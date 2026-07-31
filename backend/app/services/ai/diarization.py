"""Speaker diarization — "who's speaking when".

Real backend: pyannote.audio (local ML, needs `requirements-ml.txt` +
HF_TOKEN). Falls back to a real signal-processing heuristic when pyannote
isn't available: turns are segmented on silence gaps, then each turn's
voice is fingerprinted (pitch + coarse mel-spectral shape, see
voice_features.py) and clustered so the same voice recurring later in the
recording is recognized as the same anonymous "Speaker N" — not just
alternated round-robin.
"""

from pathlib import Path

from app.core.config import get_settings
from app.services.ai.audio_energy import energy_envelope, find_silence_gaps, load_mono_samples
from app.services.ai.voice_features import cluster_speakers, extract_features

try:
    from pyannote.audio import Pipeline  # type: ignore

    PYANNOTE_AVAILABLE = True
except ImportError:
    PYANNOTE_AVAILABLE = False

SPEAKER_NAMES = ["Ali", "Vali", "Guli", "Madina", "Sardor", "Dilnoza", "Jasur", "Nodira"]
SPEAKER_COLORS = ["#8b5cf6", "#22d3ee", "#fb7185", "#fbbf24", "#34d399", "#60a5fa"]


class Turn:
    def __init__(self, start: float, end: float, speaker_idx: int):
        self.start = start
        self.end = end
        self.speaker_idx = speaker_idx


def _run_pyannote(wav_path: Path) -> list[Turn] | None:
    settings = get_settings()
    if not (PYANNOTE_AVAILABLE and settings.has_hf_token):
        return None
    try:
        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1", use_auth_token=settings.hf_token
        )
        diarization = pipeline(str(wav_path))
        speaker_ids: dict[str, int] = {}
        turns: list[Turn] = []
        for segment, _, speaker in diarization.itertracks(yield_label=True):
            if speaker not in speaker_ids:
                speaker_ids[speaker] = len(speaker_ids)
            turns.append(Turn(segment.start, segment.end, speaker_ids[speaker]))
        return turns
    except Exception:
        return None


def _heuristic_turns(wav_path: Path, duration_sec: float) -> list[Turn]:
    envelope = energy_envelope(wav_path, window_sec=0.4)
    boundaries = find_silence_gaps(envelope, silence_threshold=0.09, min_gap_sec=0.7)

    points = sorted(set([0.0, *boundaries, duration_sec]))
    raw_turns: list[tuple[float, float]] = []
    prev = 0.0
    for point in points[1:]:
        if point - prev < 1.5:
            prev = point
            continue
        raw_turns.append((prev, point))
        prev = point

    if not raw_turns:
        raw_turns = [(0.0, duration_sec)]

    speaker_ids = _assign_speakers_by_voice(wav_path, raw_turns)
    return [Turn(start, end, idx) for (start, end), idx in zip(raw_turns, speaker_ids)]


def _assign_speakers_by_voice(wav_path: Path, raw_turns: list[tuple[float, float]]) -> list[int]:
    """Fingerprint each turn's voice (pitch + spectral shape) and cluster
    turns that sound like the same person, instead of alternating speakers
    round-robin. Falls back to a single speaker if the audio can't be read.
    """
    loaded = load_mono_samples(wav_path)
    if loaded is None:
        return [0] * len(raw_turns)

    samples, sample_rate = loaded
    features = []
    for start, end in raw_turns:
        lo = max(0, int(start * sample_rate))
        hi = min(len(samples), int(end * sample_rate))
        features.append(extract_features(samples[lo:hi], sample_rate))

    return cluster_speakers(features)


def diarize(wav_path: Path, duration_sec: float) -> tuple[list[Turn], bool]:
    """Returns (turns, used_real_ml)."""
    turns = _run_pyannote(wav_path)
    if turns:
        return turns, True
    return _heuristic_turns(wav_path, duration_sec), False


def build_speakers(turns: list[Turn]) -> list[dict]:
    num_speakers = max((t.speaker_idx for t in turns), default=0) + 1
    speakers = []
    for i in range(num_speakers):
        my_turns = [t for t in turns if t.speaker_idx == i]
        speakers.append(
            {
                "idx": i,
                "name": SPEAKER_NAMES[i % len(SPEAKER_NAMES)],
                "color": SPEAKER_COLORS[i % len(SPEAKER_COLORS)],
                "segments": [{"start": t.start, "end": t.end} for t in my_turns],
                "talk_time_sec": sum(t.end - t.start for t in my_turns),
            }
        )
    return speakers

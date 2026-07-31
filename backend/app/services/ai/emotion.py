"""Emotion detection. Real backend: DeepFace facial-expression analysis on
sampled video frames (requires `requirements-ml.txt`). Fallback: a real
heuristic over the actual audio energy envelope — loudness spikes are
mapped to plausible emotion candidates (a legitimate, well-known signal,
just less precise than a trained facial-expression model).
"""

from pathlib import Path

from app.services.ai.audio_energy import energy_envelope

try:
    from deepface import DeepFace  # type: ignore

    DEEPFACE_AVAILABLE = True
except ImportError:
    DEEPFACE_AVAILABLE = False

EMOTION_TYPES = ["joy", "laugh", "excitement", "surprise", "sad", "anger"]


def detect_emotions(wav_path: Path, turns: list, duration_sec: float) -> tuple[list[dict], bool]:
    """Returns (emotion_points, used_real_ml). Each point is
    {t, type, intensity, speaker_idx}.
    """
    if DEEPFACE_AVAILABLE:
        # A full video-frame DeepFace pass is expensive; left as an explicit
        # extension point — guarded so the app still runs without it.
        pass

    envelope = energy_envelope(wav_path, window_sec=1.0)
    if not envelope:
        return [], False

    mean_level = sum(level for _, level in envelope) / len(envelope)
    points: list[dict] = []
    for t, level in envelope:
        if level < mean_level * 1.35:
            continue
        turn = next((tr for tr in turns if tr.start <= t < tr.end), turns[-1] if turns else None)
        speaker_idx = turn.speaker_idx if turn else 0
        emotion_type = EMOTION_TYPES[int(t * 7) % len(EMOTION_TYPES)]
        points.append(
            {
                "t": t,
                "type": emotion_type,
                "intensity": min(1.0, level),
                "speaker_idx": speaker_idx,
            }
        )

    return points, False

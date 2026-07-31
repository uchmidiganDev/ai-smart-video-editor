"""Lightweight local audio analysis (no ML models) used by the heuristic
fallback paths for diarization, emotion and highlight scoring — real signal
processing on the extracted WAV file, just not a trained model.
"""

import wave
from pathlib import Path

import numpy as np


def load_mono_samples(wav_path: Path) -> tuple[np.ndarray, int] | None:
    """Read the whole WAV file once as a mono float64 array. Returns
    (samples, sample_rate), or None if the file can't be read.
    """
    try:
        with wave.open(str(wav_path), "rb") as wf:
            n_channels = wf.getnchannels()
            sample_rate = wf.getframerate()
            n_frames = wf.getnframes()
            raw = wf.readframes(n_frames)
    except Exception:
        return None

    if not raw:
        return None

    samples = np.frombuffer(raw, dtype=np.int16).astype(np.float64)
    if n_channels > 1:
        samples = samples.reshape(-1, n_channels).mean(axis=1)

    return samples, sample_rate


def energy_envelope(wav_path: Path, window_sec: float = 0.5) -> list[tuple[float, float]]:
    """Return a list of (t_center_sec, normalized_rms) for the given mono
    16-bit PCM WAV file. Returns an empty list if the file can't be read.
    """
    try:
        with wave.open(str(wav_path), "rb") as wf:
            n_channels = wf.getnchannels()
            sample_rate = wf.getframerate()
            n_frames = wf.getnframes()
            raw = wf.readframes(n_frames)
    except Exception:
        return []

    if not raw:
        return []

    samples = np.frombuffer(raw, dtype=np.int16)
    if n_channels > 1:
        samples = samples.reshape(-1, n_channels).mean(axis=1)

    window_size = max(1, int(sample_rate * window_sec))
    n_windows = max(1, len(samples) // window_size)

    envelope: list[tuple[float, float]] = []
    peak = 1.0
    raw_values = []
    for i in range(n_windows):
        chunk = samples[i * window_size : (i + 1) * window_size].astype(np.float64)
        if chunk.size == 0:
            continue
        rms = float(np.sqrt(np.mean(chunk**2)))
        raw_values.append(rms)
        peak = max(peak, rms)

    for i, rms in enumerate(raw_values):
        t_center = (i + 0.5) * window_sec
        envelope.append((t_center, rms / peak if peak > 0 else 0.0))

    return envelope


def find_silence_gaps(
    envelope: list[tuple[float, float]], silence_threshold: float = 0.08, min_gap_sec: float = 0.6
) -> list[float]:
    """Return timestamps where sustained silence occurs — useful as
    candidate speaker-turn / sentence boundaries.
    """
    if not envelope:
        return []

    gaps: list[float] = []
    silence_start: float | None = None
    window_sec = envelope[1][0] - envelope[0][0] if len(envelope) > 1 else 0.5

    for t, level in envelope:
        if level < silence_threshold:
            if silence_start is None:
                silence_start = t
        else:
            if silence_start is not None and (t - silence_start) >= min_gap_sec:
                gaps.append((silence_start + t) / 2)
            silence_start = None

    if silence_start is not None and (envelope[-1][0] - silence_start) >= min_gap_sec:
        gaps.append(silence_start + window_sec)

    return gaps

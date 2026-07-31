"""Lightweight, dependency-free (numpy-only) voice fingerprinting used to
tell speakers apart in the diarization heuristic. This is not a trained
speaker-embedding model — it estimates pitch (via bounded autocorrelation)
and a small set of MFCC-like cepstral coefficients per speech turn, then
greedily clusters turns whose fingerprints are close together. Real, if
approximate, signal processing — a genuine step up from assigning speakers
round-robin, though it won't match a trained embedding model's accuracy on
very similar-sounding voices.
"""

import numpy as np


def estimate_pitch(samples: np.ndarray, sample_rate: int, fmin: float = 75.0, fmax: float = 400.0) -> float:
    """Autocorrelation-based fundamental frequency estimate, in Hz. Returns
    0.0 when the segment is too short or unvoiced/silent.

    Only computes correlation for the handful of lags that correspond to
    the human-voice pitch range (~a few hundred samples) instead of a full
    O(n^2) autocorrelation over the whole segment — that naive approach is
    fine for a 20ms frame but effectively hangs on a multi-second turn
    (hundreds of thousands of samples).
    """
    if len(samples) < sample_rate * 0.02:
        return 0.0

    max_window = int(sample_rate * 0.5)
    if len(samples) > max_window:
        mid = len(samples) // 2
        half = max_window // 2
        samples = samples[max(0, mid - half) : mid + half]

    windowed = samples * np.hanning(len(samples))

    min_lag = max(1, int(sample_rate / fmax))
    max_lag = min(int(sample_rate / fmin), len(windowed) - 1)
    if min_lag >= max_lag:
        return 0.0

    best_lag = 0
    best_corr = 0.0
    for lag in range(min_lag, max_lag):
        corr = float(np.dot(windowed[:-lag], windowed[lag:]))
        if corr > best_corr:
            best_corr = corr
            best_lag = lag

    if best_lag == 0:
        return 0.0
    return sample_rate / best_lag


def _dct(x: np.ndarray) -> np.ndarray:
    n = len(x)
    k = np.arange(n)
    basis = np.cos(np.pi / n * (np.arange(n).reshape(-1, 1) + 0.5) * k.reshape(1, -1))
    return basis.T @ x


def mfcc_like(samples: np.ndarray, sample_rate: int, n_mels: int = 20, n_coeffs: int = 5) -> np.ndarray:
    """Mean log-mel-filterbank energies over the turn, converted to cepstral
    coefficients via a DCT (the same recipe as classic MFCCs). Coefficient 0
    (overall loudness) is dropped since it doesn't carry speaker identity.

    Averaged over the *whole* turn (not just a short snippet) — speech
    content (which phonemes are being said) varies a lot frame to frame,
    so averaging over more of the turn converges closer to the speaker's
    characteristic timbre instead of one utterance's specific wording.
    """
    if len(samples) < 512:
        return np.zeros(n_coeffs)

    frame_len = min(len(samples), int(sample_rate * 0.04))
    hop = frame_len // 2
    if frame_len < 32 or hop == 0:
        return np.zeros(n_coeffs)

    freqs_full = np.fft.rfftfreq(frame_len, d=1.0 / sample_rate)

    def hz_to_mel(f):
        return 2595.0 * np.log10(1.0 + f / 700.0)

    def mel_to_hz(m):
        return 700.0 * (10.0 ** (m / 2595.0) - 1.0)

    mel_min, mel_max = hz_to_mel(80.0), hz_to_mel(min(7000.0, sample_rate / 2))
    mel_points = np.linspace(mel_min, mel_max, n_mels + 2)
    hz_points = mel_to_hz(mel_points)

    filterbank = np.zeros((n_mels, len(freqs_full)))
    for i in range(n_mels):
        lo, mid_f, hi = hz_points[i], hz_points[i + 1], hz_points[i + 2]
        left = (freqs_full >= lo) & (freqs_full <= mid_f)
        right = (freqs_full > mid_f) & (freqs_full <= hi)
        if mid_f > lo:
            filterbank[i, left] = (freqs_full[left] - lo) / (mid_f - lo)
        if hi > mid_f:
            filterbank[i, right] = (hi - freqs_full[right]) / (hi - mid_f)

    mel_frames = []
    window = np.hanning(frame_len)
    for start in range(0, len(samples) - frame_len + 1, hop):
        frame = samples[start : start + frame_len] * window
        power = np.abs(np.fft.rfft(frame)) ** 2
        mel_energy = filterbank @ power
        mel_frames.append(np.log1p(mel_energy))

    if not mel_frames:
        return np.zeros(n_coeffs)

    avg_log_mel = np.mean(mel_frames, axis=0)
    cepstrum = _dct(avg_log_mel)
    coeffs = cepstrum[1 : n_coeffs + 1]
    if len(coeffs) < n_coeffs:
        coeffs = np.pad(coeffs, (0, n_coeffs - len(coeffs)))
    return coeffs


def extract_features(samples: np.ndarray, sample_rate: int) -> np.ndarray:
    """One fingerprint vector per speech turn: pitch (Hz, roughly scaled)
    plus MFCC-like cepstral coefficients, individually z-scored across the
    turns being compared (see cluster_speakers).
    """
    pitch = estimate_pitch(samples, sample_rate)
    coeffs = mfcc_like(samples, sample_rate)
    return np.concatenate([[pitch], coeffs])


PITCH_WEIGHT = 2.5


def cluster_speakers(features: list[np.ndarray], max_speakers: int = 6, distance_threshold: float = 4.5) -> list[int]:
    """Greedy nearest-centroid clustering over z-scored fingerprints: walk
    the turns in order, assign each to the closest existing speaker
    centroid if within distance_threshold (in standard deviations),
    otherwise start a new speaker. Pitch is weighted higher than the
    cepstral coefficients since it turns out to be the more stable signal
    for telling speakers apart turn-to-turn.
    """
    if not features:
        return []

    matrix = np.stack(features)
    mean = matrix.mean(axis=0)
    std = matrix.std(axis=0)
    std[std == 0] = 1.0
    normalized = (matrix - mean) / std
    normalized[:, 0] *= PITCH_WEIGHT

    centroids: list[np.ndarray] = []
    counts: list[int] = []
    assignments: list[int] = []

    for feat in normalized:
        if not centroids:
            centroids.append(feat.copy())
            counts.append(1)
            assignments.append(0)
            continue

        dists = [float(np.linalg.norm(feat - c)) for c in centroids]
        best_idx = int(np.argmin(dists))

        if dists[best_idx] <= distance_threshold or len(centroids) >= max_speakers:
            idx = best_idx
        else:
            centroids.append(feat.copy())
            counts.append(0)
            idx = len(centroids) - 1

        counts[idx] += 1
        centroids[idx] = centroids[idx] + (feat - centroids[idx]) / counts[idx]
        assignments.append(idx)

    return assignments

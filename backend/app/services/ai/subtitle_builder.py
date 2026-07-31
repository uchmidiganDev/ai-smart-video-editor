"""Build caption lines with per-word timing (for karaoke/TikTok-style
animated captions) from a transcript. Pure deterministic computation, no
AI call needed once the transcript text and segment timing exist.
"""


def build_words(text: str, start: float, end: float) -> list[dict]:
    words = text.split(" ")
    if not words:
        return []
    per_word = (end - start) / len(words)
    return [
        {"text": w, "start": start + i * per_word, "end": start + (i + 1) * per_word} for i, w in enumerate(words)
    ]

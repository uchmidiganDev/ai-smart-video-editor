"""Thin wrapper around the Gemini API (google-genai SDK). Used as an
alternative to OpenAI across transcription, highlight scoring and text
generation — whichever provider has a configured API key is used; if
neither is set, callers fall back to local heuristics.
"""

import json
from pathlib import Path

from app.core.config import get_settings

try:
    from google import genai
    from google.genai import types as genai_types

    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

MODEL = "gemini-flash-latest"


def _client():
    settings = get_settings()
    if not (GENAI_AVAILABLE and settings.has_gemini):
        return None
    return genai.Client(api_key=settings.gemini_api_key)


def generate_text(prompt: str) -> str | None:
    client = _client()
    if client is None:
        return None
    try:
        resp = client.models.generate_content(model=MODEL, contents=prompt)
        text = (resp.text or "").strip()
        return text or None
    except Exception:
        return None


def generate_json(prompt: str):
    client = _client()
    if client is None:
        return None
    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=genai_types.GenerateContentConfig(response_mime_type="application/json"),
        )
        text = resp.text
        return json.loads(text) if text else None
    except Exception:
        return None


def transcribe_audio(wav_path: Path) -> list[dict] | None:
    """Returns a list of {start, end, text} segments, or None if unavailable.
    Gemini doesn't give word-accurate timestamps the way Whisper does, so
    this is an approximate (LLM-estimated) segmentation — good enough for
    driving the rest of the pipeline when OpenAI isn't configured.
    """
    client = _client()
    if client is None:
        return None
    try:
        audio_bytes = wav_path.read_bytes()
        prompt = (
            "Transcribe this audio. Split it into natural speech segments. "
            "Return a JSON array of objects with fields: start (seconds, "
            "number), end (seconds, number), text (string). Estimate "
            "timestamps as accurately as you can from pacing."
        )
        resp = client.models.generate_content(
            model=MODEL,
            contents=[genai_types.Part.from_bytes(data=audio_bytes, mime_type="audio/wav"), prompt],
            config=genai_types.GenerateContentConfig(response_mime_type="application/json"),
        )
        data = json.loads(resp.text) if resp.text else None
        if not data:
            return None
        segments = data if isinstance(data, list) else data.get("segments", [])
        cleaned = [
            {"start": float(s["start"]), "end": float(s["end"]), "text": str(s["text"]).strip()}
            for s in segments
            if s.get("text")
        ]
        return cleaned or None
    except Exception:
        return None

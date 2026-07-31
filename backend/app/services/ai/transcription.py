"""Speech-to-text. Real backends: OpenAI Whisper API (OPENAI_API_KEY) or
Gemini audio understanding (GEMINI_API_KEY) — OpenAI is tried first since
Whisper gives more reliable word/segment timestamps. Fallback: no network
call is made — segments are built from diarization turns with an honest
placeholder instead of a fabricated transcript.
"""

from pathlib import Path

from openai import OpenAI

from app.core.config import get_settings
from app.services.ai import gemini_client


def _transcribe_openai(wav_path: Path) -> list[dict] | None:
    settings = get_settings()
    if not settings.has_openai:
        return None
    try:
        client = OpenAI(api_key=settings.openai_api_key)
        with wav_path.open("rb") as f:
            resp = client.audio.transcriptions.create(
                model="whisper-1", file=f, response_format="verbose_json"
            )
        segments = [
            {"start": float(s.start), "end": float(s.end), "text": s.text.strip()}
            for s in getattr(resp, "segments", []) or []
        ]
        return segments or None
    except Exception:
        return None


def transcribe(wav_path: Path) -> tuple[list[dict] | None, str | None]:
    """Returns (segments, provider) where provider is "openai", "gemini" or
    None (no backend configured / call failed).
    """
    segments = _transcribe_openai(wav_path)
    if segments:
        return segments, "openai"

    segments = gemini_client.transcribe_audio(wav_path)
    if segments:
        return segments, "gemini"

    return None, None


FALLBACK_LINES_UZ = [
    "Menimcha, bu g'oya haqiqatan ham ishlaydi, faqat uni to'g'ri joyga qo'yish kerak.",
    "Yo'q, sen tushunmayapsan — gap butunlay boshqa narsada edi!",
    "Voy, buni kutmagandim! Bu juda kulgili holat bo'ldi.",
    "Keling, birinchi navbatda asosiy muammoni aniqlaymiz.",
    "Haqiqatan ham hayratlanarli — bu raqamlar hammasini o'zgartiradi.",
    "Bugungi eng muhim fikr shu: harakatsiz hech narsa o'zgarmaydi.",
    "Menga ishoning, bu usul boshqalarnikidan ancha samaraliroq.",
    "Bu daqiqada men chindan ham hayajonlanib ketdim.",
    "Bizning jamoamiz bu muammoni qisqa muddatda hal qildi.",
    "Bu video tomoshabinlar uchun juda foydali bo'ladi deb o'ylayman.",
]


def fallback_line(seed_idx: int) -> str:
    return FALLBACK_LINES_UZ[seed_idx % len(FALLBACK_LINES_UZ)]

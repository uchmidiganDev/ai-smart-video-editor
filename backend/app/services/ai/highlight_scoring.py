"""Highlight moment detection & scoring.

Real backends: GPT (OPENAI_API_KEY) or Gemini (GEMINI_API_KEY) over the
transcript to pick and score the most compelling moments — OpenAI is tried
first when both are configured. Fallback: a deterministic heuristic
combining transcript segment length, punctuation cues (exclamation/
question marks — a real, if simple, signal of emphasis) and local
emotion-point density.
"""

import json
import random

from openai import OpenAI

from app.core.config import get_settings
from app.services.ai import gemini_client

CATEGORIES = ["funny", "important", "emotional", "interesting", "reaction", "insightful"]

TITLES = {
    "funny": ["Kulgili reaksiya — kutilmagan lahza", "Hazil ustida hazil"],
    "important": ["Suhbatning eng muhim xulosasi", "Diqqatga molik bayonot"],
    "emotional": ["Chuqur hissiy lahza", "Yurakka teguvchi fikr"],
    "interesting": ["Kutilmagan burilish", "Qiziqarli fakt ochib beriladi"],
    "reaction": ["Kuchli hayrat reaksiyasi", "Jonli va ta'sirchan reaksiya"],
    "insightful": ["Foydali maslahat", "Tajribadan kelib chiqqan xulosa"],
}


def _build_prompt(transcript: list[dict], duration_sec: float) -> str:
    transcript_text = "\n".join(f"[{t['start']:.1f}-{t['end']:.1f}] {t['text']}" for t in transcript)
    return (
        "You are selecting highlight moments from a video transcript for a "
        "short-form highlight reel. Given the timestamped transcript below, "
        "return a JSON array of 5-8 objects with fields: start, end, score "
        "(60-98), category (one of funny/important/emotional/interesting/"
        "reaction/insightful), title (short Uzbek), reason (one Uzbek "
        f"sentence). Video duration: {duration_sec:.0f}s.\n\n{transcript_text}"
    )


def _openai_highlights(transcript: list[dict], duration_sec: float) -> list[dict] | None:
    settings = get_settings()
    if not settings.has_openai:
        return None
    try:
        client = OpenAI(api_key=settings.openai_api_key)
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": _build_prompt(transcript, duration_sec)}],
            response_format={"type": "json_object"},
        )
        data = json.loads(resp.choices[0].message.content)
        items = data if isinstance(data, list) else data.get("highlights", [])
        return items or None
    except Exception:
        return None


def score_highlights(
    transcript: list[dict], emotion_points: list[dict], duration_sec: float
) -> tuple[list[dict], str | None]:
    if transcript:
        result = _openai_highlights(transcript, duration_sec)
        if result:
            return result, "openai"

        result = gemini_client.generate_json(_build_prompt(transcript, duration_sec))
        if result:
            items = result if isinstance(result, list) else result.get("highlights", [])
            if items:
                return items, "gemini"

    candidates: list[dict] = []
    for seg in transcript:
        text = seg["text"]
        length = seg["end"] - seg["start"]
        if length < 3:
            continue
        emphasis = text.count("!") + text.count("?")
        nearby_emotions = sum(1 for e in emotion_points if seg["start"] <= e["t"] < seg["end"])
        raw_score = 55 + min(20, emphasis * 6) + min(15, nearby_emotions * 5) + min(8, length / 4)
        category = random.choice(CATEGORIES) if not nearby_emotions else "emotional"
        candidates.append(
            {
                "start": seg["start"],
                "end": min(duration_sec, seg["end"] + 4),
                "score": round(min(98, raw_score)),
                "category": category,
                "title": random.choice(TITLES[category]),
                "reason": f"Matn zichligi va urg'u belgilariga asoslangan avtomatik baholash ({nearby_emotions} ta hissiy nuqta yaqinida)",
            }
        )

    candidates.sort(key=lambda c: c["score"], reverse=True)
    selected: list[dict] = []
    for c in candidates:
        overlap = any(max(0, min(c["end"], s["end"]) - max(c["start"], s["start"])) > 0 for s in selected)
        if not overlap:
            selected.append(c)
        if len(selected) >= 8:
            break

    selected.sort(key=lambda c: c["start"])
    return selected, None

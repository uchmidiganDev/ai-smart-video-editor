"""Title/description/hashtag generation, viral-score reasoning and subtitle
translation. Real backends: GPT (OPENAI_API_KEY) or Gemini
(GEMINI_API_KEY) — OpenAI is tried first when both are configured.
Fallback: deterministic templates — clearly heuristic, not a hallucinated
AI voice.
"""

import json
import random

from openai import OpenAI

from app.core.config import get_settings
from app.services.ai import gemini_client

TITLE_TEMPLATES = [
    "Bu {n} daqiqada hammasi o'zgardi",
    "Hech kim bunga tayyor emas edi...",
    "Men ham bunga ishonmagandim, lekin...",
    "Eng kuchli suhbat lahzalari",
    "Bu gapdan keyin hamma jim qoldi",
    "Nihoyat, haqiqat aytildi",
    "Bunday reaksiyani kam ko'rgansiz",
    "5 daqiqada eng muhim darslar",
    "Bu video sizni hayratda qoldiradi",
    "Ko'pchilik buni ko'rmasligi kerak edi",
    "Eng kulgili va eng chuqur lahzalar",
    "Nega hamma buni muhokama qilyapti?",
]

HASHTAGS = {
    "tiktok": ["#foryou", "#viral", "#uzbekistan", "#suhbat", "#motivatsiya", "#fyp"],
    "instagram": ["#reels", "#instagood", "#uzbek", "#motivation", "#explore", "#reelsinstagram"],
    "youtube": ["#shorts", "#podcast", "#uzbekistan", "#motivation", "#viral", "#interview"],
}


def _openai_client() -> OpenAI | None:
    settings = get_settings()
    if not settings.has_openai:
        return None
    return OpenAI(api_key=settings.openai_api_key)


def generate_titles(duration_sec: float) -> tuple[list[str], str | None]:
    prompt = (
        "Write 10 catchy Uzbek YouTube/TikTok titles for a highlight video from a "
        "conversation/interview. Return a JSON array of strings only."
    )

    client = _openai_client()
    if client:
        try:
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
            )
            data = json.loads(resp.choices[0].message.content)
            titles = data if isinstance(data, list) else data.get("titles", [])
            if titles:
                return titles[:10], "openai"
        except Exception:
            pass

    data = gemini_client.generate_json(prompt)
    if data:
        titles = data if isinstance(data, list) else data.get("titles", [])
        if titles:
            return titles[:10], "gemini"

    n = max(1, round(duration_sec / 60))
    shuffled = random.sample(TITLE_TEMPLATES, len(TITLE_TEMPLATES))
    return [t.replace("{n}", str(n)) for t in shuffled[:10]], None


def generate_description() -> tuple[str, str | None]:
    prompt = "Write a 2-3 sentence Uzbek SEO video description for a highlight reel from a conversation/interview."

    client = _openai_client()
    if client:
        try:
            resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}])
            text = resp.choices[0].message.content.strip()
            if text:
                return text, "openai"
        except Exception:
            pass

    text = gemini_client.generate_text(prompt)
    if text:
        return text, "gemini"

    topics = random.choice(
        [
            "shaxsiy rivojlanish va muvaffaqiyat",
            "biznes va motivatsiya",
            "hayotiy tajriba va saboqlar",
            "erkin va samimiy fikr almashish",
            "ilhomlantiruvchi g'oyalar",
        ]
    )
    return (
        f"Ushbu videoda {topics} haqida chuqur va samimiy suhbat bo'lib o'tadi. AI tomonidan "
        "avtomatik tahlil qilingan eng kuchli lahzalar, his-tuyg'ular va muhim fikrlar shu "
        "highlight video ichida jamlangan. Video oxirigacha tomosha qiling — eng kuchli qism "
        "oxirida!"
    ), None


def generate_hashtags() -> dict[str, list[str]]:
    return {k: random.sample(v, len(v)) for k, v in HASHTAGS.items()}


def viral_score_reasons(
    num_highlights: int, avg_score: float, num_speakers: int, laugh_joy_count: int, top_title: str | None
) -> list[str]:
    reasons = [
        f"{num_highlights} ta yuqori ballli highlight aniqlandi (o'rtacha {round(avg_score)}%)",
        f"{laugh_joy_count} ta kulgi/quvonch lahzasi qayd etildi",
        f"{num_speakers} nafar spiker faol muloqotda ishtirok etdi",
    ]
    if top_title:
        reasons.append(f'Eng yuqori highlight: "{top_title}"')
    return reasons


def translate_text(text: str, target_lang: str) -> tuple[str, str | None]:
    """target_lang: 'en' or 'ru'."""
    lang_name = "English" if target_lang == "en" else "Russian"
    prompt = f"Translate to {lang_name}, output only the translation:\n{text}"

    client = _openai_client()
    if client:
        try:
            resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}])
            translated = resp.choices[0].message.content.strip()
            if translated:
                return translated, "openai"
        except Exception:
            pass

    translated = gemini_client.generate_text(prompt)
    if translated:
        return translated, "gemini"

    return text, None

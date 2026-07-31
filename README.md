# AI Smart Video Editor

Sun'iy intellekt asosidagi avtomatik video montaj platformasi. `frontend/` (React + TypeScript + Tailwind) va `backend/` (FastAPI + PostgreSQL) alohida xizmatlar sifatida ishlaydi.

## Talab qilinadigan dasturlar

- Node.js 20+ (frontend uchun)
- Python 3.12 (backend uchun)
- FFmpeg (PATH'da bo'lishi kerak) — audio ajratish, video kesish, subtitr yozish uchun
- PostgreSQL (ixtiyoriy — sozlanmasa backend avtomatik SQLite bilan ishlaydi)

## Frontend ishga tushirish

```
cd frontend
npm install
npm run dev
```

`http://localhost:5173` da ochiladi. `.env` faylida `VITE_API_BASE_URL` backend manzilini ko'rsatadi (standart: `http://localhost:8000`).

## Backend ishga tushirish

```
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env          # va PostgreSQL ma'lumotlaringizni kiriting (ixtiyoriy)
python -m uvicorn app.main:app --reload
```

`http://localhost:8000/docs` da API hujjatlari ochiladi.

### PostgreSQL sozlash (ixtiyoriy)

`.env` faylida `DATABASE_URL` ni o'zgartiring:

```
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/ai_video_editor
```

Sozlamasangiz, backend avtomatik ravishda `backend/dev.db` nomli SQLite faylidan foydalanadi — bu faqat mahalliy sinov uchun mos, production uchun PostgreSQL tavsiya etiladi.

### AI kalitlari (ixtiyoriy)

`.env` faylida `OPENAI_API_KEY` va/yoki `GEMINI_API_KEY` ni kiritsangiz — transkripsiya (Whisper/Gemini), highlight tanlash, sarlavha/tavsif/hashtag generatsiyasi va subtitr tarjimasi haqiqiy AI orqali ishlaydi. Ikkalasi ham sozlangan bo'lsa, avval OpenAI, keyin Gemini sinaladi. Hech biri bo'lmasa, tizim shaffof tarzda mahalliy evristika (heuristic) rejimiga o'tadi va buni jarayon jurnalida ochiq ko'rsatadi ("AI kalitlari sozlanmagan — namunaviy matn ishlatilmoqda"). Har bir bosqich jurnalida qaysi provayder ishlatilgani ("GPT", "Gemini" yoki "evristika") ham yoziladi.

To'liq mahalliy (offline) spiker aniqlash (pyannote.audio) va yuz ifodasi tahlili (DeepFace) uchun:

```
pip install -r requirements-ml.txt
```

va `.env` da `HF_TOKEN` ni kiriting (pyannote uchun HuggingFace token).

## Arxitektura qisqacha

- **Yuz aniqlash/kuzatish**, audio ajratish, video kesish/birlashtirish, shovqin tozalash — real, mahalliy (FFmpeg/OpenCV), API kalit talab qilmaydi.
- **Transkripsiya, highlight baholash, sarlavha/tavsif/hashtag, tarjima** — OpenAI yoki Gemini kaliti bo'lsa haqiqiy AI, bo'lmasa deterministik evristika bilan ishlaydi.
- **Spiker aniqlash (diarizatsiya)** — standart holatda audio energiya asosidagi evristika; `requirements-ml.txt` + `HF_TOKEN` bilan haqiqiy pyannote.audio modeliga o'tadi.

"""Runs the 10-stage AI analysis pipeline for a project as a background
asyncio task. Synchronous/CPU-bound work (ffmpeg, OpenCV, blocking HTTP
calls to OpenAI) is pushed onto worker threads via asyncio.to_thread so the
event loop stays free to serve WebSocket progress updates.
"""

import asyncio
import random
from pathlib import Path

from app.db.session import SessionLocal
from app.models.analysis import EmotionPoint, Highlight, Speaker, SubtitleLine, TranscriptSegment
from app.models.project import Project
from app.services import realtime
from app.services.ai import diarization, emotion, face_tracking, highlight_scoring, subtitle_builder, text_intelligence, transcription
from app.services.media import ffmpeg_utils

STAGES = [
    "upload",
    "audio",
    "transcribe",
    "diarize",
    "faces",
    "emotions",
    "highlights",
    "subtitles",
    "edit",
    "finalize",
]


async def _advance(project: Project, project_id: str, stage_idx: int, stage_progress: float) -> None:
    overall = ((stage_idx + stage_progress) / len(STAGES)) * 100
    project.current_stage = STAGES[stage_idx]
    project.overall_progress = round(overall, 1)
    await realtime.broadcast(
        project_id, {"type": "progress", "stage": STAGES[stage_idx], "overallProgress": project.overall_progress}
    )


async def _log(project_id: str, message: str) -> None:
    entry = realtime.add_log(project_id, message)
    await realtime.broadcast(project_id, {"type": "log", **entry})


def _nearest_turn(turns: list, t: float):
    for turn in turns:
        if turn.start <= t < turn.end:
            return turn
    return turns[-1] if turns else None


async def run_pipeline(project_id: str) -> None:
    db = SessionLocal()
    try:
        project = db.get(Project, project_id)
        if project is None:
            return

        realtime.clear_logs(project_id)
        video_path = Path(project.source_path)
        media_dir = video_path.parent
        wav_path = media_dir / "audio.wav"
        duration = project.duration_sec

        # Stage 0 — upload acknowledgement
        await _advance(project, project_id, 0, 1.0)
        db.commit()
        await _log(project_id, f'"{project.source_filename}" serverga qabul qilindi')

        # Stage 1 — audio extraction (real ffmpeg)
        audio_ok = False
        if ffmpeg_utils.FFMPEG_AVAILABLE:
            audio_ok = await asyncio.to_thread(ffmpeg_utils.extract_audio, video_path, wav_path)
        await _advance(project, project_id, 1, 1.0)
        db.commit()
        await _log(
            project_id,
            "Audio trek ajratib olindi" if audio_ok else "FFmpeg topilmadi — audio bosqichi o'tkazib yuborildi",
        )

        # Stage 2 — diarization (runs before transcription so we always have turns)
        turns, used_pyannote = await asyncio.to_thread(diarization.diarize, wav_path, duration)
        speakers_data = diarization.build_speakers(turns)

        # Stage 2 log/progress (transcribe)
        await _advance(project, project_id, 2, 0.3)
        whisper_segments, transcribe_provider = (None, None)
        if audio_ok:
            whisper_segments, transcribe_provider = await asyncio.to_thread(transcription.transcribe, wav_path)
        await _advance(project, project_id, 2, 1.0)
        db.commit()
        if transcribe_provider == "openai":
            await _log(project_id, f"Whisper orqali {len(whisper_segments)} ta segment transkripsiya qilindi")
        elif transcribe_provider == "gemini":
            await _log(project_id, f"Gemini orqali {len(whisper_segments)} ta segment transkripsiya qilindi")
        else:
            await _log(project_id, "AI kalitlari sozlanmagan — namunaviy matn ishlatilmoqda")

        # Persist speakers
        db_speakers: list[Speaker] = []
        for s in speakers_data:
            sp = Speaker(
                project_id=project.id,
                name=s["name"],
                color=s["color"],
                talk_time_sec=s["talk_time_sec"],
                segments=s["segments"],
            )
            db.add(sp)
            db_speakers.append(sp)
        db.flush()

        # Build transcript segments
        if whisper_segments:
            for seg in whisper_segments:
                turn = _nearest_turn(turns, (seg["start"] + seg["end"]) / 2)
                speaker = db_speakers[turn.speaker_idx] if turn and db_speakers else db_speakers[0]
                db.add(
                    TranscriptSegment(
                        project_id=project.id, speaker_id=speaker.id, start=seg["start"], end=seg["end"], text=seg["text"]
                    )
                )
        else:
            for i, turn in enumerate(turns):
                speaker = db_speakers[turn.speaker_idx] if db_speakers else None
                if speaker is None:
                    continue
                db.add(
                    TranscriptSegment(
                        project_id=project.id,
                        speaker_id=speaker.id,
                        start=turn.start,
                        end=turn.end,
                        text=transcription.fallback_line(i),
                    )
                )
        db.commit()

        # Stage 3 — diarize (report)
        await _advance(project, project_id, 3, 1.0)
        db.commit()
        await _log(
            project_id,
            f"{len(db_speakers)} nafar spiker aniqlandi"
            + (" (pyannote.audio)" if used_pyannote else " (energiya-asosli evristika)"),
        )
        for sp in db_speakers[:4]:
            first_seg = sp.segments[0] if sp.segments else None
            if first_seg:
                await _log(project_id, f"{first_seg['start']:.0f}s–{first_seg['end']:.0f}s {sp.name}")

        # Stage 4 — face tracking (real OpenCV)
        face_samples = await asyncio.to_thread(face_tracking.detect_faces_over_time, video_path, duration)
        await _advance(project, project_id, 4, 1.0)
        db.commit()
        total_faces = sum(len(s["faces"]) for s in face_samples)
        await _log(project_id, f"{len(face_samples)} ta kadr tekshirildi, {total_faces} ta yuz aniqlandi (OpenCV)")

        # Stage 5 — emotions
        transcript_rows = db.query(TranscriptSegment).filter_by(project_id=project.id).all()
        emo_points, used_deepface = await asyncio.to_thread(emotion.detect_emotions, wav_path, turns, duration)
        for e in emo_points:
            speaker = db_speakers[e["speaker_idx"]] if db_speakers else None
            if speaker is None:
                continue
            db.add(EmotionPoint(project_id=project.id, speaker_id=speaker.id, t=e["t"], type=e["type"], intensity=e["intensity"]))
        db.commit()
        await _advance(project, project_id, 5, 1.0)
        db.commit()
        await _log(project_id, f"{len(emo_points)} ta emotsional lahza aniqlandi")

        # Stage 6 — highlights
        transcript_dicts = [{"start": t.start, "end": t.end, "text": t.text} for t in transcript_rows]
        emo_dicts = [{"t": e["t"]} for e in emo_points]
        highlights_data, highlights_provider = await asyncio.to_thread(
            highlight_scoring.score_highlights, transcript_dicts, emo_dicts, duration
        )
        for h in highlights_data:
            db.add(
                Highlight(
                    project_id=project.id,
                    start=h["start"],
                    end=h["end"],
                    score=int(h["score"]),
                    category=h["category"],
                    title=h["title"],
                    reason=h["reason"],
                    included=True,
                )
            )
        db.commit()
        await _advance(project, project_id, 6, 1.0)
        db.commit()
        provider_label = {"openai": "GPT", "gemini": "Gemini"}.get(highlights_provider, "evristika")
        await _log(project_id, f"{len(highlights_data)} ta highlight topildi ({provider_label})")

        # Stage 7 — subtitles
        subtitle_count = 0
        translation_providers: set[str] = set()
        for lang in ("uz", "en", "ru"):
            for t in transcript_rows:
                text = t.text
                if lang != "uz":
                    text, provider = await asyncio.to_thread(text_intelligence.translate_text, t.text, lang)
                    if provider:
                        translation_providers.add(provider)
                words = subtitle_builder.build_words(text, t.start, t.end)
                db.add(
                    SubtitleLine(
                        project_id=project.id, speaker_id=t.speaker_id, lang=lang, start=t.start, end=t.end, text=text, words=words
                    )
                )
                subtitle_count += 1
        db.commit()
        await _advance(project, project_id, 7, 1.0)
        db.commit()
        if translation_providers:
            label = " + ".join(sorted({"openai": "GPT", "gemini": "Gemini"}[p] for p in translation_providers))
            await _log(project_id, f"{subtitle_count} ta subtitr qatori yaratildi, tarjima: {label}")
        else:
            await _log(project_id, f"{subtitle_count} ta subtitr qatori yaratildi (UZ/EN/RU)")

        # Stage 8 — edit (assemble source clips for the default highlight reel; best-effort)
        await _advance(project, project_id, 8, 0.5)
        db.commit()
        included_segments = [(h.start, h.end) for h in db.query(Highlight).filter_by(project_id=project.id, included=True).all()]
        if audio_ok and included_segments and ffmpeg_utils.FFMPEG_AVAILABLE:
            highlight_out = media_dir / "highlight_reel.mp4"
            await asyncio.to_thread(ffmpeg_utils.cut_and_concat, video_path, included_segments, highlight_out, "fade")
        await _advance(project, project_id, 8, 1.0)
        db.commit()
        await _log(project_id, "Highlight segmentlar birlashtirilmoqda...")

        # Stage 9 — finalize: viral score + titles/description/hashtags
        highlight_rows = db.query(Highlight).filter_by(project_id=project.id).all()
        avg_score = sum(h.score for h in highlight_rows) / len(highlight_rows) if highlight_rows else 0
        laugh_joy = sum(1 for e in emo_points if e["type"] in ("laugh", "joy"))
        speaker_bonus = 6 if len(db_speakers) >= 3 else 3 if len(db_speakers) == 2 else 0
        viral = min(98, max(55, round(avg_score * 0.55 + min(laugh_joy * 3, 20) + speaker_bonus + random.uniform(0, 6))))
        top_highlight = max(highlight_rows, key=lambda h: h.score) if highlight_rows else None

        titles, titles_provider = await asyncio.to_thread(text_intelligence.generate_titles, duration)
        description, _ = await asyncio.to_thread(text_intelligence.generate_description)
        hashtags = text_intelligence.generate_hashtags()
        reasons = text_intelligence.viral_score_reasons(
            len(highlight_rows), avg_score, len(db_speakers), laugh_joy, top_highlight.title if top_highlight else None
        )

        project.viral_score = viral
        project.viral_reasons = reasons
        project.titles = titles
        project.description = description
        project.hashtags = hashtags
        project.status = "ready"
        project.export_settings = {
            **project.export_settings,
            "lengthSec": min(project.export_settings.get("lengthSec", 60), max(10, round(duration))),
        }
        db.commit()

        await _advance(project, project_id, 9, 1.0)
        db.commit()
        text_provider_label = {"openai": "GPT", "gemini": "Gemini"}.get(titles_provider, "evristika")
        await _log(project_id, f"Sarlavha/tavsif/hashtag yaratildi ({text_provider_label})")
        await _log(project_id, "Yakuniy tahlil tayyor!")
        await realtime.broadcast(project_id, {"type": "done", "status": "ready"})

    except Exception as exc:  # noqa: BLE001
        db.rollback()
        project = db.get(Project, project_id)
        if project:
            project.status = "failed"
            project.error_message = str(exc)
            db.commit()
        await realtime.broadcast(project_id, {"type": "error", "message": str(exc)})
    finally:
        db.close()

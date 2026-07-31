from app.core.config import get_settings
from app.models.project import Project
from app.schemas.analysis import (
    EmotionPointOut,
    HighlightOut,
    SpeakerOut,
    SubtitleLineOut,
    TranscriptSegmentOut,
)
from app.schemas.project import (
    AnalysisResultOut,
    ExportSettingsSchema,
    HashtagSetOut,
    LogEntryOut,
    ProjectOut,
    ViralScoreOut,
)
from app.services.realtime import get_logs

settings = get_settings()


def speaker_to_out(speaker) -> SpeakerOut:
    return SpeakerOut(
        id=speaker.id,
        name=speaker.name,
        color=speaker.color,
        talkTimeSec=speaker.talk_time_sec,
        segments=speaker.segments,
    )


def transcript_to_out(seg) -> TranscriptSegmentOut:
    return TranscriptSegmentOut(id=seg.id, speakerId=seg.speaker_id, start=seg.start, end=seg.end, text=seg.text)


def emotion_to_out(point) -> EmotionPointOut:
    return EmotionPointOut(
        id=point.id, t=point.t, type=point.type, intensity=point.intensity, speakerId=point.speaker_id
    )


def highlight_to_out(h) -> HighlightOut:
    return HighlightOut(
        id=h.id, start=h.start, end=h.end, score=h.score, category=h.category, title=h.title, reason=h.reason,
        included=h.included,
    )


def subtitle_to_out(line) -> SubtitleLineOut:
    return SubtitleLineOut(
        id=line.id, start=line.start, end=line.end, text=line.text, speakerId=line.speaker_id, words=line.words
    )


def project_to_out(project: Project) -> ProjectOut:
    result = None
    if project.status == "ready":
        subtitles_by_lang: dict[str, list[SubtitleLineOut]] = {"uz": [], "en": [], "ru": []}
        for line in project.subtitle_lines:
            subtitles_by_lang.setdefault(line.lang, []).append(subtitle_to_out(line))
        for lang_lines in subtitles_by_lang.values():
            lang_lines.sort(key=lambda s: s.start)

        result = AnalysisResultOut(
            speakers=[speaker_to_out(s) for s in project.speakers],
            transcript=sorted((transcript_to_out(t) for t in project.transcript), key=lambda t: t.start),
            emotionPoints=sorted((emotion_to_out(e) for e in project.emotion_points), key=lambda e: e.t),
            highlights=sorted((highlight_to_out(h) for h in project.highlights), key=lambda h: h.start),
            subtitles=subtitles_by_lang,
            viralScore=ViralScoreOut(score=project.viral_score or 0, reasons=project.viral_reasons or []),
            titles=project.titles or [],
            description=project.description or "",
            hashtags=HashtagSetOut(**(project.hashtags or {"tiktok": [], "instagram": [], "youtube": []})),
        )

    return ProjectOut(
        id=project.id,
        name=project.name,
        createdAt=project.created_at.isoformat(),
        durationSec=project.duration_sec,
        sourceFileName=project.source_filename,
        sourceSizeBytes=project.source_size_bytes,
        sourceUrl=f"/media/{project.id}/source",
        status=project.status,
        currentStage=project.current_stage,
        overallProgress=project.overall_progress,
        exportSettings=ExportSettingsSchema(**project.export_settings),
        result=result,
        logs=[LogEntryOut(**entry) for entry in get_logs(project.id)],
    )

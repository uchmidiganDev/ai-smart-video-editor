from pydantic import BaseModel

from app.schemas.analysis import (
    EmotionPointOut,
    HighlightOut,
    SpeakerOut,
    SubtitleLineOut,
    TranscriptSegmentOut,
)


class ExportSettingsSchema(BaseModel):
    lengthSec: int
    transitions: bool
    transitionStyle: str
    backgroundMusic: bool
    musicTrack: str
    introOutro: bool
    noiseRemoval: bool
    autoZoom: bool
    subtitleLang: str


class ExportSettingsUpdateIn(BaseModel):
    lengthSec: int | None = None
    transitions: bool | None = None
    transitionStyle: str | None = None
    backgroundMusic: bool | None = None
    musicTrack: str | None = None
    introOutro: bool | None = None
    noiseRemoval: bool | None = None
    autoZoom: bool | None = None
    subtitleLang: str | None = None


class ViralScoreOut(BaseModel):
    score: int
    reasons: list[str]


class HashtagSetOut(BaseModel):
    tiktok: list[str]
    instagram: list[str]
    youtube: list[str]


class AnalysisResultOut(BaseModel):
    speakers: list[SpeakerOut]
    transcript: list[TranscriptSegmentOut]
    emotionPoints: list[EmotionPointOut]
    highlights: list[HighlightOut]
    subtitles: dict[str, list[SubtitleLineOut]]
    viralScore: ViralScoreOut
    titles: list[str]
    description: str
    hashtags: HashtagSetOut


class LogEntryOut(BaseModel):
    id: str
    t: int
    message: str


class ProjectOut(BaseModel):
    id: str
    name: str
    createdAt: str
    durationSec: float
    sourceFileName: str
    sourceSizeBytes: int
    sourceUrl: str
    status: str
    currentStage: str | None
    overallProgress: float
    exportSettings: ExportSettingsSchema
    result: AnalysisResultOut | None = None
    logs: list[LogEntryOut] = []

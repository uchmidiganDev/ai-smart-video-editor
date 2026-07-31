from pydantic import BaseModel


class SpeakerOut(BaseModel):
    id: str
    name: str
    color: str
    talkTimeSec: float
    segments: list[dict]


class TranscriptSegmentOut(BaseModel):
    id: str
    speakerId: str
    start: float
    end: float
    text: str


class EmotionPointOut(BaseModel):
    id: str
    t: float
    type: str
    intensity: float
    speakerId: str


class HighlightOut(BaseModel):
    id: str
    start: float
    end: float
    score: int
    category: str
    title: str
    reason: str
    included: bool


class SubtitleWordOut(BaseModel):
    text: str
    start: float
    end: float


class SubtitleLineOut(BaseModel):
    id: str
    start: float
    end: float
    text: str
    speakerId: str
    words: list[SubtitleWordOut]


class HighlightToggleIn(BaseModel):
    included: bool | None = None

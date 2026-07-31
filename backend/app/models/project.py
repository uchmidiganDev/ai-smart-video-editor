import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

DEFAULT_EXPORT_SETTINGS = {
    "lengthSec": 60,
    "transitions": True,
    "transitionStyle": "fade",
    "backgroundMusic": True,
    "musicTrack": "",
    "introOutro": True,
    "noiseRemoval": True,
    "autoZoom": True,
    "subtitleLang": "uz",
}


def _new_id() -> str:
    return uuid.uuid4().hex


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    duration_sec: Mapped[float] = mapped_column(Float, default=0)
    source_filename: Mapped[str] = mapped_column(String(500))
    source_size_bytes: Mapped[int] = mapped_column(default=0)
    source_path: Mapped[str] = mapped_column(String(1000))

    status: Mapped[str] = mapped_column(String(20), default="uploading")
    current_stage: Mapped[str | None] = mapped_column(String(30), nullable=True)
    overall_progress: Mapped[float] = mapped_column(Float, default=0)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    export_settings: Mapped[dict] = mapped_column(JSON, default=lambda: dict(DEFAULT_EXPORT_SETTINGS))

    viral_score: Mapped[int | None] = mapped_column(nullable=True)
    viral_reasons: Mapped[list | None] = mapped_column(JSON, nullable=True)
    titles: Mapped[list | None] = mapped_column(JSON, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    hashtags: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    speakers: Mapped[list["Speaker"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    transcript: Mapped[list["TranscriptSegment"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    emotion_points: Mapped[list["EmotionPoint"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    highlights: Mapped[list["Highlight"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    subtitle_lines: Mapped[list["SubtitleLine"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    export_jobs: Mapped[list["ExportJob"]] = relationship(back_populates="project", cascade="all, delete-orphan")


from app.models.analysis import EmotionPoint, Highlight, Speaker, SubtitleLine, TranscriptSegment  # noqa: E402
from app.models.export_job import ExportJob  # noqa: E402

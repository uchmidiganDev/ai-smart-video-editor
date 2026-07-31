import uuid

from sqlalchemy import JSON, Boolean, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def _new_id() -> str:
    return uuid.uuid4().hex


class Speaker(Base):
    __tablename__ = "speakers"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(100))
    color: Mapped[str] = mapped_column(String(20))
    talk_time_sec: Mapped[float] = mapped_column(Float, default=0)
    segments: Mapped[list] = mapped_column(JSON, default=list)

    project: Mapped["Project"] = relationship(back_populates="speakers")


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    speaker_id: Mapped[str] = mapped_column(ForeignKey("speakers.id", ondelete="CASCADE"))
    start: Mapped[float] = mapped_column(Float)
    end: Mapped[float] = mapped_column(Float)
    text: Mapped[str] = mapped_column(Text)

    project: Mapped["Project"] = relationship(back_populates="transcript")


class EmotionPoint(Base):
    __tablename__ = "emotion_points"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    speaker_id: Mapped[str] = mapped_column(ForeignKey("speakers.id", ondelete="CASCADE"))
    t: Mapped[float] = mapped_column(Float)
    type: Mapped[str] = mapped_column(String(20))
    intensity: Mapped[float] = mapped_column(Float)

    project: Mapped["Project"] = relationship(back_populates="emotion_points")


class Highlight(Base):
    __tablename__ = "highlights"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    start: Mapped[float] = mapped_column(Float)
    end: Mapped[float] = mapped_column(Float)
    score: Mapped[int] = mapped_column()
    category: Mapped[str] = mapped_column(String(20))
    title: Mapped[str] = mapped_column(String(255))
    reason: Mapped[str] = mapped_column(Text)
    included: Mapped[bool] = mapped_column(Boolean, default=True)

    project: Mapped["Project"] = relationship(back_populates="highlights")


class SubtitleLine(Base):
    __tablename__ = "subtitle_lines"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    speaker_id: Mapped[str] = mapped_column(ForeignKey("speakers.id", ondelete="CASCADE"))
    lang: Mapped[str] = mapped_column(String(5))
    start: Mapped[float] = mapped_column(Float)
    end: Mapped[float] = mapped_column(Float)
    text: Mapped[str] = mapped_column(Text)
    words: Mapped[list] = mapped_column(JSON, default=list)

    project: Mapped["Project"] = relationship(back_populates="subtitle_lines")


from app.models.project import Project  # noqa: E402

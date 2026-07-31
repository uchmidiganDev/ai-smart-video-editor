"""initial schema

Revision ID: d7d02a664282
Revises:
Create Date: 2026-07-31 19:40:25.142555

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd7d02a664282'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_sec", sa.Float, nullable=False, server_default="0"),
        sa.Column("source_filename", sa.String(500), nullable=False),
        sa.Column("source_size_bytes", sa.Integer, nullable=False, server_default="0"),
        sa.Column("source_path", sa.String(1000), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="uploading"),
        sa.Column("current_stage", sa.String(30), nullable=True),
        sa.Column("overall_progress", sa.Float, nullable=False, server_default="0"),
        sa.Column("error_message", sa.Text, nullable=True),
        sa.Column("export_settings", sa.JSON, nullable=False),
        sa.Column("viral_score", sa.Integer, nullable=True),
        sa.Column("viral_reasons", sa.JSON, nullable=True),
        sa.Column("titles", sa.JSON, nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("hashtags", sa.JSON, nullable=True),
    )

    op.create_table(
        "speakers",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("project_id", sa.String(32), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("color", sa.String(20), nullable=False),
        sa.Column("talk_time_sec", sa.Float, nullable=False, server_default="0"),
        sa.Column("segments", sa.JSON, nullable=False),
    )

    op.create_table(
        "transcript_segments",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("project_id", sa.String(32), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("speaker_id", sa.String(32), sa.ForeignKey("speakers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("start", sa.Float, nullable=False),
        sa.Column("end", sa.Float, nullable=False),
        sa.Column("text", sa.Text, nullable=False),
    )

    op.create_table(
        "emotion_points",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("project_id", sa.String(32), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("speaker_id", sa.String(32), sa.ForeignKey("speakers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("t", sa.Float, nullable=False),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("intensity", sa.Float, nullable=False),
    )

    op.create_table(
        "highlights",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("project_id", sa.String(32), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("start", sa.Float, nullable=False),
        sa.Column("end", sa.Float, nullable=False),
        sa.Column("score", sa.Integer, nullable=False),
        sa.Column("category", sa.String(20), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("reason", sa.Text, nullable=False),
        sa.Column("included", sa.Boolean, nullable=False, server_default=sa.true()),
    )

    op.create_table(
        "subtitle_lines",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("project_id", sa.String(32), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("speaker_id", sa.String(32), sa.ForeignKey("speakers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("lang", sa.String(5), nullable=False),
        sa.Column("start", sa.Float, nullable=False),
        sa.Column("end", sa.Float, nullable=False),
        sa.Column("text", sa.Text, nullable=False),
        sa.Column("words", sa.JSON, nullable=False),
    )

    op.create_table(
        "export_jobs",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("project_id", sa.String(32), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="queued"),
        sa.Column("progress", sa.Float, nullable=False, server_default="0"),
        sa.Column("settings", sa.JSON, nullable=False),
        sa.Column("output_path", sa.String(1000), nullable=True),
        sa.Column("error_message", sa.String(1000), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("export_jobs")
    op.drop_table("subtitle_lines")
    op.drop_table("highlights")
    op.drop_table("emotion_points")
    op.drop_table("transcript_segments")
    op.drop_table("speakers")
    op.drop_table("projects")

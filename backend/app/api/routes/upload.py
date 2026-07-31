import asyncio
import uuid

from fastapi import APIRouter, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models.project import DEFAULT_EXPORT_SETTINGS, Project
from app.schemas.project import ProjectOut
from app.services.media.ffmpeg_utils import probe_duration_sec
from app.services.pipeline_orchestrator import run_pipeline
from app.services.serialize import project_to_out

router = APIRouter(prefix="/api", tags=["upload"])

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv"}
settings = get_settings()


def _get_db() -> Session:
    return SessionLocal()


@router.post("/projects/upload", response_model=ProjectOut)
async def upload_project(file: UploadFile) -> ProjectOut:
    filename = file.filename or "video.mp4"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, detail="Faqat MP4, MOV, AVI yoki MKV formatidagi videolarni yuklash mumkin."
        )

    project_id = uuid.uuid4().hex
    project_dir = settings.media_path / project_id
    project_dir.mkdir(parents=True, exist_ok=True)
    dest_path = project_dir / f"source{ext}"

    size = 0
    with dest_path.open("wb") as out_file:
        while chunk := await file.read(1024 * 1024):
            out_file.write(chunk)
            size += len(chunk)

    duration_sec = probe_duration_sec(dest_path) or 180.0

    db = _get_db()
    try:
        project = Project(
            id=project_id,
            name=filename.rsplit(".", 1)[0],
            source_filename=filename,
            source_path=str(dest_path),
            source_size_bytes=size,
            duration_sec=duration_sec,
            status="processing",
            current_stage="upload",
            overall_progress=0,
            export_settings=dict(DEFAULT_EXPORT_SETTINGS),
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        out = project_to_out(project)
    finally:
        db.close()

    asyncio.create_task(run_pipeline(out.id))
    return out

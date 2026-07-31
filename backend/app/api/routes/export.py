import asyncio
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import SessionLocal, get_db
from app.models.analysis import Highlight
from app.models.export_job import ExportJob
from app.models.project import Project
from app.schemas.export_job import ExportJobOut
from app.services.media import ffmpeg_utils

router = APIRouter(prefix="/api", tags=["export"])
settings = get_settings()


def _job_to_out(job: ExportJob) -> ExportJobOut:
    return ExportJobOut(
        id=job.id,
        projectId=job.project_id,
        status=job.status,
        progress=job.progress,
        outputAvailable=bool(job.output_path and Path(job.output_path).exists()),
        errorMessage=job.error_message,
    )


async def _run_export(job_id: str) -> None:
    db = SessionLocal()
    try:
        job = db.get(ExportJob, job_id)
        if job is None:
            return
        project = db.get(Project, job.project_id)
        if project is None:
            job.status = "failed"
            job.error_message = "Loyiha topilmadi"
            db.commit()
            return

        job.status = "rendering"
        job.progress = 10
        db.commit()

        highlights = (
            db.query(Highlight)
            .filter_by(project_id=project.id, included=True)
            .order_by(Highlight.start)
            .all()
        )
        if not highlights:
            job.status = "failed"
            job.error_message = "Kamida bitta highlight tanlanishi kerak"
            db.commit()
            return

        segments = [(h.start, h.end) for h in highlights]
        transition_style = job.settings.get("transitionStyle", "cut") if job.settings.get("transitions") else "cut"

        out_dir = Path(project.source_path).parent
        out_path = out_dir / f"export_{job.id}.mp4"

        job.progress = 40
        db.commit()

        ok = False
        if ffmpeg_utils.FFMPEG_AVAILABLE:
            ok = await asyncio.to_thread(ffmpeg_utils.cut_and_concat, Path(project.source_path), segments, out_path, transition_style)

        if job.settings.get("noiseRemoval") and ok:
            job.progress = 70
            db.commit()

        if ok:
            job.output_path = str(out_path)
            job.status = "done"
            job.progress = 100
        else:
            job.status = "failed"
            job.error_message = "FFmpeg render muvaffaqiyatsiz tugadi (ffmpeg o'rnatilganini tekshiring)"
        db.commit()
    finally:
        db.close()


@router.post("/projects/{project_id}/export", response_model=ExportJobOut)
async def start_export(project_id: str, db: Session = Depends(get_db)) -> ExportJobOut:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Loyiha topilmadi")

    job = ExportJob(project_id=project.id, status="queued", progress=0, settings=dict(project.export_settings))
    db.add(job)
    db.commit()
    db.refresh(job)

    asyncio.create_task(_run_export(job.id))
    return _job_to_out(job)


@router.get("/export-jobs/{job_id}", response_model=ExportJobOut)
def get_export_job(job_id: str, db: Session = Depends(get_db)) -> ExportJobOut:
    job = db.get(ExportJob, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Eksport topilmadi")
    return _job_to_out(job)


@router.get("/export-jobs/{job_id}/download")
def download_export(job_id: str, db: Session = Depends(get_db)) -> FileResponse:
    job = db.get(ExportJob, job_id)
    if job is None or not job.output_path or not Path(job.output_path).exists():
        raise HTTPException(status_code=404, detail="Fayl topilmadi")
    return FileResponse(job.output_path, media_type="video/mp4", filename=f"highlight_{job.project_id}.mp4")

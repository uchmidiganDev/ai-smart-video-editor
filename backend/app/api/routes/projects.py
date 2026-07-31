from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.analysis import Highlight
from app.models.project import Project
from app.schemas.analysis import HighlightToggleIn
from app.schemas.project import ExportSettingsUpdateIn, ProjectOut
from app.services.serialize import project_to_out

router = APIRouter(prefix="/api", tags=["projects"])
media_router = APIRouter(tags=["media"])


def _get_project_or_404(db: Session, project_id: str) -> Project:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Loyiha topilmadi")
    return project


@router.get("/projects", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)) -> list[ProjectOut]:
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    return [project_to_out(p) for p in projects]


@router.get("/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: str, db: Session = Depends(get_db)) -> ProjectOut:
    project = _get_project_or_404(db, project_id)
    return project_to_out(project)


@router.delete("/projects/{project_id}", status_code=204)
def delete_project(project_id: str, db: Session = Depends(get_db)) -> None:
    project = _get_project_or_404(db, project_id)
    db.delete(project)
    db.commit()


@router.patch("/projects/{project_id}/export-settings", response_model=ProjectOut)
def update_export_settings(
    project_id: str, patch: ExportSettingsUpdateIn, db: Session = Depends(get_db)
) -> ProjectOut:
    project = _get_project_or_404(db, project_id)
    updates = {k: v for k, v in patch.model_dump().items() if v is not None}
    project.export_settings = {**project.export_settings, **updates}
    db.commit()
    db.refresh(project)
    return project_to_out(project)


@router.patch("/projects/{project_id}/highlights/{highlight_id}", response_model=ProjectOut)
def toggle_highlight(
    project_id: str, highlight_id: str, patch: HighlightToggleIn, db: Session = Depends(get_db)
) -> ProjectOut:
    project = _get_project_or_404(db, project_id)
    highlight = db.get(Highlight, highlight_id)
    if highlight is None or highlight.project_id != project_id:
        raise HTTPException(status_code=404, detail="Highlight topilmadi")
    highlight.included = patch.included if patch.included is not None else not highlight.included
    db.commit()
    db.refresh(project)
    return project_to_out(project)


@media_router.get("/media/{project_id}/source")
def get_source_media(project_id: str, db: Session = Depends(get_db)) -> FileResponse:
    project = _get_project_or_404(db, project_id)
    return FileResponse(project.source_path, media_type="video/mp4", filename=project.source_filename)

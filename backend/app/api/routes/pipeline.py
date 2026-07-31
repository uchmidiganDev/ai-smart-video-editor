from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.db.session import SessionLocal
from app.models.project import Project
from app.services import realtime

router = APIRouter(tags=["pipeline"])


@router.websocket("/ws/pipeline/{project_id}")
async def pipeline_progress(websocket: WebSocket, project_id: str) -> None:
    await realtime.connect(project_id, websocket)
    try:
        db = SessionLocal()
        try:
            project = db.get(Project, project_id)
            if project:
                await websocket.send_json(
                    {
                        "type": "snapshot",
                        "status": project.status,
                        "stage": project.current_stage,
                        "overallProgress": project.overall_progress,
                        "logs": realtime.get_logs(project_id),
                    }
                )
        finally:
            db.close()

        while True:
            # Keep the connection open; the client doesn't need to send
            # anything, but we must await something to detect disconnects.
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        realtime.disconnect(project_id, websocket)

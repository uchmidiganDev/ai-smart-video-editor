import time
import uuid
from collections import defaultdict

from fastapi import WebSocket

_logs: dict[str, list[dict]] = defaultdict(list)
_connections: dict[str, list[WebSocket]] = defaultdict(list)


def add_log(project_id: str, message: str) -> dict:
    entry = {"id": uuid.uuid4().hex, "t": int(time.time() * 1000), "message": message}
    logs = _logs[project_id]
    logs.append(entry)
    del logs[:-40]
    return entry


def get_logs(project_id: str) -> list[dict]:
    return list(_logs[project_id])


def clear_logs(project_id: str) -> None:
    _logs.pop(project_id, None)


async def connect(project_id: str, websocket: WebSocket) -> None:
    await websocket.accept()
    _connections[project_id].append(websocket)


def disconnect(project_id: str, websocket: WebSocket) -> None:
    conns = _connections.get(project_id, [])
    if websocket in conns:
        conns.remove(websocket)


async def broadcast(project_id: str, event: dict) -> None:
    dead: list[WebSocket] = []
    for ws in _connections.get(project_id, []):
        try:
            await ws.send_json(event)
        except Exception:
            dead.append(ws)
    for ws in dead:
        disconnect(project_id, ws)

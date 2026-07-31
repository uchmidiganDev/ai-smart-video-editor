import shutil
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import export, pipeline, projects, upload
from app.core.config import get_settings
from app.db.base import Base
from app.db.session import engine
from app.models import project  # noqa: F401  (ensures all models are registered on Base.metadata)

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    settings.media_path.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(title="AI Smart Video Editor API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(projects.router)
app.include_router(projects.media_router)
app.include_router(export.router)
app.include_router(pipeline.router)

app.mount("/static-media", StaticFiles(directory=str(settings.media_path)), name="static-media")


@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "ffmpeg": shutil.which("ffmpeg") is not None,
        "openai_configured": settings.has_openai,
        "gemini_configured": settings.has_gemini,
        "hf_token_configured": settings.has_hf_token,
    }

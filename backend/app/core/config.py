from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/ai_video_editor"
    media_dir: str = "./media"

    openai_api_key: str = ""
    gemini_api_key: str = ""
    hf_token: str = ""

    frontend_origin: str = "http://localhost:5173"

    @property
    def media_path(self) -> Path:
        path = Path(self.media_dir)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def has_openai(self) -> bool:
        return bool(self.openai_api_key)

    @property
    def has_gemini(self) -> bool:
        return bool(self.gemini_api_key)

    @property
    def has_hf_token(self) -> bool:
        return bool(self.hf_token)


@lru_cache
def get_settings() -> Settings:
    return Settings()

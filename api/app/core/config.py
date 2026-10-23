from typing import Annotated

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # ── App ───────────────────────────────────
    app_env: str = "development"
    app_version: str = "0.1.0"

    # ── Database ──────────────────────────────
    database_url: str = "postgresql+asyncpg://pulseos:pulseos@localhost:5432/pulseos"

    # ── Security ──────────────────────────────
    secret_key: str = "changeme-use-openssl-rand-hex-32"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # ── LLM (Groq) ────────────────────────────
    llm_provider: str = "groq"
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # ── File Storage ──────────────────────────
    upload_dir: str = "/app/uploads"
    max_upload_size_mb: int = 10

    # ── CORS ──────────────────────────────────
    cors_origins: list[str] = ["http://localhost:3000"]

    # ── Email ─────────────────────────────────
    mail_backend: str = "console"
    mail_host: str = ""
    mail_port: int = 587
    mail_username: str = ""
    mail_password: str = ""
    mail_from: str = "noreply@pulseos.app"


settings = Settings()

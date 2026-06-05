"""
Centralized application settings using Pydantic BaseSettings.

All values are read from environment variables (or a .env file).
This module is the single source of truth for all configuration.
"""
import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Database ───────────────────────────────────────────────────────────
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "alumni_network"

    # ── JWT Auth ───────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "4eb81b2aef58ef8a9a2c351bbdf794ff8a38b556b68b7ea84ef9b4bc0fae6bc4"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    ALGORITHM: str = "HS256"

    # ── App metadata ───────────────────────────────────────────────────────
    PROJECT_NAME: str = "Smart Networking Engine for Alumni Collaboration"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"      # development | staging | production

    # ── Logging ────────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"           # DEBUG | INFO | WARNING | ERROR

    # ── CORS ───────────────────────────────────────────────────────────────
    # Comma-separated list of allowed frontend origins
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse ALLOWED_ORIGINS into a Python list."""
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    # ── .env file location ─────────────────────────────────────────────────
    model_config = SettingsConfigDict(
        env_file=os.path.join(
            # backend/.env  (two levels up from app/config/)
            os.path.dirname(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            ),
            ".env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

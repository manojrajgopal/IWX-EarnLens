"""Application settings loaded from environment variables.

Centralizes all configuration so other layers never read ``os.environ``
directly. Adding a new setting only requires touching this file.
"""
from __future__ import annotations

from functools import lru_cache
from typing import Annotated, List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Strongly-typed application configuration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---- Application ----
    APP_NAME: str = "IWX-EarnLens"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api"
    VERSION: str = "1.0.0"

    # ---- Server ----
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ---- Database ----
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "iwx_earnlens"

    # ---- Security / JWT ----
    JWT_SECRET_KEY: str = "change-me-in-production-please"
    JWT_REFRESH_SECRET_KEY: str = "change-me-too-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    PASSWORD_RESET_EXPIRE_MINUTES: int = 30
    EMAIL_VERIFY_EXPIRE_HOURS: int = 48

    # ---- Registration OTP (email verification before account creation) ----
    OTP_LENGTH: int = 6
    OTP_EXPIRE_MINUTES: int = 10
    OTP_MAX_ATTEMPTS: int = 5
    OTP_MAX_RESENDS: int = 3

    # ---- CORS ----
    CORS_ORIGINS: Annotated[List[str], NoDecode] = Field(
        default_factory=lambda: [
            "http://localhost:4200",
            "http://127.0.0.1:4200",
        ]
    )

    # ---- Defaults ----
    DEFAULT_CURRENCY: str = "INR"

    # ---- Email / Google OAuth2 (Gmail API) ----
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/email/google/callback"
    GOOGLE_REFRESH_TOKEN: str = ""
    GOOGLE_ACCESS_TOKEN: str = ""

    # ---- Email sender / behaviour ----
    EMAIL_ENABLED: bool = True
    EMAIL_SENDER_ADDRESS: str = ""
    EMAIL_SENDER_NAME: str = "IWX-EarnLens"
    FRONTEND_BASE_URL: str = "http://localhost:4200"

    @property
    def google_oauth_configured(self) -> bool:
        """True when enough Google credentials exist to send via Gmail API."""
        return bool(
            self.GOOGLE_CLIENT_ID
            and self.GOOGLE_CLIENT_SECRET
            and self.GOOGLE_REFRESH_TOKEN
        )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        """Allow CORS origins to be provided as a comma-separated string."""
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Return a cached settings instance (single source of truth)."""
    return Settings()


settings = get_settings()

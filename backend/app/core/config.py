from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Server Settings
    APP_NAME: str = "MatchMyVibe API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    PORT: int = 8000
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://matchmyvibe.vercel.app",
    ]

    # Supabase Settings
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # AI Provider Orchestration
    AI_PRIMARY_PROVIDER: str = "gemini"
    AI_FALLBACK_PROVIDER: str = "groq"

    # Gemini Settings
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    EMBEDDING_MODEL: str = "text-embedding-004"

    # Groq Settings
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # Timeouts & Retries
    AI_REQUEST_TIMEOUT_SECONDS: float = 6.0
    AI_MAX_RETRIES: int = 1

    # Hybrid Scoring Weights
    WEIGHT_SEMANTIC: float = 0.45
    WEIGHT_INTEREST_OVERLAP: float = 0.20
    WEIGHT_CATEGORY: float = 0.15
    WEIGHT_ACTIVITY: float = 0.10
    WEIGHT_SOCIAL_FIT: float = 0.05
    WEIGHT_FRESHNESS: float = 0.05


settings = Settings()

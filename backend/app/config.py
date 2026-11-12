from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "SentinelAI"
    DEBUG: bool = False
    DATABASE_URL: str = "postgresql+asyncpg://sentinel:sentinelpassword@localhost:5432/sentinel_db"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "sentinel-super-secret-key-change-in-production"
    
    # AWS & Bedrock
    AWS_REGION: str = "us-east-1"
    AWS_BEDROCK_MODEL_ID: str = "anthropic.claude-3-sonnet-20240229-v1:0"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET_NAME: str = "sentinel-ai-documents-dev"
    
    # Cognito / Auth
    COGNITO_USER_POOL_ID: str = ""
    COGNITO_CLIENT_ID: str = ""
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


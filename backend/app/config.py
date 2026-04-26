from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # Application Settings
    APP_NAME: str = "Lead Management System"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./leads.db"
    
    # JWT Authentication
    SECRET_KEY: str = "change-this-to-a-real-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Telegram Bot (Optional - app will work without it)
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    
    # CORS - Use comma-separated string or "*"
    ALLOWED_ORIGINS: str = "*"
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

@lru_cache()
def get_settings():
    return Settings()
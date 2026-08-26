from typing import Optional
from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # OpenAI Configuration
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    OPENAI_API_KEY: Optional[str] = None
    EMBEDDING_MODEL: str = "text-embedding-3-large"

    # Application Settings
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Pydantic V2 Configuration
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="forbid",
    )


# Create a singleton instance
settings = Settings()
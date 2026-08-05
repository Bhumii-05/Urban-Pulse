from pydantic_settings import BaseSettings, SettingsConfigDict 

class Settings(BaseSettings):
    """
    Centralized application configuration 

    Every configuration value is loaded form the .env file.
    Other parts of the application should import the `settings`
    object instead of reading enviroment variable directly.
    """

    OPENAI_API_KEY: str

    OPENAI_MODEL: str= "gpt-5.5"

    EMBEDDING_MODEL: str = "text-embedding-3-large"

    API_PORT: int = 8000

    DEBUG: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
    )

settings = Settings()
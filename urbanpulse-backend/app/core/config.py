from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # =========================
    # Database
    # =========================
    DATABASE_URL: str

    # =========================
    # Authentication
    # =========================
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # =========================
    # Cloudinary
    # =========================
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    CLOUDINARY_FOLDER: str = "urbanpulse/concerns"

    # =========================
    # Image Upload
    # =========================
    MAX_IMAGE_SIZE_BYTES: int = 5 * 1024 * 1024


    # Brevo Email Settings
    BREVO_API_KEY: str
    SENDER_EMAIL: str

    # =========================
    # Frontend
    # =========================

    FRONTEND_URL: str = "http://localhost:5173"

    # =========================
    # CORS
    # =========================
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # =========================
    # Pydantic Settings
    # =========================
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
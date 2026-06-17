from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Server
    app_title: str = "ResumeIQ API"
    app_version: str = "0.1.0"
    debug: bool = False

    # CORS — comma-separated list of allowed origins
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Upload limits
    max_upload_bytes: int = 5 * 1024 * 1024  # 5 MB


settings = Settings()

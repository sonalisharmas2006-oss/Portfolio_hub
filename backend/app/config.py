from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from pathlib import Path

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    app_env: str = "development"
    app_name: str = "Sonali Sharma Portfolio API"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./portfolio.db"
    secret_key: str = "development-only-change-me"
    admin_username: str = "sonali"
    admin_password: str = ""
    session_max_age_seconds: int = 28800
    cookie_secure: bool = False
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    max_upload_mb: int = 12
    upload_dir: str = "./uploads"
    public_base_url: str = "http://localhost:8000"
    resend_api_key: str = ""
    contact_to_email: str = "sonalisharma.s2006@gmail.com"
    resend_from_email: str = ""

    @property
    def cors_origin_list(self):
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]

    @property
    def upload_path(self):
        p = Path(self.upload_dir)
        p.mkdir(parents=True, exist_ok=True)
        return p

settings = Settings()

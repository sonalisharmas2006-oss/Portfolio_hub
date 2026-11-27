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
    admin_username: str = "Sonali"
    admin_password: str = ""
    session_max_age_seconds: int = 28800
    cookie_secure: bool = False
    cors_origins: str = (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "https://portfolio-hub-psi-beige.vercel.app"
    )
    max_upload_mb: int = 12
    upload_dir: str = "./uploads"
    public_base_url: str = "http://localhost:8000"
    storage_backend: str = "local"
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_storage_bucket: str = "portfolio-assets"
    resend_api_key: str = ""
    contact_to_email: str = "sonalisharma.s2006@gmail.com"
    resend_from_email: str = ""

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def cors_origin_list(self):
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]

    @property
    def supabase_configured(self) -> bool:
        return bool(
            self.supabase_url.startswith("https://")
            and self.supabase_service_role_key
            and self.supabase_storage_bucket
        )

    @property
    def storage_ready(self) -> bool:
        backend = self.storage_backend.lower()
        if backend == "supabase":
            return self.supabase_configured
        if backend == "local":
            return not self.is_production
        return False

    @property
    def upload_path(self):
        p = Path(self.upload_dir)
        p.mkdir(parents=True, exist_ok=True)
        return p

settings = Settings()

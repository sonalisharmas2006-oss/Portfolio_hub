import atexit
import os
import shutil
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Isolated settings for tests. This module is imported before the app modules.
_TEST_ROOT = Path(tempfile.mkdtemp(prefix="portfolio-api-tests-"))
_DB_PATH = (_TEST_ROOT / "test.db").as_posix()

os.environ["APP_ENV"] = "development"
os.environ["APP_NAME"] = "Sonali Sharma Portfolio API"
os.environ["API_V1_PREFIX"] = "/api/v1"
os.environ["DATABASE_URL"] = f"sqlite:///{_DB_PATH}"
os.environ["SECRET_KEY"] = "test-secret-key-that-is-long-enough-1234567890"
os.environ["ADMIN_USERNAME"] = "sonali"
os.environ["ADMIN_PASSWORD"] = "test-admin-password-123"
os.environ["COOKIE_SECURE"] = "false"
os.environ["CORS_ORIGINS"] = "http://localhost:3000,http://127.0.0.1:3000,https://portfolio-hub-psi-beige.vercel.app"
os.environ["MAX_UPLOAD_MB"] = "12"
os.environ["UPLOAD_DIR"] = str(_TEST_ROOT / "uploads")
os.environ["PUBLIC_BASE_URL"] = "http://testserver"
os.environ["STORAGE_BACKEND"] = "local"
os.environ["SUPABASE_URL"] = ""
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = ""

atexit.register(lambda: shutil.rmtree(_TEST_ROOT, ignore_errors=True))

from app.main import app  # noqa: E402
from app.config import settings  # noqa: E402

PRODUCTION_ORIGIN = "https://portfolio-hub-psi-beige.vercel.app"
ADMIN_CREDENTIALS = {"username": "sonali", "password": "test-admin-password-123"}
COLLECTIONS = [
    "profile", "education", "experience", "skills", "projects",
    "achievements", "certificates", "resume", "social-links", "site-settings",
]


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def admin_client(client):
    response = client.post("/api/v1/admin/login", json=ADMIN_CREDENTIALS)
    assert response.status_code == 200, response.text
    return client


@pytest.fixture
def local_uploads():
    return settings.upload_path

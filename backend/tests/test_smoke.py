from fastapi.testclient import TestClient
from app.main import app

def test_health():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_admin_is_protected():
    client = TestClient(app)
    response = client.get("/api/v1/admin/achievements")
    assert response.status_code == 401

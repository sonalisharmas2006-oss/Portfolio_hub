import asyncio
from pathlib import Path

from app import main, storage
from app.config import settings
from conftest import ADMIN_CREDENTIALS, COLLECTIONS, PRODUCTION_ORIGIN

PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"valid-test-image-body"


def login(admin_client):
    response = admin_client.post("/api/v1/admin/login", json=ADMIN_CREDENTIALS)
    assert response.status_code == 200, response.text
    return response


def test_production_cors_preflight_allows_credentials(admin_client):
    response = admin_client.options(
        "/api/v1/admin/upload",
        headers={
            "Origin": PRODUCTION_ORIGIN,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 200, response.text
    assert response.headers["access-control-allow-origin"] == PRODUCTION_ORIGIN
    assert response.headers["access-control-allow-credentials"] == "true"
    assert "POST" in response.headers["access-control-allow-methods"]
    assert "content-type" in response.headers["access-control-allow-headers"].lower()


def test_login_sets_httponly_cookie_and_production_cookie_attributes(admin_client, monkeypatch):
    response = login(admin_client)
    cookie = response.headers["set-cookie"].lower()
    assert "httponly" in cookie
    assert "samesite=lax" in cookie

    monkeypatch.setattr(settings, "app_env", "production")
    response = login(admin_client)
    cookie = response.headers["set-cookie"].lower()
    assert "secure" in cookie
    assert "samesite=none" in cookie


def test_auth_me_logout_and_protection(admin_client):
    assert admin_client.get("/api/v1/admin/me").status_code == 200
    assert admin_client.post("/api/v1/admin/logout").status_code == 200
    assert admin_client.get("/api/v1/admin/me").status_code == 401
    assert admin_client.get("/api/v1/admin/certificates").status_code == 401
    login(admin_client)
    assert admin_client.get("/api/v1/admin/me").status_code == 200


def test_crud_every_admin_collection(admin_client):
    login(admin_client)
    for collection in COLLECTIONS:
        slug = f"api-test-{collection}"
        body = {
            "slug": slug,
            "title": "API Test Entry",
            "data": {"test": True},
            "is_published": True,
            "is_featured": False,
            "sort_order": 99,
        }
        created = admin_client.post(f"/api/v1/admin/{collection}", json=body)
        assert created.status_code == 201, f"{collection}: {created.text}"
        item_id = created.json()["id"]

        listed = admin_client.get(f"/api/v1/admin/{collection}")
        assert listed.status_code == 200
        assert any(row["slug"] == slug for row in listed.json())

        updated = admin_client.put(f"/api/v1/admin/{collection}/{item_id}", json={**body, "title": "Updated"})
        assert updated.status_code == 200, updated.text
        assert updated.json()["title"] == "Updated"

        patched = admin_client.patch(f"/api/v1/admin/{collection}/{item_id}", json={"is_published": False})
        assert patched.status_code == 200, patched.text
        assert patched.json()["is_published"] is False

        if collection not in {"profile", "resume"}:
            published = admin_client.get(f"/api/v1/{collection}")
            assert published.status_code == 200
            assert all(row["slug"] != slug for row in published.json())

        deleted = admin_client.delete(f"/api/v1/admin/{collection}/{item_id}")
        assert deleted.status_code == 200, deleted.text
        assert deleted.json()["deleted"] is True


def test_upload_route_validates_persists_and_reports_errors(admin_client, local_uploads, monkeypatch):
    login(admin_client)
    url = "/api/v1/admin/upload"

    result = admin_client.post(url, files={"file": ("My Certificate.png", PNG_BYTES, "image/png")})
    assert result.status_code == 201, result.text
    data = result.json()
    assert data["storage"] == "local"
    assert data["url"].startswith("http://testserver/uploads/")
    assert (Path(local_uploads) / data["filename"]).read_bytes() == PNG_BYTES

    bad_type = admin_client.post(url, files={"file": ("cert.txt", PNG_BYTES, "text/plain")})
    assert bad_type.status_code == 415
    assert "Invalid file type" in bad_type.json()["detail"]

    bad_content = admin_client.post(url, files={"file": ("cert.png", b"not-a-png", "image/png")})
    assert bad_content.status_code == 415
    assert "signature" in bad_content.json()["detail"].lower()

    monkeypatch.setattr(settings, "max_upload_mb", 0)
    too_large = admin_client.post(url, files={"file": ("cert.png", PNG_BYTES, "image/png")})
    assert too_large.status_code == 413
    assert "too large" in too_large.json()["detail"].lower()


def test_upload_fails_clearly_when_production_storage_is_not_configured(admin_client, local_uploads, monkeypatch):
    login(admin_client)
    monkeypatch.setattr(settings, "app_env", "production")
    monkeypatch.setattr(settings, "storage_backend", "supabase")
    monkeypatch.setattr(settings, "supabase_url", "")
    monkeypatch.setattr(settings, "supabase_service_role_key", "")

    before = set(Path(local_uploads).glob("*"))
    response = admin_client.post(
        "/api/v1/admin/upload",
        files={"file": ("cert.png", PNG_BYTES, "image/png")},
    )
    assert response.status_code == 503, response.text
    assert "Storage configuration missing" in response.json()["detail"]
    assert set(Path(local_uploads).glob("*")) == before


def test_upload_endpoint_uses_configured_storage_adapter(admin_client, monkeypatch):
    login(admin_client)

    async def fake_persist(filename, content, content_type):
        return {
            "filename": filename,
            "url": "https://abc.supabase.co/storage/v1/object/public/portfolio-uploads/cert.png",
            "size": len(content),
            "storage": "supabase",
        }

    monkeypatch.setattr(main, "persist_upload", fake_persist)
    response = admin_client.post(
        "/api/v1/admin/upload",
        files={"file": ("cert.png", PNG_BYTES, "image/png")},
    )
    assert response.status_code == 201, response.text
    assert response.json()["storage"] == "supabase"
    assert response.json()["url"].startswith("https://abc.supabase.co/")


def test_supabase_storage_adapter_builds_public_url(monkeypatch):
    captured = {}

    class FakeResponse:
        is_success = True
        text = "{}"

    class FakeAsyncClient:
        def __init__(self, **kwargs):
            captured["timeout"] = kwargs.get("timeout")

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        async def post(self, url, headers=None, content=None):
            captured.update(url=url, headers=headers, content=content)
            return FakeResponse()

    monkeypatch.setattr(storage.httpx, "AsyncClient", FakeAsyncClient)
    monkeypatch.setattr(settings, "storage_backend", "supabase")
    monkeypatch.setattr(settings, "supabase_url", "https://abc.supabase.co/")
    monkeypatch.setattr(settings, "supabase_service_role_key", "service-role-key")
    monkeypatch.setattr(settings, "supabase_storage_bucket", "portfolio-uploads")

    result = asyncio.run(storage.persist_upload("cert-123.png", PNG_BYTES, "image/png"))
    assert captured["url"] == "https://abc.supabase.co/storage/v1/object/portfolio-uploads/cert-123.png"
    assert captured["headers"]["Authorization"] == "Bearer service-role-key"
    assert captured["content"] == PNG_BYTES
    assert result["url"] == "https://abc.supabase.co/storage/v1/object/public/portfolio-uploads/cert-123.png"
    assert result["storage"] == "supabase"

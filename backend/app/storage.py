"""Upload persistence adapters.

The service-role credential stays on the backend. Public URLs are returned to the
frontend and can be rendered directly by the portfolio.
"""

from typing import Dict
from urllib.parse import quote

import httpx

from .config import settings


class StorageConfigurationError(RuntimeError):
    """Raised when uploads cannot be persisted durably."""


class StorageUploadError(RuntimeError):
    """Raised when the storage provider rejects an upload."""


async def persist_upload(filename: str, content: bytes, content_type: str) -> Dict[str, object]:
    """Persist a validated upload and return its public metadata."""
    backend = settings.storage_backend.lower()

    if backend == "supabase":
        if not settings.supabase_configured:
            raise StorageConfigurationError(
                "Storage configuration missing. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY "
                "and SUPABASE_STORAGE_BUCKET in Render."
            )
        object_path = quote(filename, safe="-._")
        base = settings.supabase_url.rstrip("/")
        upload_url = (
            f"{base}/storage/v1/object/{quote(settings.supabase_storage_bucket, safe='')}"
            f"/{object_path}"
        )
        headers = {
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "apikey": settings.supabase_service_role_key,
            "Content-Type": content_type or "application/octet-stream",
            "x-upsert": "false",
        }
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(upload_url, headers=headers, content=content)
        except httpx.HTTPError as exc:
            raise StorageUploadError("Upload provider is unreachable. Please try again.") from exc
        if not response.is_success:
            detail = response.text[:200].replace("\n", " ")
            raise StorageUploadError(f"Upload provider rejected the file: {detail}")
        public_url = (
            f"{base}/storage/v1/object/public/"
            f"{quote(settings.supabase_storage_bucket, safe='')}/{object_path}"
        )
        return {
            "filename": filename,
            "url": public_url,
            "size": len(content),
            "storage": "supabase",
        }

    if backend == "local":
        if settings.is_production:
            raise StorageConfigurationError(
                "Storage configuration missing. Local uploads are not persistent in "
                "production; set STORAGE_BACKEND=supabase with Supabase credentials."
            )
        (settings.upload_path / filename).write_bytes(content)
        return {
            "filename": filename,
            "url": f"{settings.public_base_url.rstrip('/')}/uploads/{filename}",
            "size": len(content),
            "storage": "local",
        }

    raise StorageConfigurationError(
        f"Unsupported STORAGE_BACKEND '{settings.storage_backend}'. Use 'supabase' or 'local'."
    )

# API Contract v1

Base URL (local): `http://localhost:8000/api/v1`

All responses are JSON unless a file is being served. Public endpoints return published content only. Admin endpoints require the signed `portfolio_admin_session` HttpOnly cookie from `POST /admin/login`.

## Health
- `GET /health` — service health.

## Public content
- `GET /{collection}` where collection is `profile`, `education`, `experience`, `skills`, `projects`, `achievements`, `certificates`, `social-links`, `site-settings`, or `resume`.
- `GET /projects/{slug}` — one published project.
- `POST /contact` — accepts `{ "name": "...", "email": "...", "subject": "...", "message": "..." }`; returns 202 and an explicit `email_status` of `sent`, `failed`, or `not_configured`.

A profile/resume collection returns the first published item or null. Other collections return arrays sorted by `sort_order`.

## Authentication
- `POST /admin/login` JSON `{ "username": "...", "password": "..." }`; sets HttpOnly cookie.
- `POST /admin/logout`; clears cookie.
- `GET /admin/me`; verifies session.

## Admin CMS
- `GET /admin/{collection}` — all records, including drafts.
- `POST /admin/{collection}` — create record.
- `PUT /admin/{collection}/{id}` — replace record fields.
- `DELETE /admin/{collection}/{id}` — delete record.
- `POST /admin/upload` multipart field `file`; allowed extensions PDF, PNG, JPG, JPEG, WEBP; size controlled by `MAX_UPLOAD_MB`.

Content record shape:
```json
{
  "slug": "example-item",
  "title": "Example item",
  "data": {"description": "Editable content"},
  "is_published": false,
  "is_featured": false,
  "sort_order": 0
}
```

All admin endpoints require authentication. Invalid collection returns 404. Duplicate collection/slug returns 409. Unauthorized requests return 401.

## Frontend integration notes
- Use `credentials: "include"` on admin API fetches.
- Set exact frontend origins in `CORS_ORIGINS`.
- For production, use same-site deployment or configure HTTPS, secure cookies, CSRF protection and strict origin validation.
- Public API currently returns an envelope per item (`id`, `collection`, `slug`, `title`, `data`, publication flags and timestamps). Render fields from `data`.
- Never expose admin credentials in client-side code.

# Portfolio Hub Architecture

## Ownership boundary
- This bundle contains backend, documentation and configuration only.
- Antigravity owns the separate `frontend/` application.
- Existing root `public/` assets and `.git/` are not included or modified.

## Backend
FastAPI under `backend/app/`; SQLAlchemy persistence; SQLite by default for local setup and PostgreSQL through `DATABASE_URL` for production.

## Content model
`content_items` is a flexible collection-based CMS table. Each record has a collection name, slug, title, JSON `data`, publication/feature flags and display order. This lets the admin manage profile, education, experience, skills, projects, achievements, certificates, resume, social links and site settings without a schema migration for every new profile field.

`admin_users` stores the bootstrap admin account. `contact_messages` stores validated inbound messages and email delivery state.

## Authentication
Admin session is a signed, HttpOnly cookie. Admin APIs check it server-side. Set a strong `SECRET_KEY`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` before first production startup. Set `COOKIE_SECURE=true` behind HTTPS. No public registration exists.

## File storage
Local `backend/uploads/` storage is used only in development. Production uploads go to a public Supabase Storage bucket through `backend/app/storage.py`; the service-role key stays on the backend. If Supabase is not configured, production uploads return HTTP 503 instead of writing to Render's ephemeral filesystem. Uploaded URLs are public and are stored in each content item's JSON `data`.

## Email
Contact messages are always saved. Resend delivery occurs only when `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured. Verify the sending domain with Resend before production.

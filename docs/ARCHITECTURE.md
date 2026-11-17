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
The initial implementation uses local `backend/uploads/` storage, suitable for local development. For production, configure a persistent object storage adapter (for example Supabase Storage) before deploying; local ephemeral filesystems are not durable on many hosting providers. Never expose storage service-role keys to the browser.

## Email
Contact messages are always saved. Resend delivery occurs only when `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured. Verify the sending domain with Resend before production.

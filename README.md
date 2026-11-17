# Sonali Sharma Portfolio — Backend Bundle

This ZIP is intended to be extracted into the existing `Portfolio_hub/` repository root. It adds `backend/`, `docs/`, `.gitignore` and this README. The environment template is `backend/.env.example`. It does not include a frontend, and does not include or replace your existing `.git/` or `public/` folders.

## Local setup (Windows PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set a strong `SECRET_KEY` and `ADMIN_PASSWORD`. For a local test, SQLite is configured by default.

Start the API:

```powershell
python -m app
```

Open:
- Health: http://127.0.0.1:8000/health
- Swagger API docs: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

The first startup creates the local database and starter content. Project entries are drafts pending review. The verified Orbion achievement is seeded as published. Acmegrade is intentionally excluded.

## Tests

```powershell
python -m pytest
```

## Important implementation notes

- The admin API is functional; the visual `/admin` dashboard is part of the future Antigravity frontend.
- The default local file upload implementation stores files in `backend/uploads/`. Configure persistent cloud storage before production.
- Contact messages are stored locally. Real email delivery requires Resend credentials and a verified sender domain.
- The backend is a starter implementation requiring production hardening (persistent object storage, deployment-level rate limiting/CAPTCHA, CSRF strategy and database migrations) before public launch.
- See `docs/API_CONTRACT.md` before building the frontend.

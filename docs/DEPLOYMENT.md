# Deployment Checklist

- Use PostgreSQL and run Alembic migrations.
- Set `APP_ENV=production`, strong `SECRET_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.
- Set `COOKIE_SECURE=true` and exact `CORS_ORIGINS`.
- Configure persistent object storage before deploying; local uploads may be lost on ephemeral hosts.
- Configure Resend API key, verified sender address and destination email.
- Set `PUBLIC_BASE_URL` to the deployed API origin.
- Use HTTPS.
- Add CAPTCHA or edge/WAF bot protection to the public contact form.
- Add a trusted proxy / rate limiter at the hosting edge for login and contact endpoints.
- Back up the database and storage.
- Do not commit `.env`, secrets, database files or private files.
- Configure the frontend's API base URL and `credentials: include` for admin sessions.

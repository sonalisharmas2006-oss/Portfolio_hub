# Deployment Checklist

## Render (FastAPI backend)

Set these environment variables in the Render service:

- `APP_ENV=production`
- `SECRET_KEY=<at least 32 random characters>`
- `ADMIN_USERNAME=sonali`
- `ADMIN_PASSWORD=<strong password>`
- `COOKIE_SECURE=true`
- `CORS_ORIGINS=https://portfolio-hub-psi-beige.vercel.app`
- `PUBLIC_BASE_URL=https://sonali-portfolio-api.onrender.com`
- `DATABASE_URL=<PostgreSQL connection string>`
- `STORAGE_BACKEND=supabase`
- `SUPABASE_URL=https://<project-ref>.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=<service-role key — never put this in Vercel>`
- `SUPABASE_STORAGE_BUCKET=portfolio-uploads` (create the bucket and make it public)

Uploads are rejected with HTTP 503 until the three `SUPABASE_*` variables are set. Local
`backend/uploads/` storage is intentionally disabled in production because Render's
filesystem is ephemeral; an upload is never reported as successful unless the file was
actually stored in the configured bucket.

Use PostgreSQL and run Alembic migrations. Back up the database and storage bucket.
Use HTTPS. Add a trusted proxy / rate limiter at the hosting edge for login and contact
endpoints, and add CAPTCHA or edge/WAF bot protection before a public contact-form launch.

## Vercel (Next.js frontend)

Set this environment variable in the Vercel project and redeploy:

- `NEXT_PUBLIC_API_BASE_URL=https://sonali-portfolio-api.onrender.com`

The API client also defaults to that URL when the variable is absent, and ignores
localhost values during production builds. `NEXT_PUBLIC_` variables are inlined at
build time, so a redeploy is required after changing it.

Allow these image hosts (already configured in `next.config.ts`): the API host's
`/uploads/**` path and `https://**.supabase.co/storage/v1/object/public/**`.

## Deploy order

1. Configure Render environment variables and the public Supabase bucket.
2. Deploy the backend and confirm `GET /health` returns `{"status":"ok",...}`.
3. Configure the Vercel environment variable and deploy the frontend.
4. Sign in at `/admin`, upload a test file, save an entry, and confirm it appears on the public page.

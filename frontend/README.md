# Sonali Sharma Portfolio — Frontend

This frontend was completed from the Antigravity partial scaffold. It is designed to live at `Portfolio_hub/frontend`. It uses `http://127.0.0.1:8000` in development and `https://sonali-portfolio-api.onrender.com` in production.

## Start locally (Windows CMD)

```cmd
cd frontend
npm install
npm run dev
```

Open **http://127.0.0.1:3000**. Keep the backend running in a separate terminal at **http://127.0.0.1:8000**. The API client defaults to those local URLs in development; set `NEXT_PUBLIC_API_BASE_URL` only when the backend lives elsewhere. If the backend CORS list does not include `http://127.0.0.1:3000`, add it to `backend/.env` under `CORS_ORIGINS`, then restart the backend.

Admin dashboard: **http://127.0.0.1:3000/admin**. Use the credentials configured in `backend/.env`.

## Included
- Vintage milk-coffee editorial portfolio homepage.
- Interactive perspective cargo-container navigation (CSS 3D transforms; lightweight and responsive).
- About, projects, achievement, certificate, resume and contact sections.
- Private admin sign-in and generic CRUD manager for profile, education, experience, skills, projects, achievements, certificates, resume, social links and site settings.
- API integration using the existing FastAPI endpoints and HttpOnly session cookie.
- Dynamic project detail routes, metadata, sitemap and robots rules.
- Existing personal photo, Orbion team photo and six identified certificate images copied into `public/assets/`.

## Important notes
- The current backend returns no published project/certificate/resume records in the uploaded database. The homepage shows clearly identified local project/certificate references as an initial presentation fallback; publish and manage the definitive entries through `/admin`.
- The certificate images are actual supplied files: HackMatrix '26 Top 30 Finalist; HackMatrix '26 Code Nexus; WhyCode.4u Hackathon; Cyberexplore 2026; IoT Workshop; RushKIDDOS 1.0. Acmegrade is intentionally excluded.
- Contact form status is displayed according to the backend's `email_status`. Configure Resend in the backend before expecting actual email delivery.
- The admin editor provides generated form fields for common profile/content properties plus an advanced JSON editor for additional backend fields. Use the field names in `../docs/API_CONTRACT.md` and the backend seed data.
- Admin uploads use `FormData` without a manually set `Content-Type`. Production uploads require Supabase Storage; see `../docs/DEPLOYMENT.md` for the exact Render/Vercel variables.
- The frontend defaults to `https://sonali-portfolio-api.onrender.com` in production. Set `NEXT_PUBLIC_API_BASE_URL` in Vercel if the backend URL changes.
- Uploaded certificate images/PDFs and resume files are served from public URLs, so no `public/` folder edit or redeploy is needed after publishing content.

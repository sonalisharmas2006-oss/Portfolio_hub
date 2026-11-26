# Admin Guide

1. Configure `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `SECRET_KEY` in `backend/.env` (or Render environment variables).
2. Start the API and open `http://127.0.0.1:8000/docs` to inspect the API.
3. The frontend admin login calls `POST /api/v1/admin/login`; the signed session cookie is sent on all admin requests.
4. Check the session with `GET /api/v1/admin/me`.
5. Manage each content section with `GET/POST/PUT/PATCH/DELETE /api/v1/admin/{collection}`.
6. Upload a file with `POST /api/v1/admin/upload` using multipart form data (field `file`). Do not set the multipart `Content-Type` header manually; the browser adds the boundary.
7. Copy the returned `url` into the content record's `data` (the admin upload button does this automatically).
8. For production, configure Supabase Storage (see `DEPLOYMENT.md`). Without it the upload endpoint returns HTTP 503 instead of pretending the file was saved.

## Certificate workflow in `/admin`

1. Sign in and select **Certificates**.
2. Click **Add new**.
3. Enter a title and a unique slug.
4. Upload the certificate image or PDF. The returned URL is automatically written to `image_url` + `file_url` for images, or `file_url` for PDFs.
5. Tick **Published publicly**, then click **Save changes**.
6. The entry appears in the admin list immediately and on the public portfolio after the page reloads. No `public/` folder edit, Git commit or Vercel redeploy is needed.

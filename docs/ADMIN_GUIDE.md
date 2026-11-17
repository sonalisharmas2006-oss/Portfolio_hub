# Admin Guide

1. Configure `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `SECRET_KEY` in `backend/.env`.
2. Start the API and open `http://localhost:8000/docs` to inspect the API.
3. Frontend admin login calls `POST /api/v1/admin/login`.
4. Check the session with `GET /api/v1/admin/me`.
5. Manage each content section using `/api/v1/admin/{collection}`.
6. Upload files using `POST /api/v1/admin/upload`, then store the returned URL in the content record's `data`.

There is no admin web interface in this bundle; Antigravity will build that frontend. The protected admin API is provided here.

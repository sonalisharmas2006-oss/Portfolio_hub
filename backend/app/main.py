from pathlib import Path
import re, mimetypes
import httpx
from fastapi import FastAPI, Depends, HTTPException, Request, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import select
from .config import settings
from .database import Base, engine, get_db
from .models import ContentItem, AdminUser, ContactMessage
from .schemas import LoginInput, ContentInput, ContactInput
from .security import COOKIE_NAME, hash_password, verify_password, make_session, require_admin
from .seed import seed_initial_content

COLLECTIONS = {"profile","education","experience","skills","projects","achievements","certificates","social-links","site-settings","resume"}
app = FastAPI(title=settings.app_name, version="1.0.0", description="Portfolio content and administration API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(
        settings.cors_origin_list
        + ["https://portfolio-hub-psi-beige.vercel.app"]
    )),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
upload_path = settings.upload_path
app.mount("/uploads", StaticFiles(directory=str(upload_path)), name="uploads")

@app.on_event("startup")
def startup():
    if settings.app_env == "production" and (len(settings.secret_key) < 32 or not settings.admin_password):
        raise RuntimeError("Production requires SECRET_KEY (32+ chars) and ADMIN_PASSWORD.")
    Base.metadata.create_all(bind=engine)
    from .database import SessionLocal
    db = SessionLocal()
    try:
        if settings.admin_password and not db.query(AdminUser).filter_by(username=settings.admin_username).first():
            db.add(AdminUser(username=settings.admin_username, password_hash=hash_password(settings.admin_password)))
            db.commit()
        seed_initial_content(db)
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status":"ok","service":settings.app_name}

def item_out(item: ContentItem):
    return {"id":item.id,"collection":item.collection,"slug":item.slug,"title":item.title,
            "data":item.data or {},"is_published":item.is_published,"is_featured":item.is_featured,
            "sort_order":item.sort_order,"created_at":item.created_at,"updated_at":item.updated_at}

def valid_collection(collection: str):
    if collection not in COLLECTIONS:
        raise HTTPException(404, "Unknown content collection")

@app.get(settings.api_v1_prefix + "/{collection}")
def public_collection(collection: str, db: Session = Depends(get_db)):
    valid_collection(collection)
    rows = db.scalars(select(ContentItem).where(
        ContentItem.collection == collection, ContentItem.is_published.is_(True)
    ).order_by(ContentItem.sort_order, ContentItem.id)).all()
    if collection == "profile":
        return item_out(rows[0]) if rows else None
    if collection == "resume":
        return item_out(rows[0]) if rows else None
    return [item_out(x) for x in rows]

@app.get(settings.api_v1_prefix + "/projects/{slug}")
def public_project(slug: str, db: Session = Depends(get_db)):
    row = db.scalar(select(ContentItem).where(ContentItem.collection=="projects",
        ContentItem.slug==slug, ContentItem.is_published.is_(True)))
    if not row: raise HTTPException(404, "Project not found")
    return item_out(row)

@app.post(settings.api_v1_prefix + "/admin/login")
def admin_login(payload: LoginInput, response: Response, db: Session = Depends(get_db)):
    user = db.scalar(select(AdminUser).where(AdminUser.username == payload.username))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid username or password")
    response.set_cookie(COOKIE_NAME, make_session(user.username), httponly=True,
        secure=settings.cookie_secure, samesite="lax", max_age=settings.session_max_age_seconds,
        path="/")
    return {"authenticated":True,"username":user.username}

@app.post(settings.api_v1_prefix + "/admin/logout")
def admin_logout(response: Response, _: str = Depends(require_admin)):
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"authenticated":False}

@app.get(settings.api_v1_prefix + "/admin/me")
def admin_me(username: str = Depends(require_admin)):
    return {"authenticated":True,"username":username}

@app.get(settings.api_v1_prefix + "/admin/{collection}")
def admin_list(collection: str, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    valid_collection(collection)
    rows = db.scalars(select(ContentItem).where(ContentItem.collection==collection)
                      .order_by(ContentItem.sort_order, ContentItem.id)).all()
    return [item_out(x) for x in rows]

@app.post(settings.api_v1_prefix + "/admin/{collection}", status_code=201)
def admin_create(collection: str, payload: ContentInput, db: Session = Depends(get_db),
                 _: str = Depends(require_admin)):
    valid_collection(collection)
    exists = db.scalar(select(ContentItem).where(ContentItem.collection==collection, ContentItem.slug==payload.slug))
    if exists: raise HTTPException(409, "An item with this slug already exists")
    row = ContentItem(collection=collection, **payload.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return item_out(row)

@app.put(settings.api_v1_prefix + "/admin/{collection}/{item_id}")
def admin_update(collection: str, item_id: int, payload: ContentInput, db: Session = Depends(get_db),
                 _: str = Depends(require_admin)):
    valid_collection(collection)
    row = db.get(ContentItem, item_id)
    if not row or row.collection != collection: raise HTTPException(404, "Content not found")
    conflict = db.scalar(select(ContentItem).where(ContentItem.collection==collection,
        ContentItem.slug==payload.slug, ContentItem.id != item_id))
    if conflict: raise HTTPException(409, "Slug already in use")
    for key, value in payload.model_dump().items(): setattr(row, key, value)
    db.commit(); db.refresh(row)
    return item_out(row)

@app.delete(settings.api_v1_prefix + "/admin/{collection}/{item_id}")
def admin_delete(collection: str, item_id: int, db: Session = Depends(get_db),
                 _: str = Depends(require_admin)):
    valid_collection(collection)
    row = db.get(ContentItem, item_id)
    if not row or row.collection != collection: raise HTTPException(404, "Content not found")
    db.delete(row); db.commit()
    return {"deleted":True,"id":item_id}

@app.post(settings.api_v1_prefix + "/admin/upload", status_code=201)
async def admin_upload(file: UploadFile = File(...), _: str = Depends(require_admin)):
    allowed = {".pdf",".png",".jpg",".jpeg",".webp"}
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in allowed: raise HTTPException(415, "Only PDF, PNG, JPG and WEBP files are allowed")
    content = await file.read(settings.max_upload_mb * 1024 * 1024 + 1)
    if len(content) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(413, "File exceeds upload size limit")
    # Verify signatures for common formats rather than trusting browser MIME headers.
    signatures = {".pdf": content.startswith(b"%PDF"), ".png": content.startswith(b"\x89PNG\r\n\x1a\n"),
                  ".jpg": content.startswith(b"\xff\xd8\xff"), ".jpeg": content.startswith(b"\xff\xd8\xff"),
                  ".webp": content.startswith(b"RIFF") and content[8:12] == b"WEBP"}
    if not signatures.get(suffix, False): raise HTTPException(415, "File content does not match its extension")
    safe_name = re.sub(r"[^a-zA-Z0-9._-]", "-", Path(file.filename).name)[:100]
    import uuid
    stored = f"{uuid.uuid4().hex}-{safe_name}"
    (upload_path / stored).write_bytes(content)
    return {"filename":stored,"original_filename":file.filename,
            "url":f"{settings.public_base_url.rstrip('/')}/uploads/{stored}","size":len(content)}

@app.post(settings.api_v1_prefix + "/contact", status_code=202)
async def contact(payload: ContactInput, request: Request, db: Session = Depends(get_db)):
    # Basic origin-independent validation. Add an edge/WAF challenge or CAPTCHA before public launch.
    msg = ContactMessage(name=payload.name.strip(), email=str(payload.email),
        subject=payload.subject.strip(), message=payload.message.strip())
    db.add(msg); db.commit(); db.refresh(msg)
    if settings.resend_api_key and settings.resend_from_email:
        try:
            async with httpx.AsyncClient(timeout=12) as client:
                result = await client.post("https://api.resend.com/emails",
                    headers={"Authorization":f"Bearer {settings.resend_api_key}"},
                    json={"from":settings.resend_from_email,"to":[settings.contact_to_email],
                          "reply_to":str(payload.email),"subject":f"Portfolio contact: {payload.subject}",
                          "text":f"From: {payload.name} <{payload.email}>\n\n{payload.message}"})
                result.raise_for_status()
            msg.email_status = "sent"; db.commit()
            return {"accepted":True,"email_status":"sent"}
        except Exception:
            msg.email_status = "failed"; db.commit()
            return {"accepted":True,"email_status":"failed","message":"Message saved, but email delivery failed. Please use the direct email link."}
    return {"accepted":True,"email_status":"not_configured",
            "message":"Message saved. Email delivery is not configured yet; configure Resend before production."}

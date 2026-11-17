import hashlib, hmac, secrets
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from fastapi import Request, HTTPException, status
from .config import settings

COOKIE_NAME = "portfolio_admin_session"
serializer = URLSafeTimedSerializer(settings.secret_key, salt="portfolio-admin-session-v1")

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return "pbkdf2_sha256$310000$%s$%s" % (salt.hex(), digest.hex())

def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, rounds, salt_hex, digest_hex = encoded.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), int(rounds))
        return hmac.compare_digest(candidate.hex(), digest_hex)
    except Exception:
        return False

def make_session(username: str) -> str:
    return serializer.dumps({"sub": username, "nonce": secrets.token_urlsafe(12)})

def require_admin(request: Request) -> str:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin login required")
    try:
        data = serializer.loads(token, max_age=settings.session_max_age_seconds)
        return data["sub"]
    except (BadSignature, SignatureExpired, KeyError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid")

import os
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from db import (
    add_image,
    count_images,
    count_recent_images_by_ip,
    delete_image,
    get_image,
    init_db,
    list_images,
    list_visits,
    record_visit,
)

AUDIT_ADMIN_TOKEN = os.environ.get("AUDIT_ADMIN_TOKEN")

UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

CATEGORIES = {"fine-art", "design-projects", "photography"}
MAX_UPLOAD_BYTES = 8 * 1024 * 1024
MAX_IMAGES_TOTAL = 500
MAX_UPLOADS_PER_IP_HOUR = 20
MAX_CAPTION_WORDS = 100
MAX_CAPTION_CHARS = 2000


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="aarya API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://aarya.narukullapati.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/api/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


def _client_ip(request: Request, x_forwarded_for: str | None) -> str | None:
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else None


def _sniff_ext(head: bytes) -> str | None:
    if head.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if head.startswith(b"\x89PNG"):
        return ".png"
    if head[:6] in (b"GIF87a", b"GIF89a"):
        return ".gif"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return ".webp"
    if head[4:8] == b"ftyp" and head[8:12] in (b"avif", b"avis"):
        return ".avif"
    return None


def _with_url(row: dict) -> dict:
    return {**row, "url": f"/api/uploads/{row['filename']}"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


class TrackIn(BaseModel):
    path: str = "/"
    referrer: str | None = None


@app.post("/api/track", status_code=204)
def track(
    body: TrackIn,
    request: Request,
    user_agent: str | None = Header(None),
    accept_language: str | None = Header(None),
    x_forwarded_for: str | None = Header(None),
):
    ip = _client_ip(request, x_forwarded_for)
    record_visit(
        ip=ip,
        user_agent=user_agent,
        path=body.path[:500],
        referrer=(body.referrer or "")[:500],
        accept_language=accept_language,
    )


@app.get("/api/visits")
def visits(limit: int = 100, x_admin_token: str | None = Header(None)):
    if AUDIT_ADMIN_TOKEN and x_admin_token != AUDIT_ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="invalid admin token")
    return list_visits(min(limit, 1000))


@app.get("/api/images")
def images(category: str | None = None):
    return {"images": [_with_url(r) for r in list_images(category)]}


@app.post("/api/images", status_code=201)
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    caption: str = Form(""),
    category: str = Form(""),
    x_forwarded_for: str | None = Header(None),
):
    if category not in CATEGORIES:
        raise HTTPException(status_code=400, detail="unknown category")
    caption = caption.strip()[:MAX_CAPTION_CHARS]
    if len(caption.split()) > MAX_CAPTION_WORDS:
        raise HTTPException(status_code=422, detail="caption exceeds 100 words")

    ip = _client_ip(request, x_forwarded_for)
    if ip and count_recent_images_by_ip(ip) >= MAX_UPLOADS_PER_IP_HOUR:
        raise HTTPException(status_code=429, detail="too many uploads, try later")
    if count_images() >= MAX_IMAGES_TOTAL:
        raise HTTPException(status_code=507, detail="image storage is full")

    data = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="file too large (max 8 MB)")
    ext = _sniff_ext(data[:16])
    if not ext:
        raise HTTPException(status_code=415, detail="unsupported image type")

    filename = f"{uuid.uuid4().hex}{ext}"
    (UPLOAD_DIR / filename).write_bytes(data)
    return _with_url(add_image(category, caption, filename, ip))


@app.delete("/api/images/{image_id}", status_code=204)
def remove_image(image_id: int):
    row = get_image(image_id)
    if not row:
        raise HTTPException(status_code=404, detail="image not found")
    delete_image(image_id)
    try:
        (UPLOAD_DIR / row["filename"]).unlink()
    except OSError:
        pass

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from db import init_db, list_visits, record_visit

AUDIT_ADMIN_TOKEN = os.environ.get("AUDIT_ADMIN_TOKEN")


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
    ip = (
        x_forwarded_for.split(",")[0].strip()
        if x_forwarded_for
        else request.client.host if request.client else None
    )
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

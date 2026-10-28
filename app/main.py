"""RoRa Homes web app: JSON API + static frontend."""
import re
import time
from contextlib import asynccontextmanager
from pathlib import Path

import psycopg
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app import db
from app.catalog import QuoteError, load_catalog, quote_inputs
from app.migrate import migrate
from app.pricing import quote

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
EMAIL_RE = re.compile(r"^[^@\s]{1,64}@[^@\s]+\.[^@\s]{2,}$")
CATALOG_TTL_SECONDS = 30

_catalog_cache: tuple[float, dict] | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    pool = db.open_pool()
    with pool.connection() as conn:
        migrate(conn)
    yield
    db.close_pool()


app = FastAPI(title="RoRa Homes", lifespan=lifespan, docs_url="/api/docs", openapi_url="/api/openapi.json")


@app.middleware("http")
async def cache_headers(request: Request, call_next):
    response = await call_next(request)
    path = request.url.path
    if path.startswith("/images/"):
        response.headers.setdefault("Cache-Control", "public, max-age=86400")
    elif not path.startswith("/api/") and path != "/healthz":
        # HTML/CSS/JS: always revalidate (ETag) so a new deploy is picked up immediately.
        response.headers.setdefault("Cache-Control", "no-cache")
    return response


@app.get("/healthz")
def healthz():
    with db.pool().connection() as conn:
        conn.execute("select 1")
    return {"ok": True}


@app.get("/api/catalog")
def catalog():
    global _catalog_cache
    now = time.monotonic()
    if _catalog_cache is None or now - _catalog_cache[0] > CATALOG_TTL_SECONDS:
        with db.pool().connection() as conn:
            _catalog_cache = (now, load_catalog(conn))
    return JSONResponse(_catalog_cache[1], headers={"Cache-Control": "public, max-age=30"})


class QuoteRequest(BaseModel):
    set_id: str = Field(alias="setId", max_length=80)
    items: dict[str, str] = Field(description="slot -> product id for the products kept in the set")


@app.post("/api/quote")
def set_quote(req: QuoteRequest):
    """Server-side price of a customised set (same rules as the frontend)."""
    with db.pool().connection() as conn:
        try:
            rates, prices, removed = quote_inputs(conn, req.set_id, req.items)
        except QuoteError as e:
            raise HTTPException(status_code=400, detail=str(e))
    q = quote(prices, rates, removed)
    return {"regular": q.regular / 100, "rate": q.rate, "discount": q.discount / 100, "total": q.total / 100,
            "count": q.count, "removed": removed}


class SignupRequest(BaseModel):
    email: str = Field(max_length=254)
    consent: bool
    source: str | None = Field(default=None, max_length=40)


@app.post("/api/signups", status_code=201)
def signup(req: SignupRequest):
    email = req.email.strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Palun sisesta korrektne e-posti aadress.")
    if not req.consent:
        raise HTTPException(status_code=400, detail="Palun kinnita nõusolek.")
    with db.pool().connection() as conn:
        try:
            conn.execute(
                "insert into signups (email, consent, source) values (%s, true, %s) on conflict (email) do nothing",
                (email, req.source),
            )
        except psycopg.Error:
            raise HTTPException(status_code=500, detail="Salvestamine ebaõnnestus. Proovi hiljem uuesti.")
    # Same answer for new and existing addresses (no information leak).
    return {"ok": True}


# Frontend (must be mounted last so /api routes win).
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

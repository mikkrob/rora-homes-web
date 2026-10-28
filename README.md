# RoRa Homes – web app

Estonian online shop prototype for **designer-made decor sets** (150–350 €). Visitors answer a few
questions in a demo assistant, see two matching sets on a room preview (sample room or their own
photo), swap or remove products with live set pricing, and add the set to a sample cart.
"Notify me when the shop opens" sign-ups are stored in PostgreSQL.

- **Backend:** Python 3.12, FastAPI, psycopg 3 (connection pool)
- **Database:** PostgreSQL – catalogue (products, images, alternatives, sets, pricing rules) and sign-ups
- **Frontend:** plain HTML/CSS/JavaScript modules served by FastAPI (no build step)
- **Hosting:** Railway (one web service + one Postgres service)

The assistant is a rule-based demo, not a real AI, and is labelled as such in the UI.
Uploaded room photos never leave the browser.

## Architecture

```
Browser ──GET /api/catalog──▶ FastAPI ──▶ PostgreSQL
        ──POST /api/signups─▶         ──▶ signups table
        ──POST /api/quote───▶ server-side set price (same rules as the UI)
        ◀── static/ (index.html, css, js, images)
```

| Path | What |
|---|---|
| `app/main.py` | API routes, static files, cache headers, start-up migration |
| `app/catalog.py` | Reads the catalogue from Postgres; validates customised sets for quotes |
| `app/pricing.py` | Set pricing rules (mirrored in `static/js/pricing.js`) |
| `app/migrate.py` | Applies `migrations/*.sql` once, seeds an empty database |
| `app/seed.py` | Initial catalogue (38 products, 8 sets) |
| `migrations/001_schema.sql` | Database schema |
| `static/` | Frontend; `static/images/products/` holds product photos and cutouts |
| `scripts/prepare_images.py` | Makes web photos + transparent cutouts from original product photos |
| `scripts/dev.py` | Local run with an embedded PostgreSQL |
| `tests/` | pytest: pricing rules, API, sign-ups (against a real Postgres) |

## Data model

- `rooms` – living room, bedroom, … and their "what stays" answer options
- `products` – SKU, name, category, material, colour, dimensions, **price in cents**, tags, `shopify_product_id` (for a later Shopify sync)
- `product_images` – **URL** + role (`photo`, `cutout`, later `variant` with camera/pose) – files are not stored in the database
- `product_alternatives` – which products can replace which
- `sets`, `set_items` (product + position on the preview), `set_variants` (budget "lite" variant), `set_images`
- `set_discounts` – the pricing rule: discount rate by number of products removed
- `signups` – e-mail, consent, source, time
- `schema_migrations` – applied migrations

### Pricing rule

Each set has rates such as `[0.12, 0.06, 0.02]`: full set 12 %, one product removed 6 %, two removed
2 %, more 0 %. Swapping a product keeps the rate and uses the new price. The discount is rounded to
whole euros. Removing a product always lowers the total (covered by a test).

## Run locally

Needs Python 3.12. No separate PostgreSQL install is needed – `scripts/dev.py` starts an embedded one
(data in `.pgdata/`, git-ignored).

```bash
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements-dev.txt
.venv/Scripts/python.exe scripts/dev.py 8000
```

Open http://localhost:8000 · API docs: http://localhost:8000/api/docs

To use your own PostgreSQL instead, set `DATABASE_URL` (see `.env.example`) and run
`uvicorn app.main:app --reload`.

## Tests

```bash
.venv/Scripts/python.exe -m pytest -q
```

## Deploy to Railway

1. Railway → **New Project → Deploy from GitHub repo** → choose this repository.
2. In the project: **New → Database → PostgreSQL**.
3. Web service → **Variables**: add `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`.
4. Web service → **Settings → Networking → Generate Domain**.

Railway installs `requirements.txt`, then runs the start command from `railway.json`
(`uvicorn … --port $PORT`) and checks `/healthz`. On start-up the app creates the tables and seeds the
catalogue if the database is empty. Every push to `main` redeploys.

## Editing the catalogue

Postgres is the source of truth after the first start (`app/seed.py` is only used for an empty
database). Edit prices, texts, sets and image URLs in Railway's **Data** tab or with SQL, e.g.:

```sql
update products set price_cents = 3900, updated_at = now() where id = 'OR-PK-101';
update set_discounts set rate = 0.10 where set_id = 'roheline-tasakaal' and removed_count = 0;
```

The API caches the catalogue for 30 seconds.

**New product photos:** put the originals in a folder outside the repo, add the product to
`SOURCES` in `scripts/prepare_images.py`, run it (needs `pip install pillow numpy scipy`), commit the
files in `static/images/products/`, and insert `product_images` rows with their URLs.

## API

| Method | Path | |
|---|---|---|
| GET | `/api/catalog` | rooms, products (with image URLs and alternatives), sets (items, discounts, lite variant) |
| POST | `/api/quote` | `{"setId": "...", "items": {"slot": "productId"}}` → regular, rate, discount, total (server derives the removed count and checks each product fits its slot) |
| POST | `/api/signups` | `{"email": "...", "consent": true, "source": "home"}` → 201 (same answer for new and existing addresses) |
| GET | `/healthz` | database check |

## Later

- **Shopify:** products, prices, photos, stock, orders and payments move to Shopify (its admin is the
  admin panel). Postgres keeps what Shopify doesn't model: set composition and preview positions,
  visualisation variants, set texts, sign-ups. `products.shopify_product_id` links the two.
- **Images:** move from `static/images` to object storage; only the URLs in `product_images` change.
- Real product data (prices, dimensions, materials) – current values are sample data.

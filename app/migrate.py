"""Apply SQL migrations and seed the catalogue on an empty database.

Runs at app start-up (idempotent, guarded by an advisory lock) and can be run by hand:
    python -m app.migrate
"""
from pathlib import Path

import psycopg

from app import seed
from app.db import database_url

MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"
LOCK_ID = 774_211  # arbitrary constant for pg_advisory_lock


def migrate(conn: psycopg.Connection) -> list[str]:
    applied_now: list[str] = []
    with conn.transaction():
        conn.execute("select pg_advisory_xact_lock(%s)", (LOCK_ID,))
        conn.execute(
            "create table if not exists schema_migrations ("
            " version text primary key, applied_at timestamptz not null default now())"
        )
        done = {r[0] for r in conn.execute("select version from schema_migrations")}
        for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
            if path.stem in done:
                continue
            conn.execute(path.read_text(encoding="utf-8"))
            conn.execute("insert into schema_migrations (version) values (%s)", (path.stem,))
            applied_now.append(path.stem)
        if conn.execute("select count(*) from products").fetchone()[0] == 0:
            seed.load(conn)
            applied_now.append("seed")
    return applied_now


def main() -> None:
    with psycopg.connect(database_url()) as conn:
        applied = migrate(conn)
    print("applied:", ", ".join(applied) if applied else "nothing (up to date)")


if __name__ == "__main__":
    main()

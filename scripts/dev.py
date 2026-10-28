"""Run the app locally with an embedded PostgreSQL (no Postgres install needed).

    python scripts/dev.py [port]

Data is kept in .pgdata/ (git-ignored). Delete that folder to start from the seed again.
Uses DATABASE_URL instead if it is set.
"""
import os
import sys
from pathlib import Path

import uvicorn

ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    if not os.environ.get("DATABASE_URL"):
        import pgserver

        srv = pgserver.get_server(str(ROOT / ".pgdata"), cleanup_mode=None)
        if "rorahomes" not in srv.psql("select datname from pg_database;"):
            srv.psql("create database rorahomes;")
        os.environ["DATABASE_URL"] = srv.get_uri("rorahomes")
    os.chdir(ROOT)
    sys.path.insert(0, str(ROOT))
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=False)


if __name__ == "__main__":
    main()

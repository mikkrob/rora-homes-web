import os

import pytest

pgserver = pytest.importorskip("pgserver", reason="pgserver (embedded Postgres) not installed")


@pytest.fixture(scope="session")
def database_url(tmp_path_factory):
    """A throw-away PostgreSQL server with an empty database for the test session."""
    srv = pgserver.get_server(str(tmp_path_factory.mktemp("pgdata")), cleanup_mode="stop")
    srv.psql("create database rorahomes_test;")
    url = srv.get_uri("rorahomes_test")
    yield url
    srv.cleanup()


@pytest.fixture(scope="session")
def client(database_url):
    os.environ["DATABASE_URL"] = database_url
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as c:
        yield c

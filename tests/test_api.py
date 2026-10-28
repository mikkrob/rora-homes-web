def test_healthz(client):
    assert client.get("/healthz").json() == {"ok": True}


def test_catalog_comes_from_postgres(client):
    cat = client.get("/api/catalog").json()
    assert len(cat["rooms"]) == 5
    assert len(cat["products"]) == 38
    assert len(cat["sets"]) == 8
    sets = {s["id"]: s for s in cat["sets"]}
    hero = sets["roheline-tasakaal"]
    assert hero["discounts"] == [0.12, 0.06, 0.02]
    assert [i["slot"] for i in hero["items"]] == ["padi1", "padi2", "pleed", "kunst", "vaas"]
    green = next(p for p in cat["products"] if p["id"] == "OR-PK-101")
    assert green["price"] == 35
    assert green["images"]["cutout"].endswith("OR-PK-101-cutout.webp")


def test_product_images_are_served(client):
    cat = client.get("/api/catalog").json()
    url = next(p["images"]["photo"] for p in cat["products"] if p["images"])
    assert client.get(url).status_code == 200


def test_frontend_is_served(client):
    r = client.get("/")
    assert r.status_code == 200
    assert "RoRa Homes" in r.text


def test_quote_full_set(client):
    items = {"padi1": "OR-PK-101", "padi2": "OR-PK-103", "pleed": "OR-PL-201", "kunst": "OR-KT-501", "vaas": "OR-VS-601"}
    q = client.post("/api/quote", json={"setId": "roheline-tasakaal", "items": items}).json()
    assert q == {"regular": 260, "rate": 0.12, "discount": 31, "total": 229, "count": 5, "removed": 0}


def test_quote_derives_removed_count_and_allows_alternatives(client):
    items = {"padi1": "OR-PK-101", "padi2": "OR-PK-103", "pleed": "OR-PL-202", "kunst": "OR-KT-501"}
    q = client.post("/api/quote", json={"setId": "roheline-tasakaal", "items": items}).json()
    assert q["removed"] == 1
    assert q["rate"] == 0.06
    assert q["regular"] == 35 + 32 + 49 + 75


def test_quote_rejects_product_from_wrong_category(client):
    r = client.post("/api/quote", json={"setId": "roheline-tasakaal", "items": {"padi1": "OR-VL-401"}})
    assert r.status_code == 400


def test_quote_rejects_unknown_set(client):
    assert client.post("/api/quote", json={"setId": "nope", "items": {}}).status_code == 400


def test_signup_saved_once(client, database_url):
    import psycopg

    for _ in range(2):
        r = client.post("/api/signups", json={"email": " Test@Example.EE ", "consent": True, "source": "home"})
        assert r.status_code == 201
    with psycopg.connect(database_url) as conn:
        rows = conn.execute("select email, consent, source from signups where email = 'test@example.ee'").fetchall()
    assert rows == [("test@example.ee", True, "home")]


def test_signup_requires_valid_email_and_consent(client):
    assert client.post("/api/signups", json={"email": "not-an-email", "consent": True}).status_code == 400
    assert client.post("/api/signups", json={"email": "a@b.ee", "consent": False}).status_code == 400

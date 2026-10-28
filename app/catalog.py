"""Read the catalogue from Postgres and shape it for the frontend."""
import psycopg
from psycopg.rows import dict_row


def euros(cents: int) -> float | int:
    return cents // 100 if cents % 100 == 0 else cents / 100


def load_catalog(conn: psycopg.Connection) -> dict:
    cur = conn.cursor(row_factory=dict_row)

    rooms = [
        {"id": r["id"], "name": r["name"], "keeps": r["keep_options"]}
        for r in cur.execute("select id, name, keep_options from rooms order by sort, id")
    ]

    alts: dict[str, list[str]] = {}
    for r in cur.execute("select product_id, alternative_id from product_alternatives order by product_id, sort"):
        alts.setdefault(r["product_id"], []).append(r["alternative_id"])

    images: dict[str, dict[str, str]] = {}
    for r in cur.execute("select product_id, role, url from product_images where role in ('photo', 'cutout') order by sort"):
        images.setdefault(r["product_id"], {}).setdefault(r["role"], r["url"])

    products = [
        {
            "id": r["id"], "name": r["name"], "category": r["category"], "kind": r["kind"],
            "colors": r["colors"], "colorName": r["color_name"], "material": r["material"], "dims": r["dims"],
            "price": euros(r["price_cents"]), "tags": r["tags"], "demo": r["is_demo"],
            "alts": alts.get(r["id"], []), "images": images.get(r["id"], {}),
        }
        for r in cur.execute("select * from products where active order by id")
    ]

    items: dict[str, list[dict]] = {}
    for r in cur.execute("select * from set_items order by set_id, sort"):
        items.setdefault(r["set_id"], []).append({
            "slot": r["slot"], "product": r["product_id"], "kind": r["kind"],
            "x": float(r["pos_x"]), "y": float(r["pos_y"]), "w": float(r["width"]),
        })
    discounts: dict[str, list[float]] = {}
    for r in cur.execute("select set_id, rate from set_discounts order by set_id, removed_count"):
        discounts.setdefault(r["set_id"], []).append(float(r["rate"]))
    variants: dict[str, dict] = {}
    for r in cur.execute("select * from set_variants where code = 'lite'"):
        variants[r["set_id"]] = {"swaps": r["swaps"], "removes": r["removes"], "note": r["note"]}
    set_images: dict[str, list[dict]] = {}
    for r in cur.execute("select set_id, role, url, alt from set_images order by set_id, sort"):
        set_images.setdefault(r["set_id"], []).append({"role": r["role"], "url": r["url"], "alt": r["alt"]})

    sets = [
        {
            "id": r["id"], "name": r["name"], "room": r["room_id"], "seasonal": r["seasonal"],
            "moods": r["moods"], "changes": r["changes"], "summary": r["summary"], "reason": r["reason"],
            "discounts": discounts.get(r["id"], []), "items": items.get(r["id"], []),
            "lite": variants.get(r["id"], {"swaps": {}, "removes": [], "note": ""}),
            "images": set_images.get(r["id"], []),
        }
        for r in cur.execute("select * from sets where active order by sort, id")
    ]
    return {"rooms": rooms, "products": products, "sets": sets}


class QuoteError(ValueError):
    pass


def quote_inputs(conn: psycopg.Connection, set_id: str, chosen: dict[str, str]) -> tuple[list[float], list[int], int]:
    """Validate a customised set and return (discount rates, prices in cents, removed count).

    `chosen` maps slot -> product id for the slots kept in the set. A slot may hold its
    default product or any active product of the same category (an alternative).
    The removed count is derived on the server: slots of the set that are not in `chosen`.
    """
    slots = {
        r[0]: r[1] for r in conn.execute(
            "select si.slot, p.category from set_items si join products p on p.id = si.product_id"
            " join sets s on s.id = si.set_id where si.set_id = %s and s.active", (set_id,))
    }
    if not slots:
        raise QuoteError("unknown set")
    unknown_slots = set(chosen) - set(slots)
    if unknown_slots:
        raise QuoteError(f"unknown slot: {sorted(unknown_slots)[0]}")
    products = {
        r[0]: (r[1], r[2]) for r in conn.execute(
            "select id, category, price_cents from products where id = any(%s) and active", (list(chosen.values()),))
    }
    prices = []
    for slot, pid in chosen.items():
        if pid not in products:
            raise QuoteError(f"unknown product: {pid}")
        category, price = products[pid]
        if category != slots[slot]:
            raise QuoteError(f"product {pid} does not fit slot {slot}")
        prices.append(price)
    rates = [float(r[0]) for r in conn.execute(
        "select rate from set_discounts where set_id = %s order by removed_count", (set_id,))]
    return rates, prices, len(slots) - len(chosen)

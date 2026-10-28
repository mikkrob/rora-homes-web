from app import seed
from app.pricing import discount_rate, quote

RATES = [0.12, 0.06, 0.02]


def test_full_set_gets_largest_discount():
    q = quote([3500, 3200, 7900, 7500, 3900], RATES, 0)
    assert q.regular == 26000
    assert q.discount == 3100      # 12 % of 260 € = 31.2 € -> 31 €
    assert q.total == 22900        # the "229 €" from the brief
    assert q.count == 5


def test_rate_by_removed_count():
    assert discount_rate(RATES, 0) == 0.12
    assert discount_rate(RATES, 1) == 0.06
    assert discount_rate(RATES, 2) == 0.02
    assert discount_rate(RATES, 3) == 0.0


def test_removing_a_product_always_lowers_the_total():
    for s in seed.SETS:
        prices = {p[0]: p[8] * 100 for p in seed.PRODUCTS}
        items = [prices[it[1]] for it in s[9]]
        full = quote(items, s[6], 0).total
        for i in range(len(items)):
            fewer = items[:i] + items[i + 1:]
            assert quote(fewer, s[6], 1).total < full, (s[0], i)


def test_half_euro_rounds_up_like_javascript():
    # 270 € * 15 % = 40.50 € -> 41 € (JavaScript Math.round)
    assert quote([27000], [0.15], 0).discount == 4100


def test_empty_set_costs_nothing():
    q = quote([], RATES, 5)
    assert (q.regular, q.discount, q.total, q.count) == (0, 0, 0, 0)


def test_full_set_prices_are_within_150_350():
    prices = {p[0]: p[8] * 100 for p in seed.PRODUCTS}
    for s in seed.SETS:
        total = quote([prices[it[1]] for it in s[9]], s[6], 0).total
        assert 15000 <= total <= 35000, s[0]

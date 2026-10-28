"""Set pricing rules.

A set has discount rates by the number of products removed from it, e.g.
[0.12, 0.06, 0.02]: full set 12 %, one product removed 6 %, two removed 2 %,
more removed 0 %. Swapping a product for an alternative keeps the rate and uses
the new product's price. The same rules are mirrored in static/js/pricing.js.
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class Quote:
    regular: int   # cents
    rate: float
    discount: int  # cents
    total: int     # cents
    count: int


def discount_rate(discounts: list[float], removed_count: int) -> float:
    if removed_count < 0:
        raise ValueError("removed_count must be >= 0")
    return discounts[removed_count] if removed_count < len(discounts) else 0.0


def round_half_up(value: float) -> int:
    """Round like JavaScript's Math.round for non-negative values (0.5 -> 1)."""
    return int(value + 0.5 + 1e-9)


def quote(prices_cents: list[int], discounts: list[float], removed_count: int) -> Quote:
    regular = sum(prices_cents)
    rate = discount_rate(discounts, removed_count) if prices_cents else 0.0
    # Discounts are rounded to whole euros, as shown in the shop.
    discount = round_half_up(regular / 100 * rate) * 100
    return Quote(regular=regular, rate=rate, discount=discount, total=regular - discount, count=len(prices_cents))

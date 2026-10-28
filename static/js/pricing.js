// Set pricing rules – mirror of app/pricing.py (keep them in sync).
// discounts = [full set, 1 product removed, 2 removed]; more removed → 0.
// Discounts are rounded to whole euros.

export function discountRate(discounts, removedCount) {
  return removedCount < discounts.length ? discounts[removedCount] : 0;
}

export function priceBundle(set, prices, removedCount) {
  const regular = prices.reduce((sum, p) => sum + p, 0);
  const rate = prices.length ? discountRate(set.discounts, removedCount) : 0;
  const discount = Math.round(regular * rate);
  return { regular, rate, discount, total: regular - discount, count: prices.length };
}

export function pctText(rate) {
  return Math.round(rate * 100) + '%';
}

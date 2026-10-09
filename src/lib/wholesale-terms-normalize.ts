/** Normalize historical wholesale tier JSON to the canonical [quantity, USD price] shape. */
export function normalizeWholesaleTiers(value: unknown): number[][] {
  if (!Array.isArray(value)) return [];
  return value.map((entry: any) => {
    const quantityValue = Array.isArray(entry)
      ? entry[0]
      : entry && typeof entry === 'object'
        ? entry.quantity ?? entry.minimum ?? entry.minQty ?? entry.qty
        : undefined;
    const priceValue = Array.isArray(entry)
      ? entry[1]
      : entry && typeof entry === 'object'
        ? entry.price ?? entry.unitPrice ?? entry.wholesalePrice ?? entry.priceUSD
        : undefined;
    const parse = (item: unknown) => typeof item === 'string' && item.trim() === '' ? Number.NaN : Number(item);
    return [parse(quantityValue), parse(priceValue)];
  });
}

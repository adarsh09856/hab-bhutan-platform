export type ProductAvailability = 'IN_STOCK' | 'MADE_TO_ORDER' | 'SOLD_OUT';

export function normalizeProductAvailability(value: unknown, stock: number): ProductAvailability {
  if (value === 'MADE_TO_ORDER' || value === 'SOLD_OUT' || value === 'IN_STOCK') return value;
  return stock > 0 ? 'IN_STOCK' : 'SOLD_OUT';
}

export function canPurchaseProduct(availability: unknown, stock: number, quantity: number): boolean {
  const state = normalizeProductAvailability(availability, stock);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || state === 'SOLD_OUT') return false;
  return state === 'MADE_TO_ORDER' || stock >= quantity;
}

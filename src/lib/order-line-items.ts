type OrderLineItem = {
  code: string;
  name: string;
  quantity: number;
  priceUSD: number;
  [key: string]: unknown;
};

function asItemArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return asItemArray(JSON.parse(value));
    } catch {
      return [];
    }
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.list)) return record.list;
  }
  return [];
}

/** Prefer the immutable checkout snapshot, with normalized order rows as fallback. */
export function getOrderLineItems(order: { items?: unknown; orderItems?: unknown } | null | undefined): OrderLineItem[] {
  if (!order) return [];

  const snapshot = asItemArray(order.items);
  const relations = asItemArray(order.orderItems);
  const source = snapshot.length ? snapshot : relations;

  return source.map((raw, index) => {
    const item = raw && typeof raw === 'object' ? raw as Record<string, any> : {};
    const relation = relations.find((candidate) => candidate?.code && candidate.code === item.code) || relations[index] || {};
    const product = item.product || relation.product || {};

    return {
      ...relation,
      ...item,
      code: String(item.code || relation.code || product.code || item.productCode || '—'),
      name: String(item.name || item.title || relation.name || product.name || 'Product'),
      quantity: Number(item.quantity ?? item.qty ?? relation.quantity ?? 0),
      priceUSD: Number(item.priceUSD ?? item.priceUsd ?? item.unitPrice ?? relation.priceUSD ?? product.priceUSD ?? 0),
    };
  });
}

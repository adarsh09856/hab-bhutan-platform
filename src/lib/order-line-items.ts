type OrderLineItem = {
  code: string;
  name: string;
  quantity: number;
  priceUSD: number;
  [key: string]: unknown;
};

type ParsedItems = { items: any[]; malformed: boolean };

function asItemArray(value: unknown): ParsedItems {
  if (Array.isArray(value)) return { items: value, malformed: false };
  if (typeof value === 'string') {
    try {
      return asItemArray(JSON.parse(value));
    } catch {
      return { items: [], malformed: true };
    }
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if ('items' in record) return asItemArray(record.items);
    if ('list' in record) return asItemArray(record.list);
    return { items: [], malformed: true };
  }
  return { items: [], malformed: value != null };
}

export type OrderLineItemsResult = {
  items: OrderLineItem[];
  state: 'ready' | 'empty' | 'invalid-snapshot';
};

/** Prefer the immutable checkout snapshot, with normalized order rows as fallback. */
export function getOrderLineItemsResult(order: { items?: unknown; orderItems?: unknown } | null | undefined): OrderLineItemsResult {
  if (!order) return { items: [], state: 'empty' };

  const snapshot = asItemArray(order.items);
  const relations = asItemArray(order.orderItems);
  const source = snapshot.items.length ? snapshot.items : relations.items;

  const items = source.map((raw, index) => {
    const item = raw && typeof raw === 'object' ? raw as Record<string, any> : {};
    const relation = relations.items.find((candidate) => candidate?.code && candidate.code === item.code) || relations.items[index] || {};
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

  return {
    items,
    state: items.length ? 'ready' : snapshot.malformed || relations.malformed ? 'invalid-snapshot' : 'empty',
  };
}

export function getOrderLineItems(order: { items?: unknown; orderItems?: unknown } | null | undefined): OrderLineItem[] {
  return getOrderLineItemsResult(order).items;
}

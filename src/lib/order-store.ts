import fs from 'fs';
import path from 'path';

export interface FallbackOrderItem {
  id?: string;
  productId?: string;
  code: string;
  name: string;
  priceUSD: number;
  quantity: number;
}

export interface FallbackOrder {
  id: string;
  orderNumber: string;
  trackingNumber: string;
  customerType: 'GUEST' | 'MEMBER';
  userId?: string | null;
  mBOBTransactionRef?: string | null;
  proofUrl?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress: Record<string, any>;
  shippingMethod: 'EXPRESS' | 'EMS';
  shippingFeeUSD: number;
  paymentMethod: 'CARD' | 'MBOB' | 'BNB' | 'BANK' | 'COD';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  orderStatus: 'PROCESSING' | 'PENDING_PAYMENT' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  currencyUsed: string;
  fxRateAtPurchase: number;
  totalUSD: number;
  totalPaidCurrency: number;
  subtotalUSD?: number;
  items: FallbackOrderItem[];
  orderItems?: FallbackOrderItem[];
  carrier?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory cache for speed and multi-environment stability
const MEMORY_ORDERS: FallbackOrder[] = [
  {
    id: 'ord-seed-001',
    orderNumber: 'HAB-S-88210',
    trackingNumber: 'HAB-TRK-771029',
    customerType: 'GUEST',
    customerName: 'Karma Dorji',
    customerEmail: 'karma.dorji@druknet.bt',
    customerPhone: '+975 17 112 233',
    shippingAddress: {
      fullName: 'Karma Dorji',
      street: 'Norzin Lam 2, Building 4B',
      city: 'Thimphu',
      country: 'Bhutan',
      postalCode: '11001',
    },
    shippingMethod: 'EMS',
    shippingFeeUSD: 14,
    paymentMethod: 'MBOB',
    paymentStatus: 'PAID',
    orderStatus: 'PROCESSING',
    currencyUsed: 'BTN',
    fxRateAtPurchase: 84.0,
    totalUSD: 164,
    totalPaidCurrency: 13776,
    subtotalUSD: 150,
    carrier: 'Bhutan Post EMS',
    items: [
      {
        code: 'SAD03',
        name: 'Royal ceremonial sash (Rachu)',
        priceUSD: 150,
        quantity: 1,
      },
    ],
    orderItems: [
      {
        id: 'item-001',
        code: 'SAD03',
        name: 'Royal ceremonial sash (Rachu)',
        priceUSD: 150,
        quantity: 1,
      },
    ],
    internalNotes: '[mBoB] Payment verified via Journal Ref MB-8812903. Direct dispatch scheduled.',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ord-seed-002',
    orderNumber: 'HAB-S-49120',
    trackingNumber: 'DHL-HAB-9920194',
    customerType: 'GUEST',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@gallerycraft.org',
    customerPhone: '+44 20 7946 0912',
    shippingAddress: {
      fullName: 'Elena Rostova',
      street: '14 Piccadilly Gardens',
      city: 'London',
      country: 'United Kingdom',
      postalCode: 'W1J 9HP',
    },
    shippingMethod: 'EXPRESS',
    shippingFeeUSD: 45,
    paymentMethod: 'CARD',
    paymentStatus: 'PAID',
    orderStatus: 'SHIPPED',
    currencyUsed: 'USD',
    fxRateAtPurchase: 84.0,
    totalUSD: 365,
    totalPaidCurrency: 365,
    subtotalUSD: 320,
    carrier: 'DHL Express International',
    items: [
      {
        code: 'FTB04',
        name: 'Turned birch tea bowl (Dapa)',
        priceUSD: 120,
        quantity: 1,
      },
      {
        code: 'HHB01',
        name: 'Lidded woven bamboo vessel (Bangchung)',
        priceUSD: 200,
        quantity: 1,
      },
    ],
    orderItems: [
      {
        id: 'item-002',
        code: 'FTB04',
        name: 'Turned birch tea bowl (Dapa)',
        priceUSD: 120,
        quantity: 1,
      },
      {
        id: 'item-003',
        code: 'HHB01',
        name: 'Lidded woven bamboo vessel (Bangchung)',
        priceUSD: 200,
        quantity: 1,
      },
    ],
    internalNotes: 'DHL Air Waybill 9920194 generated. Dispatched via Paro International Hub.',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
];

function getStoreFilePath(): string {
  const dir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  return path.join(dir, 'orders.json');
}

/**
 * Load all stored fallback orders from disk and memory
 */
export function getFallbackOrders(): FallbackOrder[] {
  try {
    const filePath = getStoreFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with memory ensuring no duplicates by orderNumber
        const map = new Map<string, FallbackOrder>();
        for (const o of parsed) {
          if (o && o.orderNumber) map.set(o.orderNumber, o);
        }
        for (const m of MEMORY_ORDERS) {
          if (!map.has(m.orderNumber)) map.set(m.orderNumber, m);
        }
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    }
  } catch (err) {
    console.warn('[order-store] Could not read orders.json from disk, using memory fallback:', err);
  }
  return [...MEMORY_ORDERS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Persist a newly created order to the fallback store
 */
export function saveFallbackOrder(order: Partial<FallbackOrder>): FallbackOrder {
  const now = new Date().toISOString();
  const orderNumber = order.orderNumber || `HAB-S-${Math.floor(10000 + Math.random() * 90000)}`;
  const trackingNumber =
    order.trackingNumber || `HAB-TRK-${Math.floor(100000 + Math.random() * 900000)}`;

  const fullOrder: FallbackOrder = {
    id: order.id || `ord-fallback-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    orderNumber,
    trackingNumber,
    customerType: order.customerType || 'GUEST',
    userId: order.userId || null,
    mBOBTransactionRef: order.mBOBTransactionRef || null,
    proofUrl: order.proofUrl || null,
    customerName: order.customerName || 'Valued Collector',
    customerEmail: order.customerEmail || 'collector@handicraftsbhutan.org',
    customerPhone: order.customerPhone || null,
    shippingAddress: order.shippingAddress || {},
    shippingMethod: order.shippingMethod || 'EMS',
    shippingFeeUSD: typeof order.shippingFeeUSD === 'number' ? order.shippingFeeUSD : 14,
    paymentMethod: (order.paymentMethod as any) || 'CARD',
    paymentStatus: order.paymentStatus || 'PENDING',
    orderStatus: order.orderStatus || 'PROCESSING',
    currencyUsed: order.currencyUsed || 'USD',
    fxRateAtPurchase: order.fxRateAtPurchase || 84.0,
    totalUSD: typeof order.totalUSD === 'number' ? order.totalUSD : 0,
    totalPaidCurrency: typeof order.totalPaidCurrency === 'number' ? order.totalPaidCurrency : 0,
    subtotalUSD: typeof order.subtotalUSD === 'number' ? order.subtotalUSD : order.totalUSD || 0,
    items: order.items || [],
    orderItems: order.orderItems || order.items || [],
    carrier: order.carrier || (order.shippingMethod === 'EXPRESS' ? 'DHL Express' : 'Bhutan Post EMS'),
    internalNotes: order.internalNotes || '',
    createdAt: order.createdAt || now,
    updatedAt: now,
  };

  // Add to memory
  MEMORY_ORDERS.unshift(fullOrder);

  // Persist to disk
  try {
    const filePath = getStoreFilePath();
    const existing = getFallbackOrders();
    const merged = [fullOrder, ...existing.filter((o) => o.orderNumber !== fullOrder.orderNumber)];
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[order-store] Warning: could not write fallback order to disk:', err);
  }

  return fullOrder;
}

/**
 * Find an order by orderNumber, trackingNumber, customerEmail, phone, or ID
 */
export function findFallbackOrder(query: string): FallbackOrder | null {
  if (!query) return null;
  const cleanQ = query.trim().toLowerCase();
  const digitsOnly = cleanQ.replace(/\D/g, '');
  const all = getFallbackOrders();

  return (
    all.find((o) => {
      if (o.orderNumber.toLowerCase() === cleanQ) return true;
      if (o.trackingNumber.toLowerCase() === cleanQ) return true;
      if (o.id.toLowerCase() === cleanQ) return true;
      if (o.customerEmail.toLowerCase() === cleanQ) return true;
      if (digitsOnly && o.customerPhone && o.customerPhone.replace(/\D/g, '').includes(digitsOnly)) {
        return true;
      }
      return false;
    }) || null
  );
}

/**
 * Update an existing fallback order
 */
export function updateFallbackOrder(
  orderNumberOrId: string,
  patch: Partial<FallbackOrder>
): FallbackOrder | null {
  const all = getFallbackOrders();
  const idx = all.findIndex(
    (o) => o.orderNumber === orderNumberOrId || o.id === orderNumberOrId
  );
  if (idx === -1) return null;

  const updated: FallbackOrder = {
    ...all[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  all[idx] = updated;

  try {
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[order-store] Could not write updated orders to disk:', err);
  }

  // Update in-memory
  const memIdx = MEMORY_ORDERS.findIndex(
    (o) => o.orderNumber === orderNumberOrId || o.id === orderNumberOrId
  );
  if (memIdx !== -1) {
    MEMORY_ORDERS[memIdx] = updated;
  }

  return updated;
}

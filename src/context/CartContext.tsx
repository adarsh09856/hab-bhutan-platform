'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { calculateShipping, ShippingOption } from '@/lib/shipping';

export interface CartItem {
  code: string;
  name: string;
  craftKey: string;
  region: string;
  maker: string;
  priceUSD: number;
  imageUrl?: string;
  lead?: string;
  availability?: string;
  stock: number;
  quantity: number;
  lineTotalUSD: number;
}

interface ToastState {
  message: string;
  isError?: boolean;
}

interface CartContextType {
  cart: Record<string, number>;
  cartHydrated: boolean;
  catalogueLoaded: boolean;
  catalogueLoadError: string;
  retryCatalogue: () => void;
  items: CartItem[];
  cartCount: number;
  subtotalUSD: number;
  shippingOption: ShippingOption;
  shippingMethod: 'ems' | 'express';
  setShippingMethod: (method: 'ems' | 'express') => void;
  shippingFeeUSD: number;
  totalUSD: number;
  addToCart: (code: string, qtyOrOptions?: number | { silent?: boolean }, options?: { silent?: boolean }) => void;
  decrementCart: (code: string) => void;
  removeFromCart: (code: string) => void;
  clearCart: () => void;
  showToast: (message: string, isError?: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartHydrated, setCartHydrated] = useState(false);
  const [catalogue, setCatalogue] = useState<Record<string, { code: string; name: string; priceUSD: number; craftKey: string; region: string; maker?: { name?: string }; imageUrl?: string; stock: number; lead?: string; availability?: string }>>({});
  const [catalogueLoaded, setCatalogueLoaded] = useState(false);
  const [catalogueLoadError, setCatalogueLoadError] = useState('');
  const [catalogueReload, setCatalogueReload] = useState(0);
  const [shippingMethod, setShippingMethod] = useState<'ems' | 'express'>('ems');
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hab_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) setCart(parsed);
      }
    } catch {
      // Ignore
    } finally {
      setCartHydrated(true);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    setCatalogueLoaded(false);
    setCatalogueLoadError('');

    fetch('/api/products?shuffle=false&compact=true', { cache: 'no-store', signal: controller.signal })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Catalogue unavailable')))
      .then(data => {
        if (!data.success || data.fallback || !Array.isArray(data.products)) throw new Error('Saved catalogue unavailable');
        const byCode: typeof catalogue = {};
        for (const product of data.products || []) {
          if (product.status === 'PUBLISHED') byCode[product.code] = {
            ...product,
            maker: product.maker || (product.trader?.shopName ? { name: product.trader.shopName } : undefined),
            region: product.region || product.maker?.dzongkhag || product.trader?.dzongkhag || '',
          };
        }
        if (!active) return;
        setCatalogue(byCode);
        setCatalogueLoaded(true);
      })
      .catch(() => {
        if (active) setCatalogueLoadError('We could not check current product availability. Please retry before continuing.');
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [catalogueReload]);

  const retryCatalogue = () => setCatalogueReload((version) => version + 1);

  // Reconcile persisted baskets only after a successful authoritative read.
  // Old/unpublished codes must not block a newly added, published product.
  useEffect(() => {
    if (!cartHydrated || !catalogueLoaded) return;
    const obsoleteCodes = Object.keys(cart).filter(code => cart[code] > 0 && !catalogue[code]);
    if (!obsoleteCodes.length) return;
    const next = { ...cart };
    for (const code of obsoleteCodes) delete next[code];
    setCart(next);
    try { localStorage.setItem('hab_cart', JSON.stringify(next)); } catch { /* Storage may be disabled. */ }
    setToast({ message: 'Older items that are no longer published were removed from your basket. Your available items are unchanged.' });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 6000);
  }, [cartHydrated, catalogueLoaded, catalogue, cart]);

  const saveCart = (newCart: Record<string, number>) => {
    setCart(newCart);
    try {
      localStorage.setItem('hab_cart', JSON.stringify(newCart));
    } catch {
      // Ignore
    }
  };

  const showToast = (message: string, isError?: boolean) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, isError });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, isError ? 5000 : 3500);
  };

  const addToCart = (
    code: string,
    qtyOrOptions?: number | { silent?: boolean },
    options?: { silent?: boolean }
  ) => {
    let qty = 1;
    let silent = false;

    if (typeof qtyOrOptions === 'number') {
      qty = qtyOrOptions > 0 ? qtyOrOptions : 1;
      silent = !!options?.silent;
    } else if (typeof qtyOrOptions === 'object') {
      silent = !!qtyOrOptions?.silent;
    }

    const currentQty = cart[code] || 0;
    const product = catalogue[code];
    if (product?.availability === 'SOLD_OUT' || (product?.availability !== 'MADE_TO_ORDER' && product?.stock <= 0)) {
      if (!silent) showToast(`“${product.name}” is sold out.`, true);
      return;
    }
    const maxQuantity = product?.availability === 'MADE_TO_ORDER' ? 20 : Math.max(1, Math.min(20, product?.stock || 20));
    const nextQuantity = Math.min(maxQuantity, currentQty + qty);
    if (nextQuantity === currentQty) {
      if (!silent) showToast(`Only ${maxQuantity} can be added to one basket.`, true);
      return;
    }
    const next = { ...cart, [code]: nextQuantity };
    saveCart(next);

    if (!silent) {
      const productName = catalogue[code]?.name || code;
      const msg = qty > 1
        ? `${qty}× “${productName}” added to basket.`
        : `“${productName}” added to basket.`;
      showToast(msg);
    }
  };

  const decrementCart = (code: string) => {
    if (!cart[code]) return;
    const current = cart[code];
    const next = { ...cart };
    if (current <= 1) {
      delete next[code];
    } else {
      next[code] = current - 1;
    }
    saveCart(next);
  };

  const removeFromCart = (code: string) => {
    const next = { ...cart };
    delete next[code];
    saveCart(next);
  };

  const clearCart = () => {
    saveCart({});
  };

  // Compute items
  const items: CartItem[] = Object.keys(cart)
    .filter((code) => cart[code] > 0 && catalogue[code])
    .map((code) => {
      const cleanCode = code.trim();
      const product = catalogue[cleanCode];
      const qty = cart[code];
      const imageUrl = product.imageUrl || `/images/products/${cleanCode.toLowerCase()}.jpg`;
      return {
        code: cleanCode,
        name: product.name,
        craftKey: product.craftKey,
        region: product.region,
        maker: product.maker?.name || '',
        priceUSD: product.priceUSD,
        imageUrl,
        lead: product.lead || '',
        availability: product.availability || (product.stock > 0 ? 'IN_STOCK' : 'SOLD_OUT'),
        stock: product.stock,
        quantity: qty,
        lineTotalUSD: product.priceUSD * qty,
      };
    });

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalUSD = items.reduce((sum, item) => sum + item.lineTotalUSD, 0);

  const shippingCalc = calculateShipping(subtotalUSD);
  const shippingOption = shippingMethod === 'ems' ? shippingCalc.ems : shippingCalc.express;
  const shippingFeeUSD = cartCount === 0 ? 0 : shippingOption.costUSD;
  const totalUSD = subtotalUSD + shippingFeeUSD;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartHydrated,
        catalogueLoaded,
        catalogueLoadError,
        retryCatalogue,
        items,
        cartCount,
        subtotalUSD,
        shippingOption,
        shippingMethod,
        setShippingMethod,
        shippingFeeUSD,
        totalUSD,
        addToCart,
        decrementCart,
        removeFromCart,
        clearCart,
        showToast,
      }}
    >
      {children}

      {/* Global Toast Notification */}
      {toast && (
        <div
          className={`toast ${toast.isError ? 'toast--error' : ''}`}
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 14px 34px rgba(27,20,16,.28)',
            zIndex: 9999,
            cursor: 'default',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
            {toast.isError ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
          <span style={{ lineHeight: 1.4 }}>{toast.message}</span>
          {!toast.isError && (
            <Link
              href="/basket"
              style={{
                marginLeft: '6px',
                color: '#E8C547',
                textDecoration: 'underline',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                fontFamily: 'var(--ui)',
                fontSize: '13px',
              }}
            >
              View basket &rarr;
            </Link>
          )}
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Close notification"
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '18px',
              lineHeight: 1,
              cursor: 'pointer',
              padding: '0 4px',
            }}
          >
            &times;
          </button>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

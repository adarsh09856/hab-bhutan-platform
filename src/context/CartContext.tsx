'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SAMPLE_PRODUCTS } from '@/lib/data';
import { calculateShipping, ShippingOption } from '@/lib/shipping';

export interface CartItem {
  code: string;
  name: string;
  craftKey: string;
  region: string;
  maker: string;
  priceUSD: number;
  imageUrl?: string;
  quantity: number;
  lineTotalUSD: number;
}

interface ToastState {
  message: string;
  isError?: boolean;
}

interface CartContextType {
  cart: Record<string, number>;
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
  const [cart, setCart] = useState<Record<string, number>>({
    HHB01: 1,
    DAP02: 1,
  });
  const [shippingMethod, setShippingMethod] = useState<'ems' | 'express'>('ems');
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hab_cart');
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

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
    const next = { ...cart, [code]: currentQty + qty };
    saveCart(next);

    if (!silent) {
      const product = SAMPLE_PRODUCTS.find((p) => p.code.toUpperCase() === code.toUpperCase());
      const productName = product ? product.name : code;
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
    .filter((code) => cart[code] > 0)
    .map((code) => {
      const cleanCode = code.trim();
      const product = SAMPLE_PRODUCTS.find((p) => p.code.toUpperCase() === cleanCode.toUpperCase()) || {
        code: cleanCode,
        name: 'Handcrafted Piece',
        craftKey: 'thagzo',
        region: 'Bhutan',
        maker: 'Registered Member',
        price: 50,
      };
      const qty = cart[code];
      const imageUrl = `/images/products/${cleanCode.toLowerCase()}.jpg`;
      return {
        code: cleanCode,
        name: product.name,
        craftKey: product.craftKey,
        region: product.region,
        maker: product.maker,
        priceUSD: product.price,
        imageUrl,
        quantity: qty,
        lineTotalUSD: product.price * qty,
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

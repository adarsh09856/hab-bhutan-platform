'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SAMPLE_PRODUCTS } from '@/lib/data';
import { calculateShipping, ShippingOption } from '@/lib/shipping';

export interface CartItem {
  code: string;
  name: string;
  craftKey: string;
  region: string;
  maker: string;
  priceUSD: number;
  quantity: number;
  lineTotalUSD: number;
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
  addToCart: (code: string) => void;
  decrementCart: (code: string) => void;
  removeFromCart: (code: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>({
    HHB01: 1,
    DAP02: 1,
  });
  const [shippingMethod, setShippingMethod] = useState<'ems' | 'express'>('ems');

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

  const addToCart = (code: string) => {
    const next = { ...cart, [code]: (cart[code] || 0) + 1 };
    saveCart(next);
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
      const product = SAMPLE_PRODUCTS.find((p) => p.code === code) || {
        code,
        name: 'Handcrafted Piece',
        craftKey: 'thagzo',
        region: 'Bhutan',
        maker: 'Registered Member',
        price: 50,
      };
      const qty = cart[code];
      return {
        code,
        name: product.name,
        craftKey: product.craftKey,
        region: product.region,
        maker: product.maker,
        priceUSD: product.price,
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
      }}
    >
      {children}
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

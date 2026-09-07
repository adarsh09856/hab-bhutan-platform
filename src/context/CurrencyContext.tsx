'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'USD' | 'BTN';

interface CurrencyContextType {
  currency: Currency;
  toggleCurrency: () => void;
  setCurrency: (cur: Currency) => void;
  fxRate: number;
  fxStatus: 'FRESH' | 'STALE' | 'MANUAL_OVERRIDE';
  fxBlocked: boolean;
  fxMessage?: string;
  fmt: (usdAmount: number) => string;
  alt: (usdAmount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [fxRate, setFxRate] = useState<number>(84.0);
  const [fxStatus, setFxStatus] = useState<'FRESH' | 'STALE' | 'MANUAL_OVERRIDE'>('FRESH');
  const [fxBlocked, setFxBlocked] = useState<boolean>(false);
  const [fxMessage, setFxMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch('/api/fx');
        if (res.ok) {
          const data = await res.json();
          if (data && data.rate) {
            setFxRate(data.rate);
            setFxStatus(data.status);
            setFxBlocked(data.blocked || false);
            setFxMessage(data.message);
          }
        }
      } catch (err) {
        console.error('Failed to fetch FX rate, using fallback', err);
      }
    }
    fetchRate();
  }, []);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'USD' ? 'BTN' : 'USD'));
  };

  const fmt = (usdAmount: number): string => {
    if (currency === 'USD') {
      return '$' + Math.round(usdAmount).toLocaleString();
    }
    return 'Nu. ' + Math.round(usdAmount * fxRate).toLocaleString();
  };

  const alt = (usdAmount: number): string => {
    if (currency === 'USD') {
      return 'Nu. ' + Math.round(usdAmount * fxRate).toLocaleString();
    }
    return '$' + Math.round(usdAmount).toLocaleString();
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        toggleCurrency,
        setCurrency,
        fxRate,
        fxStatus,
        fxBlocked,
        fxMessage,
        fmt,
        alt,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

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
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [fxRate, setFxRate] = useState<number>(84.0);
  const [fxStatus, setFxStatus] = useState<'FRESH' | 'STALE' | 'MANUAL_OVERRIDE'>('FRESH');
  const [fxBlocked, setFxBlocked] = useState<boolean>(false);
  const [fxMessage, setFxMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'hab_currency' && (e.newValue === 'USD' || e.newValue === 'BTN')) {
        setCurrencyState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);

    // Fetch site settings to adopt Admin default currency and FX rate
    fetch('/api/site-settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const adminCur = d?.setting?.defaultCurrency || d?.settings?.defaultCurrency;
        const lastAdminCur = typeof window !== 'undefined' ? localStorage.getItem('hab_last_admin_cur') : null;

        if (adminCur === 'USD' || adminCur === 'BTN') {
          // If admin has changed default currency in admin panel, adopt immediately
          if (adminCur !== lastAdminCur) {
            setCurrencyState(adminCur);
            localStorage.setItem('hab_currency', adminCur);
            localStorage.setItem('hab_last_admin_cur', adminCur);
            return;
          }
        }

        // Otherwise respect user preference
        const saved = typeof window !== 'undefined' ? (localStorage.getItem('hab_currency') as Currency) : null;
        if (saved === 'USD' || saved === 'BTN') {
          setCurrencyState(saved);
        } else if (adminCur === 'USD' || adminCur === 'BTN') {
          setCurrencyState(adminCur);
        }

        const adminFxRate = d?.setting?.fxRate || d?.settings?.fxRate;
        if (adminFxRate && !isNaN(Number(adminFxRate))) {
          setFxRate(Number(adminFxRate));
        }
      })
      .catch(() => {});

    // Fetch current live FX rate
    async function fetchRate() {
      try {
        const res = await fetch('/api/fx', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const rateVal = data?.data?.rate || data?.rate;
          if (rateVal && !isNaN(rateVal)) {
            setFxRate(Number(rateVal));
            setFxStatus(data.data?.status || data.status || 'FRESH');
            setFxBlocked(data.data?.blocked || data.blocked || false);
            setFxMessage(data.data?.message || data.message);
          }
        }
      } catch (err) {
        console.error('Failed to fetch FX rate, using fallback', err);
      }
    }
    fetchRate();

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setCurrency = (cur: Currency) => {
    setCurrencyState(cur);
    try {
      localStorage.setItem('hab_currency', cur);
    } catch {
      // Ignore
    }
  };

  const toggleCurrency = () => {
    const next = currency === 'USD' ? 'BTN' : 'USD';
    setCurrency(next);
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

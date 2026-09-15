'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Printer,
  RotateCcw,
  CreditCard,
  Banknote,
  QrCode,
  User,
  Phone,
  Store,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface ProductItem {
  id: string;
  code: string;
  name: string;
  priceUSD: number;
  stock: number;
  imageUrl?: string | null;
  craftKey?: string;
  craft?: {
    name: string;
  };
}

interface CartItem {
  productId: string;
  code: string;
  name: string;
  priceUSD: number;
  priceBTN: number;
  quantity: number;
  maxStock: number;
  imageUrl?: string | null;
}

interface CompletedReceipt {
  orderNumber: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  paymentMethod: 'CASH' | 'MBOB' | 'CARD';
  paymentRef?: string;
  tenderedAmount: number;
  changeAmount: number;
  totalUSD: number;
  totalBTN: number;
  currency: 'BTN' | 'USD';
  items: CartItem[];
  cashier: string;
}

export default function OnlinePosConsole() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currency, setCurrency] = useState<'BTN' | 'USD'>('BTN');
  const fxRate = 84.0; // 1 USD = 84 Nu. BTN

  // Register Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MBOB' | 'CARD'>('CASH');
  const [tenderedInput, setTenderedInput] = useState<string>('');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [saleNotes, setSaleNotes] = useState<string>('');

  // Processing & Receipt State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedReceipt, setCompletedReceipt] = useState<CompletedReceipt | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);

  // Fetch real-time products from database
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?limit=200', { cache: 'no-store' });
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products for POS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products by search and category
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.craft?.name) cats.add(p.craft.name);
      else if (p.craftKey) cats.add(p.craftKey);
    });
    return ['ALL', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'ALL' ||
        p.craft?.name === selectedCategory ||
        p.craftKey === selectedCategory;
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.craft?.name && p.craft.name.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart operations
  const addToCart = (product: ProductItem) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          setErrorMsg(`Maximum available stock reached for ${product.name} (${product.stock} in stock)`);
          return prev;
        }
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        const item: CartItem = {
          productId: product.id,
          code: product.code,
          name: product.name,
          priceUSD: product.priceUSD,
          priceBTN: Math.round(product.priceUSD * fxRate),
          quantity: 1,
          maxStock: product.stock,
          imageUrl: product.imageUrl,
        };
        return [...prev, item];
      }
    });
    setErrorMsg(null);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.maxStock) {
              setErrorMsg(`Cannot exceed available stock of ${item.maxStock} for ${item.name}`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setErrorMsg(null);
    setTenderedInput('');
    setPaymentRef('');
  };

  // Cart Calculations
  const cartSubtotalUSD = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.priceUSD * item.quantity, 0);
  }, [cart]);

  const cartSubtotalBTN = useMemo(() => {
    return Math.round(cartSubtotalUSD * fxRate);
  }, [cartSubtotalUSD, fxRate]);

  const grandTotal = currency === 'BTN' ? cartSubtotalBTN : cartSubtotalUSD;

  // Auto calculate change
  const tenderedAmountNumber = parseFloat(tenderedInput) || (paymentMethod === 'CASH' ? 0 : grandTotal);
  const changeAmount = Math.max(0, tenderedAmountNumber - grandTotal);

  // Submit sale to backend API
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setErrorMsg('Register cart is empty. Add products before checking out.');
      return;
    }

    if (paymentMethod === 'CASH' && tenderedAmountNumber < grandTotal) {
      setErrorMsg(
        `Tendered cash (${currency === 'BTN' ? 'Nu. ' : '$'}${tenderedAmountNumber.toLocaleString()}) is less than total due (${currency === 'BTN' ? 'Nu. ' : '$'}${grandTotal.toLocaleString()}).`
      );
      return;
    }

    if (paymentMethod === 'MBOB' && !paymentRef.trim()) {
      setErrorMsg('Please enter the 6-digit Bank of Bhutan mBoB Journal / Reference number.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        items: cart.map((i) => ({
          productId: i.productId,
          code: i.code,
          name: i.name,
          priceUSD: i.priceUSD,
          quantity: i.quantity,
        })),
        customerName,
        customerPhone,
        paymentMethod,
        tenderedAmount: tenderedAmountNumber,
        changeAmount,
        paymentRef: paymentRef.trim(),
        currencyUsed: currency,
        notes: saleNotes,
      };

      const res = await fetch('/api/admin/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Record completed receipt
        setCompletedReceipt({
          orderNumber: data.order.orderNumber,
          date: new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          customerName,
          customerPhone,
          paymentMethod,
          paymentRef,
          tenderedAmount: tenderedAmountNumber,
          changeAmount,
          totalUSD: cartSubtotalUSD,
          totalBTN: cartSubtotalBTN,
          currency,
          items: [...cart],
          cashier: data.order.shippingAddress?.cashierName || 'HAB Cashier Staff',
        });

        // Clear register for next transaction and reload products to reflect new stock
        clearCart();
        loadProducts();
      } else {
        setErrorMsg(data.error || 'Failed to complete counter sale.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error executing counter checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b admin-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-bold admin-title flex items-center gap-2">
              <Store className="w-5 h-5 text-slate-800" />
              Counter Billing (Online POS)
            </h1>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live Cloud Register
            </span>
          </div>
          <p className="text-xs admin-muted mt-1">
            Real-time showroom checkout with atomic PostgreSQL inventory decrement, mBoB QR reconciliation &amp; official receipt generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <div className="inline-flex rounded-lg border admin-border bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setCurrency('BTN')}
              className={`px-3 py-1 rounded-md transition ${
                currency === 'BTN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nu. BTN
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded-md transition ${
                currency === 'USD' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              USD $
            </button>
          </div>

          <button
            onClick={loadProducts}
            disabled={loading}
            className="p-2 border admin-border rounded-lg hover:bg-slate-100 text-slate-600 transition"
            title="Sync inventory"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs font-medium rounded-lg bg-rose-50 border border-rose-300 text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="font-bold ml-2 text-rose-600">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Products Left (65%), Register Right (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Product Catalog */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search and Category Bar */}
          <div className="admin-card border admin-border rounded-xl p-3 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by title, SKU code (e.g. THA-01), or craft..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 admin-input text-xs border rounded-lg focus:outline-none"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-amber-800 text-white font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border admin-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div className="py-24 text-center admin-muted text-xs font-mono">
              Fetching real-time inventory from PostgreSQL...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 text-center admin-muted text-xs admin-card border admin-border rounded-xl">
              No products found matching &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[720px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const inStock = p.stock > 0;
                const priceDisplay =
                  currency === 'BTN'
                    ? `Nu. ${Math.round(p.priceUSD * fxRate).toLocaleString()}`
                    : `$${p.priceUSD.toFixed(2)}`;

                return (
                  <div
                    key={p.id}
                    onClick={() => inStock && addToCart(p)}
                    className={`group relative admin-card border admin-border rounded-xl p-3 flex flex-col justify-between transition-all text-left select-none ${
                      inStock
                        ? 'hover:border-amber-700 hover:shadow-md cursor-pointer'
                        : 'opacity-50 cursor-not-allowed bg-slate-50'
                    }`}
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-100 border admin-border mb-2.5">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-[10px]">
                            No photo
                          </div>
                        )}
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/95 text-slate-800 shadow-sm">
                          {p.code}
                        </span>
                      </div>

                      <span className="text-[10px] font-semibold text-slate-800 block uppercase tracking-wider">
                        {p.craft?.name || p.craftKey || 'Handicraft'}
                      </span>
                      <h4 className="text-xs font-bold admin-title line-clamp-2 mt-0.5 leading-tight">
                        {p.name}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2 border-t admin-border flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block font-mono">
                          {priceDisplay}
                        </span>
                        <span
                          className={`text-[10px] font-medium block ${
                            p.stock > 5
                              ? 'text-emerald-700'
                              : p.stock > 0
                              ? 'text-amber-700 font-semibold'
                              : 'text-rose-700'
                          }`}
                        >
                          {p.stock > 0 ? `In stock: ${p.stock} pcs` : 'Out of stock'}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={!inStock}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-white transition ${
                          inStock ? 'bg-amber-800 group-hover:bg-amber-900' : 'bg-slate-300'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Counter Register Cart */}
        <div className="lg:col-span-5 admin-card border admin-border rounded-xl shadow-lg p-4 space-y-4 sticky top-4">
          <div className="flex items-center justify-between border-b admin-border pb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-slate-800" />
              <h2 className="text-base font-bold admin-title">Register Cart</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-slate-900">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-700 hover:text-rose-800 hover:underline flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="max-h-60 overflow-y-auto space-y-2 divide-y admin-divider pr-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center admin-muted text-xs">
                Register is empty. Tap any product on the left to ring up an item.
              </div>
            ) : (
              cart.map((item) => {
                const linePrice =
                  currency === 'BTN'
                    ? `Nu. ${(item.priceBTN * item.quantity).toLocaleString()}`
                    : `$${(item.priceUSD * item.quantity).toFixed(2)}`;

                return (
                  <div key={item.productId} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold admin-title truncate">{item.name}</h5>
                      <div className="text-[11px] font-mono admin-muted flex items-center gap-2">
                        <span>{item.code}</span>
                        <span>•</span>
                        <span>
                          {currency === 'BTN' ? `Nu. ${item.priceBTN.toLocaleString()}` : `$${item.priceUSD}`}{' '}
                          each
                        </span>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-6 h-6 rounded border admin-border flex items-center justify-center hover:bg-slate-100 text-slate-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono text-xs font-bold admin-text">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-6 h-6 rounded border admin-border flex items-center justify-center hover:bg-slate-100 text-slate-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="w-20 text-right">
                      <span className="text-xs font-bold font-mono admin-text block">{linePrice}</span>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-[10px] text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Customer Details Foldout */}
          <div className="border-t admin-border pt-3 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium admin-text mb-0.5">Customer Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 admin-input border rounded text-xs"
                    placeholder="Walk-in Customer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium admin-text mb-0.5">Mobile Phone (Receipt SMS)</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 admin-input border rounded text-xs"
                    placeholder="+975-17XXXXXX"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Tender Method */}
          <div className="border-t admin-border pt-3 space-y-3">
            <label className="block text-[11px] font-bold admin-text uppercase tracking-wider">
              Payment Tender
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-2 px-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                  paymentMethod === 'CASH'
                    ? 'border-amber-800 bg-slate-100 text-slate-900 ring-2 ring-amber-800/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-700" />
                <span>Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('MBOB')}
                className={`py-2 px-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                  paymentMethod === 'MBOB'
                    ? 'border-amber-800 bg-slate-100 text-slate-900 ring-2 ring-amber-800/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <QrCode className="w-4 h-4 text-sky-700" />
                <span>mBoB QR</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`py-2 px-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                  paymentMethod === 'CARD'
                    ? 'border-amber-800 bg-slate-100 text-slate-900 ring-2 ring-amber-800/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-indigo-700" />
                <span>Card Swipe</span>
              </button>
            </div>

            {/* Dynamic Tender Inputs */}
            {paymentMethod === 'CASH' && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-emerald-900">
                    Cash Tendered by Customer ({currency === 'BTN' ? 'Nu.' : '$'})
                  </label>
                  <button
                    type="button"
                    onClick={() => setTenderedInput(String(grandTotal))}
                    className="text-[11px] text-emerald-700 hover:underline font-semibold"
                  >
                    Exact Amount
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  placeholder={String(grandTotal)}
                  value={tenderedInput}
                  onChange={(e) => setTenderedInput(e.target.value)}
                  className="w-full admin-input border border-emerald-300 rounded px-3 py-1.5 text-sm font-mono font-bold bg-white"
                />
                <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-200">
                  <span className="font-medium text-emerald-900">Change Due:</span>
                  <span className="font-mono font-bold text-sm text-emerald-800">
                    {currency === 'BTN' ? 'Nu. ' : '$'}
                    {changeAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'MBOB' && (
              <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-lg space-y-2 text-xs">
                <div className="flex items-center gap-2 text-sky-900 font-semibold">
                  <QrCode className="w-4 h-4 text-sky-700" />
                  <span>Scan Bank of Bhutan (mBoB) Counter QR</span>
                </div>
                <p className="text-[11px] text-sky-800">
                  Direct customer to scan showroom QR on counter and record the 6-digit BoB Journal #.
                </p>
                <div>
                  <label className="block text-[11px] font-semibold text-sky-900 mb-0.5">
                    mBoB Journal / Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 948201"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full admin-input border border-sky-300 rounded px-2.5 py-1.5 font-mono text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg space-y-2 text-xs">
                <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                  <CreditCard className="w-4 h-4 text-indigo-700" />
                  <span>POS Terminal Authorization</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-indigo-900 mb-0.5">
                    Terminal Slip / Approval Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AUTH-4820"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full admin-input border border-indigo-300 rounded px-2.5 py-1.5 font-mono text-xs bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Grand Totals Summary */}
          <div className="border-t admin-border pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between admin-muted">
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items):</span>
              <span className="font-mono">{currency === 'BTN' ? `Nu. ${cartSubtotalBTN.toLocaleString()}` : `$${cartSubtotalUSD.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between admin-muted">
              <span>Sales Tax / CSO Levy (0% Exemption):</span>
              <span className="font-mono">Nu. 0</span>
            </div>
            <div className="flex justify-between text-base font-bold admin-title pt-1 border-t admin-border">
              <span>Grand Total:</span>
              <span className="font-mono text-slate-900 text-lg">
                {currency === 'BTN' ? `Nu. ${cartSubtotalBTN.toLocaleString()}` : `$${cartSubtotalUSD.toFixed(2)}`}
              </span>
            </div>
            {currency === 'BTN' && (
              <div className="text-[10px] text-right font-mono text-slate-400">
                (Equivalent to $${cartSubtotalUSD.toFixed(2)} USD @ Nu. 84/$1)
              </div>
            )}
          </div>

          {/* Complete Sale Button */}
          <button
            type="button"
            disabled={submitting || cart.length === 0}
            onClick={handleCheckout}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 transition shadow-md flex items-center justify-center gap-2 text-sm"
          >
            {submitting ? (
              <span>Ringing Up Sale...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  Complete Sale &amp; Print Receipt (
                  {currency === 'BTN' ? `Nu. ${grandTotal.toLocaleString()}` : `$${grandTotal.toFixed(2)}`})
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {completedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8 text-slate-900">
            {/* Header Actions */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sale Completed
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1 bg-amber-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-900 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                </button>
                <button
                  onClick={() => setCompletedReceipt(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Receipt Area */}
            <div
              ref={receiptRef}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 font-mono text-xs"
            >
              {/* Receipt Header */}
              <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-3">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
                  Handicrafts Association of Bhutan
                </h3>
                <p className="text-[10px] text-slate-600">Apex Civil Society Organization · CSO/2011/043</p>
                <p className="text-[10px] text-slate-600">HAB Central Outlet · Norzin Lam, Thimphu</p>
                <p className="text-[10px] text-slate-600">Tel: +975-2-338089 · Web: hab.touratbhutan.info</p>
              </div>

              {/* Transaction Metadata */}
              <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt No:</span>
                  <span className="font-bold text-slate-900">{completedReceipt.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date &amp; Time:</span>
                  <span className="text-slate-800">{completedReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cashier:</span>
                  <span className="text-slate-800">{completedReceipt.cashier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="text-slate-800">{completedReceipt.customerName}</span>
                </div>
                {completedReceipt.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="text-slate-800">{completedReceipt.customerPhone}</span>
                  </div>
                )}
              </div>

              {/* Itemized Table */}
              <div className="space-y-1 border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                  <span>Item / Qty</span>
                  <span>Total</span>
                </div>
                {completedReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="pr-2">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {item.code} • {item.quantity} x Nu. {item.priceBTN.toLocaleString()}
                      </p>
                    </div>
                    <span className="font-bold whitespace-nowrap">
                      Nu. {(item.priceBTN * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Summary */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal:</span>
                  <span>Nu. {completedReceipt.totalBTN.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CSO Exempt Sales Tax:</span>
                  <span>Nu. 0</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200">
                  <span>TOTAL PAID:</span>
                  <span>Nu. {completedReceipt.totalBTN.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>USD Equivalent:</span>
                  <span>$${completedReceipt.totalUSD.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Tender Details */}
              <div className="space-y-0.5 text-[11px] border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-bold">
                    {completedReceipt.paymentMethod === 'CASH'
                      ? 'CASH'
                      : completedReceipt.paymentMethod === 'MBOB'
                      ? 'mBoB (Bank of Bhutan)'
                      : 'CARD SWIPE'}
                  </span>
                </div>
                {completedReceipt.paymentRef && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ref / Journal #:</span>
                    <span className="font-bold">{completedReceipt.paymentRef}</span>
                  </div>
                )}
                {completedReceipt.paymentMethod === 'CASH' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tendered:</span>
                      <span>Nu. {completedReceipt.tenderedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-800">
                      <span>Change Given:</span>
                      <span>Nu. {completedReceipt.changeAmount.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer Note */}
              <div className="text-center pt-2 text-[10px] text-slate-500 space-y-0.5">
                <p className="font-semibold text-slate-800">Tashi Delek! Thank you for your support.</p>
                <p>100% of proceeds support traditional Bhutanese artisans.</p>
                <p>Goods once sold may be exchanged within 7 days with this slip.</p>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setCompletedReceipt(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition"
              >
                New Transaction
              </button>
              <button
                onClick={handlePrint}
                className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  CreditCard, 
  DollarSign, 
  Printer, 
  RotateCcw, 
  Check, 
  Plus, 
  Minus, 
  Trash2, 
  Package, 
  AlertCircle, 
  QrCode, 
  ArrowRight,
  Receipt,
  Clock,
  User,
  Phone,
  Mail,
  FileSpreadsheet,
  X,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  code: string;
  name: string;
  priceUSD: number;
  stock: number;
  craftKey: string;
  region: string;
  imageUrl?: string;
  maker?: {
    name: string;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CompletedSale {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerType: string;
  items: Array<{
    code: string;
    name: string;
    priceUSD: number;
    quantity: number;
  }>;
  totalUSD: number;
  totalPaidCurrency: number;
  currencyUsed: 'BTN' | 'USD';
  paymentMethod: 'CASH' | 'MBOB' | 'CARD';
  paymentReference?: string;
  cashTendered?: number;
  cashChange?: number;
  cashierName?: string;
}

const CATEGORIES = [
  { key: 'ALL', label: 'All Crafts' },
  { key: 'textile', label: 'Thag-zo (Textiles)' },
  { key: 'wood', label: 'Shing-zo & Kham-zo (Wood & Turnery)' },
  { key: 'cane-bamboo', label: 'Tshar-zo (Bamboo & Cane)' },
  { key: 'metal', label: 'Lug-zo & Gar-zo (Metal)' },
  { key: 'paper', label: 'Deh-zo (Handmade Paper)' },
  { key: 'clay', label: 'Jim-zo (Clay & Pottery)' },
  { key: 'jewelry', label: 'Tshoo-zo (Jewelry)' },
];

export default function PosRegisterPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockOnly, setStockOnly] = useState(true);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState<'BTN' | 'USD'>('BTN');
  const [fxRate, setFxRate] = useState<number>(84.0);
  const [cashierName, setCashierName] = useState<string>('Staff Operator');

  // Customer metadata
  const [customerType, setCustomerType] = useState('WALK_IN_POS');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [showCustomerFields, setShowCustomerFields] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MBOB' | 'CARD'>('CASH');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [mbobReference, setMbobReference] = useState<string>('');
  const [cardAuthCode, setCardAuthCode] = useState<string>('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastSale, setLastSale] = useState<CompletedSale | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftOrders, setShiftOrders] = useState<any[]>([]);
  const [loadingShift, setLoadingShift] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Load products and system FX
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [prodRes, healthRes] = await Promise.all([
        fetch('/api/admin/products', { credentials: 'include' }),
        fetch('/api/admin/health', { credentials: 'include' }),
      ]);

      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products || []);
      } else {
        setErrorMsg('Failed to sync live product catalog from database.');
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        if (healthData.fx?.rate) {
          setFxRate(healthData.fx.rate);
        }
        if (healthData.user?.name) {
          setCashierName(healthData.user.name);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to PostgreSQL backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (stockOnly && p.stock <= 0) return false;
      if (selectedCategory !== 'ALL' && p.craftKey !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          (p.region && p.region.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [products, stockOnly, selectedCategory, search]);

  // Handle direct barcode or SKU scan / enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim().toUpperCase();
    if (!query) return;

    const matched = products.find(
      (p) => p.code.toUpperCase() === query || p.id === query
    );

    if (matched) {
      addToCart(matched);
      setBarcodeInput('');
    } else {
      setErrorMsg(`No product found matching SKU/Barcode: ${query}`);
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  // Cart operations
  const addToCart = (product: Product) => {
    setErrorMsg('');
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          setErrorMsg(`Cannot add more. Max stock available for ${product.name} is ${product.stock}.`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        if (product.stock < 1) {
          setErrorMsg(`${product.name} is out of stock in real-time inventory.`);
          return prev;
        }
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, newQty: number) => {
    setErrorMsg('');
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > product.stock) {
      setErrorMsg(`Max stock available for ${product.name} is ${product.stock}.`);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCashTendered('');
    setMbobReference('');
    setCardAuthCode('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setCustomerNotes('');
    setErrorMsg('');
  };

  // Calculations
  const subtotalUSD = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.priceUSD * item.quantity, 0);
  }, [cart]);

  const subtotalBTN = useMemo(() => {
    return Math.round(subtotalUSD * fxRate);
  }, [subtotalUSD, fxRate]);

  const totalPayable = currency === 'BTN' ? subtotalBTN : subtotalUSD;

  // Cash change calculation
  const tenderedNumber = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNumber - totalPayable);
  const isCashInsufficient = paymentMethod === 'CASH' && tenderedNumber > 0 && tenderedNumber < totalPayable;

  // Quick cash buttons
  const quickCashOptions = useMemo(() => {
    if (currency === 'BTN') {
      const roundedHundreds = Math.ceil(subtotalBTN / 100) * 100;
      const roundedFiveHundreds = Math.ceil(subtotalBTN / 500) * 500;
      const roundedThousands = Math.ceil(subtotalBTN / 1000) * 1000;
      return Array.from(new Set([subtotalBTN, roundedHundreds, roundedFiveHundreds, roundedThousands]))
        .filter((v) => v >= subtotalBTN)
        .slice(0, 4);
    } else {
      const ceilTen = Math.ceil(subtotalUSD / 10) * 10;
      const ceilFifty = Math.ceil(subtotalUSD / 50) * 50;
      const ceilHundred = Math.ceil(subtotalUSD / 100) * 100;
      return Array.from(new Set([subtotalUSD, ceilTen, ceilFifty, ceilHundred]))
        .filter((v) => v >= subtotalUSD)
        .slice(0, 4);
    }
  }, [currency, subtotalBTN, subtotalUSD]);

  // Checkout submission
  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      setErrorMsg('Cannot process sale: Cart is empty.');
      return;
    }

    if (paymentMethod === 'CASH') {
      if (tenderedNumber < totalPayable) {
        setErrorMsg(`Insufficient cash tendered. Total due is ${currency === 'BTN' ? 'Nu. ' : '$'}${totalPayable}.`);
        return;
      }
    } else if (paymentMethod === 'MBOB') {
      if (!mbobReference.trim()) {
        setErrorMsg('Please record the mBoB transaction / journal reference number.');
        return;
      }
    } else if (paymentMethod === 'CARD') {
      if (!cardAuthCode.trim()) {
        setErrorMsg('Please record the POS Card Terminal Approval Code.');
        return;
      }
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        customerType: 'WALK_IN_POS',
        customerName: customerName.trim() || 'Walk-in Customer',
        customerEmail: customerEmail.trim() || 'pos@hab.org.bt',
        customerPhone: customerPhone.trim() || null,
        shippingMethod: 'WALK_IN',
        paymentMethod: paymentMethod,
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        currencyUsed: currency,
        items: cart.map((i) => ({
          code: i.product.code,
          productId: i.product.id,
          quantity: i.quantity,
          priceUSD: i.product.priceUSD,
        })),
        notes: customerNotes.trim() || undefined,
        reference: paymentMethod === 'MBOB' ? mbobReference : cardAuthCode,
      };

      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete POS transaction in database.');
      }

      // Successfully saved and inventory decremented atomically
      const completed: CompletedSale = {
        orderNumber: data.order?.orderNumber || `HAB-POS-${Date.now()}`,
        createdAt: data.order?.createdAt || new Date().toISOString(),
        customerName: customerName.trim() || 'Walk-in Customer',
        customerEmail: customerEmail.trim() || 'pos@hab.org.bt',
        customerPhone: customerPhone.trim() || undefined,
        customerType: customerType,
        items: cart.map((i) => ({
          code: i.product.code,
          name: i.product.name,
          priceUSD: i.product.priceUSD,
          quantity: i.quantity,
        })),
        totalUSD: subtotalUSD,
        totalPaidCurrency: totalPayable,
        currencyUsed: currency,
        paymentMethod: paymentMethod,
        paymentReference: paymentMethod === 'MBOB' ? mbobReference : paymentMethod === 'CARD' ? cardAuthCode : undefined,
        cashTendered: paymentMethod === 'CASH' ? tenderedNumber : undefined,
        cashChange: paymentMethod === 'CASH' ? changeDue : undefined,
        cashierName: cashierName,
      };

      setLastSale(completed);
      setShowReceiptModal(true);

      // Decrement stock in local state immediately so UI is 100% synchronized
      setProducts((prev) =>
        prev.map((p) => {
          const inCart = cart.find((item) => item.product.id === p.id);
          if (inCart) {
            return { ...p, stock: Math.max(0, p.stock - inCart.quantity) };
          }
          return p;
        })
      );

      // Clear cart
      setCart([]);
      setCashTendered('');
      setMbobReference('');
      setCardAuthCode('');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerNotes('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing sale.');
    } finally {
      setSubmitting(false);
    }
  };

  // Load shift summary
  const loadShiftSummary = async () => {
    try {
      setLoadingShift(true);
      setShowShiftModal(true);
      const res = await fetch('/api/admin/orders', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const allOrders = data.orders || [];
        // Filter for orders created today or POS orders
        const today = new Date().toDateString();
        const posOnly = allOrders.filter((o: any) => {
          const orderDate = new Date(o.createdAt).toDateString();
          return (o.customerType === 'WALK_IN_POS' || o.shippingMethod === 'WALK_IN' || o.orderNumber?.startsWith('HAB-POS-')) && orderDate === today;
        });
        setShiftOrders(posOnly);
      }
    } catch (e) {
      console.error('Error fetching shift orders:', e);
    } finally {
      setLoadingShift(false);
    }
  };

  // Print receipt function
  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top POS Header & Status Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              HAB Real-Time POS Register
            </h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Synchronized
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official Secretariat Showroom & Pavilion Register · Decrements live e-commerce stock atomically on sale
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Currency Switcher */}
          <div className="inline-flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setCurrency('BTN')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                currency === 'BTN'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nu. BTN
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                currency === 'USD'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              $ USD
            </button>
          </div>

          {/* RMA FX Rate Tag */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-700">
            <span className="text-slate-400">RMA FX:</span>
            <span className="font-semibold text-slate-900">1 USD = {fxRate.toFixed(2)} BTN</span>
          </div>

          {/* Shift Summary Button */}
          <button
            onClick={loadShiftSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            Today's Shift
          </button>

          {/* Refresh Catalog */}
          <button
            onClick={fetchProducts}
            disabled={loading}
            title="Refresh inventory from database"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-300 transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm px-4 py-3 rounded-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-none" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-900 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Catalog Browser & Quick Scan (7 cols) */}
        <div className="xl:col-span-7 space-y-4">
          {/* Quick SKU / Barcode Entry Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan barcode or type exact SKU (e.g. HAB-YAT-01) and press Enter..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B2E24] focus:border-transparent transition-all"
                />
                <Package className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#8B2E24] hover:bg-[#72241C] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 flex-none"
              >
                <Plus className="w-3.5 h-3.5" />
                Add SKU
              </button>
            </form>
          </div>

          {/* Search & Category Filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search crafts by name, SKU, or Dzongkhag origin..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <div className="flex items-center gap-2 flex-none">
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={stockOnly}
                    onChange={(e) => setStockOnly(e.target.checked)}
                    className="rounded border-slate-300 text-[#8B2E24] focus:ring-[#8B2E24]"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
              <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
              <p className="text-xs">Synchronizing live catalog with database...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
              <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No matching craft items found</p>
              <p className="text-xs text-slate-400 mt-1">Try relaxing filters or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const inCartItem = cart.find((i) => i.product.id === product.id);
                const remainingStock = product.stock - (inCartItem?.quantity || 0);
                const priceFormatted =
                  currency === 'BTN'
                    ? `Nu. ${Math.round(product.priceUSD * fxRate).toLocaleString()}`
                    : `$${product.priceUSD.toFixed(2)}`;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && remainingStock > 0 && addToCart(product)}
                    className={`bg-white border rounded-xl p-3 flex flex-col justify-between transition-all cursor-pointer select-none group ${
                      isOutOfStock || remainingStock <= 0
                        ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                        : 'border-slate-200 hover:border-[#8B2E24] hover:shadow-md active:scale-[0.99]'
                    }`}
                  >
                    <div>
                      {/* Thumbnail or Craft Code Tag */}
                      <div className="relative h-28 bg-slate-100 rounded-lg overflow-hidden mb-2.5 flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-slate-300" />
                        )}
                        <span className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                          {product.code}
                        </span>
                        {inCartItem && (
                          <span className="absolute top-1.5 right-1.5 bg-[#8B2E24] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                            {inCartItem.quantity}
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h3 className="font-semibold text-xs text-slate-900 line-clamp-2 leading-snug">
                        {product.name}
                      </h3>

                      {/* Region & Artisan Note */}
                      <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {product.region || 'Bhutan'}
                        {product.maker?.name ? ` · ${product.maker.name}` : ''}
                      </div>
                    </div>

                    {/* Pricing & Stock Footer */}
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900 font-mono">
                          {priceFormatted}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {currency === 'BTN' ? `$${product.priceUSD.toFixed(2)}` : `Nu. ${Math.round(product.priceUSD * fxRate)}`}
                        </div>
                      </div>

                      <div>
                        {isOutOfStock || remainingStock <= 0 ? (
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                            Out of Stock
                          </span>
                        ) : remainingStock <= 3 ? (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            {remainingStock} left
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {remainingStock} in stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Register Cart, Tender & Checkout (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {/* Cart Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-slate-700" />
                <span className="font-bold text-sm text-slate-900">Current Sale</span>
                <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-mono">
                  {cart.reduce((a, b) => a + b.quantity, 0)} items
                </span>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="p-4 max-h-[320px] overflow-y-auto space-y-3 divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                  <p className="text-xs font-medium text-slate-600">Register cart is empty</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click any craft card or enter SKU to add
                  </p>
                </div>
              ) : (
                cart.map((item) => {
                  const lineUnit =
                    currency === 'BTN'
                      ? Math.round(item.product.priceUSD * fxRate)
                      : item.product.priceUSD;
                  const lineTotal = lineUnit * item.quantity;

                  return (
                    <div key={item.product.id} className="pt-3 first:pt-0 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-slate-900 truncate">
                          {item.product.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                          <span>{item.product.code}</span>
                          <span>·</span>
                          <span>
                            {currency === 'BTN' ? `Nu. ${lineUnit}` : `$${lineUnit.toFixed(2)}`} each
                          </span>
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1 border border-slate-200">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-white text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-white text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="w-20 text-right font-bold text-xs text-slate-900 font-mono">
                        {currency === 'BTN' ? `Nu. ${lineTotal.toLocaleString()}` : `$${lineTotal.toFixed(2)}`}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Optional Customer Information Accordion */}
            <div className="border-t border-slate-200 bg-slate-50/50 p-3">
              <button
                type="button"
                onClick={() => setShowCustomerFields(!showCustomerFields)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Customer & Tax Invoice Details</span>
                  {customerName && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-normal">
                      ({customerName})
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCustomerFields ? 'rotate-180' : ''}`} />
              </button>

              {showCustomerFields && (
                <div className="mt-3 space-y-2.5 pt-2 border-t border-slate-200 text-xs animate-fadeIn">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-medium mb-1">
                        Customer Type
                      </label>
                      <select
                        value={customerType}
                        onChange={(e) => setCustomerType(e.target.value)}
                        className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800"
                      >
                        <option value="WALK_IN_POS">Walk-in Local Resident</option>
                        <option value="TOURIST_POS">International Visitor</option>
                        <option value="CSO_PARTNER">CSO / Gov Partner</option>
                        <option value="VIP_DIGNITARY">VIP / State Guest</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-medium mb-1">
                        Full Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Tenzin Wangchuk"
                        className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-medium mb-1">
                        Mobile Phone (Receipt SMS)
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+975-17XXXXXX"
                        className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-medium mb-1">
                        Email Address (Receipt)
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="customer@email.com"
                        className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-medium mb-1">
                      Sale / Gift Note
                    </label>
                    <input
                      type="text"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Special packaging, corporate consignment, etc."
                      className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Financial Totals */}
            <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Gross Subtotal</span>
                <span className="font-mono font-medium">
                  {currency === 'BTN' ? `Nu. ${subtotalBTN.toLocaleString()}` : `$${subtotalUSD.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Bhutan Tax / Sales Levy</span>
                <span className="font-mono text-emerald-700 font-medium">0% (CSO Exemption)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <div>
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Total Payable
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {currency === 'BTN' ? `Equivalent: $${subtotalUSD.toFixed(2)}` : `Equivalent: Nu. ${subtotalBTN.toLocaleString()}`}
                  </div>
                </div>
                <div className="text-xl font-extrabold text-slate-900 font-mono">
                  {currency === 'BTN' ? `Nu. ${subtotalBTN.toLocaleString()}` : `$${subtotalUSD.toFixed(2)}`}
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-4 border-t border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Tender Method
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm ring-1 ring-amber-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('MBOB')}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'MBOB'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm ring-1 ring-blue-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>mBoB QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'CARD'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm ring-1 ring-indigo-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>POS Card</span>
                </button>
              </div>

              {/* Payment Specific Input Fields */}
              {paymentMethod === 'CASH' && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-slate-700">
                      Amount Tendered ({currency}):
                    </label>
                    {quickCashOptions.length > 0 && (
                      <div className="flex gap-1">
                        {quickCashOptions.map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setCashTendered(amt.toString())}
                            className="px-2 py-0.5 bg-white border border-slate-300 hover:border-slate-400 rounded text-[10px] font-mono text-slate-700"
                          >
                            {currency === 'BTN' ? amt : `$${amt}`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    placeholder={`Enter cash received (e.g. ${totalPayable})`}
                    className="w-full p-2 bg-white border border-slate-300 rounded text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />

                  {/* Change Due Display */}
                  {tenderedNumber > 0 && (
                    <div
                      className={`p-2 rounded text-xs font-mono flex justify-between items-center ${
                        isCashInsufficient
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      <span>{isCashInsufficient ? 'Underpaid Shortfall:' : 'Change to Return:'}</span>
                      <span className="font-bold text-sm">
                        {currency === 'BTN'
                          ? `Nu. ${Math.abs(changeDue || totalPayable - tenderedNumber).toLocaleString()}`
                          : `$${Math.abs(changeDue || totalPayable - tenderedNumber).toFixed(2)}`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'MBOB' && (
                <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-xs text-blue-900 font-semibold">
                    <QrCode className="w-4 h-4 text-blue-700" />
                    <span>Customer Scans HAB Bank of Bhutan / BNB QR</span>
                  </div>
                  <p className="text-[11px] text-blue-800">
                    Verify confirmation SMS or app screenshot on customer's phone before proceeding.
                  </p>
                  <div>
                    <label className="block text-[10px] text-blue-900 font-medium mb-1 uppercase">
                      mBoB Journal / Transaction Ref #
                    </label>
                    <input
                      type="text"
                      value={mbobReference}
                      onChange={(e) => setMbobReference(e.target.value)}
                      placeholder="e.g. MBOB-984218739"
                      className="w-full p-2 bg-white border border-blue-300 rounded text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-200 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-xs text-indigo-900 font-semibold">
                    <CreditCard className="w-4 h-4 text-indigo-700" />
                    <span>Swipe / Tap on BOB / RMA POS Terminal</span>
                  </div>
                  <div>
                    <label className="block text-[10px] text-indigo-900 font-medium mb-1 uppercase">
                      Terminal Auth Code / Slip Reference
                    </label>
                    <input
                      type="text"
                      value={cardAuthCode}
                      onChange={(e) => setCardAuthCode(e.target.value)}
                      placeholder="e.g. AUTH-659302 / Last 4 Digits"
                      className="w-full p-2 bg-white border border-indigo-300 rounded text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Complete Sale Action Button */}
              <button
                type="button"
                disabled={submitting || cart.length === 0 || (paymentMethod === 'CASH' && tenderedNumber < totalPayable)}
                onClick={handleCompleteSale}
                className="w-full py-3.5 bg-[#8B2E24] hover:bg-[#72241C] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Recording in PostgreSQL & Syncing Stock...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      Complete Sale & Generate Receipt ({currency === 'BTN' ? `Nu. ${totalPayable.toLocaleString()}` : `$${totalPayable.toFixed(2)}`})
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {showReceiptModal && lastSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
            {/* Modal Actions Bar (hidden when printed) */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm text-slate-800">Sale Successfully Recorded!</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="px-3 py-1.5 bg-[#8B2E24] hover:bg-[#72241C] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Receipt
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Receipt Body (Formatted for 80mm thermal / A4 voucher print) */}
            <div id="printable-pos-receipt" className="p-6 overflow-y-auto font-mono text-xs text-slate-900 space-y-4">
              {/* Header */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
                <h2 className="font-bold text-sm tracking-tight font-serif text-slate-950">
                  HANDICRAFTS ASSOCIATION OF BHUTAN
                </h2>
                <p className="text-[10px] text-slate-600">
                  Civil Society Organization (CSO Reg: CSO/2011/043)
                </p>
                <p className="text-[10px] text-slate-600">
                  Secretariat Craft Pavilion & Gallery · Thimphu, Bhutan
                </p>
                <p className="text-[10px] text-slate-500">
                  Tel: +975-2-332999 · Desk: pos@hab.org.bt
                </p>
              </div>

              {/* Order Meta */}
              <div className="text-[11px] space-y-1 pb-3 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order No:</span>
                  <span className="font-bold">{lastSale.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date/Time:</span>
                  <span>{new Date(lastSale.createdAt).toLocaleString('en-GB')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Staff Cashier:</span>
                  <span>{lastSale.cashierName || 'Secretariat Staff'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span>{lastSale.customerName}</span>
                </div>
                {lastSale.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span>{lastSale.customerPhone}</span>
                  </div>
                )}
              </div>

              {/* Itemized Table */}
              <div className="space-y-2 pb-3 border-b border-dashed border-slate-300">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase border-b pb-1">
                  <span>Item / SKU</span>
                  <span className="text-right">Qty x Price</span>
                </div>
                {lastSale.items.map((item, idx) => {
                  const linePrice =
                    lastSale.currencyUsed === 'BTN'
                      ? Math.round(item.priceUSD * fxRate)
                      : item.priceUSD;
                  const total = linePrice * item.quantity;
                  return (
                    <div key={idx} className="space-y-0.5">
                      <div className="font-bold text-slate-900 leading-tight">
                        {item.name}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>{item.code}</span>
                        <span>
                          {item.quantity} × {lastSale.currencyUsed === 'BTN' ? `Nu. ${linePrice}` : `$${linePrice.toFixed(2)}`} ={' '}
                          <span className="font-bold text-slate-900 font-mono">
                            {lastSale.currencyUsed === 'BTN' ? `Nu. ${total.toLocaleString()}` : `$${total.toFixed(2)}`}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Payment Summary */}
              <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-300 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span>
                    {lastSale.currencyUsed === 'BTN'
                      ? `Nu. ${lastSale.totalPaidCurrency.toLocaleString()}`
                      : `$${lastSale.totalUSD.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Sales Tax / GST:</span>
                  <span className="text-emerald-700">0% (CSO Exemption)</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-200">
                  <span>Total Paid ({lastSale.currencyUsed}):</span>
                  <span>
                    {lastSale.currencyUsed === 'BTN'
                      ? `Nu. ${lastSale.totalPaidCurrency.toLocaleString()}`
                      : `$${lastSale.totalUSD.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 pt-1">
                  <span>Method:</span>
                  <span className="font-bold">{lastSale.paymentMethod}</span>
                </div>
                {lastSale.paymentReference && (
                  <div className="flex justify-between text-slate-600">
                    <span>Reference / Auth:</span>
                    <span className="font-mono">{lastSale.paymentReference}</span>
                  </div>
                )}
                {lastSale.cashTendered !== undefined && (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>Cash Tendered:</span>
                      <span>
                        {lastSale.currencyUsed === 'BTN'
                          ? `Nu. ${lastSale.cashTendered.toLocaleString()}`
                          : `$${lastSale.cashTendered.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 font-bold">
                      <span>Change Given:</span>
                      <span className="text-emerald-700">
                        {lastSale.currencyUsed === 'BTN'
                          ? `Nu. ${(lastSale.cashChange || 0).toLocaleString()}`
                          : `$${(lastSale.cashChange || 0).toFixed(2)}`}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Seal of Authenticity Note */}
              <div className="text-center space-y-1 text-[10px] text-slate-600 pt-1">
                <p className="font-semibold text-slate-800">
                  Seal of Bhutanese Craft Authenticity
                </p>
                <p className="italic text-[9px] text-slate-500">
                  100% genuine indigenous handicraft handmade by accredited Bhutanese master artisans under the 13 Traditional Arts & Crafts (Zorig Chusum).
                </p>
                <p className="text-slate-400 text-[9px] pt-1">
                  Kadrinchey (Thank You) for empowering rural craft livelihoods!
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 print:hidden">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Start New Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift / Daily Summary Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-700" />
                <h2 className="font-bold text-sm text-slate-900">
                  Today's POS Register Shift Report ({new Date().toLocaleDateString('en-GB')})
                </h2>
              </div>
              <button
                onClick={() => setShowShiftModal(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {loadingShift ? (
                <div className="py-12 text-center text-slate-400">
                  <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">Calculating daily shift totals...</p>
                </div>
              ) : shiftOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No POS sales recorded today yet</p>
                  <p className="text-xs text-slate-400 mt-1">Walk-in transactions completed will appear here</p>
                </div>
              ) : (
                <>
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-500 font-medium">Completed Transactions</div>
                      <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
                        {shiftOrders.length}
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <div className="text-xs text-amber-800 font-medium">Total Nu. BTN Revenue</div>
                      <div className="text-2xl font-bold text-amber-900 font-mono mt-1">
                        Nu. {shiftOrders
                          .filter((o) => o.currencyUsed === 'BTN')
                          .reduce((sum, o) => sum + (o.totalPaidCurrency || 0), 0)
                          .toLocaleString()}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <div className="text-xs text-blue-800 font-medium">Total USD Revenue</div>
                      <div className="text-2xl font-bold text-blue-900 font-mono mt-1">
                        ${shiftOrders
                          .filter((o) => o.currencyUsed === 'USD')
                          .reduce((sum, o) => sum + (o.totalPaidCurrency || o.totalUSD || 0), 0)
                          .toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Breakdown */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Breakdown by Payment Method
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-500 block text-[11px]">Cash Sales</span>
                        <span className="font-bold text-slate-900 font-mono text-sm">
                          {shiftOrders.filter((o) => o.paymentMethod === 'CASH').length}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-500 block text-[11px]">mBoB QR</span>
                        <span className="font-bold text-slate-900 font-mono text-sm">
                          {shiftOrders.filter((o) => o.paymentMethod === 'MBOB').length}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-500 block text-[11px]">Card Terminal</span>
                        <span className="font-bold text-slate-900 font-mono text-sm">
                          {shiftOrders.filter((o) => o.paymentMethod === 'CARD').length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Today's Transactions Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Today's Transactions
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                          <tr>
                            <th className="p-2.5">Order No</th>
                            <th className="p-2.5">Customer</th>
                            <th className="p-2.5">Items</th>
                            <th className="p-2.5">Method</th>
                            <th className="p-2.5 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {shiftOrders.map((ord: any) => (
                            <tr key={ord.id} className="hover:bg-slate-50">
                              <td className="p-2.5 font-mono font-medium text-slate-900">
                                {ord.orderNumber}
                              </td>
                              <td className="p-2.5 text-slate-700">{ord.customerName}</td>
                              <td className="p-2.5 text-slate-500 font-mono">
                                {ord.items?.length || 1} item(s)
                              </td>
                              <td className="p-2.5 font-semibold text-slate-600">
                                {ord.paymentMethod}
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                                {ord.currencyUsed === 'BTN'
                                  ? `Nu. ${(ord.totalPaidCurrency || 0).toLocaleString()}`
                                  : `$${(ord.totalUSD || 0).toFixed(2)}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowShiftModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

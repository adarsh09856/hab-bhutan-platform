'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  QrCode, 
  Building2, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShoppingBag,
  Info
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { 
    items, 
    cartCount, 
    subtotalUSD, 
    shippingMethod, 
    setShippingMethod, 
    shippingOption, 
    shippingFeeUSD, 
    totalUSD, 
    clearCart 
  } = useCart();
  const { currency, fmt } = useCurrency();

  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'MBOB' | 'BANK'>('CARD');
  const [mbobRef, setMbobRef] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    nameOnCard: '',
  });

  const [customer, setCustomer] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: 'Thimphu',
    country: 'Bhutan',
    postalCode: '',
  });

  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((d) => {
        if (d?.setting || d?.settings) {
          setSiteSettings(d.setting || d.settings);
        }
      })
      .catch(() => {});
  }, []);

  // Attempt to autofill from user profile if logged in
  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.success && data.profile) {
          setIsUserLoggedIn(true);
          setCustomer((prev) => ({
            fullName: data.profile.name || prev.fullName,
            email: data.profile.email || prev.email,
            phone: data.profile.phone || prev.phone,
            street: data.profile.address || prev.street,
            city: data.profile.city || prev.city,
            country: data.profile.country || prev.country,
            postalCode: prev.postalCode,
          }));
        }
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-[#FBF9F5] font-figtree">
        <div className="bg-white rounded-2xl border border-[#E4DDD1] p-10 max-w-md w-full text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#EDE5D6]/60 text-[#8B2E24] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="font-marcellus text-xl text-[#33261F]">Your Basket is Empty</h2>
          <p className="text-xs text-[#6B5A4C]">
            You have not selected any handcrafted items for checkout yet.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#72251D] text-white text-xs font-semibold shadow-xs"
            >
              <span>Explore Authentic Crafts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customer.fullName.trim()) {
      setError('Please provide recipient full name.');
      return;
    }
    if (!customer.email.trim() || !customer.email.includes('@')) {
      setError('Please provide a valid email address for tracking updates.');
      return;
    }
    if (!customer.street.trim()) {
      setError('Please provide a physical delivery street address.');
      return;
    }
    if (paymentMethod === 'MBOB' && !mbobRef.trim()) {
      setError('Please enter your mBOB Transaction Journal / Reference number.');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept the Terms & Conditions and Export Standards to proceed.');
      return;
    }

    setLoading(true);

    try {
      const selectedCurrency = paymentMethod === 'MBOB' ? 'BTN' : (currency || 'USD');

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            code: i.code,
            name: i.name,
            quantity: i.quantity,
            priceUsd: i.priceUSD,
          })),
          currency: selectedCurrency,
          paymentMethod,
          shippingMethod: shippingMethod === 'express' ? 'EXPRESS' : 'EMS',
          customerName: customer.fullName.trim(),
          email: customer.email.trim(),
          phone: customer.phone.trim() || null,
          mBOBTransactionRef: paymentMethod === 'MBOB' ? mbobRef.trim() : null,
          shippingAddress: {
            fullName: customer.fullName.trim(),
            email: customer.email.trim(),
            phone: customer.phone.trim(),
            street: customer.street.trim(),
            city: customer.city.trim(),
            country: customer.country.trim(),
            postalCode: customer.postalCode.trim(),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order. Please try again.');
      }

      const orderNumber = data.order?.orderNumber || 'HAB-S-00000';
      clearCart();
      router.push(`/order-confirmation/${orderNumber}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while placing your order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] bg-[#FBF9F5] py-8 sm:py-12 px-4 sm:px-6 lg:px-10 font-figtree">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumb & Step Tracker */}
        <div>
          <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-2">
            <Link href="/" className="hover:underline">Home</Link> /{' '}
            <Link href="/shop" className="hover:underline">Shop</Link> /{' '}
            <Link href="/basket" className="hover:underline">Basket</Link> /{' '}
            <span className="text-[#33261F]">Secure Checkout</span>
          </div>
          <h1 className="font-marcellus text-2xl sm:text-3xl text-[#33261F]">
            Checkout &amp; Order Placement
          </h1>
          <p className="font-lora text-xs sm:text-sm text-[#6B5A4C] mt-1">
            Certified authentic Bhutanese handicrafts dispatched directly from master guilds.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-none" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Grid: Form Left, Summary Right */}
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Columns: Checkout Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer & Delivery Address */}
            <div className="bg-white rounded-2xl border border-[#E4DDD1] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4DDD1]">
                <h2 className="font-marcellus text-lg text-[#33261F] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B2E24] text-white flex items-center justify-center text-xs font-mono font-bold">1</span>
                  Delivery Information
                </h2>
                {!isUserLoggedIn && (
                  <Link href="/login" className="text-xs text-[#8B2E24] hover:underline font-semibold">
                    Sign in for faster checkout
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    placeholder="e.g. Karma Wangchuk"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="karma@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                    Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="+975 1712 3456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                    Street Address / Building / House *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.street}
                    onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
                    placeholder="Norzin Lam, House 12"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                    City / Dzongkhag *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.country}
                    onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Method */}
            <div className="bg-white rounded-2xl border border-[#E4DDD1] p-6 shadow-xs space-y-4">
              <h2 className="font-marcellus text-lg text-[#33261F] flex items-center gap-2 pb-3 border-b border-[#E4DDD1]">
                <span className="w-6 h-6 rounded-full bg-[#8B2E24] text-white flex items-center justify-center text-xs font-mono font-bold">2</span>
                Shipping Carrier
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Bhutan Post EMS */}
                <label
                  onClick={() => setShippingMethod('ems')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                    shippingMethod === 'ems'
                      ? 'border-[#8B2E24] bg-[#8B2E24]/5 ring-1 ring-[#8B2E24]'
                      : 'border-[#E4DDD1] hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#33261F] flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#8B2E24]" />
                      <span>Bhutan Post EMS</span>
                    </div>
                    <p className="text-[11px] text-[#6B5A4C]">
                      Standard airmail with tracking (10–18 days)
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#8B2E24] font-mono">
                    {subtotalUSD >= 150 ? 'FREE' : '$25.00'}
                  </span>
                </label>

                {/* DHL Express */}
                <label
                  onClick={() => setShippingMethod('express')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                    shippingMethod === 'express'
                      ? 'border-[#8B2E24] bg-[#8B2E24]/5 ring-1 ring-[#8B2E24]'
                      : 'border-[#E4DDD1] hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#33261F] flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-600" />
                      <span>DHL Express Air</span>
                    </div>
                    <p className="text-[11px] text-[#6B5A4C]">
                      Priority air courier (4–7 business days)
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#8B2E24] font-mono">
                    $45.00
                  </span>
                </label>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white rounded-2xl border border-[#E4DDD1] p-6 shadow-xs space-y-4">
              <h2 className="font-marcellus text-lg text-[#33261F] flex items-center gap-2 pb-3 border-b border-[#E4DDD1]">
                <span className="w-6 h-6 rounded-full bg-[#8B2E24] text-white flex items-center justify-center text-xs font-mono font-bold">3</span>
                Payment Method
              </h2>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-[#8B2E24] bg-[#8B2E24]/5 text-[#8B2E24] ring-1 ring-[#8B2E24]'
                      : 'border-[#E4DDD1] text-[#6B5A4C] hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Card Online</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('MBOB')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'MBOB'
                      ? 'border-[#8B2E24] bg-[#8B2E24]/5 text-[#8B2E24] ring-1 ring-[#8B2E24]'
                      : 'border-[#E4DDD1] text-[#6B5A4C] hover:border-slate-300'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span>Bhutan mBOB QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'BANK'
                      ? 'border-[#8B2E24] bg-[#8B2E24]/5 text-[#8B2E24] ring-1 ring-[#8B2E24]'
                      : 'border-[#E4DDD1] text-[#6B5A4C] hover:border-slate-300'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span>Bank Wire</span>
                </button>
              </div>

              {/* Payment Details Container */}
              {paymentMethod === 'CARD' && (
                <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E4DDD1] space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>256-Bit SSL Encrypted Card Processing</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg border border-[#E4DDD1] bg-white text-sm focus:outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        placeholder="08/28"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-lg border border-[#E4DDD1] bg-white text-sm focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1">
                        CVC / CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-lg border border-[#E4DDD1] bg-white text-sm focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'MBOB' && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                  <div className="text-xs text-amber-900 font-semibold flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-amber-700" />
                    <span>{siteSettings?.checkoutBankName || 'Bank of Bhutan (BoB)'} Official Account</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-amber-200 text-xs space-y-1 font-mono text-slate-800">
                    <div><strong>Account Title:</strong> {siteSettings?.checkoutAccountTitle || 'Handicrafts Association of Bhutan'}</div>
                    <div><strong>Account Number:</strong> {siteSettings?.checkoutAccountNumber || '200847291038'}</div>
                    <div><strong>Bank:</strong> {siteSettings?.checkoutBankName || 'Bank of Bhutan (BoB)'}, {siteSettings?.checkoutBankAddress || 'Main Branch Thimphu'}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1">
                      mBOB Journal / Reference Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BOB-TXN-849201"
                      value={mbobRef}
                      onChange={(e) => setMbobRef(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-amber-300 bg-white text-sm focus:outline-hidden"
                    />
                    <p className="text-[11px] text-amber-800 mt-1">
                      Transfer in Nu. via mBOB and enter the transaction reference number from your receipt.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'BANK' && (
                <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E4DDD1] space-y-2 text-xs">
                  <div className="font-semibold text-[#33261F] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#8B2E24]" />
                    <span>International Wire Transfer (SWIFT)</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#E4DDD1] space-y-1 font-mono text-slate-700 text-[11px]">
                    <div><strong>SWIFT Code:</strong> {siteSettings?.checkoutSwiftCode || 'BHUBBTBT'}</div>
                    <div><strong>Beneficiary:</strong> {siteSettings?.checkoutAccountTitle || 'Handicrafts Association of Bhutan'}</div>
                    <div><strong>Bank:</strong> {siteSettings?.checkoutBankName || 'Bank of Bhutan Limited'}</div>
                    <div><strong>Account:</strong> {siteSettings?.checkoutAccountNumber || '200847291038'}</div>
                    {siteSettings?.checkoutBankAddress && <div><strong>Branch:</strong> {siteSettings.checkoutBankAddress}</div>}
                  </div>
                  <p className="text-[11px] text-[#6B5A4C]">
                    Please quote your Order Number in the wire transfer reference. Orders ship once transfer settles.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Columns: Order Summary Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E4DDD1] p-6 shadow-xs space-y-4 sticky top-24">
              <h2 className="font-marcellus text-lg text-[#33261F] pb-3 border-b border-[#E4DDD1]">
                Order Summary ({cartCount} {cartCount === 1 ? 'item' : 'items'})
              </h2>

              {/* Items Scroll Area */}
              <div className="divide-y divide-[#E4DDD1] max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.code} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-[#EDE5D6]/60 text-[#33261F] flex items-center justify-center font-bold text-[11px]">
                        {item.quantity}×
                      </span>
                      <div>
                        <div className="font-semibold text-[#33261F] truncate max-w-[170px]">{item.name}</div>
                        <div className="text-[#A39281] font-mono text-[10px]">{item.code}</div>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-[#33261F]">
                      ${(item.priceUSD * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-[#E4DDD1] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#6B5A4C]">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-[#33261F]">${subtotalUSD.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[#6B5A4C]">
                  <span>Shipping ({shippingOption.name})</span>
                  <span className="font-mono font-semibold text-[#33261F]">
                    {shippingFeeUSD === 0 ? 'FREE' : `$${shippingFeeUSD.toFixed(2)}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E4DDD1] flex items-baseline justify-between">
                  <div>
                    <span className="font-bold text-sm text-[#33261F]">Total Amount</span>
                    <div className="text-[10.5px] text-[#6B5A4C]">All export permits included</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-extrabold text-lg text-[#8B2E24]">
                      ${totalUSD.toFixed(2)} USD
                    </span>
                    <div className="font-mono text-xs text-[#6B5A4C]">
                      {fmt(totalUSD)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2 flex items-start gap-2 text-xs text-[#6B5A4C]">
                <input
                  type="checkbox"
                  id="checkoutTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#8B2E24] rounded border-[#E4DDD1] focus:ring-[#8B2E24]"
                />
                <label htmlFor="checkoutTerms" className="leading-relaxed">
                  I accept the{' '}
                  <Link href="/terms" target="_blank" className="text-[#8B2E24] underline">
                    Terms
                  </Link>{' '}
                  and understand organic variations are intrinsic to handcrafted Bhutanese crafts.
                </label>
              </div>

              {/* Place Order CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#8B2E24] hover:bg-[#72251D] text-white text-sm font-semibold shadow-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Securing your order...</span>
                ) : (
                  <>
                    <span>Place Certified Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#6B5A4C]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>CSO Authenticity Certificate Guaranteed</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

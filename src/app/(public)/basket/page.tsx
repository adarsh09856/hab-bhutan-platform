'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { CUSTOMS_NOTICE } from '@/lib/shipping';

export default function BasketPage() {
  const { fmt, alt } = useCurrency();
  const {
    items,
    cartCount,
    subtotalUSD,
    shippingMethod,
    setShippingMethod,
    shippingOption,
    shippingFeeUSD,
    totalUSD,
    addToCart,
    decrementCart,
    removeFromCart,
    clearCart,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mbob' | 'bank'>('card');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState('HAB-S-88214');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [customer, setCustomer] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'Bhutan',
    street: '',
    city: 'Thimphu',
    postalCode: '',
  });

  const handlePlaceOrder = async () => {
    setFormError('');
    if (!customer.fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!customer.email.trim() || !customer.email.includes('@')) {
      setFormError('Please enter a valid email address for order tracking updates.');
      return;
    }
    if (!customer.street.trim()) {
      setFormError('Please enter your delivery street address.');
      return;
    }

    setIsSubmitting(true);
    let orderNum = `HAB-S-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
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
          currency: 'USD',
          shippingMethod: shippingMethod === 'express' ? 'EXPRESS' : 'EMS',
          customerName: customer.fullName.trim(),
          email: customer.email.trim(),
          phone: customer.phone.trim() || null,
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
      if (data.success && data.order?.orderNumber) {
        orderNum = data.order.orderNumber;
      } else if (!res.ok && data.error) {
        setFormError(data.error);
        setIsSubmitting(false);
        return;
      }
    } catch (err: any) {
      console.error('Error in checkout:', err);
    }

    setConfirmedOrderNumber(orderNum);
    clearCart();
    setOrderConfirmed(true);
    setIsSubmitting(false);
    window.scrollTo(0, 0);
  };

  const payOptions = [
    { key: 'card', name: 'International card', note: 'Visa, Mastercard, Amex — 3-D Secure' },
    { key: 'mbob', name: 'Bhutan mobile pay', note: 'mBoB / RMA-approved wallets, in Nu.' },
    { key: 'bank', name: 'Bank transfer', note: 'BNB / BOB account, invoice issued on order' },
  ];

  return (
    <main className="max-w-[1180px] min-w-[1180px] mx-auto px-10 pt-10 pb-24">
      {/* Breadcrumb */}
      <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-8">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        <span>Basket &amp; checkout</span>
      </div>

      <h1 className="font-marcellus text-[42px] font-normal leading-[1.06] text-[#33261F] mb-8">
        Your basket
      </h1>

      {/* State 1: Order Confirmed */}
      {orderConfirmed ? (
        <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] p-16 text-center max-w-[640px] mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#EFF0E4] text-[#4C6B41] text-[28px] font-bold flex items-center justify-center mx-auto mb-6">
            ✓
          </div>
          <h2 className="font-marcellus text-[32px] font-normal text-[#33261F] mb-4">
            Order confirmed
          </h2>
          <p className="font-lora text-[16.5px] leading-[1.62] text-[#4A3C33] mb-4">
            Thank you for supporting Bhutan&apos;s artisans. Your official order number is{' '}
            <strong className="font-mono text-[#8B2E24]">{confirmedOrderNumber}</strong>.
          </p>
          <p className="font-lora text-[15px] leading-[1.6] text-[#6B5A4C] mb-8">
            Your consignment will be certified with an official seal of authenticity under the 13 Traditional Arts &amp; Crafts and dispatched via EMS Bhutan Post.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/track-order?order=${confirmedOrderNumber}`}
              className="font-figtree font-semibold text-[14.5px] bg-[#8B2E24] text-white px-7 py-3.5 rounded-[7px] hover:bg-[#6E241C] transition-colors inline-block"
            >
              Track Order Status →
            </Link>
            <Link
              href="/shop"
              className="font-figtree font-semibold text-[14.5px] bg-[#33261F] text-[#F4F0E7] px-7 py-3.5 rounded-[7px] hover:bg-black transition-colors inline-block"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      ) : cartCount === 0 ? (
        /* State 2: Empty Cart */
        <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] p-16 text-center max-w-[640px] mx-auto">
          <h3 className="font-marcellus text-[26px] font-normal text-[#33261F] mb-3">
            Nothing in the basket yet.
          </h3>
          <p className="font-lora text-[15.5px] text-[#6B5A4C] mb-8">
            Explore authentic hand-woven textiles, turned bowls, and traditional art in our collection.
          </p>
          <Link
            href="/shop"
            className="font-figtree font-semibold text-[15px] bg-[#8B2E24] text-white px-7 py-3.5 rounded-[7px] hover:bg-[#6E241C] transition-colors inline-block"
          >
            Browse the 13 crafts →
          </Link>
        </div>
      ) : (
        /* State 3: Active Bag & Checkout */
        <div className="grid grid-cols-[1.35fr_0.65fr] gap-8 items-start">
          {/* Left Column: Line Items, Shipping, Payment */}
          <div className="flex flex-col gap-6">
            {/* 1. Line items */}
            <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] divide-y divide-[#EFE9DE] overflow-hidden">
              {items.map((item) => (
                <div key={item.code} className="p-5 flex items-center gap-5">
                  <div data-cms-img className="w-[86px] h-[86px] rounded-[9px] bg-[#E8E1D4] border border-[#E4DDD1] overflow-hidden flex-none relative">
                    <img
                      src={`/images/products/${item.code.toLowerCase()}.jpg`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="absolute bottom-1 right-1 font-mono text-[9px] text-[#33261F] bg-[#FFFCF8]/90 px-1 py-0.5 rounded border border-[#E4DDD1]">
                      {item.code}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="font-mono text-[10px] uppercase text-[#8B2E24]">
                      {item.craftKey}
                    </div>
                    <div className="font-figtree font-semibold text-[16.5px] text-[#33261F]">
                      {item.name}
                    </div>
                    <div className="font-lora text-[13px] text-[#6B5A4C]">
                      {item.maker} · {item.region}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-[#CDBEA8] rounded-[8px] bg-[#F4F0E7] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => decrementCart(item.code)}
                      className="w-[34px] h-[34px] flex items-center justify-center hover:bg-[#EDE5D6] transition-colors text-[16px] text-[#33261F] cursor-pointer"
                    >
                      −
                    </button>
                    <span className="w-[32px] text-center font-figtree font-bold text-[14px] text-[#33261F]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(item.code)}
                      className="w-[34px] h-[34px] flex items-center justify-center hover:bg-[#EDE5D6] transition-colors text-[16px] text-[#33261F] cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="w-[96px] text-right font-figtree font-bold text-[16px] text-[#33261F]">
                    {fmt(item.lineTotalUSD)}
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.code)}
                    className="font-mono text-[11px] text-[#8B2E24] hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Customer & Delivery Address */}
            <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-6 space-y-4">
              <h3 className="font-figtree font-bold text-[16.5px] text-[#33261F]">
                Delivery details
              </h3>

              {formError && (
                <div className="p-3 bg-[#FDF2F0] border border-[#F3C7C2] rounded-[8px] text-[#8B2E24] text-xs font-figtree">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#6B5A4C] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    placeholder="e.g. Karma Dorji / Jane Doe"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#CDBEA8] rounded-[7px] text-sm text-[#33261F] focus:outline-none focus:border-[#8B2E24]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#6B5A4C] mb-1">
                    Email Address * (For order tracking)
                  </label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="collector@example.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#CDBEA8] rounded-[7px] text-sm text-[#33261F] focus:outline-none focus:border-[#8B2E24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#6B5A4C] mb-1">
                    Phone Number (For dispatch courier)
                  </label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="+975 17 123 456"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#CDBEA8] rounded-[7px] text-sm text-[#33261F] focus:outline-none focus:border-[#8B2E24]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#6B5A4C] mb-1">
                    Country *
                  </label>
                  <select
                    value={customer.country}
                    onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#CDBEA8] rounded-[7px] text-sm text-[#33261F] focus:outline-none focus:border-[#8B2E24]"
                  >
                    <option value="Bhutan">Bhutan</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Japan">Japan</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Canada">Canada</option>
                    <option value="India">India</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Other">Other International</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#6B5A4C] mb-1">
                  Street Delivery Address *
                </label>
                <input
                  type="text"
                  required
                  value={customer.street}
                  onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
                  placeholder="Apartment, suite, house number, street name"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CDBEA8] rounded-[7px] text-sm text-[#33261F] focus:outline-none focus:border-[#8B2E24]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#6B5A4C] mb-1">
                    City / Dzongkhag *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    placeholder="Thimphu, Paro, New York, Tokyo..."
                    className="w-full px-3.5 py-2.5 bg-white border border-[#CDBEA8] rounded-[7px] text-sm text-[#33261F] focus:outline-none focus:border-[#8B2E24]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#6B5A4C] mb-1">
                    Postal / PIN Code
                  </label>
                  <input
                    type="text"
                    value={customer.postalCode}
                    onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                    placeholder="e.g. 11001"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#CDBEA8] rounded-[7px] text-sm text-[#33261F] focus:outline-none focus:border-[#8B2E24]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Selection */}
            <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-6">
              <h3 className="font-figtree font-bold text-[16.5px] text-[#33261F] mb-4">
                Delivery method
              </h3>

              <div className="flex flex-col gap-3 mb-5">
                {[
                  {
                    key: 'ems',
                    name: 'EMS / Bhutan Post',
                    note: '7–14 days, tracked. Free over $200.',
                    priceLabel: subtotalUSD >= 200 ? 'Free' : fmt(24),
                  },
                  {
                    key: 'express',
                    name: 'Express courier',
                    note: '3–5 days, tracked and insured.',
                    priceLabel: fmt(62),
                  },
                ].map((s) => {
                  const isSelected = shippingMethod === s.key;
                  return (
                    <div
                      key={s.key}
                      onClick={() => setShippingMethod(s.key as any)}
                      className={`p-4 rounded-[8px] border-2 flex items-center justify-between cursor-pointer transition-all ${
                        isSelected ? 'border-[#8B2E24] bg-[#FFFCF8]' : 'border-[#E4DDD1] hover:border-[#CDBEA8]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#8B2E24]' : 'border-[#CDBEA8]'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#8B2E24]" />}
                        </div>
                        <div>
                          <div className="font-figtree font-semibold text-[15px] text-[#33261F]">
                            {s.name}
                          </div>
                          <div className="font-lora text-[13px] text-[#6B5A4C]">
                            {s.note}
                          </div>
                        </div>
                      </div>
                      <div className="font-figtree font-bold text-[15px] text-[#33261F]">
                        {s.priceLabel}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#F4F0E7] rounded-[8px] p-4 font-lora text-[13px] text-[#6B5A4C] leading-[1.5]">
                {CUSTOMS_NOTICE}
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-6">
              <h3 className="font-figtree font-bold text-[16.5px] text-[#33261F] mb-4">
                Payment method
              </h3>

              <div className="flex flex-col gap-3">
                {payOptions.map((p) => {
                  const isSelected = paymentMethod === p.key;
                  return (
                    <div
                      key={p.key}
                      onClick={() => setPaymentMethod(p.key as any)}
                      className={`p-4 rounded-[8px] border-2 flex items-center gap-3 cursor-pointer transition-all ${
                        isSelected ? 'border-[#8B2E24] bg-[#FFFCF8]' : 'border-[#E4DDD1] hover:border-[#CDBEA8]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#8B2E24]' : 'border-[#CDBEA8]'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#8B2E24]" />}
                      </div>
                      <div>
                        <div className="font-figtree font-semibold text-[15px] text-[#33261F]">
                          {p.name}
                        </div>
                        <div className="font-lora text-[13px] text-[#6B5A4C]">
                          {p.note}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Order Summary (Ink) */}
          <div className="sticky top-[100px] bg-[#33261F] text-[#F1ECE2] rounded-[12px] p-7">
            <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[#C9A46A] mb-5">
              Order Summary
            </div>

            <div className="flex justify-between text-[15px] pb-3 border-b border-[#4E3D2E] font-lora">
              <span className="text-[#D2C2AE]">Subtotal</span>
              <span className="font-figtree text-white">{fmt(subtotalUSD)}</span>
            </div>

            <div className="flex justify-between text-[15px] py-3 border-b border-[#4E3D2E] font-lora">
              <span className="text-[#D2C2AE]">Shipping</span>
              <span className="font-figtree text-white">
                {shippingFeeUSD === 0 ? 'Free (EMS)' : fmt(shippingFeeUSD)}
              </span>
            </div>

            <div className="flex justify-between text-[15px] py-3 border-b border-[#4E3D2E] font-lora">
              <span className="text-[#D2C2AE]">Paying with</span>
              <span className="font-figtree text-white capitalize">{paymentMethod}</span>
            </div>

            <div className="flex justify-between items-baseline pt-4 pb-1 font-figtree">
              <span className="text-[17px] text-[#D2C2AE]">Total</span>
              <span className="text-[22px] font-bold text-white">{fmt(totalUSD)}</span>
            </div>

            <div className="text-[13px] text-[#A8947F] mb-6 font-mono">
              ≈ {alt(totalUSD)} at today&apos;s rate
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePlaceOrder}
              className="w-full font-figtree font-semibold text-[15.5px] bg-[#8B2E24] text-white py-4 rounded-[9px] hover:bg-[#6E241C] transition-colors cursor-pointer text-center disabled:opacity-50"
            >
              {isSubmitting ? 'Processing…' : 'Place order'}
            </button>

            <Link
              href="/shop"
              className="block text-center text-[13.5px] text-[#D2C2AE] hover:underline mt-4 font-figtree"
            >
              ← Keep shopping
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

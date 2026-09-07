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

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    const orderNum = `HAB-S-${Math.floor(10000 + Math.random() * 90000)}`;
    setConfirmedOrderNumber(orderNum);

    // Call API order endpoint in background
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderNum,
          customerName: 'Guest Shopper',
          customerEmail: 'shopper@example.com',
          shippingMethod,
          shippingFeeUSD,
          paymentMethod,
          totalUSD,
          items,
        }),
      });
    } catch {
      // Handled
    }

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
            Thank you for supporting Bhutan&apos;s artisans. Your order number is{' '}
            <strong className="font-mono text-[#8B2E24]">{confirmedOrderNumber}</strong>.
          </p>
          <p className="font-lora text-[15px] leading-[1.6] text-[#6B5A4C] mb-8">
            Your parcel will be prepared with a verified craft authenticity certificate and dispatched via EMS Bhutan Post within two working days. Tracking details will be emailed to you.
          </p>
          <Link
            href="/shop"
            className="font-figtree font-semibold text-[14.5px] bg-[#33261F] text-[#F4F0E7] px-7 py-3.5 rounded-[7px] hover:bg-[#8B2E24] transition-colors inline-block"
          >
            Continue shopping
          </Link>
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

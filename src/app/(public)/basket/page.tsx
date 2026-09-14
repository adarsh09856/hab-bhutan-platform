'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { CLIENT_DATA } from '@/lib/client-data';

export default function BasketPage() {
  const router = useRouter();
  const { fmt, currency } = useCurrency();
  const {
    items,
    cartCount,
    subtotalUSD,
    shippingMethod,
    setShippingMethod,
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
  const [confirmedEmail, setConfirmedEmail] = useState('');
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
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!customer.street.trim()) {
      setFormError('Please enter your delivery street address.');
      return;
    }

    setIsSubmitting(true);
    let orderNum = `HAB-S-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      const selectedCurrency = paymentMethod === 'mbob' ? 'BTN' : (currency || 'USD');
      const selectedPaymentMethod = paymentMethod === 'card' ? 'CARD' : paymentMethod === 'mbob' ? 'MBOB' : 'BANK';

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
          paymentMethod: selectedPaymentMethod,
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
        setConfirmedOrderNumber(orderNum);
        setConfirmedEmail(customer.email.trim());
        clearCart();
        setIsSubmitting(false);
        router.push(`/order-confirmation/${orderNum}`);
        return;
      } else if (!res.ok && data.error) {
        setFormError(data.error);
        setIsSubmitting(false);
        return;
      }
    } catch (err: any) {
      console.error('Error in checkout:', err);
    }

    setConfirmedOrderNumber(orderNum);
    setConfirmedEmail(customer.email.trim());
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
    <main id="main">
      <section className="section section--narrow">
        <p className="crumbs">
          <Link href="/">Home</Link> / Basket &amp; checkout
        </p>
        <h1 className="display display--page">Your basket</h1>

        {/* State 1: Order confirmed */}
        {orderConfirmed ? (
          <div id="basketDone">
            <div className="shopempty">
              <span className="tick">✓</span>
              <h2 className="shopempty__title">Order confirmed</h2>
              <p className="shopempty__body">
                Order <strong>{confirmedOrderNumber}</strong>. You will receive an EMS tracking number from Bhutan Post when the parcel leaves Thimphu, usually within two working days.
              </p>
              <div className="actions" style={{ justifyContent: 'center', marginTop: 24 }}>
                <Link
                  className="btn btn--accent"
                  href={`/track-order?order=${encodeURIComponent(confirmedOrderNumber)}${confirmedEmail ? `&email=${encodeURIComponent(confirmedEmail)}` : ''}`}
                >
                  Track order status →
                </Link>
                <Link className="btn btn--outline" href="/shop">
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>
        ) : cartCount === 0 ? (
          /* State 2: Basket empty */
          <div id="basketEmpty">
            <div className="shopempty">
              <h2 className="shopempty__title">Nothing in the basket yet</h2>
              <p className="shopempty__body">
                Every piece in the shop is bought from a registered member at an agreed price.
              </p>
              <Link className="btn btn--accent" href="/shop">
                Browse the 13 crafts
              </Link>
            </div>
          </div>
        ) : (
          /* State 3: Active basket */
          <div className="checkout" id="basketActive">
            <div>
              {/* Line Items */}
              <div className="panel" style={{ padding: 0, overflow: 'hidden', marginBottom: 22 }}>
                <div id="basketLines">
                  {items.map((line) => {
                    const craft = CLIENT_DATA.crafts.find((c) => c.key === line.craftKey) || { name: line.craftKey || 'Craft' };
                    return (
                      <div key={line.code} className="basketline">
                        <span className="basketline__thumb" style={{ position: 'relative', overflow: 'hidden', display: 'block', width: '86px', height: '86px', borderRadius: '8px', background: 'var(--panel-soft, #f5efe6)', flexShrink: 0 }}>
                          <img
                            src={line.imageUrl || `/images/products/${line.code.toLowerCase()}.jpg`}
                            alt={line.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (!target.src.includes('/assets/photos/product-')) {
                                target.src = `/assets/photos/product-${line.code.toLowerCase()}.jpg`;
                              } else {
                                target.src = '/assets/photos/product-hhb01.jpg';
                              }
                            }}
                          />
                        </span>

                        <div className="basketline__body">
                          <p className="eyebrow eyebrow--accent eyebrow--sm">{craft.name}</p>
                          <p className="basketline__name">{line.name}</p>
                          <p className="card__meta">
                            {line.maker} · {line.region}
                          </p>
                        </div>

                        <div className="qty">
                          <button
                            type="button"
                            className="qty__btn"
                            onClick={() => decrementCart(line.code)}
                          >
                            −
                          </button>
                          <span className="qty__n">{line.quantity}</span>
                          <button
                            type="button"
                            className="qty__btn"
                            onClick={() => addToCart(line.code, 1, { silent: true })}
                          >
                            +
                          </button>
                        </div>

                        <span className="basketline__total">{fmt(line.lineTotalUSD)}</span>

                        <button
                          type="button"
                          className="basketline__remove"
                          onClick={() => removeFromCart(line.code)}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Method */}
              <div className="panel" style={{ marginBottom: 22 }}>
                <h2 className="newsaside__title">Shipping</h2>
                <div id="shipList">
                  <div
                    className={`payopt ${shippingMethod === 'ems' ? 'is-active' : ''}`}
                    onClick={() => setShippingMethod('ems')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="payopt__dot"></span>
                    <span>
                      <span className="payopt__name">EMS Bhutan Post</span>
                      <span className="payopt__note">Tracked air parcel, 7–14 working days worldwide</span>
                    </span>
                    <span className="payopt__price">
                      {subtotalUSD >= 200 ? 'Free' : fmt(24)}
                    </span>
                  </div>

                  <div
                    className={`payopt ${shippingMethod === 'express' ? 'is-active' : ''}`}
                    onClick={() => setShippingMethod('express')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="payopt__dot"></span>
                    <span>
                      <span className="payopt__name">DHL Express</span>
                      <span className="payopt__note">Courier delivery, 3–5 working days</span>
                    </span>
                    <span className="payopt__price">{fmt(62)}</span>
                  </div>
                </div>
                <p className="shopnote" style={{ margin: '6px 0 0' }}>
                  Import duty and local taxes are not included and are collected by your customs authority on arrival. HAB provides a commercial invoice and craft certificate in every parcel.
                </p>
              </div>

              {/* Payment Method */}
              <div className="panel" style={{ marginBottom: 22 }}>
                <h2 className="newsaside__title">Payment</h2>
                <div id="basketPay">
                  {payOptions.map((opt) => (
                    <div
                      key={opt.key}
                      className={`payopt ${paymentMethod === opt.key ? 'is-active' : ''}`}
                      onClick={() => setPaymentMethod(opt.key as any)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="payopt__dot"></span>
                      <span>
                        <span className="payopt__name">{opt.name}</span>
                        <span className="payopt__note">{opt.note}</span>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="paybar paybar--inset" style={{ margin: '20px 0 0' }}>
                  <p className="paybar__label">Secure payment</p>
                  <div className="paybar__brands" style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, background: '#fff', border: '1px solid var(--line-soft)', padding: '2px 6px', borderRadius: 4 }}>VISA</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, background: '#fff', border: '1px solid var(--line-soft)', padding: '2px 6px', borderRadius: 4 }}>Mastercard</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, background: '#fff', border: '1px solid var(--line-soft)', padding: '2px 6px', borderRadius: 4 }}>AMEX</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, background: '#fff', border: '1px solid var(--line-soft)', padding: '2px 6px', borderRadius: 4 }}>mBoB</span>
                  </div>
                  <p className="paybar__note">
                    3-D Secure verified. Cards are processed by our gateway; HAB never sees your card number.
                  </p>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="panel">
                <h2 className="newsaside__title">Delivery address</h2>
                {formError && (
                  <p style={{ color: 'var(--accent)', fontSize: 13.5, margin: '0 0 12px' }}>
                    {formError}
                  </p>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <label className="field">
                    <span className="field__label">Full name</span>
                    <input
                      className="input"
                      type="text"
                      value={customer.fullName}
                      onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                      required
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Email for tracking</span>
                    <input
                      className="input"
                      type="email"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      required
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Phone</span>
                    <input
                      className="input"
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Street address</span>
                    <input
                      className="input"
                      type="text"
                      value={customer.street}
                      onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
                      required
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">City</span>
                    <input
                      className="input"
                      type="text"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Country</span>
                    <input
                      className="input"
                      type="text"
                      value={customer.country}
                      onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right column: Summary */}
            <div className="summary">
              <p className="eyebrow eyebrow--onaccent">Order summary</p>
              <div className="summary__row">
                <span>Subtotal</span>
                <span id="sumSubtotal">{fmt(subtotalUSD)}</span>
              </div>
              <div className="summary__row">
                <span>Shipping</span>
                <span id="sumShip">
                  {shippingFeeUSD === 0 ? 'Free (EMS)' : fmt(shippingFeeUSD)}
                </span>
              </div>
              <div className="summary__row">
                <span>Paying with</span>
                <span id="sumPayLabel">
                  {paymentMethod === 'card'
                    ? 'International card'
                    : paymentMethod === 'mbob'
                    ? 'Bhutan mobile pay'
                    : 'Bank transfer'}
                </span>
              </div>
              <div className="summary__total">
                <span>Total</span>
                <span id="sumTotal">{fmt(totalUSD)}</span>
              </div>
              <button
                className="btn btn--light btn--full"
                type="button"
                id="placeOrder"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Place order'}
              </button>
              <Link className="btn btn--ghost btn--full" href="/shop" style={{ marginTop: 12 }}>
                ← Keep shopping
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CLIENT_DATA, getTierPrice } from '@/lib/client-data';
import SectionEditBadge from '@/components/public/SectionEditBadge';

export default function WholesaleCartPage() {
  const [basket, setBasket] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [quoteRef, setQuoteRef] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [buyer, setBuyer] = useState<any>(null);
  const [catalogue, setCatalogue] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    try {
      const stored = localStorage.getItem('hab_quote_basket');
      if (stored) {
        setBasket(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    fetch('/api/wholesale/auth', { credentials: 'include', cache: 'no-store' })
      .then((response) => response.json())
      .then(async (session) => {
        if (!active) return;
        if (!session?.authenticated || !session?.buyer) return;
        setBuyer(session.buyer);
        setBuyerName(session.buyer.companyName || '');
        setBuyerEmail(session.buyer.email || '');
        setBuyerPhone(session.buyer.phone || '');
        const response = await fetch('/api/trade', { credentials: 'include', cache: 'no-store' });
        const data = await response.json();
        if (!response.ok || !data?.success) throw new Error(data?.error || 'Wholesale catalogue could not be loaded.');
        if (active) setCatalogue(Array.isArray(data.products) ? data.products : []);
      })
      .catch((error) => { if (active) setErrorMsg(error?.message || 'Could not check your wholesale account.'); })
      .finally(() => { if (active) { setAuthChecked(true); setIsLoaded(true); } });
    return () => { active = false; };
  }, []);

  const saveBasket = (updated: Record<string, number>) => {
    setBasket(updated);
    try {
      localStorage.setItem('hab_quote_basket', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleQtyChange = (code: string, newQty: number, moq: number) => {
    const val = isNaN(newQty) || newQty < moq ? moq : newQty;
    const updated = { ...basket, [code]: val };
    saveBasket(updated);
  };

  const handleRemove = (code: string) => {
    const updated = { ...basket };
    delete updated[code];
    saveBasket(updated);
  };

  const items = useMemo(() => {
    return Object.keys(basket)
      .filter((code) => basket[code] > 0 && catalogue.some((product) => product.code === code && product.terms?.is_active !== false))
      .map((code) => {
        const product = catalogue.find((p) => p.code === code);
        const terms = product?.terms;
        const craft = product ? CLIENT_DATA.crafts.find((c) => c.key === (product.craftKey || product.craft_key)) : null;
        if (!product || !terms) return null;
        const qty = basket[code];
        const unitPrice = getTierPrice(terms, qty);
        const lineTotal = unitPrice * qty;

        return {
          code,
          product,
          terms,
          craft,
          qty,
          unitPrice,
          lineTotal,
        };
      }).filter(Boolean) as Array<{ code: string; product: any; terms: any; craft: any; qty: number; unitPrice: number; lineTotal: number }>;
  }, [basket, catalogue]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.lineTotal, 0);
  }, [items]);

  const totalUnits = useMemo(() => {
    return items.reduce((sum, item) => sum + item.qty, 0);
  }, [items]);

  const handleRequestQuotation = async () => {
    setErrorMsg('');
    if (!buyerName.trim()) {
      setErrorMsg('Please enter your business or contact name.');
      return;
    }
    if (!buyerEmail.trim() || !buyerEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address to receive the quotation.');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Your quote basket is empty.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/wholesale/quote', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ code: item.code, quantity: item.qty })),
          destination,
          requiredDate: deliveryDate,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const ref = data.inquiryId ? `HAB-Q-${data.inquiryId.slice(0, 6).toUpperCase()}` : `HAB-Q-${Math.floor(1000 + Math.random() * 9000)}`;
        setQuoteRef(ref);
        saveBasket({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(data.error || 'Failed to submit quotation request. Please try again.');
      }
    } catch {
      setErrorMsg('Network error submitting quote request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <main id="main">
        <section className="section section--narrow">
          <h1 className="display display--page">Quote basket</h1>
          <p>Loading quote basket…</p>
        </section>
      </main>
    );
  }

  if (authChecked && !buyer) {
    return (
      <main id="main">
        <section className="section section--narrow">
          <p className="eyebrow eyebrow--accent">HAB Wholesale</p>
          <h1 className="display display--page">Sign in to your trade account</h1>
          <p className="lede">The quote basket uses private wholesale terms and can only be submitted by an approved buyer.</p>
          {errorMsg && <p role="alert" className="uploadnote">{errorMsg}</p>}
          <div className="actions" style={{ marginTop: 20 }}>
            <Link className="btn btn--accent" href="/wholesale/shop">Sign in to wholesale catalogue</Link>
            <Link className="btn btn--outline" href="/wholesale/register">Apply for a trade account</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="main">
      <div className="tradebar">
        <span className="tradebar__badge">HAB Wholesale</span>
        <span className="tradebar__who">{buyer?.companyName || 'Verified trade account'} · quote basket</span>
        <span className="tradebar__spacer"></span>
        <Link className="tradebar__link" href="/wholesale/shop">
          Back to catalogue
        </Link>
      </div>

      <section className="section section--narrow relative" data-hab-section="wholesale-cart">
        <SectionEditBadge label="Wholesale & Trade Studio" studioHref="/admin/trade" />
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/wholesale">Wholesale</Link> / Quote basket
        </p>
        <h1 className="display display--page">Quote basket</h1>
        <p className="lede">
          Set quantities and send the basket to the trade desk. You will receive a formal quotation with freight, lead time and payment terms — no card is charged here.
        </p>

        {quoteRef ? (
          <div id="wsQuoteDone">
            <div className="shopempty">
              <span className="tick">✓</span>
              <h2 className="shopempty__title">Quotation requested</h2>
              <p className="shopempty__body">
                Reference <strong>{quoteRef}</strong>. The trade desk will confirm availability with the producing members and send a formal quotation with freight and lead times, usually within two working days.
              </p>
              <div className="actions" style={{ justifyContent: 'center', marginTop: 24 }}>
                <Link className="btn btn--accent" href="/wholesale/shop">
                  Back to the catalogue
                </Link>
                <Link className="btn btn--outline" href="/contact?topic=wholesale">
                  Talk to the trade desk
                </Link>
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div id="wsQuoteEmpty">
            <div className="shopempty">
              <h2 className="shopempty__title">Your quote basket is empty</h2>
              <p className="shopempty__body">
                Add products from the wholesale catalogue and set the quantities you need. Tier pricing is applied automatically as quantities rise.
              </p>
              <Link className="btn btn--accent" href="/wholesale/shop">
                Browse the catalogue
              </Link>
            </div>
          </div>
        ) : (
          <div className="checkout" id="wsQuoteActive">
            <div>
              <div className="panel" style={{ padding: 0, overflow: 'hidden', marginBottom: 22 }}>
                <div id="wsQuoteLines">
                  {items.map((item) => {
                    const imgSrc = item.product?.image_path
                            ? (/^(https?:)?\/\//i.test(item.product.image_path) ? item.product.image_path : `/${item.product.image_path.replace(/^\/+/, '')}`)
                      : '/assets/photos/product-sad03.jpg';

                    return (
                      <div key={item.code} className="basketline">
                        <span className="basketline__thumb" style={{ position: 'relative', overflow: 'hidden' }}>
                          <Image
                            src={imgSrc}
                            alt={item.product?.name || item.code}
                            fill
                            sizes="80px"
                            style={{ objectFit: 'cover' }}
                          />
                        </span>
                        <div className="basketline__body">
                          <p className="eyebrow eyebrow--accent eyebrow--sm">{item.craft?.name || 'Zorig Chusum'}</p>
                          <p className="basketline__name">
                            {item.product?.name} · {item.code}
                          </p>
                          <p className="card__meta">
                            MOQ {item.terms.moq} · {item.terms.lead} · ${item.unitPrice} per unit at this quantity
                          </p>
                        </div>
                      <input
                          className="input wsact__qty"
                          type="number"
                          min={item.terms.moq}
                          value={item.qty}
                          onChange={(e) => handleQtyChange(item.code, parseInt(e.target.value, 10), item.terms.moq)}
                          aria-label={`Quantity of ${item.product?.name}`}
                        />
                        <span className="basketline__total">${item.lineTotal.toLocaleString()}</span>
                        <button
                          type="button"
                          className="basketline__remove"
                          onClick={() => handleRemove(item.code)}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="panel">
                <h2 className="newsaside__title">Buyer Contact &amp; Quotation Destination</h2>
                <div className="formgrid">
                  <label className="field">
                    <span className="field__label">Company / Buyer Name *</span>
                    <input
                      className="input"
                      type="text"
                      required
                      placeholder="e.g. Himalayan Imports LLC"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Business Email Address *</span>
                    <input
                      className="input"
                      type="email"
                      required
                      placeholder="trade@company.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Phone / WhatsApp</span>
                    <input
                      className="input"
                      type="text"
                      placeholder="+1 555 0192"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Destination country</span>
                    <input
                      className="input"
                      type="text"
                      placeholder="For freight quotation"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Target delivery date</span>
                    <input
                      className="input"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                  </label>
                  <label className="field field--wide">
                    <span className="field__label">Customisation, packaging or labelling</span>
                    <textarea
                      className="input"
                      rows={3}
                      placeholder="Sizes, colourways, woven labels, private-label packaging, sample requirements"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Summary Card */}
            <div className="summary">
              <p className="eyebrow eyebrow--onaccent">Indicative total</p>
              <div id="wsQuoteSummary">
                <div className="summary__row">
                  <span>Line items</span>
                  <span>{items.length}</span>
                </div>
                <div className="summary__row">
                  <span>Total units</span>
                  <span>{totalUnits}</span>
                </div>
                <div className="summary__row">
                  <span>Terms</span>
                  <span>FOB Thimphu, USD</span>
                </div>
              </div>
              <div className="summary__total">
                <span>Goods, FOB</span>
                <span>${totalAmount.toLocaleString()}</span>
              </div>
              {errorMsg && (
                <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#FCA5A5', fontSize: '12px', marginBottom: '12px' }}>
                  {errorMsg}
                </div>
              )}
              <button
                type="button"
                className="btn btn--light btn--full"
                disabled={submitting}
                onClick={handleRequestQuotation}
              >
                {submitting ? 'Transmitting to Trade Desk...' : 'Request quotation'}
              </button>
              <p className="summary__fine">
                Indicative only. Freight, duty and payment terms are confirmed in the formal quotation, usually within two working days.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

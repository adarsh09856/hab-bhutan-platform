'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CLIENT_DATA, getTierPrice } from '@/lib/client-data';

export default function WholesaleCartPage() {
  const [basket, setBasket] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [quoteRef, setQuoteRef] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hab_quote_basket');
      if (stored) {
        setBasket(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
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
      .filter((code) => basket[code] > 0 && CLIENT_DATA.wholesaleTerms[code])
      .map((code) => {
        const product = CLIENT_DATA.products.find((p) => p.code === code);
        const terms = CLIENT_DATA.wholesaleTerms[code];
        const craft = product ? CLIENT_DATA.crafts.find((c) => c.key === product.craft_key) : null;
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
      });
  }, [basket]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.lineTotal, 0);
  }, [items]);

  const totalUnits = useMemo(() => {
    return items.reduce((sum, item) => sum + item.qty, 0);
  }, [items]);

  const handleRequestQuotation = () => {
    const ref = `HAB-Q-${Math.floor(1000 + Math.random() * 9000)}`;
    setQuoteRef(ref);
    saveBasket({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isLoaded) {
    return (
      <main id="main">
        <section className="section section--narrow">
          <p>Loading quote basket…</p>
        </section>
      </main>
    );
  }

  return (
    <main id="main">
      <div className="tradebar">
        <span className="tradebar__badge">HAB Wholesale</span>
        <span className="tradebar__who">Verified trade account · wholesale preview</span>
        <span className="tradebar__spacer"></span>
        <Link className="tradebar__link" href="/wholesale/shop">
          Back to catalogue
        </Link>
      </div>

      <section className="section section--narrow">
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
                      ? `/${item.product.image_path.replace(/^\/+/, '')}`
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
                <h2 className="newsaside__title">Anything else the trade desk should know?</h2>
                <div className="formgrid">
                  <label className="field">
                    <span className="field__label">Required delivery date</span>
                    <input
                      className="input"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
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
              <button
                type="button"
                className="btn btn--light btn--full"
                onClick={handleRequestQuotation}
              >
                Request quotation
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

'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { CLIENT_DATA, getCountsByCraft, getTierPrice, ProductData, WholesaleTermData } from '@/lib/client-data';

function WholesaleShopContent() {
  const searchParams = useSearchParams();
  const craftParam = searchParams.get('craft');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [selectedCraft, setSelectedCraft] = useState<string | null>(craftParam);
  const [sortOrder, setSortOrder] = useState<string>('new');
  const [quoteBasket, setQuoteBasket] = useState<Record<string, number>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync selected craft if URL parameter changes
  useEffect(() => {
    if (craftParam) {
      setSelectedCraft(craftParam);
      setIsAuthenticated(true);
    }
  }, [craftParam]);

  // Load quote basket from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hab_quote_basket');
      if (stored) {
        setQuoteBasket(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const totalQuoteCount = useMemo(() => {
    return Object.values(quoteBasket).reduce((sum, q) => sum + (q > 0 ? 1 : 0), 0);
  }, [quoteBasket]);

  const saveQuoteBasket = (updated: Record<string, number>) => {
    setQuoteBasket(updated);
    try {
      localStorage.setItem('hab_quote_basket', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleQtyChange = (code: string, val: number, moq: number) => {
    const validVal = isNaN(val) || val < moq ? moq : val;
    setQuantities((prev) => ({ ...prev, [code]: validVal }));
  };

  const handleAddToCart = (product: ProductData, terms: WholesaleTermData) => {
    const qty = quantities[product.code] || terms.moq;
    const updated = { ...quoteBasket, [product.code]: qty };
    saveQuoteBasket(updated);
    showToast(`${product.name} × ${qty} added to the quote basket.`);
  };

  const [productsList, setProductsList] = useState<any[]>(() => CLIENT_DATA.products);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          setProductsList(
            data.products.map((p: any) => ({
              code: p.code,
              name: p.name,
              craft_key: p.craftKey || p.craft_key,
              region: p.region || 'Bhutan',
              maker: p.maker?.name || p.maker || 'Registered Master',
              price: p.priceUSD || p.price,
              hero_image: p.images?.[0]?.url || p.hero_image || 'assets/photos/hero-1-weaving.jpg',
              summary: p.description || p.summary || '',
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const counts = getCountsByCraft();
  const activeCraft = selectedCraft ? CLIENT_DATA.crafts.find((c) => c.key === selectedCraft) : null;

  // Helper to ensure terms exist for all products (dynamic fallback)
  const getTermsForProduct = (code: string, price: number): WholesaleTermData => {
    if (CLIENT_DATA.wholesaleTerms[code]) return CLIENT_DATA.wholesaleTerms[code];
    const base = price || 50;
    return {
      moq: 5,
      lead: '2 – 3 weeks',
      tiers: [
        [5, Math.round(base * 0.9)],
        [10, Math.round(base * 0.82)],
        [25, Math.round(base * 0.72)],
      ],
    };
  };

  // Filter products that have wholesale terms
  const filteredProducts = useMemo(() => {
    let list = productsList.filter((p) => {
      if (selectedCraft) {
        return p.craft_key === selectedCraft;
      }
      return true;
    });

    if (sortOrder === 'moq') {
      list.sort((a, b) => {
        const ma = getTermsForProduct(a.code, a.price)?.moq || 0;
        const mb = getTermsForProduct(b.code, b.price)?.moq || 0;
        return ma - mb;
      });
    } else if (sortOrder === 'low') {
      list.sort((a, b) => {
        const ta = getTermsForProduct(a.code, a.price);
        const tb = getTermsForProduct(b.code, b.price);
        const pa = getTierPrice(ta, 0);
        const pb = getTierPrice(tb, 0);
        return pa - pb;
      });
    } else if (sortOrder === 'high') {
      list.sort((a, b) => {
        const ta = getTermsForProduct(a.code, a.price);
        const tb = getTermsForProduct(b.code, b.price);
        const pa = getTierPrice(ta, 0);
        const pb = getTierPrice(tb, 0);
        return pb - pa;
      });
    }

    return list;
  }, [productsList, selectedCraft, sortOrder]);

  return (
    <main id="main">
      {toastMessage && (
        <div className="toast" role="status" aria-live="polite" style={{ display: 'block' }}>
          {toastMessage}
        </div>
      )}

      {/* Trade Top Bar */}
      {isAuthenticated && (
        <div className="tradebar">
          <span className="tradebar__badge">HAB Wholesale</span>
          <span className="tradebar__who">Verified trade account · wholesale preview</span>
          <span className="tradebar__spacer"></span>
          <Link className="tradebar__link" href="/wholesale/cart">
            Quote basket <span className="tradebar__n">{totalQuoteCount}</span>
          </Link>
          <button
            type="button"
            className="tradebar__link tradebar__link--quiet"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setIsAuthenticated(false)}
          >
            Sign out
          </button>
        </div>
      )}

      {/* Sign In State */}
      {!isAuthenticated && (
        <section className="section" id="wsLogin">
          <div className="logingrid">
            <div>
              <p className="eyebrow eyebrow--accent">Wholesale buyer login</p>
              <h1 className="display display--sub">Sign in to see trade pricing</h1>
              <p className="section__lede" style={{ marginTop: 14 }}>
                Trade prices, MOQs and lead times are commercially confidential and shown to verified accounts only.
              </p>
              <ul className="bullets" style={{ marginTop: 20 }}>
                <li>Wholesale unit price and bulk tiers on every product</li>
                <li>Minimum order quantity and current lead time</li>
                <li>Customisation and made-to-order options</li>
                <li>Bulk cart and request-a-quote</li>
                <li>Order history and shipment tracking</li>
              </ul>
            </div>
            <form
              className="panel"
              onSubmit={(e) => {
                e.preventDefault();
                setIsAuthenticated(true);
              }}
            >
              <label className="field">
                <span className="field__label">Business email</span>
                <input className="input" type="email" placeholder="buying@example.com" required />
              </label>
              <label className="field">
                <span className="field__label">Password</span>
                <input className="input" type="password" placeholder="••••••••" required />
              </label>
              <button className="btn btn--accent btn--full" type="submit">
                Sign in
              </button>
              <div className="loginfoot">
                <Link href="/contact?topic=wholesale">Forgot password</Link>
                <Link href="/wholesale/register">Not registered yet?</Link>
              </div>
              <p className="uploadnote" style={{ marginTop: 16 }}>
                Click sign in to reveal the full wholesale catalogue and trade terms.
              </p>
            </form>
          </div>
        </section>
      )}

      {/* Catalogue State */}
      {isAuthenticated && (
        <section className="section" id="wsCatalogue">
          <p className="crumbs">
            <Link href="/">Home</Link> / <Link href="/wholesale">Wholesale</Link> /{' '}
            <span>{activeCraft ? activeCraft.name : 'All crafts'}</span>
          </p>

          <div className="shopgrid">
            {/* Sidebar Filter Rail */}
            <aside>
              <h2 className="railtitle">Craft category</h2>
              <div className="rail">
                <button
                  type="button"
                  className={`rail__row ${!selectedCraft ? 'is-active' : ''}`}
                  onClick={() => setSelectedCraft(null)}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <span className="rail__name">All crafts</span>
                  <span className="rail__n">{CLIENT_DATA.products.length}</span>
                </button>
                {CLIENT_DATA.crafts.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    className={`rail__row ${selectedCraft === c.key ? 'is-active' : ''}`}
                    onClick={() => setSelectedCraft(c.key)}
                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <span>
                      <span className="rail__name">{c.name}</span>
                      <span className="rail__en">{c.english}</span>
                    </span>
                    <span className="rail__n">{counts[c.key] || 0}</span>
                  </button>
                ))}
              </div>

              <div className="railtitle" style={{ marginTop: 22 }}>
                <label className="field__label" htmlFor="wsSort">
                  Sort
                </label>
                <select
                  className="input"
                  id="wsSort"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="new">Newest</option>
                  <option value="moq">Lowest MOQ</option>
                  <option value="low">Trade price: low to high</option>
                  <option value="high">Trade price: high to low</option>
                </select>
              </div>

              <div className="shopnote" style={{ marginTop: 22 }}>
                Prices are per unit, FOB Thimphu, in USD. Freight and duty are quoted separately. Tiered prices apply at the stated quantities.
              </div>
            </aside>

            {/* Product Cards Grid */}
            <div>
              <h1 className="display display--band">
                {activeCraft ? `${activeCraft.name} — wholesale` : 'HAB Wholesale'}
              </h1>
              <p className="section__lede" style={{ marginBottom: 18 }}>
                {activeCraft
                  ? `Trade terms for ${activeCraft.english.toLowerCase()}. Prices are per unit, FOB Thimphu. Tier prices apply at the stated quantities.`
                  : 'The full catalogue at trade terms. Prices are per unit, FOB Thimphu, and tier prices apply automatically at the stated quantities.'}
              </p>

              <div className="actions" style={{ marginBottom: 22 }}>
                {selectedCraft && (
                  <button
                    type="button"
                    className="btn btn--accent btn--sm"
                    onClick={() => setSelectedCraft(null)}
                  >
                    View all products
                  </button>
                )}
                {activeCraft && (
                  <Link className="btn btn--outline btn--sm" href={`/shop/${activeCraft.key}`}>
                    About {activeCraft.name} →
                  </Link>
                )}
                <span className="craft__count" style={{ margin: 0, alignSelf: 'center' }}>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </span>
              </div>

              <div className="grid grid--3">
                {filteredProducts.map((p) => {
                  const craft = CLIENT_DATA.crafts.find((c) => c.key === p.craft_key);
                  const terms = getTermsForProduct(p.code, p.price);
                  const currentQty = quantities[p.code] || terms.moq;
                  const unitPrice = getTierPrice(terms, currentQty);
                  const imgSrc = p.image_path
                    ? (p.image_path.startsWith('/') ? p.image_path : `/${p.image_path}`)
                    : (p.hero_image ? (p.hero_image.startsWith('/') || p.hero_image.startsWith('http') ? p.hero_image : `/${p.hero_image}`) : '/assets/photos/product-sad03.jpg');

                  return (
                    <article key={p.code} className="card product wscard" id={p.code}>
                      <Link className="product__shot" href={`/product/${p.code}`}>
                        <div className="frame frame--square" style={{ position: 'relative', overflow: 'hidden' }}>
                          <Image
                            src={imgSrc}
                            alt={p.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <span className="product__ref">{p.code}</span>
                      </Link>

                      <div className="card__body">
                        <p className="eyebrow eyebrow--accent eyebrow--sm">{craft?.name || 'Zorig Chusum'}</p>
                        <h3 className="card__title clamp-2">
                          <Link href={`/product/${p.code}`}>{p.name}</Link>
                        </h3>
                        <p className="card__meta clamp-1">{p.maker} · {p.region}</p>

                        <dl className="wsterms">
                          <div className="wsterms__row">
                            <dt className="wsterms__k">Trade price</dt>
                            <dd className="wsterms__v">${unitPrice} / unit</dd>
                          </div>
                          <div className="wsterms__row">
                            <dt className="wsterms__k">MOQ</dt>
                            <dd className="wsterms__v">{terms.moq} units</dd>
                          </div>
                          <div className="wsterms__row">
                            <dt className="wsterms__k">Lead time</dt>
                            <dd className="wsterms__v">{terms.lead}</dd>
                          </div>
                          {terms.custom && (
                            <div className="wsterms__row">
                              <dt className="wsterms__k">Made to order</dt>
                              <dd className="wsterms__v">{terms.custom}</dd>
                            </div>
                          )}
                        </dl>

                        <div className="wstiers">
                          <span className="wstiers__label">Bulk tiers</span>
                          {terms.tiers.map(([tierQ, tierP], idx) => (
                            <span key={idx} className="wstier">
                              <span className="wstier__q">{tierQ}+</span>
                              <span className="wstier__p">${tierP}</span>
                            </span>
                          ))}
                        </div>

                        <div className="wsact">
                          <input
                            className="input wsact__qty"
                            type="number"
                            min={terms.moq}
                            step="1"
                            value={currentQty}
                            onChange={(e) => handleQtyChange(p.code, parseInt(e.target.value, 10), terms.moq)}
                            aria-label={`Quantity of ${p.name}, minimum ${terms.moq}`}
                          />
                          <button
                            type="button"
                            className="btn btn--accent btn--sm wsact__add"
                            onClick={() => handleAddToCart(p, terms)}
                          >
                            Add to bulk cart
                          </button>
                          <Link
                            className="wsact__quote"
                            href="/wholesale/cart"
                            onClick={() => handleAddToCart(p, terms)}
                          >
                            Request quote →
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default function WholesaleShopPage() {
  return (
    <Suspense fallback={<div className="section"><p>Loading catalogue…</p></div>}>
      <WholesaleShopContent />
    </Suspense>
  );
}

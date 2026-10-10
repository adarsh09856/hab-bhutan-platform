'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useMemo, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { getTierPrice, type ProductData, type WholesaleTermData } from '@/lib/client-data';
import SectionEditBadge from '@/components/public/SectionEditBadge';

function WholesaleShopContent() {
  const searchParams = useSearchParams();
  const craftParam = searchParams.get('craft');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState<any>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [selectedCraft, setSelectedCraft] = useState<string | null>(craftParam);
  const [sortOrder, setSortOrder] = useState<string>('new');
  const [quoteBasket, setQuoteBasket] = useState<Record<string, number>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [catalogueState, setCatalogueState] = useState<'loading' | 'ready' | 'error'>('loading');

  // Sync selected craft if URL parameter changes
  useEffect(() => {
    if (craftParam) {
      setSelectedCraft(craftParam);
    }
  }, [craftParam]);

  useEffect(() => {
    let active = true;
    fetch('/api/wholesale/auth', { cache: 'no-store', credentials: 'include' })
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setBuyerInfo(data?.authenticated ? data.buyer : null);
        setIsAuthenticated(Boolean(data?.authenticated && data?.buyer));
      })
      .catch(() => {
        if (active) setLoginError('Could not check your session. Please try signing in again.');
      })
      .finally(() => {
        if (active) setAuthChecked(true);
      });
    return () => { active = false; };
  }, []);

  const handleWholesaleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const response = await fetch('/api/wholesale/auth', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername.trim(), password: loginPassword }),
      });
      const data = await response.json();
      if (!response.ok || !data?.success || !data?.buyer) throw new Error(data?.error || 'Sign-in failed. Check your username and password.');
      setBuyerInfo(data.buyer);
      setIsAuthenticated(true);
      setLoginPassword('');
      showToast(`Signed in as ${data.buyer.companyName}.`);
    } catch (error: any) {
      setLoginError(error?.message || 'Sign-in failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleWholesaleLogout = async () => {
    try {
      await fetch('/api/wholesale/auth', { method: 'DELETE', credentials: 'include' });
    } finally {
      setBuyerInfo(null);
      setIsAuthenticated(false);
      setProductsList([]);
      setCatalogueState('loading');
      setQuoteBasket({});
      try { localStorage.removeItem('hab_quote_basket'); } catch {}
    }
  };

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

  const [productsList, setProductsList] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController();
    setProductsList([]);
    setCatalogueState('loading');
    fetch('/api/trade', { cache: 'no-store', credentials: 'include', signal: controller.signal })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || data.success === false) throw new Error(data.error || 'Wholesale catalogue unavailable');
        return data;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setProductsList(
          (Array.isArray(data.products) ? data.products : []).filter((p: any) => p.terms).map((p: any) => ({
              code: p.code,
              name: p.name,
              craft_key: p.craftKey || p.craft_key,
              craft: p.craft,
              region: p.region || p.maker?.dzongkhag || '',
              maker: p.maker?.name || (typeof p.maker === 'string' ? p.maker : ''),
              price: p.priceUSD ?? p.price,
              image_path: p.image_path || p.hero_image || '/assets/photos/image-unavailable.svg',
              summary: p.description || p.summary || '',
              terms: {
                moq: p.terms.moq,
                lead: p.terms.lead_time || p.terms.lead,
                tiers: p.terms.tiers,
                custom: p.terms.customisation || p.terms.custom,
                isActive: p.terms.is_active !== false,
              },
            }))
        );
        setCatalogueState('ready');
      })
      .catch(() => { if (!controller.signal.aborted) setCatalogueState('error'); });
    return () => controller.abort();
  }, [isAuthenticated]);

  const craftOptions = useMemo(() => {
    const byKey = new Map<string, { key: string; name: string; english: string; count: number }>();
    for (const product of productsList) {
      const key = product.craft_key;
      if (!key) continue;
      const option = byKey.get(key) || { key, name: product.craft?.name || key, english: product.craft?.english || '', count: 0 };
      option.count += 1;
      byKey.set(key, option);
    }
    return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [productsList]);
  const activeCraft = selectedCraft ? craftOptions.find((craft) => craft.key === selectedCraft) : null;

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
        const ma = a.terms.moq;
        const mb = b.terms.moq;
        return ma - mb;
      });
    } else if (sortOrder === 'low') {
      list.sort((a, b) => {
        const pa = getTierPrice(a.terms, a.terms.moq);
        const pb = getTierPrice(b.terms, b.terms.moq);
        return pa - pb;
      });
    } else if (sortOrder === 'high') {
      list.sort((a, b) => {
        const pa = getTierPrice(a.terms, a.terms.moq);
        const pb = getTierPrice(b.terms, b.terms.moq);
        return pb - pa;
      });
    }

    return list;
  }, [productsList, selectedCraft, sortOrder]);

  return (
    <main id="main" className="relative" data-hab-section="wholesale-shop">
      <SectionEditBadge label="Wholesale & Trade Studio" studioHref="/admin/trade" />
      {toastMessage && (
        <div className="toast" role="status" aria-live="polite" style={{ display: 'block' }}>
          {toastMessage}
        </div>
      )}

      {/* Trade Top Bar */}
      {!authChecked && (
        <section className="section" aria-live="polite"><p className="section__lede">Checking wholesale account…</p></section>
      )}
      {isAuthenticated && (
        <div className="tradebar">
          <span className="tradebar__badge">HAB Wholesale</span>
          <span className="tradebar__who">{buyerInfo?.companyName || 'Verified buyer'} · {buyerInfo?.discountTier ?? 0}% account discount</span>
          <span className="tradebar__spacer"></span>
          <Link className="tradebar__link" href="/wholesale/cart">
            Quote basket <span className="tradebar__n">{totalQuoteCount}</span>
          </Link>
          <button
            type="button"
            className="tradebar__link tradebar__link--quiet"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={handleWholesaleLogout}
          >
            Sign out
          </button>
        </div>
      )}

      {/* Sign In State */}
      {authChecked && !isAuthenticated && (
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
            <form className="panel" onSubmit={handleWholesaleLogin}>
              {loginError && <p className="uploadnote" role="alert" style={{ color: '#9b2720', marginBottom: 14 }}>{loginError}</p>}
              <label className="field">
                <span className="field__label">Wholesale username or email</span>
                <input className="input" type="text" autoComplete="username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} placeholder="Your approved username or email" required />
              </label>
              <label className="field">
                <span className="field__label">Password</span>
                <input className="input" type="password" autoComplete="current-password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Your account password" required />
              </label>
              <button className="btn btn--accent btn--full" type="submit" disabled={loginLoading}>
                {loginLoading ? 'Signing in…' : 'Sign in securely'}
              </button>
              <div className="loginfoot">
                <Link href="/contact?topic=wholesale">Need help signing in?</Link>
                <Link href="/wholesale/register">Not registered yet?</Link>
              </div>
              <p className="uploadnote" style={{ marginTop: 16 }}>
                Only approved wholesale accounts can view trade pricing. If your application is pending, contact the HAB Secretariat.
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
                  <span className="rail__n">{productsList.length}</span>
                </button>
                {craftOptions.map((c) => (
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
                    <span className="rail__n">{c.count}</span>
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
                {catalogueState === 'ready' && <span className="craft__count" style={{ margin: 0, alignSelf: 'center' }}>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </span>}
              </div>

              {catalogueState === 'loading' && <p>Loading your approved wholesale catalogue…</p>}
              {catalogueState === 'error' && <p role="alert">The wholesale catalogue is temporarily unavailable. Please refresh or sign in again.</p>}
              {catalogueState === 'ready' && productsList.length === 0 && <p>No products have approved wholesale terms yet.</p>}
              <div className="grid grid--3">
                {filteredProducts.map((p) => {
                  const craft = craftOptions.find((c) => c.key === p.craft_key);
                  const terms = p.terms as WholesaleTermData;
                  const currentQty = quantities[p.code] || terms.moq;
                  const unitPrice = getTierPrice(terms, currentQty);
                  const imgSrc = p.image_path
                    ? (p.image_path.startsWith('/') ? p.image_path : `/${p.image_path}`)
                    : '/assets/photos/image-unavailable.svg';

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
                        <p className="eyebrow eyebrow--accent eyebrow--sm">{craft?.name || p.craft_key}</p>
                        <h3 className="card__title clamp-2">
                          <Link href={`/product/${p.code}`}>{p.name}</Link>
                        </h3>
                        {(p.maker || p.region) && <p className="card__meta clamp-1">{[p.maker, p.region].filter(Boolean).join(' · ')}</p>}

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
                          {terms.tiers.map(([minimum, price]: number[]) => (
                            <span className="wstier" key={`${p.code}-${minimum}`}>
                              <span className="wstier__q">{minimum}+ units</span>
                              <span className="wstier__p">${price} / unit</span>
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
    <Suspense fallback={<main id="main"><section className="section"><h1 className="display display--page">Sign in to see trade pricing</h1><p>Loading catalogue…</p></section></main>}>
      <WholesaleShopContent />
    </Suspense>
  );
}

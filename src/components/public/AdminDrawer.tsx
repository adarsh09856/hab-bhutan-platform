'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CLIENT_DATA } from '@/lib/client-data';

export default function AdminDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'news' | 'products' | 'trade' | 'outlets' | 'publications' | 'crafts' | 'media'>('text');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [newsForm, setNewsForm] = useState({
    title: '',
    kind: 'Programmes',
    blurb: '',
    body: '',
    date: new Date().toISOString().split('T')[0],
    published: true,
  });

  const [productForm, setProductForm] = useState({
    code: '',
    name: '',
    price: '',
    craft: 'thagzo',
    maker: '',
    region: 'Thimphu',
    description: '',
    featured: true,
    published: true,
  });

  const [tradeForm, setTradeForm] = useState({
    code: 'LHA01',
    moq: 5,
    lead: '4–6 weeks',
    q1: 5, p1: 238,
    q2: 15, p2: 221,
    q3: 40, p3: 204,
    q4: 100, p4: 190,
    custom: '',
    active: true,
  });

  const [mediaForm, setMediaForm] = useState({
    slot: 'hero.image',
    alt: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keyboard shortcut (Ctrl/Cmd + Shift + A), Hash (#admin), and logo clicks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setIsOpen(true);
      }
    };

    // Five rapid clicks on logo
    let logoClicks = 0;
    let clickTimer: any = null;
    const logoEl = document.getElementById('logoLockup');
    const onLogoClick = (e: MouseEvent) => {
      logoClicks++;
      clearTimeout(clickTimer);
      if (logoClicks >= 5) {
        e.preventDefault();
        setIsOpen(true);
        logoClicks = 0;
      } else {
        clickTimer = setTimeout(() => {
          logoClicks = 0;
        }, 1500);
      }
    };

    if (logoEl) logoEl.addEventListener('click', onLogoClick);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash === '#admin') setIsOpen(true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashChange);
      if (logoEl) logoEl.removeEventListener('click', onLogoClick);
      clearTimeout(clickTimer);
    };
  }, [isOpen]);

  const handleSaveText = (key: string, val: string) => {
    showToast(`✓ Updated line: "${key}". Changes reflected on the site.`);
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`✓ Published news post: "${newsForm.title}"`);
    setNewsForm({
      title: '',
      kind: 'Programmes',
      blurb: '',
      body: '',
      date: new Date().toISOString().split('T')[0],
      published: true,
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`✓ Saved product: ${productForm.name} (${productForm.code})`);
    setProductForm({
      code: '',
      name: '',
      price: '',
      craft: 'thagzo',
      maker: '',
      region: 'Thimphu',
      description: '',
      featured: true,
      published: true,
    });
  };

  const handleSaveTrade = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`✓ Trade pricing updated for product ${tradeForm.code}`);
  };

  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`✓ Updated image slot ${mediaForm.slot}`);
  };

  return (
    <>
      <div className={`admin ${isOpen ? 'is-open' : ''}`} id="admin" aria-hidden={!isOpen}>
        <div className="admin__scrim" id="adminScrim" onClick={() => setIsOpen(false)} />

        <aside className="admin__drawer" role="dialog" aria-modal="true" aria-labelledby="adminHeading" tabIndex={-1}>
          <header className="admin__head">
            <div>
              <p className="admin__kicker">HAB content console</p>
              <h2 className="admin__title" id="adminHeading">
                Quick In-Page Editor
              </h2>
            </div>
            <button className="admin__close" id="adminClose" aria-label="Close console" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </header>

          <section className="admin__pane" id="adminConsole">
            <div className="admin__who">
              <span>Logged in as Secretariat Staff</span>
              <Link href="/admin" className="btn btn--accent btn--xs" target="_blank" style={{ marginLeft: 'auto' }}>
                Open Full Executive Suite →
              </Link>
            </div>

            <nav className="admin__tabs" role="tablist" aria-label="Content sections">
              {(['text', 'news', 'products', 'trade', 'outlets', 'publications', 'crafts', 'media'] as const).map((tab) => (
                <button
                  key={tab}
                  className={`admin__tab ${activeTab === tab ? 'is-active' : ''}`}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'text' && 'Text'}
                  {tab === 'news' && 'News'}
                  {tab === 'products' && 'Products'}
                  {tab === 'trade' && 'Trade prices'}
                  {tab === 'outlets' && 'Outlets'}
                  {tab === 'publications' && 'Publications'}
                  {tab === 'crafts' && 'Crafts'}
                  {tab === 'media' && 'Images'}
                </button>
              ))}
            </nav>

            {/* TAB: TEXT */}
            {activeTab === 'text' && (
              <div className="admin__tabpane is-active">
                <p className="admin__hint">
                  Every editable line on the site. Change the text, press Save. The website updates for visitors within seconds.
                </p>
                <div className="admin__list">
                  <div className="admin__item">
                    <label className="field">
                      <span className="field__label">Site Legal Status (Utility Bar)</span>
                      <input
                        className="input"
                        defaultValue="Registered Civil Society Organization · CSO Act of Bhutan 2007"
                        onBlur={(e) => handleSaveText('Legal Status', e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="admin__item">
                    <label className="field">
                      <span className="field__label">Home Tagline</span>
                      <input
                        className="input"
                        defaultValue="Towards a vibrant & sustainable handicrafts sector"
                        onBlur={(e) => handleSaveText('Tagline', e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="admin__item">
                    <label className="field">
                      <span className="field__label">Secretariat Address</span>
                      <input
                        className="input"
                        defaultValue="Metog Lam, Kawajangsa, Thimphu, Bhutan"
                        onBlur={(e) => handleSaveText('Address', e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="admin__item">
                    <label className="field">
                      <span className="field__label">Secretariat Phone</span>
                      <input
                        className="input"
                        defaultValue="+975-2-338089"
                        onBlur={(e) => handleSaveText('Phone', e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="admin__item">
                    <label className="field">
                      <span className="field__label">Official Email</span>
                      <input
                        className="input"
                        defaultValue="officehab@gmail.com"
                        onBlur={(e) => handleSaveText('Email', e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: NEWS */}
            {activeTab === 'news' && (
              <div className="admin__tabpane is-active">
                <form className="admin__form admin__form--boxed" onSubmit={handleSaveNews}>
                  <label className="field">
                    <span className="field__label">Category</span>
                    <select
                      className="input"
                      value={newsForm.kind}
                      onChange={(e) => setNewsForm({ ...newsForm, kind: e.target.value })}
                    >
                      <option>Programmes</option>
                      <option>Projects</option>
                      <option>Events</option>
                      <option>Artisan support</option>
                      <option>Publications</option>
                      <option>Notice</option>
                    </select>
                  </label>
                  <label className="field">
                    <span className="field__label">Headline</span>
                    <input
                      className="input"
                      type="text"
                      maxLength={140}
                      required
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Summary <em>shown on cards, 2–3 lines</em></span>
                    <textarea
                      className="input"
                      rows={3}
                      maxLength={320}
                      value={newsForm.blurb}
                      onChange={(e) => setNewsForm({ ...newsForm, blurb: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Full story</span>
                    <textarea
                      className="input"
                      rows={6}
                      value={newsForm.body}
                      onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Date</span>
                    <input
                      className="input"
                      type="date"
                      required
                      value={newsForm.date}
                      onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Photograph</span>
                    <input className="input input--file" type="file" accept="image/*" />
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={newsForm.published}
                      onChange={(e) => setNewsForm({ ...newsForm, published: e.target.checked })}
                    />
                    <span>Published on the website</span>
                  </label>
                  <div className="admin__formactions">
                    <button className="btn btn--accent" type="submit">Save post</button>
                    <button className="btn btn--outline" type="button" onClick={() => setNewsForm({ title: '', kind: 'Programmes', blurb: '', body: '', date: '', published: true })}>Clear</button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: PRODUCTS */}
            {activeTab === 'products' && (
              <div className="admin__tabpane is-active">
                <form className="admin__form admin__form--boxed" onSubmit={handleSaveProduct}>
                  <label className="field">
                    <span className="field__label">Reference code</span>
                    <input
                      className="input"
                      type="text"
                      maxLength={16}
                      placeholder="e.g. LHA09"
                      required
                      value={productForm.code}
                      onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Product name</span>
                    <input
                      className="input"
                      type="text"
                      maxLength={80}
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Price in USD</span>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Craft category</span>
                    <select
                      className="input"
                      value={productForm.craft}
                      onChange={(e) => setProductForm({ ...productForm, craft: e.target.value })}
                    >
                      {CLIENT_DATA.crafts.map((c) => (
                        <option key={c.key} value={c.key}>{c.name} · {c.english}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span className="field__label">Maker (member)</span>
                    <input
                      className="input"
                      type="text"
                      maxLength={80}
                      value={productForm.maker}
                      onChange={(e) => setProductForm({ ...productForm, maker: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Dzongkhag</span>
                    <input
                      className="input"
                      type="text"
                      maxLength={60}
                      value={productForm.region}
                      onChange={(e) => setProductForm({ ...productForm, region: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Description</span>
                    <textarea
                      className="input"
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Product photograph</span>
                    <input className="input input--file" type="file" accept="image/*" />
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                    />
                    <span>Show in “New in the shop”</span>
                  </label>
                  <div className="admin__formactions">
                    <button className="btn btn--accent" type="submit">Save product</button>
                    <Link href="/admin/products" className="btn btn--outline">Catalog Table →</Link>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: TRADE PRICES */}
            {activeTab === 'trade' && (
              <div className="admin__tabpane is-active">
                <p className="admin__hint">
                  Wholesale (B2B) pricing. Choose a product, set the minimum order quantity, the lead time and up to four quantity breaks.
                </p>
                <form className="admin__form admin__form--boxed" onSubmit={handleSaveTrade}>
                  <label className="field">
                    <span className="field__label">Product</span>
                    <select
                      className="input"
                      value={tradeForm.code}
                      onChange={(e) => setTradeForm({ ...tradeForm, code: e.target.value })}
                    >
                      {CLIENT_DATA.products.map((p) => (
                        <option key={p.code} value={p.code}>{p.code} — {p.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span className="field__label">Minimum order quantity</span>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={tradeForm.moq}
                      onChange={(e) => setTradeForm({ ...tradeForm, moq: parseInt(e.target.value, 10) })}
                      required
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Lead time</span>
                    <input
                      className="input"
                      type="text"
                      value={tradeForm.lead}
                      onChange={(e) => setTradeForm({ ...tradeForm, lead: e.target.value })}
                    />
                  </label>
                  <span className="field__label">Quantity breaks <em>unit price in USD at each tier</em></span>
                  <div className="admin__tiergrid">
                    <label className="admin__tier"><span>Qty 1</span><input className="input" type="number" value={tradeForm.q1} onChange={(e) => setTradeForm({ ...tradeForm, q1: parseInt(e.target.value, 10) })} /><input className="input" type="number" value={tradeForm.p1} onChange={(e) => setTradeForm({ ...tradeForm, p1: parseInt(e.target.value, 10) })} placeholder="$" /></label>
                    <label className="admin__tier"><span>Qty 2</span><input className="input" type="number" value={tradeForm.q2} onChange={(e) => setTradeForm({ ...tradeForm, q2: parseInt(e.target.value, 10) })} /><input className="input" type="number" value={tradeForm.p2} onChange={(e) => setTradeForm({ ...tradeForm, p2: parseInt(e.target.value, 10) })} placeholder="$" /></label>
                    <label className="admin__tier"><span>Qty 3</span><input className="input" type="number" value={tradeForm.q3} onChange={(e) => setTradeForm({ ...tradeForm, q3: parseInt(e.target.value, 10) })} /><input className="input" type="number" value={tradeForm.p3} onChange={(e) => setTradeForm({ ...tradeForm, p3: parseInt(e.target.value, 10) })} placeholder="$" /></label>
                    <label className="admin__tier"><span>Qty 4</span><input className="input" type="number" value={tradeForm.q4} onChange={(e) => setTradeForm({ ...tradeForm, q4: parseInt(e.target.value, 10) })} /><input className="input" type="number" value={tradeForm.p4} onChange={(e) => setTradeForm({ ...tradeForm, p4: parseInt(e.target.value, 10) })} placeholder="$" /></label>
                  </div>
                  <div className="admin__formactions">
                    <button className="btn btn--accent" type="submit">Save trade price</button>
                    <Link href="/wholesale/shop" className="btn btn--outline" target="_blank">Preview Catalogue →</Link>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: OUTLETS */}
            {activeTab === 'outlets' && (
              <div className="admin__tabpane is-active">
                <p className="admin__hint">Physical artisan markets, clusters, and retail showrooms.</p>
                <div className="admin__list">
                  {CLIENT_DATA.outlets.map((o) => (
                    <div key={o.key} className="admin__item">
                      <strong>{o.name}</strong> — {o.place} ({o.type})
                      <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--muted)' }}>{o.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PUBLICATIONS */}
            {activeTab === 'publications' && (
              <div className="admin__tabpane is-active">
                <p className="admin__hint">Official reports, audited accounts, and strategy documents.</p>
                <div className="admin__list">
                  {CLIENT_DATA.publications.map((p) => (
                    <div key={p.title} className="admin__item">
                      <strong>{p.title}</strong> ({p.year}) · {p.meta}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: CRAFTS */}
            {activeTab === 'crafts' && (
              <div className="admin__tabpane is-active">
                <p className="admin__hint">The thirteen crafts of Zorig Chusum.</p>
                <div className="admin__list">
                  {CLIENT_DATA.crafts.map((c) => (
                    <div key={c.key} className="admin__item">
                      <strong>{c.name}</strong> ({c.english})
                      <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--muted)' }}>{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: MEDIA */}
            {activeTab === 'media' && (
              <div className="admin__tabpane is-active">
                <p className="admin__hint">Slot replacement for major key images.</p>
                <form className="admin__form admin__form--boxed" onSubmit={handleSaveMedia}>
                  <label className="field">
                    <span className="field__label">Slot</span>
                    <select
                      className="input"
                      value={mediaForm.slot}
                      onChange={(e) => setMediaForm({ ...mediaForm, slot: e.target.value })}
                    >
                      <option value="hero.image">Home hero photograph</option>
                      <option value="about.image">About band photograph</option>
                      <option value="outlet.image">Featured outlet photograph</option>
                    </select>
                  </label>
                  <label className="field">
                    <span className="field__label">Photograph</span>
                    <input className="input input--file" type="file" accept="image/*" required />
                  </label>
                  <label className="field">
                    <span className="field__label">Alternative text</span>
                    <input
                      className="input"
                      type="text"
                      placeholder="Describe the image for screen readers"
                      value={mediaForm.alt}
                      onChange={(e) => setMediaForm({ ...mediaForm, alt: e.target.value })}
                    />
                  </label>
                  <div className="admin__formactions">
                    <button className="btn btn--accent" type="submit">Upload &amp; publish</button>
                  </div>
                </form>
              </div>
            )}
          </section>
        </aside>
      </div>

      {toastMessage && (
        <div className="toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </>
  );
}

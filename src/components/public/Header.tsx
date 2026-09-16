'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { CLIENT_DATA } from '@/lib/client-data';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import HeaderLiveEditor from '@/components/public/HeaderLiveEditor';

const CATEGORY_THUMBNAIL_MAP: Record<string, string> = {
  'individual-artisan': '/assets/photos/hero-1-weaving.jpg',
  'craft-enterprise': '/assets/photos/hero-4-textiles.jpg',
  'cluster': '/assets/photos/hero-2-punakha.jpg',
  'associate': '/assets/photos/about-hab.jpg',
  'honorary': '/assets/photos/hero-3-clay.jpg',
};

const CRAFT_THUMBNAIL_MAP: Record<string, string> = {
  thagzo: '/assets/photos/hero-1-weaving.jpg',
  tshazo: '/assets/photos/hero-4-textiles.jpg',
  shagzo: '/assets/photos/product-hhb01.jpg',
  lhadri: '/assets/photos/hero-2-punakha.jpg',
  jimzo: '/assets/photos/hero-3-clay.jpg',
  dezo: '/assets/photos/hero-5-desho.jpg',
  troezo: '/assets/photos/about-hab.jpg',
  garzo: '/assets/photos/hero-4-textiles.jpg',
  chezo: '/assets/photos/hero-2-punakha.jpg',
  parzo: '/assets/photos/hero-3-clay.jpg',
  lugzo: '/assets/photos/hero-1-weaving.jpg',
  shingzo: '/assets/photos/product-cam01.jpg',
  dzozo: '/assets/photos/product-hhb01.jpg',
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { currency, toggleCurrency } = useCurrency();
  const { language, toggleLanguage, t } = useLanguage();
  const { cartCount } = useCart();

  const [membersOpen, setMembersOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveTotal, setLiveTotal] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [headerLiveEditOpen, setHeaderLiveEditOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const membersRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMembersOpen(false);
        setShopOpen(false);
        setSearchOpen(false);
        setLiveResults([]);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (membersRef.current && !membersRef.current.contains(e.target as Node)) {
        setMembersOpen(false);
      }
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) {
        setShopOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        if (!searchQuery.trim()) setSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchQuery]);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveResults([]);
      setLiveTotal(0);
      return;
    }

    const timer = setTimeout(async () => {
      setLiveLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setLiveTotal(data.total || 0);
          const combined = [
            ...(data.results?.products || []).slice(0, 3),
            ...(data.results?.crafts || []).slice(0, 2),
            ...(data.results?.members || []).slice(0, 2),
            ...(data.results?.news || []).slice(0, 2),
          ];
          setLiveResults(combined);
        }
      } catch (err) {
        console.error('Live search error:', err);
      } finally {
        setLiveLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
    setMembersOpen(false);
    setShopOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setLiveResults([]);
    }
  };

  const [crafts, setCrafts] = useState<any[]>(() => CLIENT_DATA.crafts || []);
  const [categories, setCategories] = useState<any[]>([
    { key: 'individual-artisan', name: 'Individual Artisan', meta: 'Active · Nu. 500 / year' },
    { key: 'craft-enterprise', name: 'Craft Enterprise', meta: 'Active · Nu. 2,000 / year' },
    { key: 'cluster', name: 'Artisan Cluster', meta: 'Active · Nu. 3,000 / year' },
    { key: 'associate', name: 'Affiliated Member', meta: 'Affiliated · Nu. 5,000 / year' },
    { key: 'honorary', name: 'Honorary Member', meta: 'By Board resolution · no fee' },
  ]);
  const [navItems, setNavItems] = useState<any[]>([
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Programmes', href: '/programmes' },
    { label: 'Projects', href: '/projects' },
    { label: 'News & Events', href: '/news' },
  ]);

  // Load dynamic CMS data from Admin endpoints
  useEffect(() => {
    // 1. Live Crafts for Shop Dropdown
    fetch('/api/crafts', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.crafts && Array.isArray(d.crafts) && d.crafts.length > 0) {
          setCrafts(d.crafts);
        }
      })
      .catch(() => {});

    // 2. Live Membership Categories for Dropdown
    fetch('/api/membership-categories', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.categories && Array.isArray(d.categories) && d.categories.length > 0) {
          setCategories(
            d.categories.map((c: any) => ({
              key: c.key,
              name: c.name,
              meta: c.duesBTN > 0 ? `Active · Nu. ${Number(c.duesBTN).toLocaleString()} / year` : (c.shortName || 'By Board resolution · no fee'),
            }))
          );
        }
      })
      .catch(() => {});

    // 3. Live Navigation Items
    fetch('/api/navigation', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.header && Array.isArray(d.header) && d.header.length > 0) {
          const mainLinks = d.header.filter((i: any) => !i.parent && i.href !== '/donate');
          if (mainLinks.length > 0) {
            const hasHome = mainLinks.some((i: any) => i.href === '/');
            const items = hasHome
              ? mainLinks.map((i: any) => ({ label: i.label, href: i.href }))
              : [
                  { label: 'Home', href: '/' },
                  ...mainLinks.map((i: any) => ({ label: i.label, href: i.href })),
                ];
            setNavItems(items);
          }
        }
      })
      .catch(() => {});

    // 4. Listen for real-time header changes
    const handleLiveHeaderUpdate = (e: any) => {
      if (e.detail?.navItems && Array.isArray(e.detail.navItems) && e.detail.navItems.length > 0) {
        setNavItems(e.detail.navItems);
      }
    };
    window.addEventListener('hab:header-updated', handleLiveHeaderUpdate);
    return () => {
      window.removeEventListener('hab:header-updated', handleLiveHeaderUpdate);
    };
  }, []);

  return (
    <header className="header" id="siteHeader" data-hab-section="header">
      <SectionEditBadge
        label="Header & Navigation"
        studioHref="/admin/navigation"
        onQuickEdit={() => setHeaderLiveEditOpen(true)}
        className="top-2 left-6 z-50"
      />
      <div className="header__inner">
        <Link className="logo" href="/" id="logoLockup" aria-label="Handicrafts Association of Bhutan — home">
          <img
            className="logo__img"
            src="/assets/hab-logo.png"
            alt="Handicrafts Association of Bhutan"
            width={3412}
            height={1296}
          />
        </Link>

        <button
          className="nav-toggle"
          id="navToggle"
          aria-expanded={mobileNavOpen}
          aria-controls="primaryNav"
          aria-label="Open menu"
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav
          className={`nav ${mobileNavOpen ? 'is-open' : ''}`}
          id="primaryNav"
          aria-label="Primary"
        >
          {navItems.map((item) => {
            const translationKey = 
              item.href === '/' ? 'nav.home' :
              item.href === '/about' ? 'nav.about' :
              item.href === '/programmes' ? 'nav.programmes' :
              item.href === '/projects' ? 'nav.projects' :
              item.href === '/news' ? 'nav.news' :
              item.href === '/donate' ? 'nav.donate' : null;
            const label = translationKey ? t(translationKey, item.label) : item.label;

            return (
              <Link
                key={item.href}
                className={`nav__item ${item.href === '/' ? 'nav__item--home' : ''} ${pathname === item.href ? 'is-current' : ''}`}
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}

          <div
            className="menu"
            data-menu
            ref={membersRef}
            onMouseEnter={() => {
              setMembersOpen(true);
              setShopOpen(false);
            }}
            onMouseLeave={() => setMembersOpen(false)}
          >
            <button
              className="nav__item nav__item--trigger"
              id="membersTrigger"
              aria-expanded={membersOpen}
              aria-controls="membersMenu"
              type="button"
              onClick={() => {
                setMembersOpen(!membersOpen);
                setShopOpen(false);
              }}
            >
              {t('nav.membership', 'Membership')} <span className="caret" aria-hidden="true">▾</span>
            </button>
            <div
              className="menu__panel menu__panel--mid"
              id="membersMenu"
              hidden={!membersOpen}
            >
              <div className="menu__card">
                <p className="eyebrow eyebrow--muted eyebrow--sm">{t('menu.categories', 'Membership categories')}</p>
                <div className="menu__cats">
                  {categories.map((cat) => (
                    <Link
                      key={cat.key}
                      className="menu__cat group flex items-center gap-3"
                      href={`/membership-category?category=${cat.key}`}
                      onClick={() => setMembersOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden relative flex-shrink-0 bg-stone-100 border border-[#E4DDD1] shadow-2xs group-hover:scale-105 transition-transform">
                        <Image
                          src={CATEGORY_THUMBNAIL_MAP[cat.key] || '/assets/photos/hero-1-weaving.jpg'}
                          alt={cat.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="menu__cat-name group-hover:text-[#8B2E24] transition-colors">{cat.name}</span>
                        <span className="menu__cat-meta">{cat.meta}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="menu__footer" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <Link className="btn btn--accent btn--sm" href="/register" onClick={() => setMembersOpen(false)} style={{ textAlign: 'center', whiteSpace: 'nowrap', padding: '5px 6px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {t('menu.register', 'Register as member')}
                    </Link>
                    <Link className="btn btn--outline btn--sm" href="/masters" onClick={() => setMembersOpen(false)} style={{ textAlign: 'center', whiteSpace: 'nowrap', padding: '5px 6px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {t('menu.awards', 'Awards & honours')}
                    </Link>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2px' }}>
                    <Link className="menu__note" href="/membership#login" onClick={() => setMembersOpen(false)} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', fontSize: '11.5px' }}>
                      {t('menu.login', 'Member login →')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile drawer quick currency & language toggles */}
          {mobileNavOpen && (
            <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', borderTop: '1px solid var(--line)', marginTop: '8px' }}>
              <button
                type="button"
                className="chip"
                onClick={toggleCurrency}
                style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}
              >
                {currency === 'USD' ? 'USD $' : 'Nu. BTN'}
              </button>
              <button
                type="button"
                className="chip"
                onClick={toggleLanguage}
                style={{ flex: 1, textAlign: 'center', fontWeight: 600, cursor: 'pointer' }}
              >
                {language === 'en' ? 'EN (English)' : 'རྫོང་ཁ (Dzongkha)'}
              </button>
            </div>
          )}
        </nav>

        <span className="header__spacer"></span>

        <form
          ref={searchContainerRef}
          className={`search ${searchOpen ? 'is-open' : ''}`}
          role="search"
          id="searchForm"
          onSubmit={handleSearchSubmit}
          onMouseEnter={() => {
            setSearchOpen(true);
          }}
          onMouseLeave={() => {
            if (!searchQuery.trim() && document.activeElement !== searchInputRef.current) {
              setSearchOpen(false);
            }
          }}
        >
          <button
            className="search__btn"
            id="searchBtn"
            type="button"
            aria-expanded={searchOpen}
            aria-controls="searchInput"
            onClick={() => {
              setSearchOpen(true);
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }}
          >
            <span className="search__glyph" aria-hidden="true">⌕</span>
            <span className="search__word">{t('nav.search', 'Search')}</span>
          </button>
          <input
            ref={searchInputRef}
            className="search__input"
            id="searchInput"
            type="search"
            placeholder={t('nav.search_placeholder', 'Search crafts, members, publications')}
            autoComplete="off"
            aria-label="Search crafts and members"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => {
              if (!searchQuery.trim()) setSearchOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchQuery('');
                setSearchOpen(false);
                searchInputRef.current?.blur();
              }
            }}
          />

          {/* Instant live search results dropdown */}
          {searchOpen && searchQuery.trim().length > 0 && (
            <div
              className="search__dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                width: 'min(420px, 92vw)',
                marginTop: '8px',
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.15), 0 0 1px 1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                zIndex: 9999,
                color: '#1e293b',
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#64748b',
                  fontWeight: 600,
                }}
              >
                <span>{liveLoading ? 'Searching...' : `Found ${liveTotal} match${liveTotal === 1 ? '' : 'es'}`}</span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Press Enter for full results</span>
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {liveResults.map((item) => (
                  <button
                    key={`${item.category}-${item.id}`}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setLiveResults([]);
                      router.push(item.url);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #f8fafc',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          flexShrink: 0,
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          background: '#fff1f2',
                          color: '#8B2E24',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {item.category.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', padding: '1px 5px', borderRadius: '4px', background: '#f1f5f9', color: '#475569' }}>
                          {item.category}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#8B2E24', fontWeight: 500, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                ))}

                {liveResults.length === 0 && !liveLoading && (
                  <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                    No instant matches. Press Enter for global search.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSearchSubmit}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#fdf2f2',
                  border: 'none',
                  borderTop: '1px solid #fecdd3',
                  color: '#8B2E24',
                  fontSize: '11px',
                  fontWeight: 700,
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'block',
                }}
              >
                View all results for &ldquo;{searchQuery}&rdquo; &rarr;
              </button>
            </div>
          )}
        </form>

        <div className="header__actions">
          <button
            className="chip"
            id="currencyToggle"
            title="Switch currency / དངུལ་ཀྲམ་བརྗེ་སོར"
            aria-live="polite"
            type="button"
            onClick={toggleCurrency}
            style={{ cursor: 'pointer' }}
          >
            {currency === 'USD' ? 'USD $' : 'Nu. BTN'}
          </button>

          <div
            className="menu"
            data-menu
            ref={shopRef}
            onMouseEnter={() => {
              setShopOpen(true);
              setMembersOpen(false);
            }}
            onMouseLeave={() => setShopOpen(false)}
          >
            <button
              className="btn btn--accent btn--sm"
              id="shopTrigger"
              aria-expanded={shopOpen}
              aria-controls="shopMenu"
              type="button"
              onClick={() => {
                setShopOpen(!shopOpen);
                setMembersOpen(false);
              }}
            >
              {t('nav.shop', 'Shop')} <span className="caret" aria-hidden="true">▾</span>
            </button>
            <div
              className="menu__panel menu__panel--wide"
              id="shopMenu"
              hidden={!shopOpen}
            >
              <div className="menu__card">
                <p className="eyebrow eyebrow--muted">{t('menu.shop_by_craft', 'Shop by craft category')}</p>
                <div className="menu__grid">
                  {crafts.map((c) => (
                    <Link
                      key={c.key}
                      className="menu__craft group flex items-center gap-2.5"
                      href={`/shop/${c.key}`}
                      onClick={() => setShopOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-md overflow-hidden relative flex-shrink-0 bg-stone-100 border border-[#E4DDD1] shadow-2xs group-hover:scale-105 transition-transform">
                        <Image
                          src={CRAFT_THUMBNAIL_MAP[c.key] || '/assets/photos/hero-1-weaving.jpg'}
                          alt={c.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="menu__craft-name group-hover:text-[#8B2E24] transition-colors">{c.name}</span>
                        <span className="menu__craft-en clamp-1">{c.english || ''}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="menu__footer">
                  <Link className="btn btn--ink btn--sm" href="/shop" onClick={() => setShopOpen(false)}>
                    {t('menu.shop_home', 'Shop home →')}
                  </Link>
                  <Link className="btn btn--outline btn--sm" href="/shop" onClick={() => setShopOpen(false)}>
                    {t('menu.all_products', 'All products')}
                  </Link>
                </div>
                <Link className="menu__wholesale" href="/wholesale" onClick={() => setShopOpen(false)}>
                  <span className="menu__wholesale-name">{t('menu.wholesale', 'Wholesale & Bulk Orders →')}</span>
                  <span className="menu__wholesale-note">Trade pricing, MOQs and made-to-order for retailers, hotels and distributors</span>
                </Link>
              </div>
            </div>
          </div>

          <Link className="basket" href="/basket" aria-label={t('nav.basket', 'Basket')}>
            <span aria-hidden="true">🧺</span>
            {cartCount > 0 ? (
              <span className="basket__count" id="basketCount">
                {cartCount}
              </span>
            ) : (
              <span className="basket__count" id="basketCount" hidden>
                0
              </span>
            )}
          </Link>
        </div>
      </div>

      <HeaderLiveEditor
        isOpen={headerLiveEditOpen}
        onClose={() => setHeaderLiveEditOpen(false)}
        onSaved={(newNav) => {
          if (newNav && newNav.length > 0) {
            setNavItems(newNav);
          }
          router.refresh();
        }}
      />
    </header>
  );
}

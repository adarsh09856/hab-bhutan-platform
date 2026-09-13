'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { CLIENT_DATA } from '@/lib/client-data';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { currency, toggleCurrency } = useCurrency();
  const { cartCount } = useCart();

  const [membersOpen, setMembersOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const membersRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMembersOpen(false);
        setShopOpen(false);
        setSearchOpen(false);
        setMobileNavOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (membersRef.current && !membersRef.current.contains(target)) {
        setMembersOpen(false);
      }
      if (shopRef.current && !shopRef.current.contains(target)) {
        setShopOpen(false);
      }
      if (!target.closest('.search') && !searchQuery) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const crafts = CLIENT_DATA.crafts || [];

  return (
    <header className="header" id="siteHeader">
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
          <Link
            className={`nav__item nav__item--home ${pathname === '/' ? 'is-current' : ''}`}
            href="/"
            aria-current={pathname === '/' ? 'page' : undefined}
          >
            Home
          </Link>
          <Link
            className={`nav__item ${pathname === '/about' ? 'is-current' : ''}`}
            href="/about"
          >
            About Us
          </Link>
          <Link
            className={`nav__item ${pathname === '/programmes' ? 'is-current' : ''}`}
            href="/programmes"
          >
            Programmes
          </Link>
          <Link
            className={`nav__item ${pathname === '/projects' ? 'is-current' : ''}`}
            href="/projects"
          >
            Projects
          </Link>
          <Link
            className={`nav__item ${pathname === '/news' ? 'is-current' : ''}`}
            href="/news"
          >
            News &amp; Events
          </Link>

          <div className="menu" data-menu ref={membersRef}>
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
              Membership <span className="caret" aria-hidden="true">▾</span>
            </button>
            <div
              className="menu__panel menu__panel--mid"
              id="membersMenu"
              hidden={!membersOpen}
            >
              <div className="menu__card">
                <p className="eyebrow eyebrow--muted eyebrow--sm">Membership categories</p>
                <div className="menu__cats">
                  <Link className="menu__cat" href="/membership-category?category=individual-artisan">
                    <span className="menu__cat-name">Individual Artisan</span>
                    <span className="menu__cat-meta">Active · Nu. 500 / year</span>
                  </Link>
                  <Link className="menu__cat" href="/membership-category?category=craft-enterprise">
                    <span className="menu__cat-name">Craft Enterprise</span>
                    <span className="menu__cat-meta">Active · Nu. 2,000 / year</span>
                  </Link>
                  <Link className="menu__cat" href="/membership-category?category=cluster">
                    <span className="menu__cat-name">Artisan Cluster</span>
                    <span className="menu__cat-meta">Active · Nu. 3,000 / year</span>
                  </Link>
                  <Link className="menu__cat" href="/membership-category?category=associate">
                    <span className="menu__cat-name">Affiliated Member</span>
                    <span className="menu__cat-meta">Affiliated · Nu. 5,000 / year</span>
                  </Link>
                  <Link className="menu__cat" href="/membership-category?category=honorary">
                    <span className="menu__cat-name">Honorary Member</span>
                    <span className="menu__cat-meta">By Board resolution · no fee</span>
                  </Link>
                </div>
                <div className="menu__footer">
                  <Link className="btn btn--accent btn--sm" href="/register">Register as a member</Link>
                  <Link className="btn btn--outline btn--sm" href="/masters">Accreditations &amp; awards</Link>
                  <Link className="menu__note" href="/membership#login">Member login</Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <span className="header__spacer"></span>

        <form
          className={`search ${searchOpen ? 'is-open' : ''}`}
          role="search"
          id="searchForm"
          onSubmit={handleSearchSubmit}
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
            <span className="search__word">Search</span>
          </button>
          <input
            ref={searchInputRef}
            className="search__input"
            id="searchInput"
            type="search"
            placeholder="Search crafts, members, publications"
            autoComplete="off"
            aria-label="Search crafts and members"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => {
              if (!searchQuery.trim()) setSearchOpen(false);
            }}
          />
        </form>

        <div className="header__actions">
          <button
            className="chip"
            id="currencyToggle"
            title="Switch currency"
            aria-live="polite"
            type="button"
            onClick={toggleCurrency}
          >
            {currency === 'USD' ? 'USD $' : 'Nu. BTN'}
          </button>

          <div className="menu" data-menu ref={shopRef}>
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
              Shop <span className="caret" aria-hidden="true">▾</span>
            </button>
            <div
              className="menu__panel menu__panel--wide"
              id="shopMenu"
              hidden={!shopOpen}
            >
              <div className="menu__card">
                <p className="eyebrow eyebrow--muted">Shop by craft category</p>
                <div className="menu__grid">
                  {crafts.map((c) => (
                    <Link
                      key={c.key}
                      className="menu__craft"
                      href={`/shop/${c.key}`}
                      onClick={() => setShopOpen(false)}
                    >
                      <span className="menu__craft-name">{c.name}</span>
                      <span className="menu__craft-en">{c.english || ''}</span>
                    </Link>
                  ))}
                </div>
                <div className="menu__footer">
                  <Link className="btn btn--ink btn--sm" href="/shop" onClick={() => setShopOpen(false)}>
                    Shop home →
                  </Link>
                  <Link className="btn btn--outline btn--sm" href="/shop" onClick={() => setShopOpen(false)}>
                    All products
                  </Link>
                </div>
                <Link className="menu__wholesale" href="/wholesale" onClick={() => setShopOpen(false)}>
                  <span className="menu__wholesale-name">Wholesale &amp; Bulk Orders →</span>
                  <span className="menu__wholesale-note">Trade pricing, MOQs and made-to-order for retailers, hotels and distributors</span>
                </Link>
              </div>
            </div>
          </div>

          <Link className="basket" href="/basket" aria-label="Basket">
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
    </header>
  );
}

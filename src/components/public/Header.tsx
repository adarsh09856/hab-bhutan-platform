'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { CRAFTS } from '@/lib/data';
import { Menu, X, Search as SearchIcon, User } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const { currency, toggleCurrency } = useCurrency();
  const { cartCount } = useCart();

  const [membersMenuOpen, setMembersMenuOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [headerLinks, setHeaderLinks] = useState<any[]>([
    { id: '1', label: 'About Us', href: '/about', parent: null },
    { id: '2', label: 'Programmes', href: '/programmes', parent: null },
    { id: '3', label: 'Projects', href: '/projects', parent: null },
    { id: '4', label: 'News & Events', href: '/news', parent: null },
    { id: '5', label: 'Directory by category', href: '/members', parent: 'members' },
    { id: '6', label: 'Publications & downloads', href: '/publications', parent: 'members' },
    { id: '7', label: 'Member shops & outlets', href: '/shop', parent: 'members' },
  ]);

  useEffect(() => {
    fetch('/api/navigation')
      .then((r) => r.json())
      .then((data) => {
        if (data?.header && data.header.length > 0) {
          setHeaderLinks(data.header);
        }
      })
      .catch(() => {});
  }, []);

  const membersWrapperRef = useRef<HTMLDivElement>(null);
  const shopWrapperRef = useRef<HTMLDivElement>(null);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMembersMenuOpen(false);
        setShopMenuOpen(false);
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close desktop dropdowns on click outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !membersWrapperRef.current?.contains(target) &&
        !shopWrapperRef.current?.contains(target)
      ) {
        setMembersMenuOpen(false);
        setShopMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown, true);
    return () => document.removeEventListener('mousedown', handleMouseDown, true);
  }, []);

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[rgba(247,246,242,.96)] backdrop-blur-[12px] border-b border-[#E4DDD1]">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 min-h-[64px] sm:min-h-[74px] flex items-center justify-between gap-2 sm:gap-4">
        {/* 1. Logo lockup */}
        <Link href="/" className="logo flex items-center cursor-pointer flex-none" aria-label="Handicrafts Association of Bhutan — home">
          <img
            src="/assets/hab-logo.png"
            alt="Handicrafts Association of Bhutan"
            className="logo__img h-[40px] sm:h-[46px] w-auto object-contain"
            onError={(e: any) => {
              e.currentTarget.style.display = 'none';
              const fb = e.currentTarget.nextElementSibling;
              if (fb) fb.style.display = 'flex';
            }}
          />
          <div style={{ display: 'none' }} className="items-center gap-2.5 sm:gap-[11px] flex-none">
            <div className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-figtree font-extrabold text-[13px] sm:text-[14px] tracking-[-0.02em] flex-none">
              HAB
            </div>
            <div className="font-figtree leading-[1.15]">
              <div className="font-bold text-[13.5px] sm:text-[14.5px] tracking-[-0.01em] text-[#33261F] whitespace-nowrap">
                Handicrafts Association
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#6B5A4C] tracking-[0.04em] whitespace-nowrap">
                OF BHUTAN · EST. 2005
              </div>
            </div>
          </div>
        </Link>

        {/* 2. Primary Navigation (Desktop only) */}
        <nav className="hidden lg:flex items-center gap-0 font-figtree text-[13px] font-medium whitespace-nowrap flex-none">
          {headerLinks
            .filter((item) => !item.parent)
            .map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="text-[#33261F] px-[9px] py-[9px] rounded-[6px] hover:bg-[#EDE5D6] transition-colors duration-150"
              >
                {item.label}
              </Link>
            ))}

          {/* Members Dropdown Wrapper */}
          {headerLinks.some((item) => item.parent === 'members') && (
            <div
              ref={membersWrapperRef}
              onMouseEnter={() => {
                setMembersMenuOpen(true);
                setShopMenuOpen(false);
              }}
              onMouseLeave={() => setMembersMenuOpen(false)}
              className="relative"
            >
              <div
                onClick={() => {
                  setMembersMenuOpen((prev) => !prev);
                  setShopMenuOpen(false);
                }}
                className="text-[#33261F] px-[9px] py-[9px] rounded-[6px] cursor-pointer flex items-center gap-[6px] hover:bg-[#EDE5D6] transition-colors duration-150"
              >
                Members
                <span className="text-[9px] text-[#6B5A4C]">▼</span>
              </div>

              {membersMenuOpen && (
                <div className="absolute top-full left-0 pt-[10px] w-[280px] z-60">
                  <div
                    className="w-full bg-[#FFFCF8] border border-[#E4DDD1] rounded-[10px] p-3 text-[13px]"
                    style={{ boxShadow: '0 14px 34px rgba(27,26,24,.12)' }}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#6B5A4C] px-2 pb-1.5 font-semibold">
                      Membership categories
                    </p>
                    <div className="space-y-0.5">
                      <Link href="/membership/individual-artisan" onClick={() => setMembersMenuOpen(false)} className="block px-2.5 py-1.5 rounded-[6px] hover:bg-[#F1EADC] transition-colors">
                        <div className="font-semibold text-[13px] text-[#33261F]">Individual Artisan</div>
                        <div className="text-[10.5px] text-[#6B5A4C]">Active · Nu. 500 / year</div>
                      </Link>
                      <Link href="/membership/craft-enterprise" onClick={() => setMembersMenuOpen(false)} className="block px-2.5 py-1.5 rounded-[6px] hover:bg-[#F1EADC] transition-colors">
                        <div className="font-semibold text-[13px] text-[#33261F]">Craft Enterprise</div>
                        <div className="text-[10.5px] text-[#6B5A4C]">Active · Nu. 2,000 / year</div>
                      </Link>
                      <Link href="/membership/cluster" onClick={() => setMembersMenuOpen(false)} className="block px-2.5 py-1.5 rounded-[6px] hover:bg-[#F1EADC] transition-colors">
                        <div className="font-semibold text-[13px] text-[#33261F]">Artisan Cluster</div>
                        <div className="text-[10.5px] text-[#6B5A4C]">Active · Nu. 3,000 / year</div>
                      </Link>
                      <Link href="/membership/associate" onClick={() => setMembersMenuOpen(false)} className="block px-2.5 py-1.5 rounded-[6px] hover:bg-[#F1EADC] transition-colors">
                        <div className="font-semibold text-[13px] text-[#33261F]">Affiliated Member</div>
                        <div className="text-[10.5px] text-[#6B5A4C]">Affiliated · Nu. 5,000 / year</div>
                      </Link>
                      <Link href="/membership/honorary" onClick={() => setMembersMenuOpen(false)} className="block px-2.5 py-1.5 rounded-[6px] hover:bg-[#F1EADC] transition-colors">
                        <div className="font-semibold text-[13px] text-[#33261F]">Honorary Member</div>
                        <div className="text-[10.5px] text-[#6B5A4C]">By Board resolution · no fee</div>
                      </Link>
                    </div>
                    <div className="pt-2.5 mt-2 border-t border-[#EFE9DE] space-y-1.5">
                      <Link href="/membership/apply" onClick={() => setMembersMenuOpen(false)} className="block text-center py-1.5 px-3 rounded bg-[#8B2E24] text-white font-figtree font-semibold text-xs hover:bg-[#6E241C] transition-colors">
                        Register as a member
                      </Link>
                      <Link href="/masters" onClick={() => setMembersMenuOpen(false)} className="block text-center py-1.5 px-3 rounded border border-[#CDBEA8] text-[#33261F] font-figtree text-xs hover:bg-[#F1EADC] transition-colors">
                        Accreditations &amp; awards
                      </Link>
                      <Link href="/login" onClick={() => setMembersMenuOpen(false)} className="block text-center text-[11px] text-[#6B5A4C] hover:text-[#8B2E24] pt-0.5">
                        Member login →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* 3. Search Field (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-2 bg-[#FFFCF8] border border-[#E4DDD1] rounded-[7px] px-[11px] h-[38px] sm:h-[42px] w-[130px] lg:w-[150px] flex-none">
          <SearchIcon className="w-3.5 h-3.5 text-[#8A7767]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            placeholder="Search crafts"
            className="border-none bg-transparent outline-none font-figtree text-[13px] w-full text-[#8B2E24] placeholder:text-[#8A7767]"
          />
        </div>

        {/* 4. Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-none whitespace-nowrap">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            aria-label="Toggle search"
            className="md:hidden w-[38px] h-[38px] rounded-[7px] border border-[#E4DDD1] bg-[#FFFCF8] flex items-center justify-center text-[#6B5A4C] hover:border-[#33261F]"
          >
            <SearchIcon className="w-4 h-4" />
          </button>

          {/* Currency Toggle */}
          <button
            type="button"
            onClick={toggleCurrency}
            title="Switch currency"
            className="font-mono text-[11px] sm:text-[11.5px] text-[#6B5A4C] border border-[#E4DDD1] rounded-[6px] px-2 sm:px-[9px] py-[6px] sm:py-[7px] cursor-pointer bg-[#FFFCF8] hover:border-[#33261F] transition-colors duration-150"
          >
            {currency === 'USD' ? '$ USD' : 'Nu. BTN'}
          </button>

          {/* Membership Button (hidden on phone) */}
          <Link
            href="/membership/apply"
            className="hidden sm:inline-block font-figtree text-[13px] sm:text-[13.5px] font-semibold border border-[#33261F] text-[#8B2E24] rounded-[7px] px-3 sm:px-[13px] py-2 sm:py-[10px] hover:bg-[#33261F] hover:text-[#F4F0E7] transition-colors duration-150"
          >
            Membership
          </Link>

          {/* Desktop Shop Dropdown */}
          <div
            ref={shopWrapperRef}
            className="relative hidden lg:block"
            onMouseEnter={() => {
              setShopMenuOpen(true);
              setMembersMenuOpen(false);
            }}
            onMouseLeave={() => setShopMenuOpen(false)}
          >
            <div
              onClick={() => {
                setShopMenuOpen((prev) => !prev);
                setMembersMenuOpen(false);
              }}
              className="font-figtree text-[13.5px] font-semibold bg-[#8B2E24] text-white rounded-[7px] px-[14px] py-[10px] cursor-pointer flex items-center gap-[7px] hover:bg-[#6E241C] transition-colors duration-150"
            >
              Shop
              <span className="text-[9px] opacity-75">▼</span>
            </div>

            {shopMenuOpen && (
              <div className="absolute top-full right-0 pt-[10px] w-[660px] z-60">
                <div
                  className="w-full bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-5 z-60"
                  style={{ boxShadow: '0 18px 44px rgba(58,42,33,.16)' }}
                >
                  <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-[#6B5A4C] mb-[14px]">
                    Shop by craft category
                  </div>
                  <div className="grid grid-cols-3 gap-[2px]">
                    {CRAFTS.map((c) => (
                      <Link
                        key={c.key}
                        href={`/shop/${c.key}`}
                        onClick={() => setShopMenuOpen(false)}
                        className="p-[9px_11px] rounded-[7px] hover:bg-[#F1EADC] transition-colors duration-150 block"
                      >
                        <div className="font-figtree font-semibold text-[14px] text-[#33261F]">
                          {c.name}
                        </div>
                        <div className="text-[12.5px] text-[#6B5A4C]">
                          {c.english}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="flex gap-[10px] mt-4 border-t border-[#EFE9DE] pt-4 items-center">
                    <Link
                      href="/shop"
                      onClick={() => setShopMenuOpen(false)}
                      className="font-figtree font-semibold text-[13.5px] bg-[#33261F] text-[#F4F0E7] px-4 py-[11px] rounded-[7px]"
                    >
                      Shop home →
                    </Link>
                    <Link
                      href="/shop"
                      onClick={() => setShopMenuOpen(false)}
                      className="font-figtree font-semibold text-[13.5px] border border-[#CDBEA8] text-[#33261F] px-4 py-[11px] rounded-[7px] hover:border-[#33261F]"
                    >
                      All products
                    </Link>
                    <Link
                      href="/basket"
                      onClick={() => setShopMenuOpen(false)}
                      className="font-figtree font-semibold text-[13.5px] border border-[#CDBEA8] text-[#33261F] px-4 py-[11px] rounded-[7px] hover:border-[#33261F]"
                    >
                      Your basket
                    </Link>
                    <Link
                      href="/track-order"
                      onClick={() => setShopMenuOpen(false)}
                      className="font-figtree font-semibold text-[13.5px] border border-[#CDBEA8] text-[#33261F] px-4 py-[11px] rounded-[7px] hover:border-[#33261F]"
                    >
                      Track order
                    </Link>
                    <Link
                      href="/wholesale"
                      onClick={() => setShopMenuOpen(false)}
                      className="font-mono text-[11.5px] text-[#8B2E24] hover:text-[#6E241C] font-semibold ml-auto"
                    >
                      Wholesale &amp; bulk buyers →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Account Link */}
          <Link
            href="/account"
            aria-label="Account"
            title="My Account & Orders"
            className="w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-[7px] border border-[#E4DDD1] bg-[#FFFCF8] flex items-center justify-center text-[#6B5A4C] hover:border-[#33261F] hover:text-[#33261F] transition-colors duration-150"
          >
            <User className="w-4 h-4" />
          </Link>

          {/* Basket Icon with Count Badge */}
          <Link
            href="/basket"
            aria-label="View basket"
            className="relative w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-[7px] border border-[#E4DDD1] bg-[#FFFCF8] flex items-center justify-center cursor-pointer text-[15px] sm:text-[16px] hover:border-[#33261F] transition-colors duration-150"
          >
            🧺
            {cartCount > 0 && (
              <div className="absolute -top-[5px] -right-[5px] min-w-[18px] h-[18px] px-[4px] rounded-full bg-[#8B2E24] text-white font-figtree text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </div>
            )}
          </Link>

          {/* Mobile Navigation Drawer Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle mobile menu"
            className="lg:hidden w-[38px] h-[38px] rounded-[7px] border border-[#E4DDD1] bg-[#FFFCF8] flex items-center justify-center text-[#33261F] hover:border-[#33261F]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Dropdown Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-[#E4DDD1] bg-[#FFFCF8] px-4 py-3">
          <div className="flex items-center gap-2 bg-[#F4F0E7] border border-[#E4DDD1] rounded-[7px] px-3 h-[40px]">
            <SearchIcon className="w-4 h-4 text-[#8A7767]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder="Search Bhutanese crafts..."
              className="border-none bg-transparent outline-none font-figtree text-[14px] w-full text-[#8B2E24] placeholder:text-[#8A7767]"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E4DDD1] bg-[#FFFCF8] px-5 py-6 max-h-[80vh] overflow-y-auto shadow-xl">
          <div className="space-y-4">
            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="font-figtree font-semibold text-[14px] bg-[#8B2E24] text-white p-3 rounded-[8px] text-center"
              >
                Browse E-Shop →
              </Link>
              <Link
                href="/membership/apply"
                onClick={() => setMobileMenuOpen(false)}
                className="font-figtree font-semibold text-[14px] border border-[#33261F] text-[#33261F] p-3 rounded-[8px] text-center"
              >
                Apply Membership
              </Link>
            </div>

            {/* Account & Register Quick Links */}
            <div className="grid grid-cols-2 gap-2 pb-2">
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="font-figtree font-semibold text-[13px] border border-[#E4DDD1] text-[#33261F] p-2.5 rounded-[8px] text-center bg-white"
              >
                My Account
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="font-figtree font-semibold text-[13px] border border-[#8B2E24] text-[#8B2E24] p-2.5 rounded-[8px] text-center bg-[#8B2E24]/5"
              >
                Register
              </Link>
            </div>

            {/* Main Navigation Links */}
            <div className="pt-2 border-t border-[#EFE9DE] divide-y divide-[#EFE9DE]">
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 font-figtree font-medium text-[15px] text-[#33261F]"
              >
                About Us &amp; Governance
              </Link>
              <Link
                href="/programmes"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 font-figtree font-medium text-[15px] text-[#33261F]"
              >
                Programmes &amp; Training
              </Link>
              <Link
                href="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 font-figtree font-medium text-[15px] text-[#33261F]"
              >
                Donor &amp; Development Projects
              </Link>
              <Link
                href="/news"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 font-figtree font-medium text-[15px] text-[#33261F]"
              >
                News, Events &amp; Tenders
              </Link>
              <Link
                href="/members"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 font-figtree font-medium text-[15px] text-[#33261F]"
              >
                Artisan Directory by Craft
              </Link>
              <Link
                href="/publications"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 font-figtree font-medium text-[15px] text-[#33261F]"
              >
                Publications &amp; Downloads
              </Link>
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 font-figtree font-medium text-[15px] text-[#33261F]"
              >
                Track Live Order Status
              </Link>
            </div>

            {/* 13 Crafts Category List */}
            <div className="pt-3 border-t border-[#EFE9DE]">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#6B5A4C] mb-2">
                13 Traditional Crafts
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[13px]">
                {CRAFTS.map((c) => (
                  <Link
                    key={c.key}
                    href={`/shop/${c.key}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded bg-[#F8F5EF] text-[#33261F] hover:bg-[#EFE9DE]"
                  >
                    <span className="font-semibold block">{c.name}</span>
                    <span className="text-[11px] text-[#6B5A4C] block">{c.english}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

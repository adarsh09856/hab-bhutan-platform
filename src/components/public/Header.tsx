'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { CRAFTS } from '@/lib/data';

export default function Header() {
  const router = useRouter();
  const { currency, toggleCurrency } = useCurrency();
  const { cartCount } = useCart();

  const [membersMenuOpen, setMembersMenuOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const membersWrapperRef = useRef<HTMLDivElement>(null);
  const shopWrapperRef = useRef<HTMLDivElement>(null);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMembersMenuOpen(false);
        setShopMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on click outside
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
    if (e.key === 'Enter') {
      router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[rgba(247,246,242,.94)] backdrop-blur-[10px] border-b border-[#E4DDD1]">
      <div className="max-w-[1280px] min-w-[1200px] mx-auto px-10 min-h-[74px] flex items-center gap-[10px]">
        {/* 1. Logo lockup */}
        <Link href="/" className="flex items-center gap-[11px] cursor-pointer flex-none">
          <div className="w-[38px] h-[38px] rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-figtree font-extrabold text-[14px] tracking-[-0.02em]">
            HAB
          </div>
          <div className="font-figtree leading-[1.15]">
            <div className="font-bold text-[14.5px] tracking-[-0.01em] text-[#33261F]">
              Handicrafts Association
            </div>
            <div className="text-[11px] text-[#6B5A4C] tracking-[0.04em]">
              OF BHUTAN · EST. 2005
            </div>
          </div>
        </Link>

        {/* 2. Primary Navigation */}
        <nav className="flex items-center gap-0 ml-0 font-figtree text-[13px] font-medium whitespace-nowrap flex-none">
          <Link
            href="/about"
            className="text-[#33261F] px-[9px] py-[9px] rounded-[6px] cursor-pointer whitespace-nowrap hover:bg-[#EDE5D6] transition-colors duration-150"
          >
            About Us
          </Link>
          <Link
            href="/programmes"
            className="text-[#33261F] px-[9px] py-[9px] rounded-[6px] cursor-pointer whitespace-nowrap hover:bg-[#EDE5D6] transition-colors duration-150"
          >
            Programmes
          </Link>
          <Link
            href="/projects"
            className="text-[#33261F] px-[9px] py-[9px] rounded-[6px] cursor-pointer whitespace-nowrap hover:bg-[#EDE5D6] transition-colors duration-150"
          >
            Projects
          </Link>
          <Link
            href="/news"
            className="text-[#33261F] px-[9px] py-[9px] rounded-[6px] cursor-pointer whitespace-nowrap hover:bg-[#EDE5D6] transition-colors duration-150"
          >
            News &amp; Events
          </Link>

          {/* Members Dropdown Wrapper */}
          <div
            ref={membersWrapperRef}
            data-menu
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
              <div className="absolute top-full left-0 pt-[10px] w-[250px] z-60">
                <div
                  className="w-full bg-[#FFFCF8] border border-[#E4DDD1] rounded-[10px] p-2 text-[13.5px]"
                  style={{ boxShadow: '0 14px 34px rgba(27,26,24,.12)' }}
                >
                  <Link
                    href="/members"
                    onClick={() => setMembersMenuOpen(false)}
                    className="block px-3 py-[10px] rounded-[7px] text-[#33261F] hover:bg-[#F1EADC] transition-colors duration-150"
                  >
                    Directory by category
                  </Link>
                  <Link
                    href="/publications"
                    onClick={() => setMembersMenuOpen(false)}
                    className="block px-3 py-[10px] rounded-[7px] text-[#33261F] hover:bg-[#F1EADC] transition-colors duration-150"
                  >
                    Publications &amp; downloads
                  </Link>
                  <Link
                    href="/shop"
                    onClick={() => setMembersMenuOpen(false)}
                    className="block px-3 py-[10px] rounded-[7px] text-[#33261F] hover:bg-[#F1EADC] transition-colors duration-150"
                  >
                    Member shops &amp; outlets
                  </Link>
                  <div className="h-[1px] bg-[#E4DDD1] my-[6px] mx-[10px]" />
                  <Link
                    href="/track-order"
                    onClick={() => setMembersMenuOpen(false)}
                    className="block px-3 py-[10px] rounded-[7px] text-[#33261F] hover:bg-[#F1EADC] transition-colors duration-150"
                  >
                    Track order status
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMembersMenuOpen(false)}
                    className="block px-3 py-[10px] rounded-[7px] text-[#8B2E24] font-semibold hover:bg-[#F1EADC] transition-colors duration-150"
                  >
                    Staff &amp; Operations Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Flexible spacer */}
        <div className="flex-1" />

        {/* 3. Search field */}
        <div className="flex items-center gap-2 bg-[#FFFCF8] border border-[#E4DDD1] rounded-[7px] px-[11px] h-[42px] w-[128px] flex-none">
          <span className="text-[13px] text-[#8A7767]">⌕</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            placeholder="Search"
            className="border-none bg-transparent outline-none font-figtree text-[13px] w-full text-[#8B2E24] placeholder:text-[#8A7767]"
          />
        </div>

        {/* 4. CTA Cluster */}
        <div className="flex items-center gap-2 flex-none whitespace-nowrap">
          {/* Currency Toggle */}
          <button
            type="button"
            onClick={toggleCurrency}
            title="Switch currency"
            className="font-mono text-[11.5px] text-[#6B5A4C] border border-[#E4DDD1] rounded-[6px] px-[9px] py-[7px] cursor-pointer bg-[#FFFCF8] whitespace-nowrap hover:border-[#33261F] transition-colors duration-150"
          >
            {currency === 'USD' ? 'USD $' : 'BTN Nu.'}
          </button>

          {/* Membership Button */}
          <Link
            href="/membership/apply"
            className="font-figtree text-[13.5px] font-semibold border border-[#33261F] text-[#8B2E24] rounded-[7px] px-[13px] py-[10px] cursor-pointer whitespace-nowrap hover:bg-[#33261F] hover:text-[#F4F0E7] transition-colors duration-150"
          >
            Membership
          </Link>

          {/* Shop Button with Mega-Menu Wrapper */}
          <div
            ref={shopWrapperRef}
            data-menu
            onMouseEnter={() => {
              setShopMenuOpen(true);
              setMembersMenuOpen(false);
            }}
            onMouseLeave={() => setShopMenuOpen(false)}
            className="relative"
          >
            <div
              onClick={() => {
                setShopMenuOpen((prev) => !prev);
                setMembersMenuOpen(false);
              }}
              className="font-figtree text-[13.5px] font-semibold bg-[#8B2E24] text-white rounded-[7px] px-[14px] py-[10px] cursor-pointer whitespace-nowrap flex items-center gap-[7px] hover:bg-[#6E241C] transition-colors duration-150"
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
                    <div className="flex-1" />
                    <div className="font-mono text-[11px] text-[#6B5A4C]">
                      Free EMS over $200
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Basket Icon with Count Badge */}
          <Link
            href="/basket"
            className="relative w-[42px] h-[42px] rounded-[7px] border border-[#E4DDD1] bg-[#FFFCF8] flex items-center justify-center cursor-pointer text-[16px] hover:border-[#33261F] transition-colors duration-150"
          >
            🧺
            {cartCount > 0 && (
              <div className="absolute -top-[7px] -right-[7px] min-w-[20px] h-[20px] px-[5px] rounded-[10px] bg-[#8B2E24] text-white font-figtree text-[11px] font-bold flex items-center justify-center">
                {cartCount}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

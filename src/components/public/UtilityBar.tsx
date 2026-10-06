'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import SectionEditBadge from '@/components/public/SectionEditBadge';

export default function UtilityBar() {
  const [tickerMessages, setTickerMessages] = useState<Array<{ text: string; link?: string }>>([
    { text: 'CSO/2011/043 · Handicrafts Association of Bhutan', link: '/about' },
    { text: 'Apex CSO Supporting 7,500+ Rural Artisans Across 20 Dzongkhags', link: '/about' },
    { text: 'Official Secretariat Hotline: +975-2-338089 · Thimphu', link: '/contact' },
    { text: 'Track Orders Worldwide with Authentic Craft Certification', link: '/track-order' },
  ]);
  const [currentTickerIdx, setCurrentTickerIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [secretaryPhone, setSecretaryPhone] = useState('+975-2-338089');
  const [secretaryEmail, setSecretaryEmail] = useState('officehab@gmail.com');
  const [topBarContactMode, setTopBarContactMode] = useState<'PHONE_ONLY' | 'EMAIL_ONLY' | 'BOTH' | 'OFF'>('PHONE_ONLY');
  const [visible, setVisible] = useState(true);
  const { language, toggleLanguage, t } = useLanguage();
  const isDz = language === 'dz';

  const textContainerRef = React.useRef<HTMLDivElement>(null);
  const textSpanRef = React.useRef<HTMLSpanElement>(null);
  const [overflowDist, setOverflowDist] = useState(0);

  useEffect(() => {
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((data) => {
        if (data?.setting) {
          if (data.setting.tickerMessages && Array.isArray(data.setting.tickerMessages) && data.setting.tickerMessages.length > 0) {
            setTickerMessages(data.setting.tickerMessages);
          } else if (data.setting.announcementText) {
            setTickerMessages([{ text: data.setting.announcementText, link: data.setting.announcementLink || undefined }]);
          }
          if (data.setting.secretaryPhone) setSecretaryPhone(data.setting.secretaryPhone);
          if (data.setting.secretaryEmail) setSecretaryEmail(data.setting.secretaryEmail);
          if (data.setting.topBarContactMode) setTopBarContactMode(data.setting.topBarContactMode);
          if (data.setting.isAnnouncementOn !== undefined) setVisible(Boolean(data.setting.isAnnouncementOn));
        }
      })
      .catch(() => {});

    const handleUpdate = (e: any) => {
      if (e.detail?.tickerMessages && Array.isArray(e.detail.tickerMessages)) {
        setTickerMessages(e.detail.tickerMessages);
      } else if (e.detail?.announcementText !== undefined) {
        setTickerMessages([{ text: e.detail.announcementText, link: e.detail.announcementLink || undefined }]);
      }
      if (e.detail?.secretaryPhone !== undefined) setSecretaryPhone(e.detail.secretaryPhone);
      if (e.detail?.secretaryEmail !== undefined) setSecretaryEmail(e.detail.secretaryEmail);
      if (e.detail?.topBarContactMode !== undefined) setTopBarContactMode(e.detail.topBarContactMode);
      if (e.detail?.isAnnouncementOn !== undefined) setVisible(Boolean(e.detail.isAnnouncementOn));
    };

    window.addEventListener('hab:header-updated', handleUpdate);
    window.addEventListener('hab:settings-updated', handleUpdate);
    return () => {
      window.removeEventListener('hab:header-updated', handleUpdate);
      window.removeEventListener('hab:settings-updated', handleUpdate);
    };
  }, []);

  // Automatic ticker roll (giving extra reading time when notice is long and marqueeing)
  useEffect(() => {
    if (isPaused || tickerMessages.length <= 1) return;
    const intervalTime = overflowDist > 0 ? 8500 : 5500;
    const timer = setInterval(() => {
      setCurrentTickerIdx((prev) => (prev + 1) % tickerMessages.length);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPaused, tickerMessages.length, overflowDist]);

  // Dynamically detect if the current notice text exceeds available container width
  useEffect(() => {
    const checkOverflow = () => {
      if (textContainerRef.current && textSpanRef.current) {
        const cW = textContainerRef.current.clientWidth;
        const sW = textSpanRef.current.scrollWidth;
        if (sW > cW + 4) {
          setOverflowDist(sW - cW + 28);
        } else {
          setOverflowDist(0);
        }
      }
    };

    const timer = setTimeout(checkOverflow, 80);
    window.addEventListener('resize', checkOverflow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [currentTickerIdx, tickerMessages]);

  if (!visible) return null;

  const currentItem = tickerMessages[currentTickerIdx] || tickerMessages[0];

  return (
    <div
      className="utility no-scrollbar relative"
      style={{
        overflow: 'hidden',
        height: 'var(--utility-h, 38px)',
        maxHeight: 'var(--utility-h, 38px)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <SectionEditBadge
        label="Utility Bar & Notice Ticker"
        studioHref="/admin/site-settings?tab=ANNOUNCEMENT"
        sectionType="utility-bar"
        className="top-0.5 right-2"
      />
      <div
        className="utility__inner no-scrollbar"
        style={{
          width: '100%',
          maxWidth: '100%',
          paddingLeft: 'clamp(12px, 2vw, 32px)',
          paddingRight: 'clamp(12px, 2vw, 32px)',
          overflowX: 'auto',
          overflowY: 'hidden',
          flexWrap: 'nowrap',
          height: '100%',
          maxHeight: 'var(--utility-h, 38px)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(8px, 1.2vw, 14px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Rolling / Scrolling Announcement Ticker with Maximum Available Space */}
        <div
          className="utility__status no-scrollbar flex items-center gap-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            overflow: 'hidden',
            minWidth: 0,
            flex: '1 1 auto',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-white/15 text-[#e6ca65] flex-shrink-0 uppercase select-none"
            style={{ letterSpacing: '0.06em' }}
          >
            {isDz ? 'གསལ་བསྒྲགས' : 'Notice'}
          </span>

          {tickerMessages.length > 1 && (
            <div className="flex items-center gap-1 mr-1 text-[10px] text-white/60 select-none flex-shrink-0">
              <button
                type="button"
                onClick={() => setCurrentTickerIdx((prev) => (prev === 0 ? tickerMessages.length - 1 : prev - 1))}
                aria-label="Previous announcement"
                className="hover:text-white transition-colors cursor-pointer px-0.5"
              >
                ‹
              </button>
              <span className="font-mono text-[9px] text-[#e6ca65]">
                {currentTickerIdx + 1}/{tickerMessages.length}
              </span>
              <button
                type="button"
                onClick={() => setCurrentTickerIdx((prev) => (prev + 1) % tickerMessages.length)}
                aria-label="Next announcement"
                className="hover:text-white transition-colors cursor-pointer px-0.5"
              >
                ›
              </button>
            </div>
          )}

          {/* Notice Text: Fully displayed with unconstrained width & smooth overflow scroll if needed */}
          <div
            ref={textContainerRef}
            className="flex-1 overflow-hidden relative"
            style={{ minWidth: 0 }}
          >
            <div
              className={`inline-block whitespace-nowrap ${overflowDist > 0 ? 'hab-ticker-marquee' : ''}`}
              style={{
                display: 'inline-block',
                whiteSpace: 'nowrap',
                color: '#fff',
                fontWeight: 500,
                transform: 'translateX(0)',
                animation: overflowDist > 0 ? 'habMarqueeShift 8.5s ease-in-out infinite alternate' : 'none',
                ['--overflow-dist' as any]: `-${overflowDist}px`,
              }}
            >
              {currentItem?.link ? (
                <Link
                  href={currentItem.link}
                  className="hover:underline transition-opacity duration-300"
                  title={currentItem.text}
                >
                  <span ref={textSpanRef}>{currentItem.text}</span>
                </Link>
              ) : (
                <span ref={textSpanRef} title={currentItem?.text}>
                  {currentItem?.text}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top Bar Secondary Navigation Menus */}
        <nav
          className="utility__links no-scrollbar"
          aria-label="Secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <Link href="/track-order" style={{ color: 'var(--brass, #e6ca65)', fontWeight: 600, flexShrink: 0 }} title="Track order">
            {isDz ? 'རྗེས་འདེད' : 'Track'}
          </Link>
          <Link href="/contact" style={{ flexShrink: 0 }} title="Contact us">
            {isDz ? 'འབྲེལ་གཏུག' : 'Contact'}
          </Link>
          <Link href="/tenders" style={{ flexShrink: 0 }} title="Tenders & Procurement">
            {isDz ? 'རིན་བསྡུར' : 'Tenders'}
          </Link>
          <Link href="/publications" style={{ flexShrink: 0 }} title="Reports & Publications">
            {isDz ? 'དཔེ་སྐྲུན' : 'Reports'}
          </Link>
          <Link href="/donate" style={{ flexShrink: 0 }} title="Donate & Support Artisans">
            {isDz ? 'ཞལ་འདེབས' : 'Donate'}
          </Link>
        </nav>

        {/* Right side items: Secretary Desk hotline, Wholesale, Language switcher */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Secretary Desk Official Line - Configurable: Phone Only, Email Only, Both, or Off */}
          {topBarContactMode !== 'OFF' && (
            <div
              className="utility__secretary-desk"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.85)',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                padding: '2px 7px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <span style={{ color: 'var(--brass, #e6ca65)', fontWeight: 600 }}>
                {isDz ? 'དྲུང་ཆེ:' : 'Desk:'}
              </span>
              {(topBarContactMode === 'PHONE_ONLY' || topBarContactMode === 'BOTH') && (
                <a
                  href={`tel:${secretaryPhone.replace(/\s+/g, '')}`}
                  style={{ color: '#fff', textDecoration: 'none' }}
                  title="Call Secretary Desk"
                >
                  {secretaryPhone}
                </a>
              )}
              {topBarContactMode === 'BOTH' && (
                <span style={{ opacity: 0.5 }}>·</span>
              )}
              {(topBarContactMode === 'EMAIL_ONLY' || topBarContactMode === 'BOTH') && (
                <a
                  href={`mailto:${secretaryEmail}`}
                  style={{ color: '#fff', textDecoration: 'none' }}
                  title="Email Secretary Desk"
                >
                  {secretaryEmail}
                </a>
              )}
            </div>
          )}

          <Link
            className="utility__trade inline-flex"
            href="/wholesale"
            style={{ flexShrink: 0, whiteSpace: 'nowrap', fontSize: '11px', padding: '2px 8px' }}
            title="Trade & Wholesale Buyers"
          >
            <span>{isDz ? 'ཚོང་འབྲེལ' : 'Wholesale'}</span>
          </Link>

          <span className="utility__rule inline-block" aria-hidden="true" style={{ flexShrink: 0, opacity: 0.5 }}></span>

          <button
            type="button"
            onClick={toggleLanguage}
            className="utility__lang"
            style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, font: 'inherit', color: 'inherit', whiteSpace: 'nowrap' }}
            title="Switch language / སྐད་ཡིག"
          >
            <span className={language === 'en' ? 'is-active' : ''}>EN</span>
            <span aria-hidden="true">/</span>
            <span className={language === 'dz' ? 'is-active' : ''} lang="dz">རྫོང་ཁ</span>
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import SectionEditBadge from '@/components/public/SectionEditBadge';

export default function UtilityBar() {
  const [tickerMessages, setTickerMessages] = useState<Array<{ text: string; link?: string }>>([
    { text: 'CSO/2011/043 · Handicrafts Association of Bhutan · Apex Civil Society Organization', link: '/about' },
    { text: 'Official Secretary Desk: +975-2-338089 · officehab@gmail.com', link: '/contact' },
    { text: 'Empowering 7,500+ rural artisans across all twenty Dzongkhags of Bhutan', link: '/about' },
    { text: 'Track orders worldwide with authentic craft certificates', link: '/track-order' },
  ]);
  const [currentTickerIdx, setCurrentTickerIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [secretaryPhone, setSecretaryPhone] = useState('+975-2-338089');
  const [secretaryEmail, setSecretaryEmail] = useState('officehab@gmail.com');
  const [topBarContactMode, setTopBarContactMode] = useState<'PHONE_ONLY' | 'EMAIL_ONLY' | 'BOTH' | 'OFF'>('PHONE_ONLY');
  const [visible, setVisible] = useState(true);
  const { language, toggleLanguage, t } = useLanguage();
  const isDz = language === 'dz';

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

  // Automatic ticker roll every 4.5 seconds
  useEffect(() => {
    if (isPaused || tickerMessages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentTickerIdx((prev) => (prev + 1) % tickerMessages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, tickerMessages.length]);

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
          overflowX: 'hidden',
          overflowY: 'hidden',
          flexWrap: 'nowrap',
          height: '100%',
          maxHeight: 'var(--utility-h, 38px)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        {/* Rolling / Scrolling Announcement Ticker */}
        <div
          className="utility__status no-scrollbar flex items-center gap-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: '220px',
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

          {currentItem?.link ? (
            <Link
              href={currentItem.link}
              className="hover:underline transition-opacity duration-300"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#fff',
                fontWeight: 500,
              }}
            >
              {currentItem.text}
            </Link>
          ) : (
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#fff',
                fontWeight: 500,
              }}
            >
              {currentItem?.text}
            </span>
          )}
        </div>

        {/* Secondary Links (Hidden on <= 1099px via CSS .utility__links{display:none}) */}
        <nav
          className="utility__links no-scrollbar"
          aria-label="Secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <Link href="/track-order" style={{ color: 'var(--brass)', fontWeight: 600, flexShrink: 0 }}>
            {isDz ? 'བཀའ་རྒྱའི་རྗེས་འདེད' : 'Track order'}
          </Link>
          <Link href="/contact" style={{ flexShrink: 0 }}>
            {isDz ? 'འབྲེལ་གཏུག' : 'Contact us'}
          </Link>
          <Link href="/tenders" style={{ flexShrink: 0 }}>
            {isDz ? 'རིན་བསྡུར' : 'Tenders'}
          </Link>
          <Link href="/publications" style={{ flexShrink: 0 }}>
            {isDz ? 'དཔེ་སྐྲུན' : 'Publications'}
          </Link>
          <Link href="/donate" style={{ flexShrink: 0 }}>
            {isDz ? 'ཞལ་འདེབས' : 'Donate'}
          </Link>
        </nav>

        {/* Secretary Desk Official Line - Configurable: Phone Only, Email Only, Both, or Off */}
        {topBarContactMode !== 'OFF' && (
          <div
            className="utility__secretary-desk"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.85)',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <span style={{ color: 'var(--brass, #e6ca65)', fontWeight: 600 }}>
              {isDz ? 'དྲུང་ཆེའི་ཡིག་ཚང:' : 'Secretary Desk:'}
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

        <Link className="utility__trade" href="/wholesale" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
          <span className="utility__trade-long">Trade &amp; wholesale buyers</span>
          <span className="utility__trade-short">Trade buyers</span>
        </Link>

        <span className="utility__rule" aria-hidden="true" style={{ flexShrink: 0 }}></span>

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
  );
}

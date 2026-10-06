'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function UtilityBar() {
  const [announcement, setAnnouncement] = useState('Registered CSO · CSO Act of Bhutan 2007');
  const [announcementLink, setAnnouncementLink] = useState<string | null>(null);
  const [secretaryPhone, setSecretaryPhone] = useState('+975-2-338089');
  const [secretaryEmail, setSecretaryEmail] = useState('officehab@gmail.com');
  const [visible, setVisible] = useState(true);
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((data) => {
        if (data?.setting) {
          if (data.setting.announcementText) setAnnouncement(data.setting.announcementText);
          if (data.setting.announcementLink) setAnnouncementLink(data.setting.announcementLink);
          if (data.setting.secretaryPhone) setSecretaryPhone(data.setting.secretaryPhone);
          if (data.setting.secretaryEmail) setSecretaryEmail(data.setting.secretaryEmail);
          if (data.setting.isAnnouncementOn !== undefined) setVisible(Boolean(data.setting.isAnnouncementOn));
        }
      })
      .catch(() => {});

    const handleUpdate = (e: any) => {
      if (e.detail?.announcementText !== undefined) setAnnouncement(e.detail.announcementText);
      if (e.detail?.announcementLink !== undefined) setAnnouncementLink(e.detail.announcementLink || null);
      if (e.detail?.secretaryPhone !== undefined) setSecretaryPhone(e.detail.secretaryPhone);
      if (e.detail?.secretaryEmail !== undefined) setSecretaryEmail(e.detail.secretaryEmail);
      if (e.detail?.isAnnouncementOn !== undefined) setVisible(Boolean(e.detail.isAnnouncementOn));
    };

    window.addEventListener('hab:header-updated', handleUpdate);
    return () => {
      window.removeEventListener('hab:header-updated', handleUpdate);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="utility no-scrollbar"
      style={{
        overflow: 'hidden',
        height: 'var(--utility-h, 38px)',
        maxHeight: 'var(--utility-h, 38px)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <div
        className="utility__inner no-scrollbar"
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          flexWrap: 'nowrap',
          height: '100%',
          maxHeight: 'var(--utility-h, 38px)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {announcementLink ? (
          <Link
            href={announcementLink}
            className="utility__status no-scrollbar"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              flex: '1 1 auto',
            }}
          >
            {announcement}
          </Link>
        ) : (
          <span
            className="utility__status no-scrollbar"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              flex: '1 1 auto',
            }}
          >
            {announcement}
          </span>
        )}

        <nav
          className="utility__links no-scrollbar"
          aria-label="Secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <Link href="/track-order" style={{ color: 'var(--brass)', fontWeight: 600, flexShrink: 0 }}>
            Track order
          </Link>
          <Link href="/contact" style={{ flexShrink: 0 }}>Contact us</Link>
          <Link href="/news" style={{ flexShrink: 0 }}>Tenders</Link>
          <Link href="/publications" style={{ flexShrink: 0 }}>Publications</Link>
          <Link href="/donate" style={{ flexShrink: 0 }}>Donate</Link>
        </nav>

        {/* Secretary Desk Official Line */}
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
          <span style={{ color: 'var(--brass, #e6ca65)', fontWeight: 600 }}>Secretary Desk:</span>
          <a
            href={`tel:${secretaryPhone.replace(/\s+/g, '')}`}
            style={{ color: '#fff', textDecoration: 'none' }}
            title="Call Secretary Desk"
          >
            {secretaryPhone}
          </a>
          <span style={{ opacity: 0.5 }}>·</span>
          <a
            href={`mailto:${secretaryEmail}`}
            style={{ color: '#fff', textDecoration: 'none' }}
            title="Email Secretary Desk"
          >
            {secretaryEmail}
          </a>
        </div>

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

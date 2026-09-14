'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function UtilityBar() {
  const [announcement, setAnnouncement] = useState('Registered CSO · CSO Act of Bhutan 2007');
  const [announcementLink, setAnnouncementLink] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((data) => {
        if (data?.setting) {
          if (data.setting.announcementText) setAnnouncement(data.setting.announcementText);
          if (data.setting.announcementLink) setAnnouncementLink(data.setting.announcementLink);
          if (data.setting.isAnnouncementOn !== undefined) setVisible(Boolean(data.setting.isAnnouncementOn));
        }
      })
      .catch(() => {});
  }, []);

  if (!visible) return null;

  return (
    <div className="utility" style={{ overflow: 'hidden' }}>
      <div className="utility__inner" style={{ overflow: 'hidden' }}>
        {announcementLink ? (
          <Link href={announcementLink} className="utility__status" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {announcement}
          </Link>
        ) : (
          <span className="utility__status" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {announcement}
          </span>
        )}
        <span className="utility__spacer"></span>
        <nav className="utility__links" aria-label="Secondary" style={{ overflow: 'hidden', flexShrink: 1 }}>
          <Link href="/track-order" style={{ color: 'var(--brass)', fontWeight: 600 }}>
            Track order
          </Link>
          <Link href="/contact">Contact us</Link>
          <Link href="/news">Tenders</Link>
          <Link href="/publications">Publications</Link>
          <Link href="/donate">Donate</Link>
        </nav>
        <Link className="utility__trade" href="/wholesale" style={{ flexShrink: 0 }}>
          <span className="utility__trade-long">Trade &amp; wholesale buyers</span>
          <span className="utility__trade-short">Trade buyers</span>
        </Link>
        <span className="utility__rule" aria-hidden="true" style={{ flexShrink: 0 }}></span>
        <button
          type="button"
          onClick={toggleLanguage}
          className="utility__lang"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, font: 'inherit', color: 'inherit' }}
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

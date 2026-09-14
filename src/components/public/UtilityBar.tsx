'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UtilityBar() {
  const [announcement, setAnnouncement] = useState('Registered CSO · CSO Act of Bhutan 2007');
  const [announcementLink, setAnnouncementLink] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

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
    <div className="utility">
      <div className="utility__inner">
        {announcementLink ? (
          <Link href={announcementLink} className="utility__status">
            {announcement}
          </Link>
        ) : (
          <span className="utility__status">{announcement}</span>
        )}
        <span className="utility__spacer"></span>
        <nav className="utility__links" aria-label="Secondary">
          <Link href="/track-order">Track order</Link>
          <Link href="/account">My account</Link>
          <Link href="/contact">Contact us</Link>
          <Link href="/news">Tenders &amp; vacancies</Link>
          <Link href="/publications">Publications</Link>
          <Link href="/donate">Donate</Link>
        </nav>
        <Link className="utility__trade" href="/wholesale">
          <span className="utility__trade-long">Trade &amp; wholesale buyers</span>
          <span className="utility__trade-short">Trade buyers</span>
        </Link>
        <span className="utility__rule" aria-hidden="true"></span>
        <span className="utility__lang">
          <span className="is-active">EN</span>
          <span aria-hidden="true">/</span>
          <span lang="dz">རྫོང་ཁ</span>
        </span>
      </div>
    </div>
  );
}

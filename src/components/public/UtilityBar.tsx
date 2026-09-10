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
    <div className="bg-[#33261F] text-[#D2C2AE]">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 min-h-[36px] flex items-center justify-between gap-4 font-mono text-[10.5px] sm:text-[11px] tracking-[0.04em]">
        {announcementLink ? (
          <Link href={announcementLink} className="text-[#F4F0E7] hover:underline truncate text-[10px] sm:text-[11px]">
            {announcement}
          </Link>
        ) : (
          <span className="text-[#F4F0E7] truncate text-[10px] sm:text-[11px]">
            {announcement}
          </span>
        )}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:flex items-center gap-4">
            <Link href="/contact" className="text-[#D2C2AE] hover:text-white whitespace-nowrap">
              Contact us
            </Link>
            <Link href="/news" className="text-[#D2C2AE] hover:text-white whitespace-nowrap">
              Tenders &amp; vacancies
            </Link>
            <Link href="/publications" className="text-[#D2C2AE] hover:text-white whitespace-nowrap">
              Publications
            </Link>
            <Link href="/donate" className="text-[#D2C2AE] hover:text-white whitespace-nowrap">
              Donate
            </Link>
          </div>
          <Link
            href="/wholesale"
            className="inline-flex items-center text-[#C9A46A] hover:text-[#F4F0E7] whitespace-nowrap text-[10px] sm:text-[11px]"
          >
            <span className="hidden sm:inline">Trade &amp; wholesale buyers</span>
            <span className="sm:hidden">Trade buyers</span>
          </Link>
          <div className="hidden sm:block w-[1px] h-[13px] bg-[#4E3D2E]" />
          <span className="whitespace-nowrap text-[10px] sm:text-[11px]">
            <span className="text-[#F4F0E7] font-semibold">EN</span>
            <span className="opacity-50 mx-1">/</span>
            <span className="text-[#D2C2AE]">རྫོང་ཁ</span>
          </span>
        </div>
      </div>
    </div>
  );
}

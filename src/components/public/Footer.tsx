'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';

export default function Footer() {
  const { currency } = useCurrency();
  const [settings, setSettings] = useState({
    officeAddress: 'Metog Lam, Thimphu, Bhutan',
    officePhone: '+975-2-338089',
    edPhone: '+975-77654508',
    marketingPhone: '+975-17462636 / 17881111',
    officialEmail: 'officehab@gmail.com',
    csoRegistration: 'CSO Registration: CSO/2011/043 · Thimphu, Kingdom of Bhutan',
    copyrightText: '© 2026 Handicrafts Association of Bhutan. All rights reserved.',
    footerAbout: 'A registered Civil Society Organization under the CSO Act of Bhutan 2007. Established 2005.',
  });

  const [footerCols, setFooterCols] = useState([
    {
      title: "Organization",
      links: [
        { label: "About HAB", href: "/about" },
        { label: "Our Mandate & AoA", href: "/programmes" },
        { label: "Strategic Projects", href: "/projects" },
        { label: "Contact Secretariat", href: "/contact" },
      ]
    },
    {
      title: "Shop & support",
      links: [
        { label: "E-shop", href: "/shop" },
        { label: "Shipping & Customs", href: "/shipping" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Track your order", href: "/track-order" },
      ]
    },
    {
      title: "Members",
      links: [
        { label: "Directory by category", href: "/members" },
        { label: "Publications", href: "/publications" },
        { label: "Member shops", href: "/shop" },
        { label: "Apply to join", href: "/membership/apply" },
      ]
    },
    {
      title: "Governance",
      links: [
        { label: "Board of Trustees", href: "/about#governance" },
        { label: "Secretariat", href: "/about#governance" },
        { label: "Annual reports", href: "/publications" },
        { label: "Audited accounts", href: "/publications" },
        { label: "Tenders & vacancies", href: "/news" },
      ]
    }
  ]);

  useEffect(() => {
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((data) => {
        if (data?.setting) {
          setSettings((prev) => ({
            ...prev,
            ...data.setting,
          }));
        }
      })
      .catch(() => {});

    fetch('/api/navigation')
      .then((r) => r.json())
      .then((data) => {
        if (data?.footer && typeof data.footer === 'object') {
          const cols = Object.keys(data.footer).map((colTitle) => ({
            title: colTitle,
            links: data.footer[colTitle].map((l: any) => ({
              label: l.label,
              href: l.href,
            })),
          }));
          if (cols.length > 0) {
            setFooterCols(cols);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-[#33261F] text-[#D2C2AE] pt-12 sm:pt-16 pb-[34px] mt-0">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.35fr_repeat(4,1fr)] gap-8 lg:gap-[34px]">
        <div className="sm:col-span-2 md:col-span-1">
          <div className="mb-4">
            <img
              src="/assets/hab-logo-footer.png"
              alt="Handicrafts Association of Bhutan"
              className="h-[44px] w-auto object-contain"
              onError={(e: any) => {
                e.currentTarget.style.display = 'none';
                const fb = e.currentTarget.nextElementSibling;
                if (fb) fb.style.display = 'flex';
              }}
            />
            <div style={{ display: 'none' }} className="items-center gap-[11px]">
              <div className="w-9 h-9 rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-figtree font-extrabold text-[13px]">
                HAB
              </div>
              <div className="font-figtree font-bold text-[14.5px] text-[#efeae1]">
                Handicrafts Association of Bhutan
              </div>
            </div>
          </div>
          <p className="text-[14px] sm:text-[14.5px] leading-[1.6] mb-[18px] max-w-[38ch] font-lora text-[#D2C2AE]">
            {settings.footerAbout}
          </p>
          <div className="font-mono text-[11.5px] leading-[1.9] text-[#D2C2AE]">
            {settings.officeAddress}<br />
            Office: {settings.officePhone}<br />
            Director: {settings.edPhone}<br />
            Marketing: {settings.marketingPhone}<br />
            {settings.officialEmail}
          </div>
        </div>

        {footerCols.map((col) => (
          <div key={col.title}>
            <div className="font-figtree font-bold text-[13.5px] text-[#efeae1] tracking-[0.02em] mb-[14px]">
              {col.title}
            </div>
            <div className="flex flex-col gap-[9px]">
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[14px] sm:text-[14.5px] text-[#D2C2AE] hover:text-white transition-colors duration-150 font-lora"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-[1280px] w-full mx-auto mt-[34px] px-4 sm:px-6 lg:px-10 pt-[22px] border-t border-[#463629] flex flex-col sm:flex-row justify-between font-mono text-[10.5px] sm:text-[11px] gap-3 text-[#A8947F]">
        <span>
          {settings.copyrightText} · {settings.csoRegistration}
        </span>
        <span>
          Prices shown in {currency === 'USD' ? 'USD $' : 'BTN Nu.'} · Payments by card, mBoB and bank transfer
        </span>
      </div>
    </footer>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import UniversalLiveSectionEditor from '@/components/public/UniversalLiveSectionEditor';

export default function Footer() {
  const { currency } = useCurrency();
  const [liveEditOpen, setLiveEditOpen] = useState(false);
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
      title: "Association",
      links: [
        { label: "About HAB", href: "/about" },
        { label: "Programmes", href: "/programmes" },
        { label: "Projects", href: "/projects" },
        { label: "Membership", href: "/membership" },
        { label: "News & events", href: "/news" },
        { label: "Contact us", href: "/contact" },
      ]
    },
    {
      title: "Shop & support",
      links: [
        { label: "E-shop", href: "/shop" },
        { label: "Wholesale & bulk orders", href: "/wholesale" },
        { label: "Shipping & delivery policy", href: "/shipping-policy" },
        { label: "Returns & refunds policy", href: "/shipping-policy#returns" },
        { label: "Track your order", href: "/track-order" },
        { label: "Duties & customs policy", href: "/shipping-policy#duty" },
      ]
    },
    {
      title: "Members",
      links: [
        { label: "Directory by category", href: "/membership" },
        { label: "Publications", href: "/publications" },
        { label: "Member shops & clusters", href: "/outlets" },
        { label: "Member login", href: "/membership#login" },
        { label: "Apply to join", href: "/register" },
      ]
    },
    {
      title: "Governance",
      links: [
        { label: "Board of Trustees", href: "/about" },
        { label: "Secretariat", href: "/about" },
        { label: "Annual reports", href: "/publications" },
        { label: "Audited accounts", href: "/publications" },
        { label: "Tenders & vacancies", href: "/news" },
        { label: "Terms of service", href: "/terms" },
        { label: "Privacy policy", href: "/privacy" },
      ]
    }
  ]);

  useEffect(() => {
    const loadSettings = () => {
      fetch('/api/site-settings', { cache: 'no-store' })
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
    };

    loadSettings();

    const loadNav = () => {
      fetch('/api/navigation', { cache: 'no-store' })
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
    };

    loadNav();

    const handleUpdate = (e: any) => {
      if (e?.detail) {
        setSettings((prev: any) => ({ ...prev, ...e.detail }));
      } else {
        loadSettings();
      }
    };

    window.addEventListener('hab:settings-updated', handleUpdate);
    window.addEventListener('hab:header-updated', loadNav);
    return () => {
      window.removeEventListener('hab:settings-updated', handleUpdate);
      window.removeEventListener('hab:header-updated', loadNav);
    };
  }, []);

  const hasSocial = Boolean(
    (settings as any).facebookUrl ||
    (settings as any).instagramUrl ||
    (settings as any).twitterUrl ||
    (settings as any).youtubeUrl ||
    (settings as any).tiktokUrl
  );

  return (
    <footer className="footer relative" id="contact" data-hab-section="footer">
      <SectionEditBadge
        label="Footer & Global Settings"
        studioHref="/admin/site-settings?tab=FOOTER"
        onQuickEdit={() => setLiveEditOpen(true)}
        className="top-4 right-4 sm:right-8 z-50"
      />
      <div className="signoff">
        <div className="signoff__inner">
          <Link className="signoff__logo" href="/" aria-label="Handicrafts Association of Bhutan — home">
            <img className="logo__img" src="/assets/hab-logo-footer.png" alt="Handicrafts Association of Bhutan" width="3412" height="1296" />
          </Link>
          <div className="signoff__text">
            <p className="signoff__name">Handicrafts Association of Bhutan</p>
            <p className="signoff__line">{settings.footerAbout}</p>
          </div>
          {hasSocial && (
            <div className="signoff__social">
              {(settings as any).facebookUrl && (
                <a className="social__link" href={(settings as any).facebookUrl} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              )}
              {(settings as any).instagramUrl && (
                <a className="social__link" href={(settings as any).instagramUrl} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              )}
              {(settings as any).twitterUrl && (
                <a className="social__link" href={(settings as any).twitterUrl} target="_blank" rel="noopener noreferrer">
                  X
                </a>
              )}
              {(settings as any).youtubeUrl && (
                <a className="social__link" href={(settings as any).youtubeUrl} target="_blank" rel="noopener noreferrer">
                  YouTube
                </a>
              )}
              {(settings as any).tiktokUrl && (
                <a className="social__link" href={(settings as any).tiktokUrl} target="_blank" rel="noopener noreferrer">
                  TikTok
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="footer__inner">
        <div className="footer__brand">
          <h2 className="footer__title">Secretariat</h2>
          <address className="footer__contact" style={{ fontStyle: 'normal' }}>
            <span>{settings.officeAddress}</span><br />
            <span>Office {settings.officePhone}</span><br />
            <a href={`mailto:${settings.officialEmail}`}>{settings.officialEmail}</a>
          </address>
        </div>

        {footerCols.map((col) => (
          <nav key={col.title} className="footer__col" aria-label={col.title}>
            <h2 className="footer__title">{col.title}</h2>
            {col.links.map((link) => (
              <Link key={link.label} href={link.href}>{link.label}</Link>
            ))}
          </nav>
        ))}
      </div>

      <div className="footer__bar">
        <span>{settings.copyrightText || '© 2026 Handicrafts Association of Bhutan. All rights reserved. · Registration CSO/2011/043'}</span>
        <span>Prices shown in <span>{currency === 'USD' ? 'USD $' : 'BTN Nu.'}</span> · Payments by card, mBoB and bank transfer</span>
      </div>

      <UniversalLiveSectionEditor
        isOpen={liveEditOpen}
        onClose={() => setLiveEditOpen(false)}
        sectionType="footer"
        sectionTitle="Footer, Policies & Social Links"
        studioHref="/admin/site-settings?tab=FOOTER"
        onSaved={(updated) => {
          if (updated) setSettings((prev) => ({ ...prev, ...updated }));
        }}
      />
    </footer>
  );
}

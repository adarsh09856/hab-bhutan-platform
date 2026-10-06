'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import UniversalLiveSectionEditor from '@/components/public/UniversalLiveSectionEditor';

const FOOTER_TRANSLATIONS: Record<string, string> = {
  "Association": "ཚོགས་པ",
  "Shop & support": "ཚོང་ཁང་དང་རྒྱབ་སྐྱོར",
  "Members": "འཐུས་མི",
  "Governance": "འཛིན་སྐྱོང",
  "About HAB": "ང་བཅས་ཀྱི་སྐོར",
  "Programmes": "ལས་རིམ",
  "Projects": "ལས་འགུལ",
  "Membership": "འཐུས་མི",
  "News & events": "གནས་ཚུལ",
  "Contact us": "འབྲེལ་གཏུག",
  "E-shop": "གློག་རྡུལ་ཚོང་ཁང",
  "Wholesale & bulk orders": "སྡེབ་ཚོང་དང་བཀའ་རྒྱ་ཆེན་པོ",
  "Shipping & delivery policy": "སྐྱེལ་འདྲེན་སྲིད་བྱུས",
  "Returns & refunds policy": "ལོག་སྤྲོད་དང་དངུལ་ལོག་སྲིད་བྱུས",
  "Track your order": "བཀའ་རྒྱའི་རྗེས་འདེད",
  "Duties & customs policy": "འགག་སྒོའི་སྲིད་བྱུས",
  "Directory by category": "འཐུས་མིའི་དཀར་ཆག",
  "Publications": "དཔེ་སྐྲུན",
  "Member shops & clusters": "འཐུས་མིའི་ཚོང་ཁང་དང་གླིང",
  "Member login": "འཐུས་མི་ནང་འཛུལ",
  "Apply to join": "འཐུས་མིའི་ཞུ་བ་ཕུལ",
  "Board of Trustees": "འཛིན་སྐྱོང་ལྷན་ཚོགས",
  "Secretariat": "དྲུང་ཆེའི་ཡིག་ཚང",
  "Secretariat Desk": "དྲུང་ཆེའི་ཡིག་ཚང",
  "Secretary Desk": "དྲུང་ཆེའི་ཡིག་ཚང",
  "Website Policies & Standards": "དྲ་ཚིགས་ཀྱི་སྲིད་བྱུས་དང་ཚད་གཞི",
};

export default function Footer() {
  const { currency } = useCurrency();
  const { language } = useLanguage();
  const isDz = language === 'dz';
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
          <h2 className="footer__title">{isDz ? 'དྲུང་ཆེའི་ཡིག་ཚང' : 'Secretariat'}</h2>
          <address className="footer__contact" style={{ fontStyle: 'normal' }}>
            <span>{isDz ? 'མེ་ཏོག་ལམ ཐིམ་ཕུག འབྲུག' : settings.officeAddress}</span><br />
            <span>{isDz ? 'ཡིག་ཚང' : 'Office'} {settings.officePhone}</span><br />
            <a href={`mailto:${settings.officialEmail}`}>{settings.officialEmail}</a>
            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
              <span style={{ color: 'var(--brass, #e6ca65)', fontWeight: 600, fontSize: '11.5px', display: 'block' }}>
                {isDz ? 'དྲུང་ཆེའི་ཡིག་ཚང' : 'Secretary Desk'}
              </span>
              <a href={`tel:${((settings as any).secretaryPhone || settings.officePhone || '+975-2-338089').replace(/\s+/g, '')}`} style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', display: 'block', fontSize: '12px' }}>
                {((settings as any).secretaryPhone || settings.officePhone || '+975-2-338089')}
              </a>
              <a href={`mailto:${(settings as any).secretaryEmail || settings.officialEmail || 'officehab@gmail.com'}`} style={{ color: 'var(--brass, #e6ca65)', textDecoration: 'none', display: 'block', fontSize: '12px' }}>
                {(settings as any).secretaryEmail || settings.officialEmail || 'officehab@gmail.com'}
              </a>
            </div>
          </address>
        </div>

        {footerCols.map((col) => {
          const colTitle = isDz ? (FOOTER_TRANSLATIONS[col.title] || col.title) : col.title;
          return (
            <nav key={col.title} className="footer__col" aria-label={colTitle}>
              <h2 className="footer__title">{colTitle}</h2>
              {col.links.map((link) => {
                const linkText = isDz ? (FOOTER_TRANSLATIONS[link.label] || link.label) : link.label;
                return (
                  <Link key={link.label} href={link.href}>{linkText}</Link>
                );
              })}
            </nav>
          );
        })}
      </div>

      <div className="footer__bar">
        <span>{settings.copyrightText || '© 2026 Handicrafts Association of Bhutan. All rights reserved. · Registration CSO/2011/043'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span>
            {isDz
              ? `རིན་གོང་ ${currency === 'USD' ? 'ཨ་རིའི་ཌོ་ལར $' : 'དངུལ་ཀྲམ Nu.'} ནང་སྟོན་ཡོད · དངུལ་སྤྲོད་ ཀརཌི་ mBoB དང་ BNB ཐོག་ལས་བཏུབ`
              : `Prices shown in ${currency === 'USD' ? 'USD $' : 'BTN Nu.'} · Payments by card, mBoB and bank transfer`}
          </span>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('hab:open-policy-modal'));
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brass, #e6ca65)',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: 'inherit',
              padding: 0,
            }}
          >
            {isDz ? 'དྲ་ཚིགས་ཀྱི་སྲིད་བྱུས་དང་ཚད་གཞི' : 'Website Policies & Standards'}
          </button>
        </div>
      </div>

      <UniversalLiveSectionEditor
        isOpen={liveEditOpen}
        onClose={() => setLiveEditOpen(false)}
        sectionType="footer"
        sectionTitle="Footer, Columns & Global Settings"
        studioHref="/admin/navigation"
        onSaved={(updated) => {
          if (updated) setSettings((prev) => ({ ...prev, ...updated }));
        }}
      />
    </footer>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import UniversalLiveSectionEditor from '@/components/public/UniversalLiveSectionEditor';

const FOOTER_TRANSLATIONS: Record<string, string> = {
  // Columns
  "Association": "ཚོགས་པ",
  "Organization": "སྒྲིག་འཛུགས",
  "Shop & support": "ཚོང་ཁང་དང་རྒྱབ་སྐྱོར",
  "Shop & Support": "ཚོང་ཁང་དང་རྒྱབ་སྐྱོར",
  "Members": "འཐུས་མི",
  "Governance": "འཛིན་སྐྱོང",
  "General": "སྤྱིར་བཏང",

  // Organization & Association links
  "About HAB": "ང་བཅས་ཀྱི་སྐོར",
  "About Us": "ང་བཅས་ཀྱི་སྐོར",
  "Our Mandate & AoA": "ང་བཅས་ཀྱི་ལས་འགན་དང་རྩ་ཁྲིམས",
  "Our Mandate": "ང་བཅས་ཀྱི་ལས་འགན",
  "Mandate & AoA": "ལས་འགན་དང་རྩ་ཁྲིམས",
  "Code of Ethics": "ཚུལ་ཁྲིམས་དང་སྒྲིག་ལམ",
  "Strategic Plan": "ཐབས་བྱུས་འཆར་གཞི",
  "Contact secretariat": "དྲུང་ཆེའི་ཡིག་ཚང་འབྲེལ་གཏུག",
  "Contact Secretariat": "དྲུང་ཆེའི་ཡིག་ཚང་འབྲེལ་གཏུག",
  "Programmes": "ལས་རིམ",
  "Projects": "ལས་འགུལ",
  "Membership": "འཐུས་མིའི་སྐོར",
  "News & events": "གནས་ཚུལ་དང་མཛད་སྒོ",
  "News & Events": "གནས་ཚུལ་དང་མཛད་སྒོ",
  "Contact us": "འབྲེལ་གཏུག",
  "Contact Us": "འབྲེལ་གཏུག",

  // Shop & Support links
  "E-shop": "གློག་རྡུལ་ཚོང་ཁང",
  "Shop": "ཚོང་ཁང",
  "Wholesale & bulk orders": "སྡེབ་ཚོང་དང་བཀའ་རྒྱ་ཆེན་པོ",
  "Wholesale": "སྡེབ་ཚོང",
  "Shipping & delivery policy": "སྐྱེལ་འདྲེན་སྲིད་བྱུས",
  "Shipping & delivery": "སྐྱེལ་འདྲེན་སྲིད་བྱུས",
  "Shipping policy": "སྐྱེལ་འདྲེན་སྲིད་བྱུས",
  "Returns & refunds policy": "ལོག་སྤྲོད་དང་དངུལ་ལོག་སྲིད་བྱུས",
  "Returns & refunds": "ལོག་སྤྲོད་དང་དངུལ་ལོག་སྲིད་བྱུས",
  "Returns": "ལོག་སྤྲོད་དང་དངུལ་ལོག",
  "Track your order": "བཀའ་རྒྱའི་རྗེས་འདེད",
  "Track order": "བཀའ་རྒྱའི་རྗེས་འདེད",
  "Duties & customs policy": "འགག་སྒོའི་སྲིད་བྱུས",
  "Duty & customs": "འགག་སྒོའི་སྲིད་བྱུས",

  // Members links
  "Directory by category": "འཐུས་མིའི་དཀར་ཆག",
  "Publications": "དཔེ་སྐྲུན",
  "Publications & downloads": "དཔེ་སྐྲུན་དང་ཕབ་ལེན",
  "Member shops & clusters": "འཐུས་མིའི་ཚོང་ཁང་དང་ལག་བཟོའི་གླིང",
  "Member shops & outlets": "འཐུས་མིའི་ཚོང་ཁང་ཚུ",
  "Craft clusters": "ལག་བཟོའི་གླིང",
  "Member login": "འཐུས་མི་ནང་འཛུལ",
  "Apply to join": "འཐུས་མིའི་ཞུ་བ་ཕུལ",
  "Register as member": "འཐུས་མི་ཐོ་བཀོད",

  // Governance links
  "Board of Trustees": "འཛིན་སྐྱོང་ལྷན་ཚོགས",
  "Secretariat": "དྲུང་ཆེའི་ཡིག་ཚང",
  "Secretariat Desk": "དྲུང་ཆེའི་ཡིག་ཚང",
  "Secretary Desk": "དྲུང་ཆེའི་ཡིག་ཚང",
  "Annual reports": "ལོ་བསྟར་སྙན་ཞུ",
  "Audited accounts": "རྩིས་ཞིབ་སྙན་ཞུ",
  "Tenders & vacancies": "རིན་བསྡུར་དང་ལས་གནས",
  "Tenders & procurement": "རིན་བསྡུར་དང་མཁོ་སྒྲུབ",
  "Tenders": "རིན་བསྡུར",
  "Terms of service": "ཞབས་ཏོག་གནས་སྟངས",
  "Terms & conditions": "གནས་སྟངས་དང་ཆ་རྐྱེན",
  "Terms & Conditions": "གནས་སྟངས་དང་ཆ་རྐྱེན",
  "Privacy policy": "གསང་རྒྱའི་སྲིད་བྱུས",
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

  const translateText = (text: string) => {
    if (!isDz || !text) return text;
    if (FOOTER_TRANSLATIONS[text]) return FOOTER_TRANSLATIONS[text];
    const clean = text.trim();
    if (FOOTER_TRANSLATIONS[clean]) return FOOTER_TRANSLATIONS[clean];
    const key = Object.keys(FOOTER_TRANSLATIONS).find(
      (k) => k.toLowerCase() === clean.toLowerCase()
    );
    if (key) return FOOTER_TRANSLATIONS[key];
    return text;
  };

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
        { label: "Returns & refunds policy", href: "/returns-policy" },
        { label: "Track your order", href: "/track-order" },
        { label: "Duties & customs policy", href: "/customs-policy" },
      ]
    },
    {
      title: "Members",
      links: [
        { label: "Directory by category", href: "/members" },
        { label: "Publications", href: "/publications" },
        { label: "Member shops & clusters", href: "/outlets" },
        { label: "Member login", href: "/login" },
        { label: "Apply to join", href: "/register" },
      ]
    },
    {
      title: "Governance",
      links: [
        { label: "Board of Trustees", href: "/board-of-trustees" },
        { label: "Secretariat", href: "/secretariat" },
        { label: "Annual reports", href: "/annual-reports" },
        { label: "Audited accounts", href: "/audited-accounts" },
        { label: "Tenders & vacancies", href: "/tenders" },
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

    const normalizeHref = (label: string, href: string) => {
      const l = (label || '').toLowerCase();
      const h = (href || '').toLowerCase();

      // Mandate & AoA
      if (l.includes('mandate') || l.includes('aoa') || h.includes('#mandate')) return '/mandate';

      // Ethics
      if (l.includes('ethic') || h.includes('#ethics')) return '/code-of-ethics';

      // Strategic plan
      if (l.includes('strategic') || h.includes('strategic')) return '/strategic-plan';

      // Secretariat / Contact secretariat
      if (l.includes('contact secretariat') || l === 'secretariat' || h.includes('#secretariat') || h.includes('#contact')) return '/secretariat';

      // Board
      if (l.includes('board of trustees') || l === 'board' || h.includes('#board') || h.includes('#governance')) return '/board-of-trustees';

      // Shipping & delivery
      if ((l.includes('shipping') || l.includes('delivery')) && !l.includes('return')) return '/shipping-policy';

      // Returns & refunds
      if (l.includes('return') || l.includes('refund') || h.includes('#returns') || (h.includes('#support') && l.includes('return'))) return '/returns-policy';

      // Duties & customs
      if (l.includes('custom') || l.includes('dut') || h.includes('#duty') || (h.includes('#support') && (l.includes('duty') || l.includes('custom')))) return '/customs-policy';

      // Annual reports
      if (l.includes('annual report') || h.includes('kind=annual')) return '/annual-reports';

      // Audited accounts
      if (l.includes('audited account') || h.includes('kind=audited')) return '/audited-accounts';

      // Directory / members / login / tenders
      if (l.includes('directory')) return '/members';
      if (l === 'member login') return '/login';
      if (l.includes('tender')) return '/tenders';

      // Direct checks on specific href strings
      if (href && href.startsWith('/shipping-policy#returns')) return '/returns-policy';
      if (href && href.startsWith('/shipping-policy#duty')) return '/customs-policy';
      if (href && href.startsWith('/about#board')) return '/board-of-trustees';
      if (href && href.startsWith('/about#secretariat')) return '/secretariat';
      if (href && href.startsWith('/about#mandate')) return '/mandate';
      if (href && href.startsWith('/about#ethics')) return '/code-of-ethics';
      if (href && href.startsWith('/about#contact')) return '/secretariat';
      if (href && href.startsWith('/about#support')) {
        if (l.includes('return')) return '/returns-policy';
        if (l.includes('custom') || l.includes('dut')) return '/customs-policy';
        return '/shipping-policy';
      }

      return href;
    };

    const loadNav = () => {
      fetch('/api/navigation', { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => {
          if (data?.footer && typeof data.footer === 'object') {
            const cols = Object.keys(data.footer).map((colTitle) => ({
              title: colTitle,
              links: data.footer[colTitle].map((l: any) => ({
                label: l.label,
                href: normalizeHref(l.label, l.href),
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

  const socialLinks = [
    { label: 'Facebook', url: (settings as any).facebookUrl },
    { label: 'Instagram', url: (settings as any).instagramUrl },
    { label: 'X', url: (settings as any).twitterUrl },
    { label: 'YouTube', url: (settings as any).youtubeUrl },
    { label: 'TikTok', url: (settings as any).tiktokUrl },
  ].filter((item) => typeof item.url === 'string' && /^https?:\/\//i.test(item.url));

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
            <p className="signoff__name">{isDz ? 'འབྲུག་གི་ལག་བཟོ་ཚོགས་པ' : 'Handicrafts Association of Bhutan'}</p>
            <p className="signoff__line">
              {isDz
                ? 'འབྲུག་གི་ལག་བཟོ་ཚོགས་པ་ (HAB) འདི་ སྤྱི་ལོ་ ༢༠༠༥ ལུ་གཞི་བཙུགས་འབད་ཡོདཔ་དང་ སྤྱི་ཚོགས་ལས་ཚོགས་ཁྲིམས་ཡིག་ ༢༠༠༧ གྱི་འོག་ལུ་ དེབ་སྐྱེལ་འབད་ཡོད་པའི་ མི་མང་ཕན་བདེ་ལས་ཚོགས་ཨིན།'
                : settings.footerAbout}
            </p>
          </div>
          {socialLinks.length > 0 && <div className="signoff__social">
            {socialLinks.map(({ label, url }) => (
              <a key={label} className="social__link" href={url} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ))}
          </div>}
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
          const colTitle = translateText(col.title);
          return (
            <nav key={col.title} className="footer__col" aria-label={colTitle}>
              <h2 className="footer__title">{colTitle}</h2>
              {col.links.map((link) => {
                const linkText = translateText(link.label);
                return (
                  <Link key={link.label} href={link.href}>{linkText}</Link>
                );
              })}
            </nav>
          );
        })}
      </div>

      <div className="footer__bar">
        <span>
          {isDz
            ? '© ༢༠༢༦ འབྲུག་གི་ལག་བཟོ་ཚོགས་པ། ཐོབ་དབང་ཆ་མཉམ་ཡོད། · དེབ་སྐྱེལ་ CSO/2011/043'
            : (settings.copyrightText || '© 2026 Handicrafts Association of Bhutan. All rights reserved. · Registration CSO/2011/043')}
        </span>
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

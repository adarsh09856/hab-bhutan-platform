'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Edit3,
  ExternalLink,
  Sliders,
  Image as ImageIcon,
  Type,
  Link2,
  Plus,
  Trash2,
  BarChart2,
  ShieldCheck,
  Users,
  Sparkles,
  Columns,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import FileUploadInput from '@/components/admin/FileUploadInput';

const STATIC_SYSTEM_PAGES = [
  { label: 'Homepage', href: '/', category: 'Core Pages' },
  { label: 'About Us & Leadership', href: '/about', category: 'Core Pages' },
  { label: 'Programmes (A–K Pillars)', href: '/programmes', category: 'Core Pages' },
  { label: 'Donor Projects', href: '/projects', category: 'Core Pages' },
  { label: 'News & Announcements', href: '/news', category: 'Core Pages' },
  { label: 'Contact Us', href: '/contact', category: 'Core Pages' },
  { label: 'Donate to Artisans', href: '/donate', category: 'Core Pages' },
  { label: 'Punakha Riverfront Outlet', href: '/punakha', category: 'Core Pages' },
  { label: 'E-Shop (Catalog)', href: '/shop', category: 'Shop & Support' },
  { label: 'Wholesale & B2B Trade', href: '/wholesale', category: 'Shop & Support' },
  { label: 'Shipping & Delivery Policy', href: '/shipping-policy', category: 'Shop & Support' },
  { label: 'Returns & Refunds Policy', href: '/shipping-policy#returns', category: 'Shop & Support' },
  { label: 'Track Order', href: '/track-order', category: 'Shop & Support' },
  { label: 'Customs & Duty Information', href: '/shipping-policy#duty', category: 'Shop & Support' },
  { label: 'Artisans Directory by Category', href: '/membership', category: 'Members & Network' },
  { label: 'Publications & Annual Reports', href: '/publications', category: 'Members & Network' },
  { label: 'Craft Shops & Clusters Map', href: '/outlets', category: 'Members & Network' },
  { label: 'Apply to Join HAB', href: '/register', category: 'Members & Network' },
  { label: 'Member Portal Login', href: '/membership#login', category: 'Members & Network' },
  { label: 'All Statutory Policies Directory', href: '/policies', category: 'Governance & Policies' },
  { label: 'Terms of Service & AoA 2026', href: '/terms', category: 'Governance & Policies' },
  { label: 'Privacy & Data Protection Policy', href: '/privacy', category: 'Governance & Policies' },
];

export type SectionType =
  | 'hero'
  | 'stats'
  | 'buy'
  | 'about'
  | 'assurances'
  | 'membership'
  | 'about-page'
  | 'donate'
  | 'contact'
  | 'policies'
  | 'punakha'
  | 'footer'
  | 'programmes'
  | 'wholesale'
  | 'clusters'
  | 'masters'
  | 'news'
  | 'events'
  | 'publications'
  | 'outlets';

interface UniversalLiveSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: SectionType;
  sectionTitle?: string;
  studioHref?: string;
  onSaved?: (updatedSettings: any) => void;
}

export default function UniversalLiveSectionEditor({
  isOpen,
  onClose,
  sectionType,
  sectionTitle,
  studioHref,
  onSaved,
}: UniversalLiveSectionEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Active tab within the section editor (e.g. Content, Actions, Media/Stats, Columns)
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'ACTIONS' | 'MEDIA' | 'STATS' | 'COLUMNS'>('CONTENT');

  // Form Fields State (covers SiteSettings fields)
  const [form, setForm] = useState<Record<string, any>>({});

  // Hero Slides (if hero section)
  const [slides, setSlides] = useState<any[]>([]);

  // Footer Navigation State (if sectionType === 'footer')
  const [footerNavItems, setFooterNavItems] = useState<any[]>([]);
  const [deletedNavIds, setDeletedNavIds] = useState<string[]>([]);
  const [selectedFooterCol, setSelectedFooterCol] = useState('Association');
  const [systemPages, setSystemPages] = useState<Array<{ label: string; href: string; category: string }>>(STATIC_SYSTEM_PAGES);
  const [selectedPagePreset, setSelectedPagePreset] = useState('');
  const [newLinkCol, setNewLinkCol] = useState('Association');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkHref, setNewLinkHref] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Load initial settings and data
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);
    setError(null);
    setSuccess(false);
    setSessionExpired(false);

    if (sectionType === 'footer') {
      setActiveTab('COLUMNS');
      setSelectedFooterCol('Association');
      setNewLinkCol('Association');
    } else {
      setActiveTab('CONTENT');
    }

    const fetches: Promise<any>[] = [
      fetch('/api/site-settings', { cache: 'no-store' })
        .then((r) => r.json())
        .catch(() => ({})),
    ];

    if (sectionType === 'hero') {
      fetches.push(
        fetch('/api/admin/hero-slides', { cache: 'no-store' })
          .then((r) => r.json())
          .catch(() => ({}))
      );
    }

    if (sectionType === 'donate') {
      fetches.push(
        fetch('/api/support-pillars', { cache: 'no-store' })
          .then((r) => r.json())
          .catch(() => ({}))
      );
    }

    if (sectionType === 'footer') {
      fetches.push(
        fetch('/api/navigation', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({})),
        fetch('/api/admin/pages', { credentials: 'include', cache: 'no-store' }).then((r) => r.json()).catch(() => ({})),
        fetch('/api/admin/policies', { credentials: 'include', cache: 'no-store' }).then((r) => r.json()).catch(() => ({}))
      );
    }

    Promise.all(fetches).then((results) => {
      if (!isMounted) return;
      const settingsData = results[0];
      let heroData: any = null;
      let pillarsData: any = null;
      let navData: any = null;
      let pagesData: any = null;
      let policiesData: any = null;

      let idxCounter = 1;
      if (sectionType === 'hero') {
        heroData = results[idxCounter++];
      }
      if (sectionType === 'donate') {
        pillarsData = results[idxCounter++];
      }
      if (sectionType === 'footer') {
        navData = results[idxCounter++];
        pagesData = results[idxCounter++];
        policiesData = results[idxCounter++];
      }

      const s = settingsData?.setting || settingsData?.settings || {};
      const pillars = pillarsData?.pillars || [];
      const grassroots = pillars.find((p: any) => p.key === 'grassroots') || {};
      const impact = pillars.find((p: any) => p.key === 'impact') || {};
      const cultural = pillars.find((p: any) => p.key === 'cultural') || {};
      const environment = pillars.find((p: any) => p.key === 'environment') || {};

      setForm({
        // Hero fields
        heroEyebrow: s.heroEyebrow || 'Crafted in the Himalayas',
        tagline: s.tagline || 'Towards a vibrant & sustainable handicrafts sector',
        heroParagraph:
          s.heroParagraph ||
          'Handicrafts Association of Bhutan supports local artisans in promoting their handicrafts in markets both within Bhutan and internationally, and supports skills development and capacity building of the craftspeople.',
        heroCtaPrimaryText: s.heroCtaPrimaryText || 'Our mission',
        heroCtaPrimaryLink: s.heroCtaPrimaryLink || '/about',
        heroCtaSecondaryText: s.heroCtaSecondaryText || 'Shop the crafts →',
        heroCtaSecondaryLink: s.heroCtaSecondaryLink || '/shop',

        // Stats fields
        stat1Number: s.stat1Number || '7,500',
        stat1Label: s.stat1Label || 'Micro & small enterprises in the network',
        stat2Number: s.stat2Number || '5,250',
        stat2Label: s.stat2Label || 'Women-led enterprises',
        stat3Number: s.stat3Number || '195',
        stat3Label: s.stat3Label || 'Affiliated stores across Bhutan',
        stat4Number: s.stat4Number || '13',
        stat4Label: s.stat4Label || 'Arts & crafts of Zorig Chusum',

        // Retail & Wholesale Band
        homeCraftIntro: s.homeCraftIntro || 'Explore traditional textiles, wood carvings, metalwork, and clay artifacts.',
        homeClusterPromo: s.homeClusterPromo || 'Direct community clusters preserving ancient traditions across 20 Dzongkhags.',
        homeWholesalePromo: s.homeWholesalePromo || 'Trade pricing, custom commissions, and bulk ordering for institutions.',

        // About Band
        aboutBandTitle: s.aboutBandTitle || 'A national civil society organisation founded to serve Bhutan’s artisans',
        aboutBandPara1:
          s.aboutBandPara1 ||
          'Handicrafts Association of Bhutan (HAB) is a civil society organisation established to preserve, develop and promote the craft traditions of Bhutan. We represent craftspeople, craft enterprises and community clusters across the country.',
        aboutBandPara2:
          s.aboutBandPara2 ||
          'Our work covers quality standards, design development, business skills, domestic and export marketing, and the documentation of traditional techniques.',
        aboutBandImageUrl: s.aboutBandImageUrl || '/assets/photos/about-hab.jpg',
        aboutBandImageCaption: s.aboutBandImageCaption || 'Master weaver instructing apprentices in Thimphu',
        aboutBandCtaText: s.aboutBandCtaText || 'Read about our programmes',
        aboutBandCtaLink: s.aboutBandCtaLink || '/programmes',

        // Assurances
        assurance1Title: s.assurance1Title || 'Verified members only',
        assurance1Text: s.assurance1Text || 'Every seller is a registered HAB member with documented craft credentials.',
        assurance2Title: s.assurance2Title || 'Fair price, paid upfront',
        assurance2Text: s.assurance2Text || 'Artisans receive fair wholesale rates at dispatch, not conditional on sale.',
        assurance3Title: s.assurance3Title || 'Craft origin certified',
        assurance3Text: s.assurance3Text || 'Pieces carry verifiable origin, cluster provenance and artisan details.',
        assurance4Title: s.assurance4Title || 'Direct CSO support',
        assurance4Text: s.assurance4Text || 'Every purchase directly funds artisan training and tools across all 20 dzongkhags.',

        // Membership callouts
        membershipLeftTitle: s.membershipLeftTitle || 'Join as a craft artisan or enterprise',
        membershipLeftText:
          s.membershipLeftText ||
          'Get access to market linkage, design workshops, subsidized stalls, export facilitation, and our national directory.',
        membershipLeftCtaText: s.membershipLeftCtaText || 'Apply for Membership →',
        membershipLeftCtaLink: s.membershipLeftCtaLink || '/register',
        membershipRightTitle: s.membershipRightTitle || 'Find certified master craftspeople',
        membershipRightText:
          s.membershipRightText ||
          'Browse our vetted member directory covering all thirteen traditional Zorig Chusum craft sectors.',

        // Extended About
        aboutMandateText: s.aboutMandateText || 'HAB was established under the Civil Society Organizations Act of Bhutan 2007.',
        aboutMandatePara2: s.aboutMandatePara2 || 'We operate as the peak industry body connecting rural producers to global connoisseurs.',
        aboutHistoryText: s.aboutHistoryText || 'Founded in 2005 and registered in 2011, HAB has united over 7,500 craft practitioners.',

        // Donate
        donateHeroTitle: s.donateHeroTitle || 'Support Bhutanese Artisans & Cultural Heritage',
        donateHeroLede: s.donateHeroLede || 'Your philanthropic donation empowers rural weavers, blacksmiths, and sculptors across Bhutan.',
        donateTaxNotice: s.donateTaxNotice || 'HAB is a registered Civil Society Organization. Donations within Bhutan qualify for CSO tax deductions under Section 31.',
        donateAmount1: s.donateAmount1 || 1000,
        donateAmount2: s.donateAmount2 || 5000,
        donateAmount3: s.donateAmount3 || 10000,
        donateAmount4: s.donateAmount4 || 25000,
        donateBankBoB: s.donateBankBoB || 'Bank of Bhutan: 1002345892 (Metog Lam Branch)',
        donateBankBNB: s.donateBankBNB || 'Bhutan National Bank: 2001984710',
        donateSwiftCode: s.donateSwiftCode || 'BHUBBTBT',

        // 4 Support Pillars (Card 1 Grassroots has leaf, Cards 2-4 clean)
        pillar_grassroots_title: grassroots.title || 'Grassroots Benefit',
        pillar_grassroots_line: grassroots.line || grassroots.tagline || 'Keeps rural creators trading through the lean season.',
        pillar_grassroots_body: grassroots.body || grassroots.description || 'Every ngultrum stays in the sector. Your gift funds vital market access, export logistics, and fair-price advocacy that keeps rural enterprises viable.',
        pillar_impact_title: impact.title || 'Impact Crowdfunding & Enterprise',
        pillar_impact_line: impact.line || impact.tagline || 'Buys the raw materials an artisan cannot afford upfront.',
        pillar_impact_body: impact.body || impact.description || 'Artisans lose orders due to upfront material costs. This revolving fund buys their supplies; they repay upon sale, cycling your money continuously to the next entrepreneur.',
        pillar_cultural_title: cultural.title || 'Vital Cultural Preservation',
        pillar_cultural_line: cultural.line || cultural.tagline || 'Funds critical master-to-apprentice placements.',
        pillar_cultural_body: cultural.body || cultural.description || 'Several of Bhutan’s traditional crafts face critical decline. Paid apprenticeships are the only way youth can afford to learn and save these sacred arts.',
        pillar_environment_title: environment.title || 'Environmental & Landscape Conservation',
        pillar_environment_line: environment.line || environment.tagline || 'Replants the natural materials our crafts grow from.',
        pillar_environment_body: environment.body || environment.description || 'Craft demand can outrun forest regrowth. We fund local artisan clusters to manage ecological replanting, ensuring both the heritage and our hillsides thrive.',

        // Wholesale extended
        wholesaleHeroTitle: s.wholesaleHeroTitle || 'Wholesale & Bulk Orders',
        wholesaleHeroLede: s.wholesaleHeroLede || 'HAB supplies Bhutanese handicraft at trade terms to retailers, hotels, designers, institutions and distributors.',
        wholesaleMoq: s.wholesaleMoq || 10,
        wholesaleLeadTime: s.wholesaleLeadTime || '2 to 4 weeks',
        wholesaleAssurance1Title: s.wholesaleAssurances?.[0]?.title || s.wholesaleAssurance1Title || 'Traceable supply chain',
        wholesaleAssurance1Body: s.wholesaleAssurances?.[0]?.body || s.wholesaleAssurance1Body || 'Materials, makers and shipping are fully documented from source cluster to port of export.',
        wholesaleAssurance2Title: s.wholesaleAssurances?.[1]?.title || s.wholesaleAssurance2Title || 'Phytosanitary & export documentation',
        wholesaleAssurance2Body: s.wholesaleAssurances?.[1]?.body || s.wholesaleAssurance2Body || 'We prepare export documentation, non-commercial invoices and all customs clearances.',
        wholesaleAssurance3Title: s.wholesaleAssurances?.[2]?.title || s.wholesaleAssurance3Title || 'Pre-dispatch quality assurance',
        wholesaleAssurance3Body: s.wholesaleAssurances?.[2]?.body || s.wholesaleAssurance3Body || 'Every order is inspected against master reference pieces by our quality inspectors in Thimphu.',
        wholesaleAssurance4Title: s.wholesaleAssurances?.[3]?.title || s.wholesaleAssurance4Title || 'Flexible customization',
        wholesaleAssurance4Body: s.wholesaleAssurances?.[3]?.body || s.wholesaleAssurance4Body || 'Custom sizes, weave densities, debossed branding and bespoke packaging available.',
        wholesaleAssurance5Title: s.wholesaleAssurances?.[4]?.title || s.wholesaleAssurance5Title || 'Fair compensation guarantee',
        wholesaleAssurance5Body: s.wholesaleAssurances?.[4]?.body || s.wholesaleAssurance5Body || 'Artisans receive fair wholesale rates at dispatch, ensuring sustained community livelihoods.',

        // Wholesale Flow Steps (1–6)
        wholesaleFlowStep1Title: s.wholesaleTerms?.flowSteps?.[0]?.title || 'Browse',
        wholesaleFlowStep1Desc: s.wholesaleTerms?.flowSteps?.[0]?.desc || 'Category, then product. The catalogue is the same one the retail shop uses.',
        wholesaleFlowStep2Title: s.wholesaleTerms?.flowSteps?.[1]?.title || 'Quantity',
        wholesaleFlowStep2Desc: s.wholesaleTerms?.flowSteps?.[1]?.desc || 'Set quantities against the MOQ. Tier pricing applies automatically.',
        wholesaleFlowStep3Title: s.wholesaleTerms?.flowSteps?.[2]?.title || 'Quote basket',
        wholesaleFlowStep3Desc: s.wholesaleTerms?.flowSteps?.[2]?.desc || 'Collect several products into one basket rather than checking out.',
        wholesaleFlowStep4Title: s.wholesaleTerms?.flowSteps?.[3]?.title || 'HAB review',
        wholesaleFlowStep4Desc: s.wholesaleTerms?.flowSteps?.[3]?.desc || 'The trade desk confirms availability with the producing members.',
        wholesaleFlowStep5Title: s.wholesaleTerms?.flowSteps?.[4]?.title || 'Quotation',
        wholesaleFlowStep5Desc: s.wholesaleTerms?.flowSteps?.[4]?.desc || 'Formal quote with freight, lead time and payment terms.',
        wholesaleFlowStep6Title: s.wholesaleTerms?.flowSteps?.[5]?.title || 'Order & tracking',
        wholesaleFlowStep6Desc: s.wholesaleTerms?.flowSteps?.[5]?.desc || 'Production, quality control in Thimphu, then shipment with tracking.',

        // About extended
        aboutObjective1: s.aboutObjectives?.[0] || s.aboutObjective1 || 'Improve market access for Bhutanese artisans at home, in tourism and internationally.',
        aboutObjective2: s.aboutObjectives?.[1] || s.aboutObjective2 || 'Raise product quality and consistency through training, standards and inspection.',
        aboutObjective3: s.aboutObjectives?.[2] || s.aboutObjective3 || 'Guarantee fair compensation and prompt payment for handcrafted work.',
        aboutObjective4: s.aboutObjectives?.[3] || s.aboutObjective4 || 'Keep the thirteen crafts of Zorig Chusum in living practice, especially endangered ones.',
        aboutObjective5: s.aboutObjectives?.[4] || s.aboutObjective5 || 'Advocate for artisan rights, raw material access and sector-friendly policy interventions.',
        aboutObjective6: s.aboutObjectives?.[5] || s.aboutObjective6 || 'Build sustainable livelihoods for women, youth, and rural artisan communities.',
        aboutCraft1Name: s.aboutValues?.[0]?.title || s.aboutCraft1Name || 'Care',
        aboutCraft1Desc: s.aboutValues?.[0]?.body || s.aboutCraft1Desc || 'Care for the maker, the material and the object.',
        aboutCraft2Name: s.aboutValues?.[1]?.title || s.aboutCraft2Name || 'Respect',
        aboutCraft2Desc: s.aboutValues?.[1]?.body || s.aboutCraft2Desc || 'Respect for a tradition older than the association, and for the person who carries it.',
        aboutCraft3Name: s.aboutValues?.[2]?.title || s.aboutCraft3Name || 'Attentive',
        aboutCraft3Desc: s.aboutValues?.[2]?.body || s.aboutCraft3Desc || 'Attentive to quality, to the market and to what members actually ask for.',
        aboutCraft4Name: s.aboutValues?.[3]?.title || s.aboutCraft4Name || 'Fair',
        aboutCraft4Desc: s.aboutValues?.[3]?.body || s.aboutCraft4Desc || 'Fair dealing, in writing. Prices are agreed with the maker and paid upfront.',
        aboutCraft5Name: s.aboutValues?.[4]?.title || s.aboutCraft5Name || 'Transparent',
        aboutCraft5Desc: s.aboutValues?.[4]?.body || s.aboutCraft5Desc || 'Transparent about money and results. Audited accounts published yearly.',

        // 4 Quick Facts (craftfacts on /about)
        fact1Key: s.aboutStats?.[0]?.label || 'Established',
        fact1Val: s.aboutStats?.[0]?.number || '2005',
        fact2Key: s.aboutStats?.[1]?.label || 'Registered CSO',
        fact2Val: s.aboutStats?.[1]?.number || s.csoRegistration || '2011 · CSO/2011/043',
        fact3Key: s.aboutStats?.[2]?.label || 'Member enterprises',
        fact3Val: s.aboutStats?.[2]?.number || s.stat1Number || '7,500',
        fact4Key: s.aboutStats?.[3]?.label || 'Affiliated stores',
        fact4Val: s.aboutStats?.[3]?.number || s.stat3Number || '195',

        // Contact
        officeAddress: s.officeAddress || 'Metog Lam, Thimphu, Bhutan',
        officePhone: s.officePhone || '+975-2-338089',
        edPhone: s.edPhone || '+975-77654508',
        marketingPhone: s.marketingPhone || '+975-17462636 / 17881111',
        officialEmail: s.officialEmail || 'officehab@gmail.com',
        contactHours: s.contactHours || 'Monday - Friday: 9:00 AM - 5:00 PM (BST)',
        contactPoBox: s.contactPoBox || 'P.O. Box 1109, Thimphu',
        contactDirections: s.contactDirections || 'Near Institute of Zorig Chusum, Kawajangsa, Thimphu',
        contactLede: s.contactLede || 'Get in touch with the HAB secretariat for membership, wholesale, provenance verification or donor partnerships.',

        // Specific Secondary Section values
        clustersHeroTitle: s.clustersHeroTitle || 'Artisan clusters',
        clustersHeroLede: s.clustersHeroLede || 'A cluster is a village or valley where one craft is concentrated. Members hold a common price, buy materials together, and receive visitors who want to see the work being done. Each has a story.',
        clustersCountText: s.clustersCountText || '20 Dzongkhags · Verified Artisan Clusters',

        mastersHeroEyebrow: s.mastersHeroEyebrow || 'Recognition',
        mastersHeroTitle: s.mastersHeroTitle || 'Accreditations & awards',
        mastersHeroLede: s.mastersHeroLede || 'A small number of members are recognised individually — for mastery held over a lifetime, for standards that lifted a whole craft, and for the enterprises and young artisans changing how Bhutanese work reaches a market.',
        mastersCtaPrimaryText: s.mastersCtaPrimaryText || 'See who holds them →',
        mastersCtaPrimaryLink: s.mastersCtaPrimaryLink || '#holders',
        mastersCtaSecondaryText: s.mastersCtaSecondaryText || 'How to nominate',
        mastersCtaSecondaryLink: s.mastersCtaSecondaryLink || '#nominate',
        mastersAward1Title: s.mastersAward1Title || 'National Craft Award (Zorig Chusum)',
        mastersAward1Desc: s.mastersAward1Desc || 'Lifetime achievement and sector leadership in traditional arts.',
        mastersAward2Title: s.mastersAward2Title || 'Royal Seal of Excellence',
        mastersAward2Desc: s.mastersAward2Desc || 'Design, execution and material benchmark across authentic crafts.',
        mastersAward3Title: s.mastersAward3Title || 'Master Craftsperson accreditation',
        mastersAward3Desc: s.mastersAward3Desc || 'Peer-reviewed practitioner qualification for authentic master craftspeople.',

        newsHeroTitle: s.newsHeroTitle || 'News & events',
        newsHeroLede: s.newsHeroLede || 'Stay informed, stay empowered.',

        eventsHeroEyebrow: s.eventsHeroEyebrow || "What's coming up",
        eventsHeroTitle: s.eventsHeroTitle || 'Events',
        eventsHeroLede: s.eventsHeroLede || 'Craft bazaars, training courses, export clinics, buyer missions and the Annual Sector Forum. Most are open to members; the bazaars are open to everyone.',
        eventsAttendingTitle: s.eventsAttendingTitle || 'Attending',
        eventsAttendingBody: s.eventsAttendingBody || 'Places and stalls are arranged through the secretariat. Write to officehab@gmail.com or call +975-2-338089.',
        eventsAttendingEmail: s.eventsAttendingEmail || 'officehab@gmail.com',
        eventsAttendingPhone: s.eventsAttendingPhone || '+975-2-338089',

        publicationsHeroTitle: s.publicationsHeroTitle || 'Publications',
        publicationsHeroLede: s.publicationsHeroLede || 'Annual reports, audited accounts, sector research, guidelines and training material — published by HAB and free to download.',
        publicationsLeadTitle: s.publicationsLeadTitle || 'Annual Report 2025',
        publicationsLeadAbstract: s.publicationsLeadAbstract || 'Programme outcomes, sector figures and audited accounts for the year, published in English and Dzongkha.',
        publicationsLeadDownloadUrl: s.publicationsLeadDownloadUrl || '/assets/docs/hab-annual-report-2025.pdf',

        policiesHeroTitle: s.policiesHeroTitle || 'Statutory Policies & Governance',
        policiesHeroLede: s.policiesHeroLede || 'Official policies, artisan rights charter, terms of service, and CSO governance standards of HAB.',
        policiesCharterNotice: s.policiesCharterNotice || 'Constituted under the Civil Society Organizations Act of Bhutan 2007. Non-political, transparent, and dedicated to artisan welfare.',

        outletsHeroEyebrow: s.outletsHeroEyebrow || 'Verified Markets · HAB Validated',
        outletsHeroTitle: s.outletsHeroTitle || 'Punakha Riverfront Craft Market',
        outletsHeroLede: s.outletsHeroLede || 'Physical outlets, verified markets and artisan clusters across Bhutan validated by HAB.',
        outletsFeaturedPlace: s.outletsFeaturedPlace || 'Punakha Dzong riverside, Punakha',
        outletsFeaturedHours: s.outletsFeaturedHours || 'Wednesday – Sunday: 9:00 AM – 6:00 PM',
        outletsFeaturedStalls: s.outletsFeaturedStalls || '34 permanent stalls · 12 rotating weekend makers',

        projectsHeroEyebrow: s.projectsHeroEyebrow || 'Funded interventions',
        projectsHeroTitle: s.projectsHeroTitle || 'Donor projects',
        projectsHeroLede: s.projectsHeroLede || 'Structured donor-supported initiatives that build capability, upgrade technology, open markets and transmit skills across Bhutan.',

        // Generic Section fallbacks for /clusters, /masters, /news, /events, /publications, /policies
        genericEyebrow: s.tagline ? s.tagline.slice(0, 30) : 'Handicrafts Association of Bhutan',
        genericTitle: s.aboutBandTitle || 'Bhutan Traditional Crafts Network',
        genericDescription: s.heroParagraph || 'Supporting over 7,500 artisans across Bhutan.',

        // Punakha
        punakhaMarketNotice: s.punakhaMarketNotice || 'Validated and managed by HAB for authentic Bhutanese craft provenance.',
        csoRegistration: s.csoRegistration || '2011 · CSO/2011/043',

        // Footer & Social Links
        facebookUrl: s.facebookUrl || '',
        instagramUrl: s.instagramUrl || '',
        twitterUrl: s.twitterUrl || '',
        youtubeUrl: s.youtubeUrl || '',
        tiktokUrl: s.tiktokUrl || '',
        footerAbout: s.footerAbout || 'A registered Civil Society Organization under the CSO Act of Bhutan 2007. Established 2005.',
        copyrightText: s.copyrightText || '© 2026 Handicrafts Association of Bhutan. All rights reserved.',
      });

      if (sectionType === 'footer') {
        const loadedNav: any[] = [];
        if (navData?.footer && typeof navData.footer === 'object') {
          Object.keys(navData.footer).forEach((colName) => {
            const colLinks = navData.footer[colName];
            if (Array.isArray(colLinks)) {
              colLinks.forEach((l: any, idx: number) => {
                loadedNav.push({
                  id: l.id,
                  column: colName,
                  label: l.label,
                  href: l.href,
                  sortOrder: l.sortOrder ?? idx + 1,
                  isActive: l.isActive !== false,
                });
              });
            }
          });
        }

        if (loadedNav.length > 0) {
          setFooterNavItems(loadedNav);
        } else {
          setFooterNavItems([
            { column: 'Association', label: 'About HAB', href: '/about', sortOrder: 1, isActive: true },
            { column: 'Association', label: 'Programmes', href: '/programmes', sortOrder: 2, isActive: true },
            { column: 'Association', label: 'Projects', href: '/projects', sortOrder: 3, isActive: true },
            { column: 'Association', label: 'Membership', href: '/membership', sortOrder: 4, isActive: true },
            { column: 'Association', label: 'News & events', href: '/news', sortOrder: 5, isActive: true },
            { column: 'Association', label: 'Contact us', href: '/contact', sortOrder: 6, isActive: true },
            { column: 'Shop & support', label: 'E-shop', href: '/shop', sortOrder: 1, isActive: true },
            { column: 'Shop & support', label: 'Wholesale & bulk orders', href: '/wholesale', sortOrder: 2, isActive: true },
            { column: 'Shop & support', label: 'Shipping & delivery policy', href: '/shipping-policy', sortOrder: 3, isActive: true },
            { column: 'Shop & support', label: 'Returns & refunds policy', href: '/shipping-policy#returns', sortOrder: 4, isActive: true },
            { column: 'Shop & support', label: 'Track your order', href: '/track-order', sortOrder: 5, isActive: true },
            { column: 'Shop & support', label: 'Duties & customs policy', href: '/shipping-policy#duty', sortOrder: 6, isActive: true },
            { column: 'Members', label: 'Directory by category', href: '/membership', sortOrder: 1, isActive: true },
            { column: 'Members', label: 'Publications', href: '/publications', sortOrder: 2, isActive: true },
            { column: 'Members', label: 'Member shops & clusters', href: '/outlets', sortOrder: 3, isActive: true },
            { column: 'Members', label: 'Member login', href: '/membership#login', sortOrder: 4, isActive: true },
            { column: 'Members', label: 'Apply to join', href: '/register', sortOrder: 5, isActive: true },
            { column: 'Governance', label: 'Board of Trustees', href: '/about', sortOrder: 1, isActive: true },
            { column: 'Governance', label: 'Secretariat', href: '/about', sortOrder: 2, isActive: true },
            { column: 'Governance', label: 'Annual reports', href: '/publications', sortOrder: 3, isActive: true },
            { column: 'Governance', label: 'Audited accounts', href: '/publications', sortOrder: 4, isActive: true },
            { column: 'Governance', label: 'Tenders & vacancies', href: '/news', sortOrder: 5, isActive: true },
            { column: 'Governance', label: 'Terms of service', href: '/terms', sortOrder: 6, isActive: true },
            { column: 'Governance', label: 'Privacy policy', href: '/privacy', sortOrder: 7, isActive: true },
          ]);
        }

        const dynamicList = [...STATIC_SYSTEM_PAGES];
        if (pagesData?.customPages && Array.isArray(pagesData.customPages)) {
          pagesData.customPages.forEach((cp: any) => {
            dynamicList.push({
              label: cp.title,
              href: `/pages/${cp.slug}`,
              category: `Custom Pages (${cp.category || 'General'})`,
            });
          });
        }
        if (policiesData?.policies && Array.isArray(policiesData.policies)) {
          policiesData.policies.forEach((pol: any) => {
            const polHref = pol.publicUrl || `/policies/${pol.slug}`;
            if (!dynamicList.some((d) => d.href === polHref)) {
              dynamicList.push({
                label: pol.title,
                href: polHref,
                category: 'Statutory Policies',
              });
            }
          });
        }
        setSystemPages(dynamicList);
      }

      if (heroData?.slides && Array.isArray(heroData.slides)) {
        setSlides(heroData.slides);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, sectionType]);

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Footer Navigation Helpers
  const defaultFooterCols = ['Association', 'Shop & support', 'Members', 'Governance'];
  const availableFooterCols = Array.from(
    new Set([...defaultFooterCols, ...footerNavItems.map((item) => item.column)])
  ).filter(Boolean);

  const currentFooterColItems = footerNavItems.filter((i) => i.column === selectedFooterCol);

  const moveFooterItem = (indexInCol: number, direction: 'up' | 'down') => {
    const targetIdxInCol = direction === 'up' ? indexInCol - 1 : indexInCol + 1;
    if (targetIdxInCol < 0 || targetIdxInCol >= currentFooterColItems.length) return;

    const itemA = currentFooterColItems[indexInCol];
    const itemB = currentFooterColItems[targetIdxInCol];

    setFooterNavItems((prev) => {
      const copy = [...prev];
      const globalIdxA = copy.indexOf(itemA);
      const globalIdxB = copy.indexOf(itemB);

      if (globalIdxA === -1 || globalIdxB === -1) return prev;

      const tempOrder = itemA.sortOrder;
      itemA.sortOrder = itemB.sortOrder;
      itemB.sortOrder = tempOrder;

      copy[globalIdxA] = { ...itemA };
      copy[globalIdxB] = { ...itemB };

      return copy.sort((a, b) => a.sortOrder - b.sortOrder);
    });
  };

  const updateFooterItemField = (itemToUpdate: any, field: string, value: any) => {
    setFooterNavItems((prev) =>
      prev.map((item) => (item === itemToUpdate ? { ...item, [field]: value } : item))
    );
  };

  const removeFooterItem = (itemToRemove: any) => {
    if (itemToRemove.id && !itemToRemove.isNew) {
      setDeletedNavIds((prev) => [...prev, itemToRemove.id]);
    }
    setFooterNavItems((prev) => prev.filter((i) => i !== itemToRemove));
  };

  const handleSelectPagePreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedPagePreset(val);
    if (!val) return;

    const matched = systemPages.find((p) => p.href === val);
    if (matched) {
      setNewLinkLabel(matched.label);
      setNewLinkHref(matched.href);
    }
  };

  const handleAddFooterLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkLabel.trim() || !newLinkHref.trim()) return;

    const col = newLinkCol || selectedFooterCol;
    const colItems = footerNavItems.filter((i) => i.column === col);

    const newItem = {
      id: `new-${Date.now()}`,
      column: col,
      label: newLinkLabel.trim(),
      href: newLinkHref.trim(),
      sortOrder: colItems.length + 1,
      isActive: true,
      isNew: true,
    };

    setFooterNavItems((prev) => [...prev, newItem]);
    setNewLinkLabel('');
    setNewLinkHref('');
    setSelectedPagePreset('');
    setSelectedFooterCol(col);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Synchronize structured arrays for JSON storage in SiteSetting
      const payload: Record<string, any> = { ...form };

      // About arrays
      payload.aboutObjectives = [
        form.aboutObjective1,
        form.aboutObjective2,
        form.aboutObjective3,
        form.aboutObjective4,
        form.aboutObjective5,
        form.aboutObjective6,
      ].filter(Boolean);

      payload.aboutValues = [
        { letter: 'C', title: form.aboutCraft1Name || 'Care', body: form.aboutCraft1Desc || '' },
        { letter: 'R', title: form.aboutCraft2Name || 'Respect', body: form.aboutCraft2Desc || '' },
        { letter: 'A', title: form.aboutCraft3Name || 'Attentive', body: form.aboutCraft3Desc || '' },
        { letter: 'F', title: form.aboutCraft4Name || 'Fair', body: form.aboutCraft4Desc || '' },
        { letter: 'T', title: form.aboutCraft5Name || 'Transparent', body: form.aboutCraft5Desc || '' },
      ].filter((v) => v.title);

      payload.aboutStats = [
        { label: form.fact1Key || 'Established', number: form.fact1Val || '2005' },
        { label: form.fact2Key || 'Registered CSO', number: form.fact2Val || '2011 · CSO/2011/043' },
        { label: form.fact3Key || 'Member enterprises', number: form.fact3Val || '7,500' },
        { label: form.fact4Key || 'Affiliated stores', number: form.fact4Val || '195' },
      ].filter((st) => st.label);

      // Wholesale arrays
      payload.wholesaleAssurances = [
        { title: form.wholesaleAssurance1Title, body: form.wholesaleAssurance1Body },
        { title: form.wholesaleAssurance2Title, body: form.wholesaleAssurance2Body },
        { title: form.wholesaleAssurance3Title, body: form.wholesaleAssurance3Body },
        { title: form.wholesaleAssurance4Title, body: form.wholesaleAssurance4Body },
        { title: form.wholesaleAssurance5Title, body: form.wholesaleAssurance5Body },
      ].filter((a) => a.title);

      payload.wholesaleTerms = {
        ...(typeof form.wholesaleTerms === 'object' && form.wholesaleTerms !== null ? form.wholesaleTerms : {}),
        flowSteps: [
          { title: form.wholesaleFlowStep1Title, desc: form.wholesaleFlowStep1Desc },
          { title: form.wholesaleFlowStep2Title, desc: form.wholesaleFlowStep2Desc },
          { title: form.wholesaleFlowStep3Title, desc: form.wholesaleFlowStep3Desc },
          { title: form.wholesaleFlowStep4Title, desc: form.wholesaleFlowStep4Desc },
          { title: form.wholesaleFlowStep5Title, desc: form.wholesaleFlowStep5Desc },
          { title: form.wholesaleFlowStep6Title, desc: form.wholesaleFlowStep6Desc },
        ].filter((s) => s.title),
      };

      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setSessionExpired(true);
        throw new Error('Your admin session has expired. Please log in again.');
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save section changes.');
      }

      // If donate section, also save all 4 support pillars to SupportPillar DB
      if (sectionType === 'donate') {
        const pillarUpdates = [
          {
            key: 'grassroots',
            title: form.pillar_grassroots_title || 'Grassroots Benefit',
            description: form.pillar_grassroots_body || form.pillar_grassroots_line || '',
            iconEmoji: 'leaf',
          },
          {
            key: 'impact',
            title: form.pillar_impact_title || 'Impact Crowdfunding & Enterprise',
            description: form.pillar_impact_body || form.pillar_impact_line || '',
            iconEmoji: '',
          },
          {
            key: 'cultural',
            title: form.pillar_cultural_title || 'Vital Cultural Preservation',
            description: form.pillar_cultural_body || form.pillar_cultural_line || '',
            iconEmoji: '',
          },
          {
            key: 'environment',
            title: form.pillar_environment_title || 'Environmental & Landscape Conservation',
            description: form.pillar_environment_body || form.pillar_environment_line || '',
            iconEmoji: '',
          },
        ];
        for (const p of pillarUpdates) {
          await fetch('/api/admin/support-pillars', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(p),
          }).catch(() => {});
        }
      }

      // If footer section, also save navigation items
      if (sectionType === 'footer') {
        for (const delId of deletedNavIds) {
          if (!delId.startsWith('new-') && !delId.startsWith('f-')) {
            await fetch(`/api/admin/navigation?id=${encodeURIComponent(delId)}`, {
              method: 'DELETE',
              credentials: 'include',
            }).catch(() => {});
          }
        }

        for (let idx = 0; idx < footerNavItems.length; idx++) {
          const item = footerNavItems[idx];
          const isDbItem = item.id && !item.isNew && !item.id.startsWith('f-') && !item.id.startsWith('new-');

          if (isDbItem) {
            await fetch('/api/admin/navigation', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                id: item.id,
                menuType: 'FOOTER',
                column: item.column,
                label: item.label,
                href: item.href,
                sortOrder: item.sortOrder || idx + 1,
                isActive: item.isActive,
              }),
            }).catch(() => {});
          } else {
            await fetch('/api/admin/navigation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                menuType: 'FOOTER',
                column: item.column,
                label: item.label,
                href: item.href,
                sortOrder: item.sortOrder || idx + 1,
                isActive: item.isActive,
              }),
            }).catch(() => {});
          }
        }
      }

      const result = await res.json();
      const updatedSetting = result.setting || form;

      // 2. Dispatch events for instantaneous zero-reload live updates across components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('hab:settings-updated', {
            detail: updatedSetting,
          })
        );
        window.dispatchEvent(new CustomEvent('hab:header-updated'));
        window.dispatchEvent(new CustomEvent('hab:content-updated'));
      }

      if (onSaved) {
        onSaved(updatedSetting);
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to save section.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !mounted) return null;

  // Compute title & studio destination
  const displayTitle =
    sectionTitle ||
    (sectionType === 'hero'
      ? 'Hero Section & Mission'
      : sectionType === 'stats'
      ? 'Stats & Impact Counters'
      : sectionType === 'buy'
      ? 'Retail & Trade Gateways'
      : sectionType === 'about'
      ? 'About HAB Band'
      : sectionType === 'assurances'
      ? 'Quality Assurances Band'
      : sectionType === 'membership'
      ? 'Membership Callouts'
      : sectionType === 'about-page'
      ? 'About Page Story & Mandate'
      : sectionType === 'donate'
      ? 'Donations & Philanthropy'
      : sectionType === 'contact'
      ? 'Contact & Secretariate Info'
      : sectionType === 'footer'
      ? 'Footer, Columns & Global Settings'
      : sectionType === 'programmes'
      ? 'Programmes & Strategic Pillars'
      : sectionType === 'wholesale'
      ? 'Wholesale & Trade Terms'
      : 'Live Section Editor');

  const defaultStudioHref =
    studioHref ||
    (sectionType === 'hero'
      ? '/admin/hero'
      : sectionType === 'stats'
      ? '/admin/site-settings'
      : sectionType === 'buy'
      ? '/admin/trade'
      : sectionType === 'about'
      ? '/admin/pages/about'
      : sectionType === 'membership'
      ? '/admin/membership-categories'
      : sectionType === 'donate'
      ? '/admin/donate-settings'
      : sectionType === 'contact'
      ? '/admin/site-settings?tab=CONTACT'
      : sectionType === 'footer'
      ? '/admin/navigation'
      : sectionType === 'programmes'
      ? '/admin/programmes'
      : sectionType === 'wholesale'
      ? '/admin/trade'
      : '/admin/site-settings');

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl my-auto flex flex-col max-h-[92vh] overflow-hidden select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex-shrink-0 p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B2E24] text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {displayTitle}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wider">
                  In-Place Live Edit
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Update titles, paragraphs, buttons, and media with instant 2-way reflection across the live page.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/pages?new=1"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-[#8B2E24] text-[#8B2E24] hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
              title="Create a brand new standalone public page"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create New Page</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Sub-Tabs for Deep Section Control */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-3 gap-2 overflow-x-auto no-scrollbar">
          {sectionType === 'footer' && (
            <button
              type="button"
              onClick={() => setActiveTab('COLUMNS')}
              className={"pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap " +
                (activeTab === 'COLUMNS'
                  ? 'border-[#8B2E24] text-[#8B2E24]'
                  : 'border-transparent text-slate-500 hover:text-slate-900')
              }
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Footer Columns &amp; Pages ({footerNavItems.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('CONTENT')}
            className={"pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap " +
              (activeTab === 'CONTENT'
                ? 'border-[#8B2E24] text-[#8B2E24]'
                : 'border-transparent text-slate-500 hover:text-slate-900')
            }
          >
            <Type className="w-3.5 h-3.5" />
            <span>{sectionType === 'footer' ? 'Secretariat & About Text' : 'Headlines & Text'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ACTIONS')}
            className={"pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap " +
              (activeTab === 'ACTIONS'
                ? 'border-[#8B2E24] text-[#8B2E24]'
                : 'border-transparent text-slate-500 hover:text-slate-900')
            }
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>{sectionType === 'footer' ? 'Social Links' : 'Call-to-Action Buttons'}</span>
          </button>

          {(sectionType === 'hero' || sectionType === 'about') && (
            <button
              type="button"
              onClick={() => setActiveTab('MEDIA')}
              className={"pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap " +
                (activeTab === 'MEDIA'
                  ? 'border-[#8B2E24] text-[#8B2E24]'
                  : 'border-transparent text-slate-500 hover:text-slate-900')
              }
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{sectionType === 'hero' ? 'Slideshow & Photos' : 'Section Image'}</span>
            </button>
          )}

          {(sectionType === 'hero' || sectionType === 'stats') && (
            <button
              type="button"
              onClick={() => setActiveTab('STATS')}
              className={"pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap " +
                (activeTab === 'STATS'
                  ? 'border-[#8B2E24] text-[#8B2E24]'
                  : 'border-transparent text-slate-500 hover:text-slate-900')
              }
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Impact Counters ({form.stat1Number ? '4' : '0'})</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 no-scrollbar">
            {/* Feedback Alerts */}
            {sessionExpired && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Your staff session has expired. Re-authenticate in a new tab to continue saving.</span>
                </div>
                <Link
                  href="/admin/login"
                  target="_blank"
                  className="px-3 py-1 rounded-lg bg-[#8B2E24] text-white font-bold hover:bg-[#73241c] transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  <span>Log in</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}

            {error && !sessionExpired && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">Section updated successfully! Changes reflected immediately.</span>
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#8B2E24] mb-2" />
                <span className="text-xs">Loading section records from database...</span>
              </div>
            ) : (
              <>
                {/* ================= TAB 0: FOOTER COLUMNS & PAGES ================= */}
                {activeTab === 'COLUMNS' && sectionType === 'footer' && (
                  <div className="space-y-4">
                    {/* Column Switcher Pills */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Columns className="w-4 h-4 text-[#8B2E24]" />
                        <span>Select Footer Column:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {availableFooterCols.map((colName) => {
                          const count = footerNavItems.filter((i) => i.column === colName).length;
                          const isSelected = selectedFooterCol === colName;
                          return (
                            <button
                              key={colName}
                              type="button"
                              onClick={() => {
                                setSelectedFooterCol(colName);
                                setNewLinkCol(colName);
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#8B2E24] text-white shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <span>{colName}</span>
                              <span
                                className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Column Items List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
                        <span>
                          Links in <strong className="text-slate-800">&quot;{selectedFooterCol}&quot;</strong> column ({currentFooterColItems.length})
                        </span>
                        <span>Use arrows to reorder • Toggle active to hide</span>
                      </div>

                      {currentFooterColItems.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                          No links in this column yet. Use the form below to add pages or custom links.
                        </div>
                      ) : (
                        currentFooterColItems.map((item, idx) => (
                          <div
                            key={item.id || `footer-link-${idx}`}
                            className={`flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-xl border transition-all ${
                              item.isActive
                                ? 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                                : 'bg-slate-50 border-slate-200 opacity-60'
                            }`}
                          >
                            {/* Reorder and Index */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <div className="flex flex-col gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => moveFooterItem(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveFooterItem(idx, 'down')}
                                  disabled={idx === currentFooterColItems.length - 1}
                                  className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                                #{idx + 1}
                              </span>
                            </div>

                            {/* Label Input */}
                            <div className="flex-1 min-w-[130px]">
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) => updateFooterItemField(item, 'label', e.target.value)}
                                placeholder="Link Label"
                                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                              />
                            </div>

                            {/* URL Input */}
                            <div className="flex-1 min-w-[150px]">
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                  <Link2 className="w-3 h-3" />
                                </span>
                                <input
                                  type="text"
                                  value={item.href}
                                  onChange={(e) => updateFooterItemField(item, 'href', e.target.value)}
                                  placeholder="/path or https://..."
                                  className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:bg-white focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                                />
                              </div>
                            </div>

                            {/* Move to another column */}
                            <div className="w-32 flex-shrink-0">
                              <select
                                value={item.column}
                                onChange={(e) => updateFooterItemField(item, 'column', e.target.value)}
                                className="w-full px-2 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer focus:bg-white focus:outline-hidden"
                                title="Change Column"
                              >
                                {availableFooterCols.map((c) => (
                                  <option key={c} value={c}>
                                    Column: {c}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Active Toggle & Delete */}
                            <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                              <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none px-1">
                                <input
                                  type="checkbox"
                                  checked={item.isActive}
                                  onChange={(e) => updateFooterItemField(item, 'isActive', e.target.checked)}
                                  className="rounded border-slate-300 text-[#8B2E24] focus:ring-[#8B2E24] w-3.5 h-3.5 cursor-pointer"
                                />
                                <span>Active</span>
                              </label>

                              <button
                                type="button"
                                onClick={() => removeFooterItem(item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove link"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Link Form with System Pages Dropdown */}
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-[#8B2E24]" />
                          <span>Add Page or Custom Link to Footer</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Auto-populate from existing platform pages
                        </span>
                      </div>

                      {/* Dropdown: Select from System Pages */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Quick-Pick Existing Platform Page:
                        </label>
                        <select
                          value={selectedPagePreset}
                          onChange={handleSelectPagePreset}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 cursor-pointer focus:border-[#8B2E24] focus:outline-hidden"
                        >
                          <option value="">-- Choose a Page to Auto-Fill (Custom Pages, Policies, Core) --</option>
                          {Array.from(new Set(systemPages.map((p) => p.category))).map((cat) => (
                            <optgroup key={cat} label={cat}>
                              {systemPages
                                .filter((p) => p.category === cat)
                                .map((page) => (
                                  <option key={`${cat}-${page.href}`} value={page.href}>
                                    {page.label} ({page.href})
                                  </option>
                                ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      {/* Manual input overrides & Target Column */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Destination Column
                          </label>
                          <select
                            value={newLinkCol}
                            onChange={(e) => setNewLinkCol(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:border-[#8B2E24] focus:outline-hidden"
                          >
                            {availableFooterCols.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Link Label
                          </label>
                          <input
                            type="text"
                            value={newLinkLabel}
                            onChange={(e) => setNewLinkLabel(e.target.value)}
                            placeholder="e.g. Master Artisans"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:border-[#8B2E24] focus:outline-hidden"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Target Path
                          </label>
                          <input
                            type="text"
                            value={newLinkHref}
                            onChange={(e) => setNewLinkHref(e.target.value)}
                            placeholder="e.g. /masters"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-mono focus:border-[#8B2E24] focus:outline-hidden"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-end">
                          <button
                            type="button"
                            onClick={handleAddFooterLink}
                            disabled={!newLinkLabel.trim() || !newLinkHref.trim()}
                            className="w-full py-1.5 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= TAB 1: HEADLINES & TEXT ================= */}
                {activeTab === 'CONTENT' && (
                  <div className="space-y-4">
                    {sectionType === 'hero' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Hero Eyebrow (Category Badge)
                          </label>
                          <input
                            type="text"
                            value={form.heroEyebrow || ''}
                            onChange={(e) => updateField('heroEyebrow', e.target.value)}
                            placeholder="Crafted in the Himalayas"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Main Headline / Tagline (H1)
                          </label>
                          <input
                            type="text"
                            value={form.tagline || ''}
                            onChange={(e) => updateField('tagline', e.target.value)}
                            placeholder="Towards a vibrant & sustainable handicrafts sector"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Mission Lede Paragraph
                          </label>
                          <textarea
                            rows={3}
                            value={form.heroParagraph || ''}
                            onChange={(e) => updateField('heroParagraph', e.target.value)}
                            placeholder="Handicrafts Association of Bhutan supports local artisans..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>
                      </>
                    )}

                    {sectionType === 'about' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Band Headline
                          </label>
                          <input
                            type="text"
                            value={form.aboutBandTitle || ''}
                            onChange={(e) => updateField('aboutBandTitle', e.target.value)}
                            placeholder="A national civil society organisation founded to serve Bhutan’s artisans"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Paragraph 1 (Founding & Mission)
                          </label>
                          <textarea
                            rows={3}
                            value={form.aboutBandPara1 || ''}
                            onChange={(e) => updateField('aboutBandPara1', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Paragraph 2 (Scope & Programmes)
                          </label>
                          <textarea
                            rows={3}
                            value={form.aboutBandPara2 || ''}
                            onChange={(e) => updateField('aboutBandPara2', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>
                      </>
                    )}

                    {sectionType === 'assurances' && (
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((num) => (
                          <div key={num} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-[#8B2E24]" />
                              <span className="text-xs font-bold text-slate-800">Assurance Pillar #{num}</span>
                            </div>
                            <input
                              type="text"
                              value={form['assurance' + num + 'Title'] || ''}
                              onChange={(e) => updateField('assurance' + num + 'Title', e.target.value)}
                              placeholder={'Title for Assurance #' + num}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold focus:outline-hidden focus:border-[#8B2E24]"
                            />
                            <textarea
                              rows={2}
                              value={form['assurance' + num + 'Text'] || ''}
                              onChange={(e) => updateField('assurance' + num + 'Text', e.target.value)}
                              placeholder={'Description for Assurance #' + num}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:border-[#8B2E24]"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {sectionType === 'stats' && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          4 Impact Key Statistics
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[1, 2, 3, 4].map((num) => (
                            <div key={num} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                              <span className="text-[11px] font-bold text-[#8B2E24]">Stat Metric #{num}</span>
                              <input
                                type="text"
                                value={form['stat' + num + 'Number'] || ''}
                                onChange={(e) => updateField('stat' + num + 'Number', e.target.value)}
                                placeholder={'Value (e.g. 7,500)'}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-bold focus:outline-hidden focus:border-[#8B2E24]"
                              />
                              <input
                                type="text"
                                value={form['stat' + num + 'Label'] || ''}
                                onChange={(e) => updateField('stat' + num + 'Label', e.target.value)}
                                placeholder={'Label / Metric Name'}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:border-[#8B2E24]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sectionType === 'membership' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                          <span className="text-xs font-bold text-[#8B2E24] uppercase tracking-wider">
                            Left Card: Artisan & Enterprise Join Callout
                          </span>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Card Title</label>
                            <input
                              type="text"
                              value={form.membershipLeftTitle || ''}
                              onChange={(e) => updateField('membershipLeftTitle', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Card Description</label>
                            <textarea
                              rows={2}
                              value={form.membershipLeftText || ''}
                              onChange={(e) => updateField('membershipLeftText', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                          <span className="text-xs font-bold text-[#8B2E24] uppercase tracking-wider">
                            Right Card: Find Master Craftspeople Callout
                          </span>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Card Title</label>
                            <input
                              type="text"
                              value={form.membershipRightTitle || ''}
                              onChange={(e) => updateField('membershipRightTitle', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Card Description</label>
                            <textarea
                              rows={2}
                              value={form.membershipRightText || ''}
                              onChange={(e) => updateField('membershipRightText', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {sectionType === 'about-page' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Who We Are / Mandate Introduction
                          </label>
                          <textarea
                            rows={3}
                            value={form.aboutMandateText || ''}
                            onChange={(e) => updateField('aboutMandateText', e.target.value)}
                            placeholder="The Handicrafts Association of Bhutan (HAB) was established in 2005 under Royal Patronage..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Mission & Support Details (Para 2)
                          </label>
                          <textarea
                            rows={3}
                            value={form.aboutMandatePara2 || ''}
                            onChange={(e) => updateField('aboutMandatePara2', e.target.value)}
                            placeholder="HAB supports local artisans by providing resources, training and policy interventions..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            CSO Registration & Legal Identification
                          </label>
                          <input
                            type="text"
                            value={form.csoRegistration || ''}
                            onChange={(e) => updateField('csoRegistration', e.target.value)}
                            placeholder="2011 · CSO/2011/043"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            History & Growth Narrative
                          </label>
                          <textarea
                            rows={3}
                            value={form.aboutHistoryText || ''}
                            onChange={(e) => updateField('aboutHistoryText', e.target.value)}
                            placeholder="Founded in 2005 and registered in 2011, HAB has united over 7,500 craft practitioners..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>

                        {/* 6 Strategic Objectives */}
                        <div className="pt-2 border-t border-slate-200">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            6 Sector Strategic Objectives
                          </label>
                          <div className="space-y-2">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <div key={num} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                                <span className="text-[11px] font-bold text-[#8B2E24]">Objective #{num}</span>
                                <input
                                  type="text"
                                  value={form['aboutObjective' + num] || ''}
                                  onChange={(e) => updateField('aboutObjective' + num, e.target.value)}
                                  className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:border-[#8B2E24]"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 4 Quick Facts (craftfacts on /about) */}
                        <div className="pt-2 border-t border-slate-200">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            4 Key Sector Facts
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[1, 2, 3, 4].map((num) => (
                              <div key={num} className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                                <span className="text-[10px] font-bold text-[#8B2E24]">Fact #{num}</span>
                                <input
                                  type="text"
                                  value={form['fact' + num + 'Key'] || ''}
                                  onChange={(e) => updateField('fact' + num + 'Key', e.target.value)}
                                  placeholder="Fact Label (e.g. Established)"
                                  className="w-full px-2.5 py-1 rounded border border-slate-300 text-xs font-medium"
                                />
                                <input
                                  type="text"
                                  value={form['fact' + num + 'Val'] || ''}
                                  onChange={(e) => updateField('fact' + num + 'Val', e.target.value)}
                                  placeholder="Fact Value (e.g. 2005)"
                                  className="w-full px-2.5 py-1 rounded border border-slate-300 text-xs font-bold text-slate-900"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 5 CRAFT Core Values */}
                        <div className="pt-2 border-t border-slate-200">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            5 CRAFT Core Values (C-R-A-F-T)
                          </label>
                          <div className="space-y-2">
                            {[
                              { num: 1, letter: 'C', defName: 'Care' },
                              { num: 2, letter: 'R', defName: 'Respect' },
                              { num: 3, letter: 'A', defName: 'Attentive' },
                              { num: 4, letter: 'F', defName: 'Fair' },
                              { num: 5, letter: 'T', defName: 'Transparent' },
                            ].map(({ num, letter, defName }) => (
                              <div key={num} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-[#8B2E24] text-white flex items-center justify-center text-xs font-bold">
                                    {letter}
                                  </span>
                                  <input
                                    type="text"
                                    value={form['aboutCraft' + num + 'Name'] || ''}
                                    onChange={(e) => updateField('aboutCraft' + num + 'Name', e.target.value)}
                                    placeholder={`Value (${letter}) - ${defName}`}
                                    className="flex-1 px-3 py-1 rounded-lg border border-slate-300 text-xs font-bold"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={form['aboutCraft' + num + 'Desc'] || ''}
                                  onChange={(e) => updateField('aboutCraft' + num + 'Desc', e.target.value)}
                                  placeholder={`Description for ${letter} commitment`}
                                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {sectionType === 'donate' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Donation Hero Headline
                          </label>
                          <input
                            type="text"
                            value={form.donateHeroTitle || ''}
                            onChange={(e) => updateField('donateHeroTitle', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Donation Lede / Mission Description
                          </label>
                          <textarea
                            rows={3}
                            value={form.donateHeroLede || ''}
                            onChange={(e) => updateField('donateHeroLede', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Tax Exemption Notice
                          </label>
                          <textarea
                            rows={2}
                            value={form.donateTaxNotice || ''}
                            onChange={(e) => updateField('donateTaxNotice', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>

                        {/* 4 Support Pillars (Card 1 Grassroots has leaf, Cards 2-4 clean) */}
                        <div className="pt-3 border-t border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                              4 Living Heritage Support Pillars
                            </label>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Card 1 designated leaf badge · Cards 2-4 clean
                            </span>
                          </div>

                          {/* Pillar 1: Grassroots Benefit (LEAF) */}
                          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                                <span>Pillar 1: Grassroots Benefit</span>
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                🌿 leaf indicator (Strictly Grassroots only)
                              </span>
                            </div>
                            <input
                              type="text"
                              value={form.pillar_grassroots_title || ''}
                              onChange={(e) => updateField('pillar_grassroots_title', e.target.value)}
                              placeholder="Grassroots Benefit"
                              className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-bold text-slate-900"
                            />
                            <input
                              type="text"
                              value={form.pillar_grassroots_line || ''}
                              onChange={(e) => updateField('pillar_grassroots_line', e.target.value)}
                              placeholder="Tagline: Keeps rural creators trading through the lean season."
                              className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs text-slate-700"
                            />
                            <textarea
                              rows={2}
                              value={form.pillar_grassroots_body || ''}
                              onChange={(e) => updateField('pillar_grassroots_body', e.target.value)}
                              placeholder="Description: Every ngultrum stays in the sector..."
                              className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs text-slate-700"
                            />
                          </div>

                          {/* Pillar 2: Impact Crowdfunding & Enterprise (CLEAN) */}
                          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800">
                                Pillar 2: Impact Crowdfunding &amp; Enterprise
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                Strictly Clean · No leaf
                              </span>
                            </div>
                            <input
                              type="text"
                              value={form.pillar_impact_title || ''}
                              onChange={(e) => updateField('pillar_impact_title', e.target.value)}
                              placeholder="Impact Crowdfunding & Enterprise"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900"
                            />
                            <input
                              type="text"
                              value={form.pillar_impact_line || ''}
                              onChange={(e) => updateField('pillar_impact_line', e.target.value)}
                              placeholder="Tagline: Buys the raw materials an artisan cannot afford upfront."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700"
                            />
                            <textarea
                              rows={2}
                              value={form.pillar_impact_body || ''}
                              onChange={(e) => updateField('pillar_impact_body', e.target.value)}
                              placeholder="Description: Artisans lose orders due to upfront material costs..."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700"
                            />
                          </div>

                          {/* Pillar 3: Vital Cultural Preservation (CLEAN) */}
                          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800">
                                Pillar 3: Vital Cultural Preservation
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                Strictly Clean · No leaf
                              </span>
                            </div>
                            <input
                              type="text"
                              value={form.pillar_cultural_title || ''}
                              onChange={(e) => updateField('pillar_cultural_title', e.target.value)}
                              placeholder="Vital Cultural Preservation"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900"
                            />
                            <input
                              type="text"
                              value={form.pillar_cultural_line || ''}
                              onChange={(e) => updateField('pillar_cultural_line', e.target.value)}
                              placeholder="Tagline: Funds critical master-to-apprentice placements."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700"
                            />
                            <textarea
                              rows={2}
                              value={form.pillar_cultural_body || ''}
                              onChange={(e) => updateField('pillar_cultural_body', e.target.value)}
                              placeholder="Description: Several of Bhutan’s traditional crafts face critical decline..."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700"
                            />
                          </div>

                          {/* Pillar 4: Environmental & Landscape Conservation (CLEAN) */}
                          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800">
                                Pillar 4: Environmental &amp; Landscape Conservation
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                Strictly Clean · No leaf
                              </span>
                            </div>
                            <input
                              type="text"
                              value={form.pillar_environment_title || ''}
                              onChange={(e) => updateField('pillar_environment_title', e.target.value)}
                              placeholder="Environmental & Landscape Conservation"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900"
                            />
                            <input
                              type="text"
                              value={form.pillar_environment_line || ''}
                              onChange={(e) => updateField('pillar_environment_line', e.target.value)}
                              placeholder="Tagline: Replants the natural materials our crafts grow from."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700"
                            />
                            <textarea
                              rows={2}
                              value={form.pillar_environment_body || ''}
                              onChange={(e) => updateField('pillar_environment_body', e.target.value)}
                              placeholder="Description: Craft demand can outrun forest regrowth..."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700"
                            />
                          </div>
                        </div>

                        {/* Preset Donation Amounts */}
                        <div className="pt-2 border-t border-slate-200">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            4 Preset Amount Chips (Nu.)
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[1, 2, 3, 4].map((num) => (
                              <div key={num}>
                                <span className="text-[11px] text-slate-500 font-semibold">Tier #{num}</span>
                                <input
                                  type="number"
                                  value={form['donateAmount' + num] || ''}
                                  onChange={(e) => updateField('donateAmount' + num, Number(e.target.value))}
                                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bank Wire Details */}
                        <div className="pt-2 border-t border-slate-200 space-y-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Bank Account & Wire Transfer Details
                          </label>
                          <input
                            type="text"
                            value={form.donateBankBoB || ''}
                            onChange={(e) => updateField('donateBankBoB', e.target.value)}
                            placeholder="Bank of Bhutan Account"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                          />
                          <input
                            type="text"
                            value={form.donateBankBNB || ''}
                            onChange={(e) => updateField('donateBankBNB', e.target.value)}
                            placeholder="Bhutan National Bank Account"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                          />
                          <input
                            type="text"
                            value={form.donateSwiftCode || ''}
                            onChange={(e) => updateField('donateSwiftCode', e.target.value)}
                            placeholder="SWIFT / BIC Code"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {sectionType === 'contact' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Office Address</label>
                          <input
                            type="text"
                            value={form.officeAddress || ''}
                            onChange={(e) => updateField('officeAddress', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
                          <input
                            type="email"
                            value={form.officialEmail || ''}
                            onChange={(e) => updateField('officialEmail', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Office Telephone</label>
                          <input
                            type="text"
                            value={form.officePhone || ''}
                            onChange={(e) => updateField('officePhone', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Executive Director Direct</label>
                          <input
                            type="text"
                            value={form.edPhone || ''}
                            onChange={(e) => updateField('edPhone', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Marketing Hotline</label>
                          <input
                            type="text"
                            value={form.marketingPhone || ''}
                            onChange={(e) => updateField('marketingPhone', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Office Working Hours</label>
                          <input
                            type="text"
                            value={form.contactHours || ''}
                            onChange={(e) => updateField('contactHours', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Postal Address / P.O. Box</label>
                          <input
                            type="text"
                            value={form.contactPoBox || ''}
                            onChange={(e) => updateField('contactPoBox', e.target.value)}
                            placeholder="P.O. Box 1109, Thimphu"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Physical Directions / Landmark</label>
                          <input
                            type="text"
                            value={form.contactDirections || ''}
                            onChange={(e) => updateField('contactDirections', e.target.value)}
                            placeholder="Near Institute of Zorig Chusum, Kawajangsa, Thimphu"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Contact Page Intro / Lede</label>
                          <textarea
                            rows={2}
                            value={form.contactLede || ''}
                            onChange={(e) => updateField('contactLede', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {sectionType === 'footer' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Footer Organization Description / Blurb
                          </label>
                          <textarea
                            rows={3}
                            value={form.footerAbout || ''}
                            onChange={(e) => updateField('footerAbout', e.target.value)}
                            placeholder="A registered Civil Society Organization under the CSO Act of Bhutan 2007..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Copyright & Registration Line
                          </label>
                          <input
                            type="text"
                            value={form.copyrightText || ''}
                            onChange={(e) => updateField('copyrightText', e.target.value)}
                            placeholder="© 2026 Handicrafts Association of Bhutan. All rights reserved. · Registration CSO/2011/043"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Office Address</label>
                            <input
                              type="text"
                              value={form.officeAddress || ''}
                              onChange={(e) => updateField('officeAddress', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
                            <input
                              type="email"
                              value={form.officialEmail || ''}
                              onChange={(e) => updateField('officialEmail', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Office Telephone</label>
                            <input
                              type="text"
                              value={form.officePhone || ''}
                              onChange={(e) => updateField('officePhone', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">CSO Registration ID</label>
                            <input
                              type="text"
                              value={form.csoRegistration || ''}
                              onChange={(e) => updateField('csoRegistration', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {sectionType === 'punakha' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-amber-950 block">Punakha Riverfront Craft Market</span>
                            <span className="text-[11px] text-amber-800">
                              Directly manage stalls, hours, and craftspeople in the Outlets Studio.
                            </span>
                          </div>
                          <Link
                            href="/admin/clusters-outlets"
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8B2E24] text-white text-xs font-bold hover:bg-[#70241b] transition-colors whitespace-nowrap"
                          >
                            <span>Open Studio</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Market Authenticity Notice
                          </label>
                          <textarea
                            rows={3}
                            value={form.punakhaMarketNotice || ''}
                            onChange={(e) => updateField('punakhaMarketNotice', e.target.value)}
                            placeholder="Validated and managed by HAB for authentic Bhutanese craft provenance."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>
                      </div>
                    )}

                    {sectionType === 'programmes' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-amber-950 block">All 11 Statutory Programmes (A–K)</span>
                            <span className="text-[11px] text-amber-800">
                              Directly edit pillar narratives, objectives, and photos in the Programmes Studio.
                            </span>
                          </div>
                          <Link
                            href="/admin/programmes"
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8B2E24] text-white text-xs font-bold hover:bg-[#70241b] transition-colors whitespace-nowrap"
                          >
                            <span>Open Studio</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Section Eyebrow
                          </label>
                          <input
                            type="text"
                            value={form.programmesEyebrow || 'What we run'}
                            onChange={(e) => updateField('programmesEyebrow', e.target.value)}
                            placeholder="What we run"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Section Headline
                          </label>
                          <input
                            type="text"
                            value={form.programmesTitle || 'Our Programmes'}
                            onChange={(e) => updateField('programmesTitle', e.target.value)}
                            placeholder="Our Programmes"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Mandate Lede / Description
                          </label>
                          <textarea
                            rows={3}
                            value={form.programmesLede || 'The objects are construed broadly: each is a standing programme area, not a fixed project.'}
                            onChange={(e) => updateField('programmesLede', e.target.value)}
                            placeholder="The objects are construed broadly: each is a standing programme area, not a fixed project."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>
                      </div>
                    )}

                    {sectionType === 'wholesale' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-amber-950 block">B2B Wholesale &amp; Trade Studio</span>
                            <span className="text-[11px] text-amber-800">
                              Manage SKU tier pricing, lead times, RFQ quotes, and registered buyers.
                            </span>
                          </div>
                          <Link
                            href="/admin/trade"
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8B2E24] text-white text-xs font-bold hover:bg-[#70241b] transition-colors whitespace-nowrap"
                          >
                            <span>Open Trade Studio</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Wholesale Headline
                          </label>
                          <input
                            type="text"
                            value={form.wholesaleHeroTitle || 'Wholesale & Bulk Orders'}
                            onChange={(e) => updateField('wholesaleHeroTitle', e.target.value)}
                            placeholder="Wholesale & Bulk Orders"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Trade Mandate &amp; Lede
                          </label>
                          <textarea
                            rows={3}
                            value={form.wholesaleHeroLede || 'HAB supplies Bhutanese handicraft at trade terms to retailers, hotels, designers, institutions and distributors.'}
                            onChange={(e) => updateField('wholesaleHeroLede', e.target.value)}
                            placeholder="HAB supplies Bhutanese handicraft at trade terms..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Default MOQ (Units)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={form.wholesaleMoq || 10}
                              onChange={(e) => updateField('wholesaleMoq', Number(e.target.value) || 1)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Standard Lead Time
                            </label>
                            <input
                              type="text"
                              value={form.wholesaleLeadTime || '2 to 4 weeks'}
                              onChange={(e) => updateField('wholesaleLeadTime', e.target.value)}
                              placeholder="2 to 4 weeks"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                            />
                          </div>
                        </div>

                        {/* 5 Wholesale Trade Assurances */}
                        <div className="pt-2 border-t border-slate-200">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            5 Wholesale Trade Assurances
                          </label>
                          <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <div key={num} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                                <span className="text-[10px] font-bold text-[#8B2E24]">Assurance #{num}</span>
                                <input
                                  type="text"
                                  value={form['wholesaleAssurance' + num + 'Title'] || ''}
                                  onChange={(e) => updateField('wholesaleAssurance' + num + 'Title', e.target.value)}
                                  placeholder={'Assurance #' + num + ' Title'}
                                  className="w-full px-3 py-1 rounded-lg border border-slate-300 text-xs font-bold"
                                />
                                <textarea
                                  rows={2}
                                  value={form['wholesaleAssurance' + num + 'Body'] || ''}
                                  onChange={(e) => updateField('wholesaleAssurance' + num + 'Body', e.target.value)}
                                  placeholder={'Assurance #' + num + ' Description'}
                                  className="w-full px-3 py-1 rounded-lg border border-slate-300 text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 6 Step-by-Step Flow Steps */}
                        <div className="pt-2 border-t border-slate-200">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            6 How It Works Flow Steps
                          </label>
                          <div className="space-y-2">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <div key={num} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                                <span className="text-[10px] font-bold text-[#8B2E24]">Step {num}</span>
                                <input
                                  type="text"
                                  value={form['wholesaleFlowStep' + num + 'Title'] || ''}
                                  onChange={(e) => updateField('wholesaleFlowStep' + num + 'Title', e.target.value)}
                                  placeholder={'Step ' + num + ' Title'}
                                  className="w-full px-3 py-1 rounded-lg border border-slate-300 text-xs font-bold"
                                />
                                <input
                                  type="text"
                                  value={form['wholesaleFlowStep' + num + 'Desc'] || ''}
                                  onChange={(e) => updateField('wholesaleFlowStep' + num + 'Desc', e.target.value)}
                                  placeholder={'Step ' + num + ' Description'}
                                  className="w-full px-3 py-1 rounded-lg border border-slate-300 text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Clusters Section Editor */}
                    {sectionType === 'clusters' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-amber-950 block">Artisan Clusters Studio</span>
                            <span className="text-[11px] text-amber-800">
                              Manage all 20 Dzongkhag community clusters, stories, and visitor notes.
                            </span>
                          </div>
                          <Link
                            href="/admin/clusters-outlets"
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8B2E24] text-white text-xs font-bold hover:bg-[#70241b] transition-colors whitespace-nowrap"
                          >
                            <span>Open Studio</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Clusters Page Headline (H1)
                          </label>
                          <input
                            type="text"
                            value={form.clustersHeroTitle || ''}
                            onChange={(e) => updateField('clustersHeroTitle', e.target.value)}
                            placeholder="Artisan clusters"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Clusters Mandate &amp; Introductory Lede
                          </label>
                          <textarea
                            rows={3}
                            value={form.clustersHeroLede || ''}
                            onChange={(e) => updateField('clustersHeroLede', e.target.value)}
                            placeholder="A cluster is a village or valley where one craft is concentrated..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Clusters Badge / Counter Label
                          </label>
                          <input
                            type="text"
                            value={form.clustersCountText || ''}
                            onChange={(e) => updateField('clustersCountText', e.target.value)}
                            placeholder="20 Dzongkhags · Verified Artisan Clusters"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Masters & Honours Section Editor */}
                    {sectionType === 'masters' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-amber-950 block">Honours &amp; Master Artisans Studio</span>
                            <span className="text-[11px] text-amber-800">
                              Manage recognized masters, Royal Seal awards, and citations.
                            </span>
                          </div>
                          <Link
                            href="/admin/honours"
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8B2E24] text-white text-xs font-bold hover:bg-[#70241b] transition-colors whitespace-nowrap"
                          >
                            <span>Open Studio</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Section Eyebrow
                          </label>
                          <input
                            type="text"
                            value={form.mastersHeroEyebrow || ''}
                            onChange={(e) => updateField('mastersHeroEyebrow', e.target.value)}
                            placeholder="Recognition"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Main Headline H1
                          </label>
                          <input
                            type="text"
                            value={form.mastersHeroTitle || ''}
                            onChange={(e) => updateField('mastersHeroTitle', e.target.value)}
                            placeholder="Accreditations & awards"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Introductory Lede Paragraph
                          </label>
                          <textarea
                            rows={3}
                            value={form.mastersHeroLede || ''}
                            onChange={(e) => updateField('mastersHeroLede', e.target.value)}
                            placeholder="A small number of members are recognised individually..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                        <div className="pt-2 border-t border-slate-200 space-y-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            3 National Honours Frameworks
                          </label>
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                            <span className="text-[10px] font-bold text-[#8B2E24]">Honour 1</span>
                            <input
                              type="text"
                              value={form.mastersAward1Title || ''}
                              onChange={(e) => updateField('mastersAward1Title', e.target.value)}
                              placeholder="National Craft Award (Zorig Chusum)"
                              className="w-full px-3 py-1 rounded border border-slate-300 text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={form.mastersAward1Desc || ''}
                              onChange={(e) => updateField('mastersAward1Desc', e.target.value)}
                              placeholder="Description of criteria..."
                              className="w-full px-3 py-1 rounded border border-slate-300 text-xs"
                            />
                          </div>
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                            <span className="text-[10px] font-bold text-[#8B2E24]">Honour 2</span>
                            <input
                              type="text"
                              value={form.mastersAward2Title || ''}
                              onChange={(e) => updateField('mastersAward2Title', e.target.value)}
                              placeholder="Royal Seal of Excellence"
                              className="w-full px-3 py-1 rounded border border-slate-300 text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={form.mastersAward2Desc || ''}
                              onChange={(e) => updateField('mastersAward2Desc', e.target.value)}
                              placeholder="Description of criteria..."
                              className="w-full px-3 py-1 rounded border border-slate-300 text-xs"
                            />
                          </div>
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                            <span className="text-[10px] font-bold text-[#8B2E24]">Honour 3</span>
                            <input
                              type="text"
                              value={form.mastersAward3Title || ''}
                              onChange={(e) => updateField('mastersAward3Title', e.target.value)}
                              placeholder="Master Craftsperson accreditation"
                              className="w-full px-3 py-1 rounded border border-slate-300 text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={form.mastersAward3Desc || ''}
                              onChange={(e) => updateField('mastersAward3Desc', e.target.value)}
                              placeholder="Description of criteria..."
                              className="w-full px-3 py-1 rounded border border-slate-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* News Section Editor */}
                    {sectionType === 'news' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-amber-950 block">News &amp; Articles Studio</span>
                            <span className="text-[11px] text-amber-800">
                              Write new posts, upload press releases, and manage published articles.
                            </span>
                          </div>
                          <Link
                            href="/admin/content"
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8B2E24] text-white text-xs font-bold hover:bg-[#70241b] transition-colors whitespace-nowrap"
                          >
                            <span>Open Studio</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            News Page Headline H1
                          </label>
                          <input
                            type="text"
                            value={form.newsHeroTitle || ''}
                            onChange={(e) => updateField('newsHeroTitle', e.target.value)}
                            placeholder="News & events"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Introductory Lede
                          </label>
                          <textarea
                            rows={3}
                            value={form.newsHeroLede || ''}
                            onChange={(e) => updateField('newsHeroLede', e.target.value)}
                            placeholder="Stay informed, stay empowered."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Events Section Editor */}
                    {sectionType === 'events' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-amber-950 block">Events &amp; Exhibitions Studio</span>
                            <span className="text-[11px] text-amber-800">
                              Create events, set dates, manage bazaars, and registration links.
                            </span>
                          </div>
                          <Link
                            href="/admin/events"
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8B2E24] text-white text-xs font-bold hover:bg-[#70241b] transition-colors whitespace-nowrap"
                          >
                            <span>Open Studio</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Eyebrow
                          </label>
                          <input
                            type="text"
                            value={form.eventsHeroEyebrow || ''}
                            onChange={(e) => updateField('eventsHeroEyebrow', e.target.value)}
                            placeholder="What's coming up"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Headline H1
                          </label>
                          <input
                            type="text"
                            value={form.eventsHeroTitle || ''}
                            onChange={(e) => updateField('eventsHeroTitle', e.target.value)}
                            placeholder="Events"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Introductory Lede
                          </label>
                          <textarea
                            rows={3}
                            value={form.eventsHeroLede || ''}
                            onChange={(e) => updateField('eventsHeroLede', e.target.value)}
                            placeholder="Craft bazaars, training courses, export clinics..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                        <div className="pt-2 border-t border-slate-200 space-y-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Attending &amp; Secretariat Panel
                          </label>
                          <input
                            type="text"
                            value={form.eventsAttendingTitle || ''}
                            onChange={(e) => updateField('eventsAttendingTitle', e.target.value)}
                            placeholder="Attending"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                          />
                          <textarea
                            rows={2}
                            value={form.eventsAttendingBody || ''}
                            onChange={(e) => updateField('eventsAttendingBody', e.target.value)}
                            placeholder="Places and stalls are arranged through the secretariat..."
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="email"
                              value={form.eventsAttendingEmail || ''}
                              onChange={(e) => updateField('eventsAttendingEmail', e.target.value)}
                              placeholder="officehab@gmail.com"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                            />
                            <input
                              type="text"
                              value={form.eventsAttendingPhone || ''}
                              onChange={(e) => updateField('eventsAttendingPhone', e.target.value)}
                              placeholder="+975-2-338089"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Publications Section Editor */}
                    {sectionType === 'publications' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-amber-950 block">Publications &amp; Reports Studio</span>
                            <span className="text-[11px] text-amber-800">
                              Upload annual reports, research PDFs, and audited accounts.
                            </span>
                          </div>
                          <Link
                            href="/admin/publications"
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8B2E24] text-white text-xs font-bold hover:bg-[#70241b] transition-colors whitespace-nowrap"
                          >
                            <span>Open Studio</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Publications Headline H1
                          </label>
                          <input
                            type="text"
                            value={form.publicationsHeroTitle || ''}
                            onChange={(e) => updateField('publicationsHeroTitle', e.target.value)}
                            placeholder="Publications"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Introductory Lede
                          </label>
                          <textarea
                            rows={3}
                            value={form.publicationsHeroLede || ''}
                            onChange={(e) => updateField('publicationsHeroLede', e.target.value)}
                            placeholder="Annual reports, audited accounts, sector research..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                        <div className="pt-2 border-t border-slate-200 space-y-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Featured Report Highlight
                          </label>
                          <input
                            type="text"
                            value={form.publicationsLeadTitle || ''}
                            onChange={(e) => updateField('publicationsLeadTitle', e.target.value)}
                            placeholder="Annual Report 2025"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                          />
                          <textarea
                            rows={2}
                            value={form.publicationsLeadAbstract || ''}
                            onChange={(e) => updateField('publicationsLeadAbstract', e.target.value)}
                            placeholder="Programme outcomes, sector figures and audited accounts..."
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                          />
                          <input
                            type="text"
                            value={form.publicationsLeadDownloadUrl || ''}
                            onChange={(e) => updateField('publicationsLeadDownloadUrl', e.target.value)}
                            placeholder="/assets/docs/hab-annual-report-2025.pdf"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* Policies Section Editor */}
                    {sectionType === 'policies' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-amber-950 block">Policies &amp; Governance Studio</span>
                            <span className="text-[11px] text-amber-800">
                              Edit statutory policies, terms of service, and privacy standards.
                            </span>
                          </div>
                          <Link
                            href="/admin/policies"
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8B2E24] text-white text-xs font-bold hover:bg-[#70241b] transition-colors whitespace-nowrap"
                          >
                            <span>Open Studio</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Policies Headline H1
                          </label>
                          <input
                            type="text"
                            value={form.policiesHeroTitle || ''}
                            onChange={(e) => updateField('policiesHeroTitle', e.target.value)}
                            placeholder="Statutory Policies & Governance"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Introductory Lede
                          </label>
                          <textarea
                            rows={3}
                            value={form.policiesHeroLede || ''}
                            onChange={(e) => updateField('policiesHeroLede', e.target.value)}
                            placeholder="Official policies, artisan rights charter..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Charter Governance Notice
                          </label>
                          <textarea
                            rows={2}
                            value={form.policiesCharterNotice || ''}
                            onChange={(e) => updateField('policiesCharterNotice', e.target.value)}
                            placeholder="Constituted under the Civil Society Organizations Act of Bhutan 2007..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Outlets Section Editor */}
                    {sectionType === 'outlets' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-amber-950 block">Outlets &amp; Markets Studio</span>
                            <span className="text-[11px] text-amber-800">
                              Manage physical emporiums, stalls, opening hours, and locations.
                            </span>
                          </div>
                          <Link
                            href="/admin/clusters-outlets"
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8B2E24] text-white text-xs font-bold hover:bg-[#70241b] transition-colors whitespace-nowrap"
                          >
                            <span>Open Studio</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Featured Outlet Eyebrow
                          </label>
                          <input
                            type="text"
                            value={form.outletsHeroEyebrow || ''}
                            onChange={(e) => updateField('outletsHeroEyebrow', e.target.value)}
                            placeholder="Verified Markets · HAB Validated"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Featured Outlet Name H1
                          </label>
                          <input
                            type="text"
                            value={form.outletsHeroTitle || ''}
                            onChange={(e) => updateField('outletsHeroTitle', e.target.value)}
                            placeholder="Punakha Riverfront Craft Market"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Description Lede
                          </label>
                          <textarea
                            rows={3}
                            value={form.outletsHeroLede || ''}
                            onChange={(e) => updateField('outletsHeroLede', e.target.value)}
                            placeholder="Physical outlets, verified markets and artisan clusters..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Location / Where</label>
                            <input
                              type="text"
                              value={form.outletsFeaturedPlace || ''}
                              onChange={(e) => updateField('outletsFeaturedPlace', e.target.value)}
                              placeholder="Punakha Dzong riverside, Punakha"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Open Hours</label>
                            <input
                              type="text"
                              value={form.outletsFeaturedHours || ''}
                              onChange={(e) => updateField('outletsFeaturedHours', e.target.value)}
                              placeholder="Wednesday – Sunday: 9:00 AM – 6:00 PM"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Scale / Stalls Count</label>
                            <input
                              type="text"
                              value={form.outletsFeaturedStalls || ''}
                              onChange={(e) => updateField('outletsFeaturedStalls', e.target.value)}
                              placeholder="34 permanent stalls · 12 rotating weekend makers"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ================= TAB 2: CALL-TO-ACTION BUTTONS ================= */}
                {activeTab === 'ACTIONS' && (
                  <div className="space-y-4">
                    {sectionType === 'hero' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <span className="text-xs font-bold text-slate-800">Primary Button</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Button Text</label>
                              <input
                                type="text"
                                value={form.heroCtaPrimaryText || ''}
                                onChange={(e) => updateField('heroCtaPrimaryText', e.target.value)}
                                placeholder="Our mission"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Destination Link</label>
                              <input
                                type="text"
                                value={form.heroCtaPrimaryLink || ''}
                                onChange={(e) => updateField('heroCtaPrimaryLink', e.target.value)}
                                placeholder="/about"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <span className="text-xs font-bold text-slate-800">Secondary Button</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Button Text</label>
                              <input
                                type="text"
                                value={form.heroCtaSecondaryText || ''}
                                onChange={(e) => updateField('heroCtaSecondaryText', e.target.value)}
                                placeholder="Shop the crafts →"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Destination Link</label>
                              <input
                                type="text"
                                value={form.heroCtaSecondaryLink || ''}
                                onChange={(e) => updateField('heroCtaSecondaryLink', e.target.value)}
                                placeholder="/shop"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {sectionType === 'about' && (
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-slate-800">About Band Link Button</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Button Label</label>
                            <input
                              type="text"
                              value={form.aboutBandCtaText || ''}
                              onChange={(e) => updateField('aboutBandCtaText', e.target.value)}
                              placeholder="Read about our programmes"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Target URL</label>
                            <input
                              type="text"
                              value={form.aboutBandCtaLink || ''}
                              onChange={(e) => updateField('aboutBandCtaLink', e.target.value)}
                              placeholder="/programmes"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {sectionType === 'membership' && (
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-slate-800">Apply Membership Button</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Button Text</label>
                            <input
                              type="text"
                              value={form.membershipLeftCtaText || ''}
                              onChange={(e) => updateField('membershipLeftCtaText', e.target.value)}
                              placeholder="Apply for Membership →"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Destination URL</label>
                            <input
                              type="text"
                              value={form.membershipLeftCtaLink || ''}
                              onChange={(e) => updateField('membershipLeftCtaLink', e.target.value)}
                              placeholder="/register"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {sectionType === 'footer' && (
                      <div className="space-y-3">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                          <strong>Zero Dummy Links Policy:</strong> Social media links only appear in the public footer if you provide a valid URL below. Leaving a field blank completely hides that icon from the website.
                        </div>
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook Page URL</label>
                            <input
                              type="url"
                              value={form.facebookUrl || ''}
                              onChange={(e) => updateField('facebookUrl', e.target.value)}
                              placeholder="https://facebook.com/handicraftsbhutan (Leave blank if none)"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram Profile URL</label>
                            <input
                              type="url"
                              value={form.instagramUrl || ''}
                              onChange={(e) => updateField('instagramUrl', e.target.value)}
                              placeholder="https://instagram.com/handicraftsbhutan (Leave blank if none)"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">X / Twitter URL</label>
                            <input
                              type="url"
                              value={form.twitterUrl || ''}
                              onChange={(e) => updateField('twitterUrl', e.target.value)}
                              placeholder="https://x.com/handicraftsbhutan (Leave blank if none)"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube Channel URL</label>
                            <input
                              type="url"
                              value={form.youtubeUrl || ''}
                              onChange={(e) => updateField('youtubeUrl', e.target.value)}
                              placeholder="https://youtube.com/@handicraftsbhutan (Leave blank if none)"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">TikTok Profile URL</label>
                            <input
                              type="url"
                              value={form.tiktokUrl || ''}
                              onChange={(e) => updateField('tiktokUrl', e.target.value)}
                              placeholder="https://tiktok.com/@handicraftsbhutan (Leave blank if none)"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ================= TAB 3: MEDIA & PHOTOGRAPHS ================= */}
                {activeTab === 'MEDIA' && (
                  <div className="space-y-4">
                    {sectionType === 'about' && (
                      <div className="space-y-3">
                        <FileUploadInput
                          value={form.aboutBandImageUrl || ''}
                          onChange={(url) => updateField('aboutBandImageUrl', url)}
                          label="About Band Photograph"
                          hint="Recommended: Landscape or square artisan workshop photo (JPG/WebP/PNG)"
                        />
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Image Caption / Screen-reader Alt Text
                          </label>
                          <input
                            type="text"
                            value={form.aboutBandImageCaption || ''}
                            onChange={(e) => updateField('aboutBandImageCaption', e.target.value)}
                            placeholder="Master weaver instructing apprentices in Thimphu"
                            className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {sectionType === 'hero' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800">
                              Active Hero Background Slides ({slides.length})
                            </span>
                            <p className="text-[11px] text-slate-500">
                              Artisan slides cycle automatically in the hero frame.
                            </p>
                          </div>
                          <Link
                            href="/admin/hero"
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 text-xs font-semibold transition-colors"
                          >
                            <span>Manage Full Slider</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {slides.map((slide, idx) => (
                            <div
                              key={slide.id || idx}
                              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3"
                            >
                              <div className="w-16 h-12 rounded-lg overflow-hidden relative shrink-0 bg-slate-200 border border-slate-300">
                                <img
                                  src={slide.imageUrl}
                                  alt={slide.altText || slide.caption}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="block text-xs font-bold text-slate-800 truncate">
                                  {slide.caption || ('Slide #' + (idx + 1))}
                                </span>
                                <span className="block text-[10px] text-slate-500 truncate font-mono">
                                  {slide.imageUrl}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ================= TAB 4: IMPACT STATS ================= */}
                {activeTab === 'STATS' && (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((num) => (
                      <div
                        key={num}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center"
                      >
                        <div className="sm:col-span-1">
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Stat #{num} Number
                          </label>
                          <input
                            type="text"
                            value={form['stat' + num + 'Number'] || ''}
                            onChange={(e) => updateField('stat' + num + 'Number', e.target.value)}
                            placeholder="e.g. 7,500"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-[#8B2E24]"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Stat #{num} Label / Metric
                          </label>
                          <input
                            type="text"
                            value={form['stat' + num + 'Label'] || ''}
                            onChange={(e) => updateField('stat' + num + 'Label', e.target.value)}
                            placeholder="e.g. Micro & small enterprises in the network"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex-shrink-0 p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href={defaultStudioHref}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Admin Studio</span>
              </Link>
              <span className="text-slate-300">|</span>
              <Link
                href="/admin/pages?new=1"
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#8B2E24] hover:text-[#73241c] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Page</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || loading}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

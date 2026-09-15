'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  ExternalLink,
  Edit3,
  Search,
  CheckCircle2,
  Sparkles,
  Layout,
  BookOpen,
  FolderKanban,
  Store,
  Award,
  Users,
  Newspaper,
  Calendar,
  Heart,
  BadgePercent,
  Mail,
  ShieldCheck,
  Palette
} from 'lucide-react';

interface WebPageItem {
  id: string;
  title: string;
  publicPath: string;
  adminHref: string;
  category: string;
  icon: any;
  sectionsCount: string;
  summary: string;
  crudFeatures: string[];
}

const WEBSITE_PAGES: WebPageItem[] = [
  {
    id: 'home',
    title: 'Homepage (A to Z)',
    publicPath: '/',
    adminHref: '/admin/pages/home',
    category: 'Core Pages',
    icon: Layout,
    sectionsCount: '15 Sections',
    summary: 'Hero slider carousel, intro mandate, Punakha Crafts Market, physical outlets grid, artisan clusters, partner logos, and global announcement bar.',
    crudFeatures: ['Hero Slides CRUD', 'Punakha Market CMS', 'Outlets Selection', 'Partner Logos CRUD', 'Intro Text CMS'],
  },
  {
    id: 'about',
    title: 'About Us',
    publicPath: '/about',
    adminHref: '/admin/pages/about',
    category: 'Core Pages',
    icon: BookOpen,
    sectionsCount: '6 Sections',
    summary: 'Mandate narrative, Vision, Mission, 6 Sector Objectives, 5 CRAFT values, Board of Trustees, Secretariat Team, and Historical Milestones.',
    crudFeatures: ['Board of Trustees CRUD', 'Secretariat Team CRUD', 'Milestones CRUD', 'Mission/Vision CMS'],
  },
  {
    id: 'programmes',
    title: 'Training Programmes (A–K)',
    publicPath: '/programmes',
    adminHref: '/admin/programmes',
    category: 'Impact & Programmes',
    icon: BookOpen,
    sectionsCount: '11 Pillars',
    summary: 'Standing programme areas under Article 3.2 of the Articles of Association, from Zorig Chusum skills training to quality certification.',
    crudFeatures: ['Programme Pillars A-K CRUD', 'Syllabus Editor', 'Trainer Profiles', 'Letter Badges'],
  },
  {
    id: 'projects',
    title: 'Donor Projects',
    publicPath: '/projects',
    adminHref: '/admin/projects',
    category: 'Impact & Programmes',
    icon: FolderKanban,
    sectionsCount: 'Project Catalog',
    summary: 'Current and completed development projects funded by RGoB, EU SWITCH-Asia, SHINE, GIZ, and international donors.',
    crudFeatures: ['Projects CRUD', 'Budget & Dates', 'Progress Tracking', 'Banner Photos Upload'],
  },
  {
    id: 'outlets-clusters',
    title: 'Outlets & Artisan Clusters',
    publicPath: '/clusters',
    adminHref: '/admin/clusters-outlets',
    category: 'Field & Retail',
    icon: Store,
    sectionsCount: 'Retail & Clusters',
    summary: 'Physical retail craft shops (Punakha Market, Thimphu Outlet, Paro Airport, Bumthang) and registered artisan clusters across 20 Dzongkhags.',
    crudFeatures: ['Physical Outlets CRUD', 'Artisan Clusters CRUD', 'Opening Hours CMS', 'Photos Upload'],
  },
  {
    id: 'masters',
    title: 'Master Artisans & Honours',
    publicPath: '/masters',
    adminHref: '/admin/honours',
    category: 'Artisans',
    icon: Award,
    sectionsCount: 'Honours Roll',
    summary: 'Master craftspeople accredited for traditional excellence, Seal of Excellence awardees, and national craft recognition recipients.',
    crudFeatures: ['Masters CRUD', 'Award Citations', 'Year & Craft Filtering', 'Portrait Photos Upload'],
  },
  {
    id: 'membership',
    title: 'Membership Information & Tiers',
    publicPath: '/membership',
    adminHref: '/admin/membership-categories',
    category: 'Artisans',
    icon: Users,
    sectionsCount: 'Tiers & Applications',
    summary: 'Membership categories (Individual Artisan, Craft Enterprise, Cluster, Associate, Honorary), annual fees, criteria, and benefits.',
    crudFeatures: ['Membership Tiers CRUD', 'Application Review Queue', 'Dues Settings', 'Perks CMS'],
  },
  {
    id: 'news',
    title: 'News & Stories',
    publicPath: '/news',
    adminHref: '/admin/content',
    category: 'Communications',
    icon: Newspaper,
    sectionsCount: 'Newsroom',
    summary: 'Press releases, artisan success stories, training workshop announcements, and sector news updates.',
    crudFeatures: ['Articles CRUD', 'Rich Text Body', 'Cover Photo Upload', 'Category Tags'],
  },
  {
    id: 'events',
    title: 'Exhibitions & Events',
    publicPath: '/events',
    adminHref: '/admin/events',
    category: 'Communications',
    icon: Calendar,
    sectionsCount: 'Calendar',
    summary: 'National handicraft expos, trade fair calendars, design workshops, and Annual Sector Forum schedule.',
    crudFeatures: ['Events Calendar CRUD', 'Registration Links', 'Venue & Schedule', 'Posters Upload'],
  },
  {
    id: 'publications',
    title: 'Reports & Publications',
    publicPath: '/publications',
    adminHref: '/admin/publications',
    category: 'Communications',
    icon: FileText,
    sectionsCount: 'Digital Library',
    summary: 'Annual Sector Impact Reports, audited financial statements, strategic five-year plans, and sector study downloads.',
    crudFeatures: ['Publications CRUD', 'PDF Upload up to 30MB', 'File Size Badges', 'Featured Downloads'],
  },
  {
    id: 'donate',
    title: 'Donations & Support Appeals',
    publicPath: '/donate',
    adminHref: '/admin/donate-settings',
    category: 'Support & Giving',
    icon: Heart,
    sectionsCount: 'Support Pillars',
    summary: 'Donation causes, offline donation ledger recording, CSO/2011/043 official tax exemption receipt printing, and Bank of Bhutan wire details.',
    crudFeatures: ['Support Pillars CRUD', 'Offline Donations Ledger', 'Printable Tax Receipts', 'Reconciliation'],
  },
  {
    id: 'wholesale',
    title: 'B2B Wholesale & Trade',
    publicPath: '/wholesale',
    adminHref: '/admin/trade',
    category: 'Commerce',
    icon: BadgePercent,
    sectionsCount: 'B2B Trade',
    summary: 'Wholesale trade inquiries, buyer verification, minimum order quantities (MOQ), standard lead times, and export pricing tiers.',
    crudFeatures: ['Wholesale Inquiries CRUD', 'Buyer Approvals', 'MOQ & Lead Times', 'Export Discounts'],
  },
  {
    id: 'contact',
    title: 'Contact & Inquiries',
    publicPath: '/contact',
    adminHref: '/admin/inquiries',
    category: 'Core Pages',
    icon: Mail,
    sectionsCount: 'Secretariat HQ',
    summary: 'Headquarters contact numbers (Office, ED, Marketing), official email, PO Box, opening hours, and customer contact inbox.',
    crudFeatures: ['Inquiries Inbox CRUD', 'Message Status', 'HQ Contact Info CMS', 'Staff Notes'],
  },
  {
    id: 'policies',
    title: 'Legal Policies',
    publicPath: '/privacy',
    adminHref: '/admin/policies',
    category: 'Governance',
    icon: ShieldCheck,
    sectionsCount: '4 Policies',
    summary: 'Terms of Service, Privacy Policy, Shipping & Delivery Policy, and Returns & Refund Policy under the CSO Act 2007.',
    crudFeatures: ['Policies CRUD', 'Rich Text Clauses', 'Version Control', 'Publish Status'],
  },
  {
    id: 'crafts',
    title: 'The 13 Crafts (Zorig Chusum)',
    publicPath: '/crafts',
    adminHref: '/admin/crafts',
    category: 'Heritage Taxonomy',
    icon: Palette,
    sectionsCount: '13 Categories',
    summary: 'The thirteen traditional arts and crafts of Bhutan: Shingzo, Dhozo, Parzo, Lhazo, Jimzo, Lugzo, Garzo, Shakzo, Tshemzo, Thagzo, Tsharzo, Dezo, and Dozo.',
    crudFeatures: ['13 Crafts CRUD', 'Dzongkha Script Titles', 'Heritage Photos Upload', 'Master Tools CMS'],
  },
];

export default function AdminPagesHub() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'Core Pages', 'Impact & Programmes', 'Field & Retail', 'Artisans', 'Communications', 'Commerce', 'Governance', 'Heritage Taxonomy'];

  const filteredPages = WEBSITE_PAGES.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.summary.toLowerCase().includes(search.toLowerCase()) ||
      p.crudFeatures.some((f) => f.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono font-bold text-[10px] uppercase tracking-wider">
              WordPress-Style Architecture
            </span>
            <span className="text-xs text-slate-500 font-medium">15 Managed Pages</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Website Pages Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full end-to-end control of every page. Manage sections, upload photos &amp; PDFs, format text, and perform full CRUD without developer assistance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <Link
            href="/admin/pages/home"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Manage Homepage (A–Z)</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search pages or CRUD features..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPages.map((page) => {
          const Icon = page.icon;
          return (
            <div
              key={page.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#8B2E24] border border-amber-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono font-medium border border-slate-200">
                      {page.sectionsCount}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Live
                    </span>
                  </div>
                </div>

                <div className="mt-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {page.category}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#8B2E24] transition-colors mt-0.5">
                    {page.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {page.summary}
                  </p>
                </div>

                {/* CRUD Tags */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-1">
                  {page.crudFeatures.map((f, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href={page.publicPath}
                  target="_blank"
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <Link
                  href={page.adminHref}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#8B2E24] text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Content &amp; CRUD →</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

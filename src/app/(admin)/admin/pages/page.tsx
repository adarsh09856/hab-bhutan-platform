'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
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
  Palette,
  Plus,
  Trash2,
  Eye,
  AlertCircle,
  Clock,
  Layers,
  Check
} from 'lucide-react';
import FileUploadInput from '@/components/admin/FileUploadInput';
import RichTextEditor from '@/components/admin/RichTextEditor';
import AdvancedEditorSuite, { AdvancedEditorFormState } from '@/components/admin/AdvancedEditorSuite';

interface WebPageItem {
  id: string;
  title: string;
  slug?: string;
  publicPath: string;
  adminHref?: string;
  category: string;
  icon?: any;
  sectionsCount: string;
  summary: string;
  crudFeatures: string[];
  isCustom?: boolean;
  isPublished?: boolean;
  bannerUrl?: string | null;
  content?: string;
  showInHeaderNav?: boolean;
  showInFooterNav?: boolean;
  createdAt?: string;
}

const CORE_WEBSITE_PAGES: WebPageItem[] = [
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
    isCustom: false,
    isPublished: true,
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
    isCustom: false,
    isPublished: true,
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
    isCustom: false,
    isPublished: true,
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
    isCustom: false,
    isPublished: true,
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
    isCustom: false,
    isPublished: true,
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
    isCustom: false,
    isPublished: true,
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
    isCustom: false,
    isPublished: true,
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
    isCustom: false,
    isPublished: true,
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
    isCustom: false,
    isPublished: true,
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
    isCustom: false,
    isPublished: true,
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
    isCustom: false,
    isPublished: true,
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
    isCustom: false,
    isPublished: true,
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
    isCustom: false,
    isPublished: true,
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
    isCustom: false,
    isPublished: true,
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
    isCustom: false,
    isPublished: true,
  },
];

export default function AdminPagesHub() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [customPages, setCustomPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State for Create / Edit Custom Page
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Deletion Modal State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<{ id: string; title: string } | null>(null);

  // Form fields
  const [form, setForm] = useState<AdvancedEditorFormState>({
    title: '',
    slug: '',
    category: 'General',
    excerpt: '',
    content: '',
    bannerUrl: '',
    videoUrl: '',
    galleryImages: [],
    socialLinks: { facebook: '', instagram: '', youtube: '', twitter: '', whatsapp: '' },
    ctaButton: { label: '', url: '', style: 'primary' },
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    isPublished: true,
    showInHeaderNav: false,
    showInFooterNav: false,
  });

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadCustomPages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pages', { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCustomPages(data.customPages || []);
      }
    } catch (err) {
      console.error('Failed to load custom pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomPages();
  }, []);

  const openCreateModal = () => {
    setEditingPageId(null);
    setIsCreatingCategory(false);
    setCustomCategoryInput('');
    setForm({
      title: '',
      slug: '',
      category: 'General',
      excerpt: '',
      content: '',
      bannerUrl: '',
      videoUrl: '',
      galleryImages: [],
      socialLinks: { facebook: '', instagram: '', youtube: '', twitter: '', whatsapp: '' },
      ctaButton: { label: '', url: '', style: 'primary' },
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      isPublished: true,
      showInHeaderNav: false,
      showInFooterNav: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingPageId(p.id);
    setIsCreatingCategory(false);
    setCustomCategoryInput('');
    setForm({
      title: p.title || '',
      slug: p.slug || '',
      category: p.category || 'General',
      excerpt: p.excerpt || '',
      content: p.content || '',
      bannerUrl: p.bannerUrl || '',
      videoUrl: p.videoUrl || '',
      galleryImages: Array.isArray(p.galleryImages) ? p.galleryImages : [],
      socialLinks: p.socialLinks || { facebook: '', instagram: '', youtube: '', twitter: '', whatsapp: '' },
      ctaButton: p.ctaButton || { label: '', url: '', style: 'primary' },
      seoTitle: p.seoTitle || '',
      seoDescription: p.seoDescription || '',
      seoKeywords: p.seoKeywords || '',
      isPublished: p.isPublished !== undefined ? p.isPublished : true,
      showInHeaderNav: Boolean(p.showInHeaderNav),
      showInFooterNav: Boolean(p.showInFooterNav),
    });
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setForm((prev) => {
      // Auto-generate slug if not editing or if slug was derived from title
      const newSlug = !editingPageId || !prev.slug
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        : prev.slug;
      return { ...prev, title: val, slug: newSlug };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('error', 'Page title is required');
      return;
    }

    setSubmitting(true);
    try {
      const finalCategory = isCreatingCategory && customCategoryInput.trim()
        ? customCategoryInput.trim()
        : form.category.trim() || 'General';

      const payload = {
        ...form,
        category: finalCategory,
      };

      const url = editingPageId ? `/api/admin/pages/${editingPageId}` : '/api/admin/pages';
      const method = editingPageId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', editingPageId ? `Page "${form.title}" updated successfully!` : `New page "${form.title}" published!`);
        setModalOpen(false);
        loadCustomPages();
      } else {
        showToast('error', data.error || 'Failed to save page');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Network error saving page');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeletePage = (id: string, title: string) => {
    setPageToDelete({ id, title });
    setDeleteConfirmOpen(true);
  };

  const executeDeletePage = async () => {
    if (!pageToDelete) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/pages/${pageToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', `Deleted "${pageToDelete.title}" and unlinked any navigation items.`);
        setDeleteConfirmOpen(false);
        setPageToDelete(null);
        loadCustomPages();
      } else {
        showToast('error', data.error || 'Failed to delete page');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Network error deleting page');
    } finally {
      setSubmitting(false);
    }
  };

  // Convert custom pages to WebPageItem shape for unified directory view
  const formattedCustomPages: WebPageItem[] = customPages.map((cp) => ({
    id: cp.id,
    title: cp.title,
    slug: cp.slug,
    publicPath: `/pages/${cp.slug}`,
    category: cp.category || 'Custom CMS',
    icon: FileText,
    sectionsCount: 'Custom Dynamic Page',
    summary: cp.excerpt || 'Custom created page managed directly via CMS editor.',
    crudFeatures: ['Full Rich Text CRUD', 'Public View /pages/[slug]', 'Live Quick-Edit Badge', cp.showInHeaderNav ? 'Header Nav Linked' : 'Standalone Page'],
    isCustom: true,
    isPublished: cp.isPublished,
    bannerUrl: cp.bannerUrl,
    content: cp.content,
    showInHeaderNav: cp.showInHeaderNav,
    showInFooterNav: cp.showInFooterNav,
    createdAt: cp.createdAt,
  }));

  // Unified all-pages list
  const allPages = [...formattedCustomPages, ...CORE_WEBSITE_PAGES];

  const dynamicCustomCategories = Array.from(
    new Set(customPages.map((p) => p.category).filter(Boolean))
  );

  const categories = [
    'ALL',
    'Custom CMS',
    'Core Pages',
    ...dynamicCustomCategories.filter((c) => !['Core Pages', 'Custom CMS'].includes(c)),
    'Impact & Programmes',
    'Field & Retail',
    'Artisans',
    'Communications',
    'Commerce',
    'Governance',
    'Heritage Taxonomy',
  ].filter((c, i, arr) => arr.indexOf(c) === i);

  const availableFormCategories = Array.from(
    new Set([
      'General',
      'Initiatives',
      'Community',
      'Heritage',
      'Reports',
      'Exhibition',
      'Event',
      'Programme',
      'Announcement',
      ...dynamicCustomCategories,
    ].filter(Boolean))
  );

  const filteredPages = allPages.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.summary.toLowerCase().includes(search.toLowerCase()) ||
      p.crudFeatures.some((f) => f.toLowerCase().includes(search.toLowerCase()));

    if (selectedCategory === 'ALL') return matchesSearch;
    if (selectedCategory === 'Custom CMS') return matchesSearch && p.isCustom;
    return matchesSearch && p.category === selectedCategory;
  });

  return (
    <div className="space-y-6 pb-12 font-figtree">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-bounce ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header with Action Bar & "+ Create Page" Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-slate-900 font-mono font-bold text-[10px] uppercase tracking-wider">
              Unified CMS Architecture
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {allPages.length} Pages Managed ({customPages.length} Custom · {CORE_WEBSITE_PAGES.length} Core Studios)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Website Pages Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full end-to-end control of every page. Create new custom dynamic pages, manage sections, upload photos, format text, and perform full CRUD without developer assistance.
          </p>
        </div>

        {/* Right-side Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <Link
            href="/admin/pages/home"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage Homepage (A–Z)</span>
          </Link>

          {/* Primary "+ Create Page" Button */}
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
            id="create-page-btn"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Create Page</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search all pages or features..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
              {cat === 'Custom CMS' && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-400/30 text-amber-800 font-mono text-[10px] font-bold">
                  {customPages.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPages.map((page) => {
          const Icon = page.icon || FileText;
          return (
            <div
              key={page.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                page.isCustom ? 'border-amber-300/80 bg-linear-to-b from-[#FFFDF9] to-white ring-1 ring-amber-100' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${
                    page.isCustom ? 'bg-amber-100 text-[#8B2E24] border border-amber-200' : 'bg-slate-100 text-[#8B2E24] border border-slate-200'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {page.isCustom ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold border border-amber-300">
                        Custom CMS
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono font-medium border border-slate-200">
                        {page.sectionsCount}
                      </span>
                    )}

                    {page.isPublished ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Live
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
                        <Clock className="w-3 h-3" />
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
                    <span>{page.category}</span>
                    {page.isCustom && <span className="text-[10px] text-amber-700 lowercase font-mono">{page.publicPath}</span>}
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
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                        page.isCustom ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
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
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </Link>

                {page.isCustom ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(customPages.find((c) => c.id === page.id))}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-[#8B2E24] text-white text-xs font-semibold transition-colors shadow-xs"
                      title="Edit custom page content and media"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDeletePage(page.id, page.title)}
                      className="p-1.5 rounded-lg text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 transition-colors"
                      title="Delete page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href={page.adminHref || '/admin'}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#8B2E24] text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Manage Studio →</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredPages.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No pages matched your filter.</p>
          <p className="text-xs text-slate-400 mt-1">Try a different search term or click &quot;+ Create Page&quot; to publish a new page.</p>
        </div>
      )}

      {/* CREATE / EDIT CUSTOM PAGE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[94dvh] flex flex-col shadow-2xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B2E24]">
                  {editingPageId ? 'Edit Custom CMS Page' : 'Publish New Website Page'}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 truncate">
                  {editingPageId ? `Editing: ${form.title}` : 'Create Dynamic Page'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <AdvancedEditorSuite
                form={form}
                onChange={(updated) => setForm((prev) => ({ ...prev, ...updated }))}
                availableCategories={availableFormCategories}
                isCreatingCategory={isCreatingCategory}
                setIsCreatingCategory={setIsCreatingCategory}
                customCategoryInput={customCategoryInput}
                setCustomCategoryInput={setCustomCategoryInput}
              />

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors text-center"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{submitting ? 'Saving...' : editingPageId ? 'Update Page' : 'Publish Page'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmOpen && pageToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Delete &quot;{pageToDelete.title}&quot;?
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              This will permanently delete the page and remove any linked header or footer navigation items. This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setPageToDelete(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={executeDeletePage}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                {submitting ? 'Deleting...' : 'Yes, Delete Page'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

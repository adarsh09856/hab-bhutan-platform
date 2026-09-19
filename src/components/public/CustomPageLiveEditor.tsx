'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Edit3,
  ExternalLink,
  Image as ImageIcon,
  Type,
  FileText,
  Compass,
  Search,
  Eye,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import FileUploadInput from '@/components/admin/FileUploadInput';
import RichTextEditor from '@/components/admin/RichTextEditor';

export interface CustomPageData {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt?: string | null;
  content: string;
  bannerUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isPublished: boolean;
  showInHeaderNav?: boolean;
  showInFooterNav?: boolean;
}

interface CustomPageLiveEditorProps {
  isOpen: boolean;
  onClose: () => void;
  page: CustomPageData;
  onSaved?: (updatedPage: CustomPageData) => void;
}

const CATEGORIES = [
  'General',
  'Heritage',
  'Initiative',
  'Event',
  'Exhibition',
  'Programme',
  'Announcement',
  'Craft Knowledge',
  'Community',
];

export default function CustomPageLiveEditor({
  isOpen,
  onClose,
  page,
  onSaved,
}: CustomPageLiveEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'MEDIA' | 'NAVIGATION' | 'SEO'>('CONTENT');

  // Form states initialized with page prop
  const [title, setTitle] = useState(page.title || '');
  const [slug, setSlug] = useState(page.slug || '');
  const [category, setCategory] = useState(page.category || 'General');
  const [excerpt, setExcerpt] = useState(page.excerpt || '');
  const [content, setContent] = useState(page.content || '');
  const [bannerUrl, setBannerUrl] = useState(page.bannerUrl || '');
  const [seoTitle, setSeoTitle] = useState(page.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(page.seoDescription || '');
  const [isPublished, setIsPublished] = useState(Boolean(page.isPublished));
  const [showInHeaderNav, setShowInHeaderNav] = useState(Boolean(page.showInHeaderNav));
  const [showInFooterNav, setShowInFooterNav] = useState(Boolean(page.showInFooterNav));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync internal state if page prop changes or modal re-opens
  useEffect(() => {
    if (isOpen) {
      setTitle(page.title || '');
      setSlug(page.slug || '');
      setCategory(page.category || 'General');
      setExcerpt(page.excerpt || '');
      setContent(page.content || '');
      setBannerUrl(page.bannerUrl || '');
      setSeoTitle(page.seoTitle || '');
      setSeoDescription(page.seoDescription || '');
      setIsPublished(Boolean(page.isPublished));
      setShowInHeaderNav(Boolean(page.showInHeaderNav));
      setShowInFooterNav(Boolean(page.showInFooterNav));
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, page]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Page title cannot be empty.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          category: category.trim(),
          excerpt: excerpt.trim() || null,
          content,
          bannerUrl: bannerUrl.trim() || null,
          seoTitle: seoTitle.trim() || null,
          seoDescription: seoDescription.trim() || null,
          isPublished,
          showInHeaderNav,
          showInFooterNav,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update page');
      }

      setSuccess(true);
      const updatedPage: CustomPageData = data.page;

      if (onSaved) {
        onSaved(updatedPage);
      }

      // If navigation or header was altered, notify listeners
      window.dispatchEvent(new CustomEvent('hab:header-updated'));

      setTimeout(() => {
        // If slug changed, redirect to new slug; otherwise reload to reflect content
        if (updatedPage.slug && updatedPage.slug !== page.slug) {
          window.location.href = `/pages/${updatedPage.slug}`;
        } else {
          window.location.reload();
        }
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Error saving custom page changes');
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-stone-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-live-editor-title"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#8B2E24]/10 text-[#8B2E24]">
              <Edit3 className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="modal-live-editor-title" className="text-base font-bold text-stone-900">
                  Live Quick Edit
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">
                  /pages/{slug}
                </span>
                {isPublished ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Live
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-stone-200 text-stone-700">
                    Draft
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Instant in-place CMS updates · Changes propagate immediately across public navigation and layout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/pages"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#8B2E24] px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-colors font-medium"
              title="Open full admin directory in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Studio</span>
            </Link>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
              aria-label="Close Live Editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-stone-200 bg-stone-100/50 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('CONTENT')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'CONTENT'
                ? 'border-[#8B2E24] text-[#8B2E24] bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Title &amp; Content</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MEDIA')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'MEDIA'
                ? 'border-[#8B2E24] text-[#8B2E24] bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Banner &amp; Media</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('NAVIGATION')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'NAVIGATION'
                ? 'border-[#8B2E24] text-[#8B2E24] bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Navigation &amp; Visibility</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SEO')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'SEO'
                ? 'border-[#8B2E24] text-[#8B2E24] bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>SEO &amp; Metadata</span>
          </button>
        </div>

        {/* Tab Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to save</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="font-medium">Page saved! Reloading to apply live updates...</p>
            </div>
          )}

          {/* TAB 1: CONTENT */}
          {activeTab === 'CONTENT' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Page Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Bhutanese Traditional Weaving Heritage"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  URL Slug <span className="text-stone-400 font-normal">(/pages/{slug})</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g. traditional-weaving-heritage"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Introductory Lede / Summary Excerpt
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A concise introductory paragraph summarizing the page..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Page Content <span className="text-stone-400 font-normal">(Rich Text &amp; Media)</span>
                </label>
                <RichTextEditor
                  value={content}
                  onChange={(val) => setContent(val)}
                  placeholder="Craft your page narrative, add headers, quotes, lists, and images..."
                  minHeight="280px"
                />
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA */}
          {activeTab === 'MEDIA' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Header Banner Image
                </label>
                <FileUploadInput
                  value={bannerUrl}
                  onChange={(url) => setBannerUrl(url)}
                  hint="Enter URL or click upload to select an image from your device"
                />
                <p className="text-xs text-stone-400 mt-1">
                  Recommended size: 1920x600px. High-resolution imagery representing the Bhutanese handicrafts ethos.
                </p>
              </div>

              {bannerUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 p-2">
                  <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5 px-1">
                    Banner Preview
                  </p>
                  <div className="relative h-44 w-full rounded-lg overflow-hidden bg-stone-900">
                    <img
                      src={bannerUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NAVIGATION */}
          {activeTab === 'NAVIGATION' && (
            <div className="space-y-5">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                  Publishing Status
                </h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-[#8B2E24] rounded border-stone-300 focus:ring-[#8B2E24]"
                  />
                  <div>
                    <span className="text-sm font-semibold text-stone-800">
                      Publish to live public website
                    </span>
                    <p className="text-xs text-stone-500">
                      When unchecked, only logged-in administrators can preview this page.
                    </p>
                  </div>
                </label>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Menu &amp; Site Navigation
                </h3>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInHeaderNav}
                    onChange={(e) => setShowInHeaderNav(e.target.checked)}
                    className="w-4 h-4 text-[#8B2E24] rounded border-stone-300 focus:ring-[#8B2E24] mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-semibold text-stone-800">
                      Show in Header Navigation Bar
                    </span>
                    <p className="text-xs text-stone-500">
                      Adds an adaptive sliding item in the primary top header menu. If more than 5 items exist, the navbar smoothly slides with chevron controls.
                    </p>
                  </div>
                </label>

                <div className="border-t border-stone-200/60 pt-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInFooterNav}
                      onChange={(e) => setShowInFooterNav(e.target.checked)}
                      className="w-4 h-4 text-[#8B2E24] rounded border-stone-300 focus:ring-[#8B2E24] mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-semibold text-stone-800">
                        Show in Footer Navigation Links
                      </span>
                      <p className="text-xs text-stone-500">
                        Adds a direct link in the footer organization columns across all pages.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEO */}
          {activeTab === 'SEO' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Meta Title <span className="text-stone-400 font-normal">(Search Results)</span>
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={`${title || 'Page Title'} · Handicrafts Association of Bhutan`}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Summary of this page for Google and social previews..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                />
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#a0362b] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Page...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save &amp; Apply Live</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

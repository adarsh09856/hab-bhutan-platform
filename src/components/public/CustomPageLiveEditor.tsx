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
} from 'lucide-react';
import Link from 'next/link';
import AdvancedEditorSuite, { AdvancedEditorFormState } from '@/components/admin/AdvancedEditorSuite';

export interface CustomPageData {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt?: string | null;
  content: string;
  bannerUrl?: string | null;
  videoUrl?: string | null;
  galleryImages?: any;
  socialLinks?: any;
  ctaButton?: any;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
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

const DEFAULT_CATEGORIES = [
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
  const [form, setForm] = useState<AdvancedEditorFormState>({
    title: page.title || '',
    slug: page.slug || '',
    category: page.category || 'General',
    excerpt: page.excerpt || '',
    content: page.content || '',
    bannerUrl: page.bannerUrl || '',
    videoUrl: page.videoUrl || '',
    galleryImages: Array.isArray(page.galleryImages) ? page.galleryImages : [],
    socialLinks: page.socialLinks || {},
    ctaButton: page.ctaButton || { label: '', url: '', style: 'primary' },
    seoTitle: page.seoTitle || '',
    seoDescription: page.seoDescription || '',
    seoKeywords: page.seoKeywords || '',
    isPublished: Boolean(page.isPublished),
    showInHeaderNav: Boolean(page.showInHeaderNav),
    showInFooterNav: Boolean(page.showInFooterNav),
  });

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync internal state if page prop changes or modal re-opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        title: page.title || '',
        slug: page.slug || '',
        category: page.category || 'General',
        excerpt: page.excerpt || '',
        content: page.content || '',
        bannerUrl: page.bannerUrl || '',
        videoUrl: page.videoUrl || '',
        galleryImages: Array.isArray(page.galleryImages) ? page.galleryImages : [],
        socialLinks: page.socialLinks || {},
        ctaButton: page.ctaButton || { label: '', url: '', style: 'primary' },
        seoTitle: page.seoTitle || '',
        seoDescription: page.seoDescription || '',
        seoKeywords: page.seoKeywords || '',
        isPublished: Boolean(page.isPublished),
        showInHeaderNav: Boolean(page.showInHeaderNav),
        showInFooterNav: Boolean(page.showInFooterNav),
      });
      setIsCreatingCategory(false);
      setCustomCategoryInput('');
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
    if (!form.title.trim()) {
      setError('Page title cannot be empty.');
      return;
    }

    const finalCategory = isCreatingCategory && customCategoryInput.trim()
      ? customCategoryInput.trim()
      : form.category.trim() || 'General';

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          category: finalCategory,
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

      // Notify header listeners of changes
      window.dispatchEvent(new CustomEvent('hab:header-updated'));

      setTimeout(() => {
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

  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, form.category].filter(Boolean)));

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[94dvh] flex flex-col my-auto overflow-hidden text-stone-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-live-editor-title"
      >
        {/* Modal Top Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/90 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-xl bg-[#8B2E24]/10 text-[#8B2E24] shrink-0">
              <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 id="modal-live-editor-title" className="text-sm sm:text-base font-bold text-stone-900">
                  Live Quick Edit
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 truncate max-w-[150px] sm:max-w-none">
                  /pages/{form.slug}
                </span>
                {form.isPublished ? (
                  <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Live
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-semibold bg-stone-200 text-stone-700">
                    Draft
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 truncate hidden xs:block">
                In-place CMS updates · Instant public propagation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin/pages"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#8B2E24] px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-colors font-medium"
              title="Open full admin directory in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>All Pages</span>
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

        {/* Form Body with Advanced Editor Suite */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Page updated successfully! Refreshing...</span>
            </div>
          )}

          <AdvancedEditorSuite
            form={form}
            onChange={(updated) => setForm((prev) => ({ ...prev, ...updated }))}
            availableCategories={allCategories}
            isCreatingCategory={isCreatingCategory}
            setIsCreatingCategory={setIsCreatingCategory}
            customCategoryInput={customCategoryInput}
            setCustomCategoryInput={setCustomCategoryInput}
          />
        </form>

        {/* Modal Footer Controls */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-stone-200 bg-stone-50 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 text-xs font-semibold transition-colors text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#a0362b] text-white text-xs font-bold transition-all shadow-sm hover:shadow disabled:opacity-50 cursor-pointer"
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

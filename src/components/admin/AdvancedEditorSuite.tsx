'use client';

import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Search,
  Share2,
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Play,
  HelpCircle,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Smartphone,
  Monitor
} from 'lucide-react';
import FileUploadInput from '@/components/admin/FileUploadInput';
import RichTextEditor from '@/components/admin/RichTextEditor';

export interface GalleryItem {
  url: string;
  caption?: string;
}

export interface SocialLinksData {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  whatsapp?: string;
  website?: string;
}

export interface CtaButtonData {
  label: string;
  url: string;
  style?: 'primary' | 'dark' | 'amber';
}

export interface AdvancedEditorFormState {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  bannerUrl: string;
  videoUrl: string;
  galleryImages: GalleryItem[];
  socialLinks: SocialLinksData;
  ctaButton: CtaButtonData;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  isPublished: boolean;
  showInHeaderNav: boolean;
  showInFooterNav: boolean;
}

interface AdvancedEditorSuiteProps {
  form: AdvancedEditorFormState;
  onChange: (updated: Partial<AdvancedEditorFormState>) => void;
  availableCategories: string[];
  isCreatingCategory: boolean;
  setIsCreatingCategory: (val: boolean) => void;
  customCategoryInput: string;
  setCustomCategoryInput: (val: string) => void;
  siteUrl?: string;
}

export function extractVideoEmbedUrl(rawUrl: string): { embedUrl: string | null; type: 'youtube' | 'vimeo' | 'mp4' | 'unknown' } {
  if (!rawUrl || !rawUrl.trim()) return { embedUrl: null, type: 'unknown' };
  const trimmed = rawUrl.trim();

  // YouTube formats:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0`,
      type: 'youtube',
    };
  }

  // Vimeo formats:
  // - https://vimeo.com/VIDEO_ID
  // - https://player.vimeo.com/video/VIDEO_ID
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      type: 'vimeo',
    };
  }

  // Direct MP4 / WebM
  if (/\.(mp4|webm|ogg)$/i.test(trimmed)) {
    return {
      embedUrl: trimmed,
      type: 'mp4',
    };
  }

  return { embedUrl: null, type: 'unknown' };
}

export default function AdvancedEditorSuite({
  form,
  onChange,
  availableCategories,
  isCreatingCategory,
  setIsCreatingCategory,
  customCategoryInput,
  setCustomCategoryInput,
  siteUrl = 'https://touratbhutan.info',
}: AdvancedEditorSuiteProps) {
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'MEDIA' | 'SEO' | 'SOCIAL' | 'NAV'>('CONTENT');
  const [serpViewMode, setSerpViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Video embed evaluation
  const videoEvaluation = extractVideoEmbedUrl(form.videoUrl);

  // Gallery item adding
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryCaption, setNewGalleryCaption] = useState('');

  const handleAddGalleryItem = () => {
    if (!newGalleryUrl.trim()) return;
    const current = Array.isArray(form.galleryImages) ? [...form.galleryImages] : [];
    current.push({ url: newGalleryUrl.trim(), caption: newGalleryCaption.trim() });
    onChange({ galleryImages: current });
    setNewGalleryUrl('');
    setNewGalleryCaption('');
  };

  const handleRemoveGalleryItem = (index: number) => {
    const current = Array.isArray(form.galleryImages) ? [...form.galleryImages] : [];
    current.splice(index, 1);
    onChange({ galleryImages: current });
  };

  const updateSocialField = (key: keyof SocialLinksData, val: string) => {
    onChange({
      socialLinks: {
        ...(form.socialLinks || {}),
        [key]: val,
      },
    });
  };

  const updateCtaField = (key: keyof CtaButtonData, val: any) => {
    onChange({
      ctaButton: {
        ...(form.ctaButton || { label: '', url: '', style: 'primary' }),
        [key]: val,
      },
    });
  };

  // SEO lengths & badges
  const seoTitleLen = (form.seoTitle || '').length;
  const seoDescLen = (form.seoDescription || '').length;

  return (
    <div className="space-y-4">
      {/* Tab Switcher Header */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('CONTENT')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'CONTENT'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>1. Content &amp; Text</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MEDIA')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'MEDIA'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>2. Media &amp; Video Preview</span>
          {(form.videoUrl || (form.galleryImages && form.galleryImages.length > 0)) && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SEO')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'SEO'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>3. SEO &amp; Google Preview</span>
          {(form.seoTitle || form.seoDescription) && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SOCIAL')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'SOCIAL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>4. Social &amp; Actions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('NAV')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'NAV'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>5. Menus &amp; Publishing</span>
        </button>
      </div>

      {/* ================= TAB 1: CONTENT & TEXT ================= */}
      {activeTab === 'CONTENT' && (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Page Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => {
                  const val = e.target.value;
                  const autoSlug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                  onChange({
                    title: val,
                    ...(!form.slug || form.slug === autoSlug.slice(0, -1) ? { slug: autoSlug } : {}),
                    ...(!form.seoTitle ? { seoTitle: `${val} · Handicrafts Association of Bhutan` } : {}),
                  });
                }}
                placeholder="e.g. Traditional Paper Making Heritage"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                URL Slug * (public address)
              </label>
              <div className="flex items-center">
                <span className="px-2.5 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-xs text-slate-500 font-mono shrink-0">
                  /pages/
                </span>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })}
                  placeholder="paper-making-heritage"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-r-xl text-slate-900 font-mono focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Category Tag
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                  className="text-[11px] font-semibold text-[#8B2E24] hover:underline cursor-pointer"
                >
                  {isCreatingCategory ? 'Choose Existing' : '+ Create Category'}
                </button>
              </div>

              {isCreatingCategory ? (
                <input
                  type="text"
                  value={customCategoryInput}
                  onChange={(e) => {
                    setCustomCategoryInput(e.target.value);
                    onChange({ category: e.target.value });
                  }}
                  placeholder="Type new category..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#8B2E24] rounded-xl text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#8B2E24]"
                  autoFocus
                />
              ) : (
                <select
                  value={form.category}
                  onChange={(e) => {
                    if (e.target.value === '__NEW__') {
                      setIsCreatingCategory(true);
                      setCustomCategoryInput('');
                    } else {
                      onChange({ category: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-[#8B2E24]"
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__NEW__">+ Create New Category...</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Featured Cover Banner
              </label>
              <FileUploadInput
                value={form.bannerUrl || ''}
                onChange={(url) => onChange({ bannerUrl: url })}
                label="Upload Cover Photo"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Summary / Lede Paragraph
            </label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => {
                const val = e.target.value;
                onChange({
                  excerpt: val,
                  ...(!form.seoDescription ? { seoDescription: val } : {}),
                });
              }}
              placeholder="Short introductory summary displayed in bold at the top of the page..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-[#8B2E24]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Page Narrative &amp; Sections (Rich Text) *
            </label>
            <RichTextEditor
              value={form.content}
              onChange={(content) => onChange({ content })}
              placeholder="Draft the comprehensive page narrative, sections, guidelines, or details..."
              minHeight="260px"
            />
          </div>
        </div>
      )}

      {/* ================= TAB 2: MEDIA & VIDEO PREVIEW ================= */}
      {activeTab === 'MEDIA' && (
        <div className="space-y-6 pt-1">
          {/* Video Embed Section */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Video Embed &amp; Interactive Player Preview
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Embed documentary videos, artisan footage, or project trailers (YouTube, Vimeo, MP4).
                  </p>
                </div>
              </div>

              {videoEvaluation.type !== 'unknown' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                  {videoEvaluation.type} Verified
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Video URL
              </label>
              <input
                type="text"
                value={form.videoUrl || ''}
                onChange={(e) => onChange({ videoUrl: e.target.value })}
                placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://vimeo.com/76979871"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-hidden focus:border-[#8B2E24] shadow-2xs"
              />
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-slate-400" />
                Supports full YouTube links, youtu.be short links, Vimeo videos, or direct .mp4 files.
              </p>
            </div>

            {/* Interactive Live Player Preview */}
            {videoEvaluation.embedUrl ? (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Live Interactive Player (Test Play Directly):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onChange({ videoUrl: '' })}
                    className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                  >
                    Remove Video
                  </button>
                </div>
                <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-slate-300 bg-black">
                  {videoEvaluation.type === 'mp4' ? (
                    <video controls src={videoEvaluation.embedUrl} className="w-full h-full object-cover" />
                  ) : (
                    <iframe
                      src={videoEvaluation.embedUrl}
                      title="Video Player Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  )}
                </div>
              </div>
            ) : form.videoUrl ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Could not parse a valid YouTube or Vimeo ID from this link. Please check the URL format.</span>
              </div>
            ) : null}
          </div>

          {/* Photo Gallery Manager */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Photo Gallery &amp; Section Image Grid
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Upload a collection of photos with captions to display an interactive responsive gallery.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                {form.galleryImages?.length || 0} Photos
              </span>
            </div>

            {/* Add New Gallery Photo Input */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2.5">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#8B2E24]" />
                <span>Add Photo to Gallery</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-6">
                  <FileUploadInput
                    value={newGalleryUrl}
                    onChange={(url) => setNewGalleryUrl(url)}
                    label="Image URL or Upload"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Photo Caption (optional)
                  </label>
                  <input
                    type="text"
                    value={newGalleryCaption}
                    onChange={(e) => setNewGalleryCaption(e.target.value)}
                    placeholder="e.g. Master Tshering carving sacred mask"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
                  />
                </div>
                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="button"
                    onClick={handleAddGalleryItem}
                    disabled={!newGalleryUrl.trim()}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Gallery Photos Grid */}
            {Array.isArray(form.galleryImages) && form.galleryImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                {form.galleryImages.map((img, idx) => (
                  <div key={idx} className="relative group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="aspect-square bg-slate-100 overflow-hidden relative">
                      <img src={img.url} alt={img.caption || 'Gallery photo'} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryItem(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-md opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {img.caption && (
                      <div className="p-1.5 bg-white text-[10px] text-slate-600 line-clamp-1 border-t border-slate-100">
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: SEO & GOOGLE PREVIEW ================= */}
      {activeTab === 'SEO' && (
        <div className="space-y-6 pt-1">
          {/* SEO Input Fields */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  SEO Meta Title (Search Engine Result Title)
                </label>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    seoTitleLen === 0
                      ? 'text-slate-400 bg-slate-100'
                      : seoTitleLen >= 40 && seoTitleLen <= 60
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                      : 'text-amber-700 bg-amber-50 border border-amber-200'
                  }`}
                >
                  {seoTitleLen} / 60 chars {seoTitleLen >= 40 && seoTitleLen <= 60 ? '✓ Optimal' : ''}
                </span>
              </div>
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => onChange({ seoTitle: e.target.value })}
                placeholder={`${form.title || 'Page Title'} · Handicrafts Association of Bhutan`}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-[#8B2E24] shadow-2xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Appears as the main blue link in Google search results and browser tab titles.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  SEO Meta Description (Search Snippet Text)
                </label>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    seoDescLen === 0
                      ? 'text-slate-400 bg-slate-100'
                      : seoDescLen >= 120 && seoDescLen <= 160
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                      : 'text-amber-700 bg-amber-50 border border-amber-200'
                  }`}
                >
                  {seoDescLen} / 160 chars {seoDescLen >= 120 && seoDescLen <= 160 ? '✓ Optimal' : ''}
                </span>
              </div>
              <textarea
                rows={3}
                value={form.seoDescription}
                onChange={(e) => onChange({ seoDescription: e.target.value })}
                placeholder="Comprehensive overview of the page content designed to attract clicks from search engines..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-[#8B2E24] shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Focus Search Keywords
              </label>
              <input
                type="text"
                value={form.seoKeywords || ''}
                onChange={(e) => onChange({ seoKeywords: e.target.value })}
                placeholder="e.g. Bhutan handicrafts, Zorig Chusum, handmade paper, Thimphu artisans"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-[#8B2E24] shadow-2xs"
              />
            </div>
          </div>

          {/* Interactive Google SERP Preview */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Live Google Search Result Preview (SERP)
                </h3>
              </div>

              {/* View Switcher: Desktop vs Mobile */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSerpViewMode('desktop')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                    serpViewMode === 'desktop' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSerpViewMode('mobile')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                    serpViewMode === 'mobile' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Google Card Representation */}
            <div
              className={`bg-white p-4 rounded-xl border border-slate-200 shadow-xs font-sans ${
                serpViewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
              }`}
            >
              {/* Google Breadcrumb URL */}
              <div className="flex items-center gap-2 text-[12px] text-slate-600 mb-1">
                <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-700">
                  🇧🇹
                </div>
                <div className="flex items-center gap-1 truncate">
                  <span className="text-slate-800 font-medium">Handicrafts Association of Bhutan</span>
                  <span className="text-slate-400">›</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {siteUrl.replace(/^https?:\/\//, '')}/pages/{form.slug || 'slug'}
                  </span>
                </div>
              </div>

              {/* Clickable Heading in Blue */}
              <h4 className="text-base sm:text-lg text-[#1a0dab] hover:underline font-medium cursor-pointer line-clamp-1 leading-snug">
                {form.seoTitle || form.title || 'Page Title — Handicrafts Association of Bhutan'}
              </h4>

              {/* Description Snippet */}
              <p className="text-xs sm:text-sm text-[#4d5156] line-clamp-2 mt-1 leading-relaxed">
                {form.seoDescription || form.excerpt || 'Handicrafts Association of Bhutan official page. Read comprehensive details, policies, artisan initiatives, and cultural heritage documentation.'}
              </p>
            </div>
          </div>

          {/* Social Share Card Preview (Facebook / X / LinkedIn) */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Live Social Share Card Preview (Facebook &amp; X / Twitter)
              </h3>
            </div>

            <div className="max-w-md bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="aspect-1200/630 bg-slate-100 relative overflow-hidden">
                {form.bannerUrl ? (
                  <img src={form.bannerUrl} alt="Social preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200/70 text-slate-400 p-4 text-center">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-60" />
                    <span className="text-xs font-semibold">Upload Cover Photo to see social preview banner</span>
                  </div>
                )}
              </div>
              <div className="p-3 space-y-1 bg-slate-50/90 border-t border-slate-200">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                  {siteUrl.replace(/^https?:\/\//, '').toUpperCase()}
                </span>
                <h5 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                  {form.seoTitle || form.title || 'Page Title'}
                </h5>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {form.seoDescription || form.excerpt || 'Handicrafts Association of Bhutan official cultural initiative.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: SOCIAL & ACTIONS ================= */}
      {activeTab === 'SOCIAL' && (
        <div className="space-y-6 pt-1">
          {/* Social Profiles Bar */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#8B2E24]" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Page Social Links &amp; Profiles
                </h3>
                <p className="text-[11px] text-slate-500">
                  Add social profiles to display clean connect pills directly on this page.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facebook Page URL
                </label>
                <input
                  type="text"
                  value={form.socialLinks?.facebook || ''}
                  onChange={(e) => updateSocialField('facebook', e.target.value)}
                  placeholder="https://facebook.com/hab.bhutan"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instagram Profile URL
                </label>
                <input
                  type="text"
                  value={form.socialLinks?.instagram || ''}
                  onChange={(e) => updateSocialField('instagram', e.target.value)}
                  placeholder="https://instagram.com/hab_bhutan"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  YouTube Channel / Video URL
                </label>
                <input
                  type="text"
                  value={form.socialLinks?.youtube || ''}
                  onChange={(e) => updateSocialField('youtube', e.target.value)}
                  placeholder="https://youtube.com/@habbhutan"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Contact Number
                </label>
                <input
                  type="text"
                  value={form.socialLinks?.whatsapp || ''}
                  onChange={(e) => updateSocialField('whatsapp', e.target.value)}
                  placeholder="+975 17 12 34 56"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>
            </div>
          </div>

          {/* Call to Action Button Builder */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Featured Call-to-Action (CTA) Button
                </h3>
                <p className="text-[11px] text-slate-500">
                  Optionally display a prominent button banner at the bottom of the page.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={form.ctaButton?.label || ''}
                  onChange={(e) => updateCtaField('label', e.target.value)}
                  placeholder="e.g. Join the Artisan Network"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={form.ctaButton?.url || ''}
                  onChange={(e) => updateCtaField('url', e.target.value)}
                  placeholder="e.g. /membership/apply or /contact"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Color Style
                </label>
                <select
                  value={form.ctaButton?.style || 'primary'}
                  onChange={(e) => updateCtaField('style', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:border-[#8B2E24]"
                >
                  <option value="primary">HAB Maroon (Primary)</option>
                  <option value="dark">Dark Slate</option>
                  <option value="amber">Amber Gold</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: MENUS & PUBLISHING ================= */}
      {activeTab === 'NAV' && (
        <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Publishing Status &amp; Navigation Menus
          </span>

          <div className="space-y-3">
            <label className="flex items-start sm:items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer text-xs sm:text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => onChange({ isPublished: e.target.checked })}
                className="w-4 h-4 text-[#8B2E24] rounded border-slate-300 focus:ring-[#8B2E24] mt-0.5 sm:mt-0"
              />
              <div>
                <span className="block">Publish live immediately (visible to all public visitors)</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  If unchecked, only authenticated administrators can preview this page.
                </span>
              </div>
            </label>

            <label className="flex items-start sm:items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer text-xs sm:text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={form.showInHeaderNav}
                onChange={(e) => onChange({ showInHeaderNav: e.target.checked })}
                className="w-4 h-4 text-[#8B2E24] rounded border-slate-300 focus:ring-[#8B2E24] mt-0.5 sm:mt-0"
              />
              <div>
                <span className="block">Add link to Header Navigation Bar (adaptive flex slider)</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Automatically adds a menu item. If more than 5 items exist, the header smoothly slides with chevron controls.
                </span>
              </div>
            </label>

            <label className="flex items-start sm:items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer text-xs sm:text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={form.showInFooterNav}
                onChange={(e) => onChange({ showInFooterNav: e.target.checked })}
                className="w-4 h-4 text-[#8B2E24] rounded border-slate-300 focus:ring-[#8B2E24] mt-0.5 sm:mt-0"
              />
              <div>
                <span className="block">Add link to Footer Organization Column</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Adds a permanent link in the statutory footer columns across all pages.
                </span>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

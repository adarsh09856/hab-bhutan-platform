'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import CustomPageLiveEditor, { CustomPageData } from '@/components/public/CustomPageLiveEditor';
import { Calendar, Tag, Clock, ArrowLeft, Share2, Check } from 'lucide-react';

interface CustomPageClientViewProps {
  initialPage: CustomPageData;
}

export default function CustomPageClientView({ initialPage }: CustomPageClientViewProps) {
  const [page, setPage] = useState<CustomPageData>(initialPage);
  const [editorOpen, setEditorOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main id="main" className="min-h-screen bg-[var(--surface,#FAF7F2)]">
      {/* Live Visual Editor Modal */}
      <CustomPageLiveEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        page={page}
        onSaved={(updated) => setPage(updated)}
      />

      {/* Hero / Header Section */}
      <section
        className="section relative border-b border-[var(--line,#E4DDD1)] pt-8 pb-12"
        data-hab-section={`custom-page-${page.slug}`}
      >
        <SectionEditBadge
          label="Custom Page Studio"
          studioHref="/admin/pages"
          onQuickEdit={() => setEditorOpen(true)}
          className="top-3 right-4"
        />

        <div className="max-w-[var(--shell,1200px)] mx-auto px-4 sm:px-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <p className="crumbs text-xs sm:text-sm text-stone-500 flex items-center gap-1.5 flex-wrap">
              <Link href="/" className="hover:text-[#8B2E24] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-stone-400">Pages</span>
              <span>/</span>
              <span className="text-stone-800 font-medium">{page.title}</span>
            </p>
          </nav>

          {/* Category Badge & Status */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8B2E24]/10 text-[#8B2E24]">
              <Tag className="w-3 h-3" />
              <span>{page.category || 'General'}</span>
            </span>
            {!page.isPublished && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                Draft Preview (Admin Only)
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="display display--page text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 leading-tight mb-4 max-w-[28ch]">
            {page.title}
          </h1>

          {/* Lede / Excerpt */}
          {page.excerpt && (
            <p className="lede text-lg sm:text-xl text-stone-600 font-normal leading-relaxed max-w-[65ch] mb-6">
              {page.excerpt}
            </p>
          )}

          {/* Metadata bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-[var(--line,#E4DDD1)]/60 text-xs text-stone-500">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                Handicrafts Association of Bhutan
              </span>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-300 hover:border-[#8B2E24] text-stone-700 hover:text-[#8B2E24] transition-colors text-xs font-medium cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Page</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Featured Banner Image (if available) */}
      {page.bannerUrl && (
        <section className="max-w-[var(--shell,1200px)] mx-auto px-4 sm:px-6 pt-8 pb-4">
          <div className="w-full h-64 sm:h-96 lg:h-[420px] rounded-2xl overflow-hidden shadow-lg border border-stone-200/80 relative">
            <img
              src={page.bannerUrl}
              alt={page.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </section>
      )}

      {/* Main Content Body */}
      <section className="section section--last py-12">
        <div className="max-w-[var(--shell,1200px)] mx-auto px-4 sm:px-6">
          <div className="policy flex flex-col lg:flex-row gap-12 items-start">
            {/* Main Rich Text Content */}
            <article className="policy__body flex-1 w-full bg-white p-6 sm:p-10 rounded-2xl border border-stone-200 shadow-xs">
              {page.content ? (
                <div
                  className="space-y-4 text-stone-800 leading-relaxed font-sans [&>h2]:text-2xl [&>h2]:font-serif [&>h2]:font-bold [&>h2]:text-stone-900 [&>h2]:mt-8 [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-serif [&>h3]:font-semibold [&>h3]:text-stone-800 [&>h3]:mt-6 [&>h3]:mb-2 [&>p]:mb-4 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>li]:mb-2 [&>blockquote]:border-l-4 [&>blockquote]:border-[#8B2E24] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-stone-700 [&>blockquote]:my-4 [&>img]:rounded-xl [&>img]:my-6 [&>img]:shadow-md [&>a]:text-[#8B2E24] [&>a]:underline [&>table]:w-full [&>table]:border-collapse [&>table]:my-6 [&>table_th]:border-b-2 [&>table_th]:border-stone-300 [&>table_th]:p-2 [&>table_th]:text-left [&>table_td]:border-b [&>table_td]:border-stone-200 [&>table_td]:p-2"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              ) : (
                <div className="py-12 text-center text-stone-400">
                  <p>This page has not published any body content yet.</p>
                </div>
              )}
            </article>

            {/* Sidebar with Navigation and Related Actions */}
            <aside className="w-full lg:w-80 shrink-0 space-y-6">
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setEditorOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#8B2E24]/10 hover:bg-[#8B2E24]/20 text-[#8B2E24] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Visual Quick Edit</span>
                  </button>
                  <Link
                    href="/admin/pages"
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors"
                  >
                    <span>All Pages Directory</span>
                  </Link>
                </div>
              </div>

              <div className="bg-[#33261F] text-[#FAF7F2] p-6 rounded-xl shadow-md space-y-3">
                <span className="text-[11px] uppercase tracking-widest text-[#D97706] font-semibold">
                  Handicrafts of Bhutan
                </span>
                <h4 className="font-serif text-lg font-bold text-white">
                  Preserving Heritage &amp; Empowering Artisans
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  The Handicrafts Association of Bhutan represents over 7,500 artisans across 20 Dzongkhags.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#D97706] hover:underline"
                  >
                    <span>Explore authentic crafts →</span>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

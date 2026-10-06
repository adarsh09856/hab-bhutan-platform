'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  ExternalLink, 
  Download, 
  BookOpen, 
  Eye, 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  CheckCircle2, 
  FileCheck,
  Building2,
  Share2
} from 'lucide-react';

interface DocumentEmbedViewerProps {
  documentUrl?: string | null;
  documentType?: string | null; // PDF | FLIPBOOK | DOC
  documentTitle?: string | null;
  className?: string;
}

export default function DocumentEmbedViewer({
  documentUrl,
  documentType = 'PDF',
  documentTitle,
  className = '',
}: DocumentEmbedViewerProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'overview'>('preview');
  const [copied, setCopied] = useState(false);

  if (!documentUrl) {
    return null;
  }

  const cleanUrl = documentUrl.trim();
  const isPdf = (documentType || '').toUpperCase() === 'PDF' || cleanUrl.toLowerCase().endsWith('.pdf');
  const isFlipbook = (documentType || '').toUpperCase() === 'FLIPBOOK' || cleanUrl.includes('fliphtml5') || cleanUrl.includes('issuu') || cleanUrl.includes('heyzine');
  const title = documentTitle || (isFlipbook ? 'Interactive Flipbook Publication' : 'Supporting Document & Publication');
  const fileExt = isFlipbook ? 'FLIPBOOK' : isPdf ? 'PDF' : 'DOC';

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const fullUrl = cleanUrl.startsWith('http') ? cleanUrl : `${window.location.origin}${cleanUrl}`;
      navigator.clipboard?.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderEmbeddedContent = (heightClass = 'h-[540px] sm:h-[640px]') => {
    if (isFlipbook) {
      return (
        <iframe
          src={cleanUrl}
          title={title}
          className={`w-full ${heightClass} border-0 bg-white`}
          allowFullScreen
        />
      );
    }

    return (
      <div className={`w-full ${heightClass} bg-slate-900 relative`}>
        {/* Modern object tag with multi-tier iframe and card fallback */}
        <object
          data={cleanUrl}
          type="application/pdf"
          className="w-full h-full border-0 bg-white"
        >
          <iframe
            src={`${cleanUrl}#toolbar=1&navpanes=0`}
            title={title}
            className="w-full h-full border-0 bg-white"
          >
            {/* Elegant in-frame fallback card if browser blocks inline iframe rendering */}
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#FBF9F5] text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#8B2E24]/10 text-[#8B2E24] flex items-center justify-center mb-4 shadow-xs">
                <FileCheck className="w-8 h-8" />
              </div>
              <h4 className="font-marcellus text-xl text-[#33261F] max-w-md mb-2">
                {title}
              </h4>
              <p className="font-lora text-xs sm:text-sm text-[#6B5A4C] max-w-md mb-6">
                Official document certified by the Handicrafts Association of Bhutan (CSO/2011/043).
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#72241C] text-white text-xs font-semibold shadow-xs transition whitespace-nowrap shrink-0"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span>Open in Document Viewer</span>
                </a>
                <a
                  href={cleanUrl}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#CDBEA8] bg-white hover:bg-[#F4F0E7] text-xs font-semibold text-[#33261F] transition whitespace-nowrap shrink-0"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Download PDF Document</span>
                </a>
              </div>
            </div>
          </iframe>
        </object>
      </div>
    );
  };

  return (
    <>
      <div className={`my-8 bg-[#FFFCF8] rounded-2xl border border-[#E4DDD1] p-5 sm:p-6 shadow-sm overflow-hidden ${className}`}>
        {/* Document Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E4DDD1] gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#8B2E24]/10 text-[#8B2E24] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              {isFlipbook ? <BookOpen className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-[#EDE5D6] text-[#6B5A4C] font-semibold whitespace-nowrap shrink-0">
                  {isFlipbook ? 'Digital Flipbook' : `Official Document (${fileExt})`}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 whitespace-nowrap shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  Verified HAB Document
                </span>
              </div>
              <h3 className="font-marcellus text-base sm:text-lg text-[#33261F] leading-snug">
                {title}
              </h3>
            </div>
          </div>

          {/* Action Controls - Strictly with whitespace-nowrap and shrink-0 to prevent awkward breaks */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-lg p-0.5 bg-[#EDE5D6]/70 border border-[#D5C9B8] text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded-md text-xs transition whitespace-nowrap shrink-0 ${
                  activeTab === 'preview'
                    ? 'bg-white text-[#33261F] font-semibold shadow-2xs'
                    : 'text-[#6B5A4C] hover:text-[#33261F]'
                }`}
              >
                Viewer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-2.5 py-1 rounded-md text-xs transition whitespace-nowrap shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-white text-[#33261F] font-semibold shadow-2xs'
                    : 'text-[#6B5A4C] hover:text-[#33261F]'
                }`}
              >
                Overview
              </button>
            </div>

            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CDBEA8] bg-white hover:bg-[#F4F0E7] text-xs font-semibold text-[#33261F] transition whitespace-nowrap shrink-0"
              title="Expand to Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>

            <a
              href={cleanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CDBEA8] bg-white hover:bg-[#F4F0E7] text-xs font-semibold text-[#33261F] transition whitespace-nowrap shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>Open in Tab</span>
            </a>

            <a
              href={cleanUrl}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B2E24] hover:bg-[#72241C] text-white text-xs font-semibold shadow-xs transition whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Download</span>
            </a>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'preview' ? (
          <div className="mt-4 rounded-xl overflow-hidden border border-[#D5C9B8] bg-slate-100 relative shadow-inner">
            {renderEmbeddedContent('h-[540px] sm:h-[640px]')}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-[#D5C9B8] bg-white p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4DDD1]">
              <div className="space-y-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#8B2E24] font-semibold">
                  Official Publication Metadata
                </span>
                <h4 className="font-marcellus text-xl text-[#33261F]">
                  {title}
                </h4>
                <p className="font-lora text-xs sm:text-sm text-[#6B5A4C]">
                  Authentic supporting documentation published under the authority of the Secretariat.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#CDBEA8] bg-white hover:bg-[#F4F0E7] text-xs font-semibold text-[#33261F] transition whitespace-nowrap shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
                <a
                  href={cleanUrl}
                  download
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#72241C] text-white text-xs font-semibold shadow-xs transition whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>Download Document</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E4DDD1]">
                <div className="text-[11px] font-mono uppercase text-[#6B5A4C] font-semibold mb-1">
                  Issuing Authority
                </div>
                <div className="font-medium text-sm text-[#33261F] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#8B2E24]" />
                  HAB Secretariat, Thimphu
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E4DDD1]">
                <div className="text-[11px] font-mono uppercase text-[#6B5A4C] font-semibold mb-1">
                  Registration &amp; License
                </div>
                <div className="font-medium text-sm text-[#33261F] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  CSO/2011/043 Certified
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E4DDD1]">
                <div className="text-[11px] font-mono uppercase text-[#6B5A4C] font-semibold mb-1">
                  Format &amp; Integrity
                </div>
                <div className="font-medium text-sm text-[#33261F] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  {isFlipbook ? 'Interactive Web HTML5' : 'Official PDF Document'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-[#6B5A4C] leading-relaxed">
              <span className="font-semibold text-[#33261F]">Notice to Readers &amp; Tenderers: </span>
              This document contains official administrative terms, technical specifications, or governance reports. 
              Any modifications or unauthorized republishing without written assent from the Handicrafts Association 
              of Bhutan is strictly prohibited under the CSO Act of Bhutan.
            </div>
          </div>
        )}

        {/* Footer verification tag */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6B5A4C]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Scroll inside the viewer to read all pages. Official seal verified by HAB Secretariat.
          </span>
          <span className="font-mono text-[#8B2E24] font-semibold">CSO/2011/043</span>
        </div>
      </div>

      {/* Fullscreen Modal View */}
      {fullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col p-2 sm:p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#2A2421] text-white px-4 py-3 rounded-t-xl flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                {fileExt} Reader
              </span>
              <span className="font-marcellus text-sm sm:text-base truncate max-w-md">
                {title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={cleanUrl}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B2E24] hover:bg-[#72241C] text-white text-xs font-semibold transition whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>Download</span>
              </a>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition whitespace-nowrap shrink-0"
              >
                <Minimize2 className="w-3.5 h-3.5 shrink-0" />
                <span>Close</span>
              </button>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-b-xl overflow-hidden shadow-2xl relative">
            {renderEmbeddedContent('h-full')}
          </div>
        </div>
      )}
    </>
  );
}

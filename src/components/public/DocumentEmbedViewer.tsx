'use client';

import React, { useState } from 'react';
import { FileText, ExternalLink, Download, BookOpen, Eye, Maximize2 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'embed' | 'info'>('embed');

  if (!documentUrl) {
    return null;
  }

  const isPdf = (documentType || '').toUpperCase() === 'PDF' || documentUrl.toLowerCase().endsWith('.pdf');
  const isFlipbook = (documentType || '').toUpperCase() === 'FLIPBOOK' || documentUrl.includes('fliphtml5') || documentUrl.includes('issuu') || documentUrl.includes('heyzine');
  const title = documentTitle || (isFlipbook ? 'Interactive Flipbook Publication' : 'Supporting Document & Publication');

  return (
    <div className={`my-8 bg-[#FFFCF8] rounded-2xl border border-[#E4DDD1] p-5 sm:p-6 shadow-sm overflow-hidden ${className}`}>
      {/* Document Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E4DDD1] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8B2E24]/10 text-[#8B2E24] flex items-center justify-center flex-shrink-0">
            {isFlipbook ? <BookOpen className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-[#EDE5D6] text-[#6B5A4C] font-semibold">
                {isFlipbook ? 'Digital Flipbook' : 'Official Document (PDF)'}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Verified HAB Document
              </span>
            </div>
            <h3 className="font-marcellus text-base sm:text-lg text-[#33261F] mt-0.5">
              {title}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CDBEA8] bg-white hover:bg-[#F4F0E7] text-xs font-semibold text-[#33261F] transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in New Tab</span>
          </a>
          <a
            href={documentUrl}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B2E24] hover:bg-[#72241C] text-white text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>

      {/* Embedded Document Frame */}
      <div className="mt-4 rounded-xl overflow-hidden border border-[#D5C9B8] bg-slate-100 relative shadow-inner">
        {isFlipbook ? (
          <iframe
            src={documentUrl}
            title={title}
            className="w-full h-[540px] sm:h-[640px] border-0"
            allowFullScreen
          />
        ) : (
          <div className="w-full">
            <iframe
              src={`${documentUrl}#toolbar=1&navpanes=0`}
              title={title}
              className="w-full h-[540px] sm:h-[640px] border-0 bg-white"
            />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-[#6B5A4C]">
        <span>Scroll within the viewer to read all pages. Official seal certified by HAB Secretariat.</span>
        <span className="font-mono">CSO/2011/043</span>
      </div>
    </div>
  );
}

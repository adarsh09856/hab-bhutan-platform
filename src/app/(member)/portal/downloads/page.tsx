'use client';

import React from 'react';
import { Download, FileText, Award, Shield, BookOpen, CheckCircle } from 'lucide-react';

const DOWNLOAD_ASSETS = [
  {
    id: 'ASSET-01',
    category: 'BRAND_ASSETS',
    title: 'HAB Seal of Origin & Authenticity Mark (Vector Pack)',
    description: 'Certified member vector files (SVG, EPS, high-res PNG) for product hangtags, packaging tape, and workshop display plaques.',
    size: '14.2 MB',
    format: 'ZIP',
    icon: Award
  },
  {
    id: 'ASSET-02',
    category: 'COMMERCIAL',
    title: 'B2B International Wholesale Line Sheet 2026/2027',
    description: 'Master export price list, bulk tier discounts, CIF air freight tables, and overseas museum store terms.',
    size: '3.8 MB',
    format: 'PDF',
    icon: FileText
  },
  {
    id: 'ASSET-03',
    category: 'GOVERNANCE',
    title: 'Articles of Association (AoA 2026 Revision) & Code of Ethics',
    description: 'Statutory constitutional bylaws of the Handicrafts Association of Bhutan, fair wage standards, and dispute arbitration procedures.',
    size: '1.2 MB',
    format: 'PDF',
    icon: Shield
  },
  {
    id: 'ASSET-04',
    category: 'GOVERNANCE',
    title: 'AGM 2026 Official Notice, Agenda & Proxy Voting Form',
    description: 'Documentation for the October 14, 2026 General Meeting at Royal Textile Academy Hall, Thimphu.',
    size: '850 KB',
    format: 'PDF',
    icon: BookOpen
  },
  {
    id: 'ASSET-05',
    category: 'QUALITY_ASSURANCE',
    title: 'Zorig Chusum Raw Material & Natural Dye Purity Protocol',
    description: 'Testing guidelines for wild madder, indigo, lac, and chemical mordant prohibitions required for HAB export certification.',
    size: '2.1 MB',
    format: 'PDF',
    icon: CheckCircle
  }
];

export default function MemberDownloadsPage() {
  const handleDownload = (title: string) => {
    alert(`Downloading "${title}" authenticated for member MEM-THI-001.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Download className="w-5 h-5 text-amber-700" />
          Member Downloads & Authenticity Seal Assets
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Authorized vector brand marks, wholesale line sheets, regulatory bylaws, and certification guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOWNLOAD_ASSETS.map(asset => {
          const Icon = asset.icon;
          return (
            <div key={asset.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                    {asset.category.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-xs text-slate-400 font-medium">
                    {asset.format} • {asset.size}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 leading-snug flex items-start gap-2">
                  <Icon className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                  {asset.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {asset.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleDownload(asset.title)}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 rounded text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download Authorized Copy
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

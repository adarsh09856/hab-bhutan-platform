'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PackagePlus, 
  Receipt, 
  Download, 
  Globe2, 
  CreditCard, 
  User, 
  LogOut, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/portal', label: 'Overview', icon: LayoutDashboard },
  { href: '/portal/products/submit', label: 'Submit Product', icon: PackagePlus },
  { href: '/portal/consignments', label: 'Consignment Sales', icon: Receipt },
  { href: '/portal/downloads', label: 'B2B & Seal Downloads', icon: Download },
  { href: '/portal/trade-fairs', label: 'Trade Missions', icon: Globe2 },
  { href: '/portal/dues', label: 'Annual Dues', icon: CreditCard },
  { href: '/portal/profile', label: 'Directory Profile', icon: User },
];

export default function MemberPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChangePassword = pathname === '/portal/change-password';

  if (isChangePassword) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded bg-amber-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                HAB
              </span>
              <div>
                <span className="font-bold text-slate-900 text-sm block leading-none">Member Security Center</span>
                <span className="text-[11px] text-slate-500 font-medium">Handicrafts Association of Bhutan</span>
              </div>
            </div>
            <Link 
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded bg-amber-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                HAB
              </span>
              <div>
                <span className="font-bold text-slate-900 text-sm block leading-none">Artisan Member Portal</span>
                <span className="text-[11px] text-slate-500 font-medium">Handicrafts Association of Bhutan</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              target="_blank"
              className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-medium"
            >
              Public Site <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 leading-none">Choki Weaving House</p>
                <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 justify-end mt-0.5">
                  <ShieldCheck className="w-3 h-3" /> Certified Producer (Thimphu)
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold text-xs">
                CW
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
        {/* Member Sidebar */}
        <aside className="w-full md:w-60 flex-shrink-0">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sticky top-24 space-y-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Member Area
              </p>
              <nav className="space-y-1">
                {NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-amber-50 text-amber-900 font-semibold border-l-2 border-amber-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-700' : 'text-slate-400'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block">Dues Status: Paid</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Valid through Dec 31, 2026</span>
                <span className="font-mono text-[10px] text-slate-400 block mt-1">ID: MEM-THI-001</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Link 
                href="/login"
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </Link>
            </div>
          </div>
        </aside>

        {/* Member Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

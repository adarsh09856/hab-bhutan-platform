'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import '@/styles/globals.css';

interface MemberData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  member: {
    id: string;
    name: string;
    regNumber: string;
    tier: string;
    status: string;
    dzongkhag: string;
    craft?: {
      name: string;
      english: string;
    };
  } | null;
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [data, setData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/member/profile')
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login?callbackUrl=/portal');
          }
          return null;
        }
        return res.json();
      })
      .then((d) => {
        if (d?.success) {
          setData(d);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/revoke-sessions', { method: 'POST' }).catch(() => {});
      document.cookie = 'hab_session=; path=/; max-age=0;';
    } finally {
      window.location.href = '/login';
    }
  };

  const navItems = [
    { label: '📊 Dashboard Overview', href: '/portal' },
    { label: '🏷️ My Crafts & Products', href: '/portal/products' },
    { label: '📦 Orders & Consignments', href: '/portal/orders' },
    { label: '🪚 Workshop Profile', href: '/portal/profile' },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#2E221B] font-figtree flex flex-col">
      {/* Top Header */}
      <header className="bg-[#2E221B] text-[#F1ECE2] border-b border-[#433227] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/portal" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-marcellus font-bold text-base shadow-sm">
              འ
            </span>
            <div>
              <div className="font-marcellus text-lg sm:text-xl text-[#FBF9F5] leading-none">
                HAB Artisan Portal
              </div>
              <div className="font-mono text-[10px] text-[#C9A46A] tracking-wider uppercase mt-0.5">
                Handicrafts Association of Bhutan
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/shop"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#D4C4B5] hover:text-white transition-colors bg-[#433227]/50 px-3 py-1.5 rounded-[6px] border border-[#5A4537]"
          >
            Public E-Shop ↗
          </Link>

          {data?.member && (
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-[#FBF9F5]">{data.member.name}</span>
              <span className="text-[10.5px] font-mono text-[#C9A46A]">
                {data.member.regNumber} · {data.member.dzongkhag}
              </span>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="text-xs font-semibold bg-[#8B2E24] hover:bg-[#A3382D] text-white px-3 sm:px-4 py-1.5 rounded-[6px] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex max-w-[1400px] w-full mx-auto">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-[#F5F0E6] border-r border-[#E5DDD0] p-5 hidden md:flex flex-col justify-between flex-none">
          <div className="space-y-6">
            {data?.member && (
              <div className="p-4 rounded-[10px] bg-white border border-[#E5DDD0] shadow-sm">
                <div className="font-mono text-[9.5px] uppercase tracking-wider text-[#8B2E24] font-semibold mb-1">
                  Accredited Artisan
                </div>
                <div className="font-bold text-sm text-[#2E221B] truncate">{data.member.name}</div>
                <div className="text-xs text-[#6B5A4C] mt-0.5">
                  {data.member.craft?.name || 'Traditional Craft'}
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#F0EAE1] flex items-center justify-between text-[11px]">
                  <span className="font-mono text-[#8B2E24] font-bold">{data.member.regNumber}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9.5px] font-semibold uppercase bg-emerald-100 text-emerald-800">
                    {data.member.status}
                  </span>
                </div>
              </div>
            )}

            <nav className="space-y-1">
              <div className="font-mono text-[10px] tracking-wider uppercase text-[#8C7A6B] px-3 mb-2">
                Artisan Services
              </div>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2.5 rounded-[8px] text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#2E221B] text-[#FBF9F5] shadow-sm'
                        : 'text-[#524135] hover:bg-[#EAE2D5] hover:text-[#2E221B]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Help Box */}
          <div className="p-3.5 bg-[#EAE2D5] border border-[#DDD3C4] rounded-[8px] text-xs text-[#524135] space-y-1.5">
            <div className="font-semibold text-[#2E221B]">Secretariat Support</div>
            <p className="text-[11.5px] text-[#6B5A4C]">
              For consignment assistance or export documentation, reach out to HAB Thimphu:
            </p>
            <div className="font-mono text-[10.5px] text-[#8B2E24]">
              +975 2 328182 / 328183
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
          {/* Mobile Navigation Tabs */}
          <div className="md:hidden flex overflow-x-auto gap-2 pb-4 mb-6 border-b border-[#E5DDD0]">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[#2E221B] text-white'
                      : 'bg-[#EAE2D5] text-[#524135]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

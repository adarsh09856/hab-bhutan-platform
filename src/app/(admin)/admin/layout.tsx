'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface HealthData {
  database: {
    connected: boolean;
    latencyMs: number;
    provider: string;
  };
  fx: {
    rate: number;
    status: string;
    source: string;
    stalenessHours: number;
    isBlocked: boolean;
  };
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    roleSlug: string;
  } | null;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [health, setHealth] = useState<HealthData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        const res = await fetch('/api/admin/health', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setHealth(data);
        }
      } catch (err) {
        console.error('Failed to fetch system health:', err);
      } finally {
        if (isMounted) setLoadingHealth(false);
      }
    }
    checkHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  const navItems = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'POS Terminal', href: '/admin/pos' },
    { label: 'Members', href: '/admin/members' },
    { label: 'Products', href: '/admin/products' },
    { label: 'Orders & Fulfillment', href: '/admin/orders' },
    { label: 'Application Queue', href: '/admin/applications' },
    { label: 'Content & CMS', href: '/admin/content' },
    { label: 'Financial Reports', href: '/admin/reports' },
    { label: 'System Settings', href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-crm flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E293B] text-white flex flex-col flex-none">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-bold text-xs">
              HAB
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-white">HAB Operations</div>
              <div className="text-[11px] text-slate-400">Secretariat CRM</div>
            </div>
          </div>
        </div>

        <nav className="p-4 flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700 text-xs text-slate-400 space-y-1">
          <div className="text-white font-medium truncate">
            {health?.user?.name || 'Secretariat Staff'}
          </div>
          <div className="text-slate-300 truncate">
            {health?.user?.email || 'Authenticated Session'}
          </div>
          <div className="text-[11px] text-indigo-300 font-mono">
            Role: {health?.user?.role || 'Staff Operator'}
          </div>
          <div className="pt-2 flex items-center justify-between">
            <Link href="/" className="text-[#F0C4BD] hover:underline inline-block">
              ← Public Site
            </Link>
            <button
              onClick={() => {
                document.cookie = 'hab_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                router.push('/login');
              }}
              className="text-slate-400 hover:text-rose-400 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with live status badges */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-500">
            Handicrafts Association of Bhutan · Operational Control Center
          </div>
          <div className="flex items-center gap-3">
            {/* Live PostgreSQL Status Badge */}
            {loadingHealth ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                Pinging DB...
              </span>
            ) : health?.database.connected ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                PostgreSQL Connected ({health.database.latencyMs}ms)
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
                Database Disconnected
              </span>
            )}

            {/* Live FX Status Badge */}
            {!loadingHealth && health?.fx && (
              health.fx.status === 'MANUAL_OVERRIDE' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  Manual FX Override (1 USD = {health.fx.rate.toFixed(2)} BTN)
                </span>
              ) : health.fx.isBlocked ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                  FX Blocked (&gt;72h Stale)
                </span>
              ) : health.fx.status === 'STALE' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                  FX Stale ({health.fx.stalenessHours}h old)
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  FX Rate Fresh (1 USD = {health.fx.rate.toFixed(2)} BTN)
                </span>
              )
            )}
          </div>
        </header>

        <div className="p-8 flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}

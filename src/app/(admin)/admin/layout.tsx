'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import '@/styles/globals.css';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Palette, 
  Users, 
  ClipboardList, 
  BadgePercent, 
  Image as ImageIcon, 
  FileText, 
  FolderKanban, 
  Navigation, 
  Globe, 
  BarChart3, 
  ShieldCheck, 
  Settings, 
  Menu, 
  X, 
  ChevronRight, 
  LogOut, 
  ExternalLink,
  Search,
  UserCheck
} from 'lucide-react';

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

interface NavGroup {
  group: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Render standalone page for admin login without sidebar chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const [health, setHealth] = useState<HealthData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  const navGroups: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Catalog & Orders',
      items: [
        { label: 'Products & Catalog', href: '/admin/products', icon: ShoppingBag },
        { label: 'Orders & Fulfillment', href: '/admin/orders', icon: Package },
        { label: '13 Crafts CMS', href: '/admin/crafts', icon: Palette },
      ],
    },
    {
      group: 'People',
      items: [
        { label: 'Members Directory', href: '/admin/members', icon: Users },
        { label: 'Application Queue', href: '/admin/applications', icon: ClipboardList },
        { label: 'Membership Dues & Tiers', href: '/admin/membership-settings', icon: BadgePercent },
      ],
    },
    {
      group: 'Content & Site CMS',
      items: [
        { label: 'Hero Slides', href: '/admin/hero', icon: ImageIcon },
        { label: 'Content & Publications', href: '/admin/content', icon: FileText },
        { label: 'Projects & Impact', href: '/admin/projects', icon: FolderKanban },
        { label: 'Navigation & Menus', href: '/admin/navigation', icon: Navigation },
        { label: 'Website & Global CMS', href: '/admin/site-settings', icon: Globe },
      ],
    },
    {
      group: 'Finance & System',
      items: [
        { label: 'Financial Reports', href: '/admin/reports', icon: BarChart3 },
        { label: 'Roles & RBAC', href: '/admin/settings?tab=RBAC', icon: ShieldCheck },
        { label: 'System Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  // Helper to generate dynamic breadcrumb labels
  const getBreadcrumbs = () => {
    if (pathname === '/admin') return [{ label: 'Dashboard', href: '/admin' }];
    const parts = pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Admin', href: '/admin' }];
    
    // Find active item
    for (const group of navGroups) {
      for (const item of group.items) {
        if (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))) {
          crumbs.push({ label: item.label, href: item.href });
          break;
        }
      }
    }
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-crm flex">
      {/* Mobile/Tablet Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1E293B] text-white flex flex-col flex-none transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#8B2E24] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
              HAB
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-white">HAB Operations</div>
              <div className="text-[11px] text-slate-400">Secretariat Management</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grouped Navigation */}
        <nav className="p-3 flex-1 overflow-y-auto space-y-5">
          {navGroups.map((group) => {
            // If quick search is active, filter items
            const visibleItems = group.items.filter((item) =>
              !quickSearch || item.label.toLowerCase().includes(quickSearch.toLowerCase())
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group}>
                <div className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {group.group}
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === '/admin'
                        ? pathname === '/admin'
                        : item.href.includes('?tab=')
                        ? pathname === '/admin/settings' && typeof window !== 'undefined' && window.location.search.includes('tab=RBAC')
                        : pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between group ${
                          isActive
                            ? 'bg-[#8B2E24] text-white shadow-sm font-semibold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 flex-none ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-200 font-mono">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer Admin User & Public Site Link */}
        <div className="p-4 border-t border-slate-700/80 bg-slate-900/40 text-xs text-slate-400 space-y-2">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="text-white font-medium truncate text-xs">
                {health?.user?.name || 'Secretariat Staff'}
              </div>
              <div className="text-[11px] text-indigo-300 font-mono">
                {health?.user?.role || 'Staff Operator'}
              </div>
            </div>
            <button
              onClick={() => {
                document.cookie = 'hab_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                router.push('/admin/login');
              }}
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px]">
            <Link 
              href="/" 
              className="text-[#F0C4BD] hover:underline flex items-center gap-1"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <span className="text-slate-500">CSO/2011/043</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with breadcrumbs and live status badges */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Drawer Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center space-x-1 text-sm font-medium text-slate-600">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.href + idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-none" />}
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-xs">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link href={crumb.href} className="text-slate-500 hover:text-slate-900 hover:underline transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Live PostgreSQL Status Badge */}
            {loadingHealth ? (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                Pinging DB...
              </span>
            ) : health?.database.connected ? (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                PostgreSQL Connected ({health.database.latencyMs}ms)
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
                Database Disconnected
              </span>
            )}

            {/* Live FX Status Badge */}
            {!loadingHealth && health?.fx && (
              health.fx.status === 'MANUAL_OVERRIDE' ? (
                <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200">
                  Manual FX: 1 USD = {health.fx.rate.toFixed(2)} BTN
                </span>
              ) : health.fx.isBlocked ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
                  FX Blocked (&gt;72h Stale)
                </span>
              ) : health.fx.status === 'STALE' ? (
                <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  FX Stale ({health.fx.stalenessHours}h old)
                </span>
              ) : (
                <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                  1 USD = {health.fx.rate.toFixed(2)} BTN
                </span>
              )
            )}

            {/* Quick Admin Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs">
                  {health?.user?.name ? health.user.name.charAt(0).toUpperCase() : 'S'}
                </div>
              </button>

              {userMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {health?.user?.name || 'Secretariat Staff'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {health?.user?.email || 'Authenticated'}
                    </p>
                    <span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-medium">
                      {health?.user?.role || 'Staff Operator'}
                    </span>
                  </div>

                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>System Settings</span>
                  </Link>

                  <Link
                    href="/admin/settings?tab=RBAC"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Roles & RBAC</span>
                  </Link>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        document.cookie = 'hab_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                        router.push('/admin/login');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="p-3 sm:p-6 lg:p-8 flex-1 overflow-x-hidden overflow-y-auto max-w-full">{children}</div>
      </div>
    </div>
  );
}

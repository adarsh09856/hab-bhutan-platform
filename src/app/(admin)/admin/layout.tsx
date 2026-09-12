'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import '@/styles/globals.css';
import '@/styles/admin.css';
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
  Mail,
  BookOpen,
  Sparkles,
  Command,
  CheckCircle2,
  Activity,
  Store,
  Calendar,
  Heart,
  Award,
  Layers
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
    icon: any;
    badge?: string;
  }[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/admin/login';

  const [health, setHealth] = useState<HealthData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('hab-admin-body');
    document.documentElement.style.backgroundColor = '#020617';
    document.body.style.backgroundColor = '#020617';
    return () => {
      document.body.classList.remove('hab-admin-body');
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    async function checkHealth() {
      try {
        const res = await fetch('/api/admin/health', {
          credentials: 'include',
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setHealth(data);
        }
      } catch (err) {
        console.error('Failed to fetch system health:', err);
      } finally {
        clearTimeout(timer);
        if (isMounted) setLoadingHealth(false);
      }
    }
    checkHealth();
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, []);

  // Global keyboard shortcut for quick command launcher (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navGroups: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        { label: 'Executive Dashboard', href: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Commerce & Orders',
      items: [
        { label: 'Orders & Fulfillment', href: '/admin/orders', icon: Package },
        { label: 'Products & Inventory', href: '/admin/products', icon: ShoppingBag },
        { label: '13 Crafts CMS', href: '/admin/crafts', icon: Palette },
        { label: 'Clusters & Outlets', href: '/admin/clusters-outlets', icon: Store },
      ],
    },
    {
      group: 'People & Accounts',
      items: [
        { label: 'Users & Credentials', href: '/admin/users', icon: ShieldCheck, badge: 'RBAC' },
        { label: 'Artisan Members', href: '/admin/members', icon: Users },
        { label: 'Applications Queue', href: '/admin/applications', icon: ClipboardList },
        { label: 'Membership Dues & Tiers', href: '/admin/membership-settings', icon: BadgePercent },
        { label: 'Membership Tiers', href: '/admin/membership-categories', icon: Layers },
      ],
    },
    {
      group: 'Site CMS & Content',
      items: [
        { label: 'Website CMS & Bands', href: '/admin/site-settings', icon: Globe },
        { label: 'Navigation & Menus', href: '/admin/navigation', icon: Navigation },
        { label: 'Statutory Programmes', href: '/admin/programmes', icon: BookOpen },
        { label: 'Inquiries Inbox', href: '/admin/inquiries', icon: Mail },
        { label: 'Projects & Impact', href: '/admin/projects', icon: FolderKanban },
        { label: 'Hero Slides', href: '/admin/hero', icon: ImageIcon },
        { label: 'Events & Expos', href: '/admin/events', icon: Calendar },
        { label: 'Donations & Support', href: '/admin/donate-settings', icon: Heart },
        { label: 'Master Honours', href: '/admin/honours', icon: Award },
        { label: 'News & Publications', href: '/admin/content', icon: FileText },
      ],
    },
    {
      group: 'Finance & System',
      items: [
        { label: 'Financial Reports', href: '/admin/reports', icon: BarChart3 },
        { label: 'System Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  // Helper to generate dynamic breadcrumbs
  const getBreadcrumbs = () => {
    if (pathname === '/admin') return [{ label: 'Executive Dashboard', href: '/admin' }];
    const crumbs = [{ label: 'Admin', href: '/admin' }];
    
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

  if (isLoginPage) {
    return <div className="hab-admin min-h-screen bg-slate-950 text-slate-100">{children}</div>;
  }

  return (
    <div className="hab-admin min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-stone-950 text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Ambient background glows for glassmorphic depth */}
      <div className="fixed top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-amber-600/10 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-rose-600/10 blur-[130px] pointer-events-none" />
      <div className="fixed top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      {/* Top Floating Glass Header */}
      <header className="sticky top-0 z-40 h-16 bg-slate-900/60 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            id="admin-sidebar-toggle"
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1" />
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                <Link
                  href={crumb.href}
                  className={`transition-colors ${
                    idx === breadcrumbs.length - 1
                      ? 'text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="flex-1 max-w-md mx-auto hidden md:block">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 border border-white/10 text-slate-400 text-xs transition-all backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search modules or actions...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900/80 text-[10px] font-mono text-slate-400 border border-white/10">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Quick actions, Live Status & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Public Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>

          {/* FX Status Pill */}
          {health?.fx && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-white/10 text-[11px] font-mono text-amber-300">
              <span>USD/BTN: Nu. {health.fx.rate != null ? Number(health.fx.rate).toFixed(2) : '86.50'}</span>
            </div>
          )}

          {/* User profile dropdown button */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8B2E24] to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/20">
              {health?.user?.name ? health.user.name[0].toUpperCase() : 'H'}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-white leading-tight">
                {health?.user?.name || 'Administrator'}
              </div>
              <div className="text-[10px] text-amber-400 font-mono">
                {health?.user?.role || 'Super Admin'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Glassmorphic Sidebar */}
        <aside id="admin-sidebar"
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/80 backdrop-blur-2xl border-r border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo & Header */}
          <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B2E24] to-[#B23E30] text-white flex items-center justify-center font-bold text-sm shadow-[0_0_20px_rgba(139,46,36,0.4)] border border-rose-400/30">
                HAB
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white block">HAB Secretariat</span>
                <span className="text-[10px] text-amber-400/90 font-mono tracking-wider block">EXECUTIVE ADMIN</span>
              </div>
            </Link>

            <button
              id="admin-sidebar-close"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Fast inline search */}
          <div className="px-4 pt-3 pb-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="admin-menu-filter"
                aria-label="Filter admin menu"
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Filter menu..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/60 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-500/50"
              />
              {quickSearch && (
                <button
                  onClick={() => setQuickSearch('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 flex-1 overflow-y-auto space-y-5 custom-scrollbar">
            {navGroups.map((group) => {
              const visibleItems = group.items.filter((item) =>
                !quickSearch || item.label.toLowerCase().includes(quickSearch.toLowerCase())
              );

              if (visibleItems.length === 0) return null;

              return (
                <div key={group.group}>
                  <div className="px-3 mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                    {group.group}
                  </div>
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === '/admin'
                          ? pathname === '/admin'
                          : pathname === item.href || pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between group ${
                            isActive
                              ? 'bg-gradient-to-r from-[#8B2E24]/90 to-[#B23E30]/80 text-white shadow-[0_0_20px_rgba(139,46,36,0.35)] border border-rose-400/30 font-semibold'
                              : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 flex-none transition-colors ${
                                isActive ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
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

          {/* Live System Health Footer */}
          <div className="p-3.5 border-t border-white/10 bg-slate-950/60 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${health?.database?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>PostgreSQL {health?.database?.latencyMs != null ? `(${health.database.latencyMs}ms)` : (health?.database?.connected ? 'Active' : 'Checking...')}</span>
              </div>
              <span className="text-[10px] text-slate-400">v2.4 LTS</span>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <div className="truncate">
                <div className="text-white font-medium text-xs truncate">
                  {health?.user?.name || 'Staff Administrator'}
                </div>
                <div className="text-[10.5px] text-amber-400 font-mono">
                  {health?.user?.role || 'Super Admin'}
                </div>
              </div>
              <button
                onClick={() => {
                  document.cookie = 'hab_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                  router.push('/admin/login');
                }}
                title="Sign out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile drawer */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Main Content Area */}
        <main id="admin-main" className="admin-main flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Command Palette Modal (Ctrl + K) */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 bg-black/70 backdrop-blur-md flex items-start justify-center">
          <div className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/15 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Search className="w-4 h-4 text-amber-400" />
              <input
                id="admin-command-search"
                aria-label="Search admin modules"
                autoFocus
                type="text"
                placeholder="Type a command or jump to page..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-hidden"
              />
              <button
                onClick={() => setCommandPaletteOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5"
              >
                Esc
              </button>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-1">
              {navGroups.flatMap(g => g.items).filter((item) =>
                item.label.toLowerCase().includes(quickSearch.trim().toLowerCase())
              ).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs text-slate-200 hover:bg-white/10 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-amber-400" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{item.href}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

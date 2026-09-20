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
  Layers,
  CreditCard,
  ChevronDown
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
  key: string;
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
    document.body.classList.remove('has-admin-live-bar');
    document.documentElement.style.backgroundColor = '#f8fafc';
    document.body.style.backgroundColor = '#f8fafc';
    document.body.style.paddingTop = '0px';
    document.body.style.marginTop = '0px';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.classList.remove('hab-admin-body');
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
      document.body.style.paddingTop = '';
      document.body.style.marginTop = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Reset scroll position of main content container on navigation
  useEffect(() => {
    const mainEl = document.getElementById('admin-main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [pathname]);

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

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    web: true,
    stories: true,
    heritage: true,
    store: true,
    settings: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navGroups: NavGroup[] = [
    {
      group: '1. Website & Pages',
      key: 'web',
      items: [
        { label: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard, badge: 'Live' },
        { label: 'Website Pages', href: '/admin/pages', icon: Layers, badge: 'A–Z' },
        { label: 'Edit Homepage', href: '/admin/pages/home', icon: LayoutDashboard },
        { label: 'Edit About Us', href: '/admin/pages/about', icon: BookOpen },
        { label: 'Header & Footer Menus', href: '/admin/navigation', icon: Navigation },
      ],
    },
    {
      group: '2. Stories & Events',
      key: 'stories',
      items: [
        { label: 'News & Articles', href: '/admin/content', icon: FileText },
        { label: 'Events & Exhibitions', href: '/admin/events', icon: Calendar },
        { label: 'Training Programmes', href: '/admin/programmes', icon: BookOpen },
        { label: 'Development Projects', href: '/admin/projects', icon: FolderKanban },
        { label: 'Reports & Publications', href: '/admin/publications', icon: FileText, badge: 'PDFs' },
      ],
    },
    {
      group: '3. Artisans & Heritage',
      key: 'heritage',
      items: [
        { label: 'Artisans & Members', href: '/admin/members', icon: Users },
        { label: 'Member Applications', href: '/admin/applications', icon: ClipboardList, badge: 'Queue' },
        { label: 'Membership Tiers & Dues', href: '/admin/membership-categories', icon: Layers },
        { label: 'Traditional Crafts (13)', href: '/admin/crafts', icon: Palette },
        { label: 'Master Artisans', href: '/admin/honours', icon: Award },
      ],
    },
    {
      group: '4. Store & Commerce',
      key: 'store',
      items: [
        { label: 'Products & Stock', href: '/admin/products', icon: ShoppingBag, badge: 'Catalog' },
        { label: 'Orders & Tracking', href: '/admin/orders', icon: Package, badge: 'Track' },
        { label: 'Point of Sale (POS)', href: '/admin/pos', icon: Store, badge: 'Live' },
        { label: 'Wholesale Orders', href: '/admin/trade', icon: BadgePercent, badge: 'B2B' },
        { label: 'Retail Shops & Outlets', href: '/admin/clusters-outlets', icon: Store },
        { label: 'Sales Reports', href: '/admin/reports', icon: BarChart3 },
      ],
    },
    {
      group: '5. Settings & Legal',
      key: 'settings',
      items: [
        { label: 'Site Details & Contact', href: '/admin/site-settings', icon: LayoutDashboard, badge: 'Sync' },
        { label: 'Legal Policies', href: '/admin/policies', icon: ShieldCheck },
        { label: 'Customer Messages', href: '/admin/inquiries', icon: Mail },
        { label: 'Donation Appeals', href: '/admin/donate-settings', icon: Heart },
        { label: 'Staff User Accounts', href: '/admin/users', icon: ShieldCheck, badge: 'Access' },
        { label: 'System Settings & Health', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  useEffect(() => {
    for (const group of navGroups) {
      if (group.items.some((item) => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)))) {
        setOpenGroups((prev) => ({ ...prev, [group.key]: true }));
      }
    }
  }, [pathname]);

  // Helper to generate dynamic breadcrumbs
  const getBreadcrumbs = () => {
    if (pathname === '/admin') return [{ label: 'Dashboard', href: '/admin' }];
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
    return <div className="hab-admin h-full overflow-y-auto bg-slate-50 text-slate-900">{children}</div>;
  }

  return (
    <div className="hab-admin h-full flex-1 flex flex-col relative overflow-hidden selection:bg-[#8B2E24]/20 selection:text-slate-900">
      {/* Top Clean Header - Strictly Pinned */}
      <header className="shrink-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-xs">
        {/* Left: Mobile hamburger & breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            id="admin-sidebar-toggle"
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1" />
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <Link
                  href={crumb.href}
                  className={`transition-colors ${
                    idx === breadcrumbs.length - 1
                      ? 'text-slate-900 font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
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
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-100 border border-slate-200 text-slate-500 text-xs transition-all shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search pages, modules or actions...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-600 border border-slate-200 shadow-xs">
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
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-xs font-medium text-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Storefront</span>
          </Link>

          {/* Currency & Language Header Pill */}
          <Link
            href="/admin/localization"
            title="Manage Store Currency & Language Settings"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-mono text-slate-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Currency &amp; Language</span>
            {health?.fx?.rate && (
              <span className="hidden xl:inline text-[10px] text-slate-600 border-l border-slate-300 pl-1.5 ml-1 font-semibold">
                Nu. {Number(health.fx.rate).toFixed(2)}
              </span>
            )}
          </Link>

          {/* User profile dropdown button */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-[#8B2E24] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {health?.user?.name ? health.user.name[0].toUpperCase() : 'H'}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {health?.user?.name || 'Administrator'}
              </div>
              <div className="text-[10px] text-[#8B2E24] font-mono font-medium">
                {health?.user?.role || 'Super Admin'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Light Sidebar - Fixed & Independent */}
        <aside id="admin-sidebar"
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col shrink-0 h-full overflow-hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo & Header */}
          <div className="h-16 shrink-0 px-5 border-b border-slate-200 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#8B2E24] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                HAB
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-slate-900 block">HAB Secretariat</span>
                <span className="text-[10px] text-[#8B2E24] font-mono font-semibold tracking-wider block">ADMIN CONSOLE</span>
              </div>
            </Link>

            <button
              id="admin-sidebar-close"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-500 hover:text-slate-800 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Fast inline search */}
          <div className="px-4 pt-3 pb-1 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="admin-menu-filter"
                aria-label="Filter admin menu"
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Search menu..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#8B2E24] focus:bg-white"
              />
              {quickSearch && (
                <button
                  onClick={() => setQuickSearch('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-3 gap-1.5 mt-2.5">
              <Link
                href="/admin/products"
                className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg bg-slate-50 hover:bg-[#8B2E24]/10 hover:text-[#8B2E24] text-[10px] font-semibold text-slate-600 border border-slate-200 hover:border-[#8B2E24]/30 transition-all text-center"
                title="Manage or add products"
              >
                <ShoppingBag className="w-3 h-3 text-[#8B2E24]" />
                <span>+ Product</span>
              </Link>
              <Link
                href="/admin/content"
                className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg bg-slate-50 hover:bg-[#8B2E24]/10 hover:text-[#8B2E24] text-[10px] font-semibold text-slate-600 border border-slate-200 hover:border-[#8B2E24]/30 transition-all text-center"
                title="Publish story or news"
              >
                <FileText className="w-3 h-3 text-[#8B2E24]" />
                <span>+ Story</span>
              </Link>
              <Link
                href="/admin/pos"
                className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-[10px] font-semibold text-slate-600 border border-slate-200 hover:border-emerald-300 transition-all text-center"
                title="Open counter billing POS"
              >
                <Store className="w-3 h-3 text-emerald-600" />
                <span>POS Sale</span>
              </Link>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 flex-1 min-h-0 overflow-y-auto space-y-3 custom-scrollbar">
            {navGroups.map((group) => {
              const visibleItems = group.items.filter((item) =>
                !quickSearch || item.label.toLowerCase().includes(quickSearch.toLowerCase())
              );

              if (visibleItems.length === 0) return null;

              const isOpen = quickSearch ? true : (openGroups[group.key] ?? true);

              return (
                <div key={group.group} className="pt-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    className="w-full px-2.5 py-1.5 mb-1 rounded-lg flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isOpen ? 'transform rotate-0 text-[#8B2E24]' : 'transform -rotate-90 text-slate-400'
                        }`}
                      />
                      <span>{group.group}</span>
                    </div>
                    <span className="text-[10px] font-mono font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {visibleItems.length}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="space-y-0.5 pl-1.5 border-l-2 border-slate-100 ml-2 animate-in fade-in duration-150">
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
                                ? 'bg-[#8B2E24] text-white shadow-xs font-semibold'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon
                                className={`w-4 h-4 flex-none transition-colors ${
                                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'
                                }`}
                              />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Live System Health Footer */}
          <div className="p-3.5 shrink-0 border-t border-slate-200 bg-slate-50 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${health?.database?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>PostgreSQL {health?.database?.latencyMs != null ? `(${health.database.latencyMs}ms)` : (health?.database?.connected ? 'Online' : 'Checking...')}</span>
              </div>
              <span className="text-[10px] text-slate-400">v2.4 LTS</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div className="truncate">
                <div className="text-slate-800 font-semibold text-xs truncate">
                  {health?.user?.name || 'Staff Administrator'}
                </div>
                <div className="text-[10.5px] text-[#8B2E24] font-mono font-medium">
                  {health?.user?.role || 'Super Admin'}
                </div>
              </div>
              <button
                onClick={() => {
                  document.cookie = 'hab_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                  router.push('/admin/login');
                }}
                title="Sign out"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
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
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* Main Content Area - Scrollable Independently */}
        <main
          id="admin-main"
          className="admin-main flex-1 min-h-0 h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 w-full custom-scrollbar"
        >
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Command Palette Modal (Ctrl + K) */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center">
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                id="admin-command-search"
                aria-label="Search admin modules"
                autoFocus
                type="text"
                placeholder="Type a menu name or jump to page..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden"
              />
              <button
                onClick={() => setCommandPaletteOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded bg-slate-100"
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
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#8B2E24]" />
                      <span className="font-medium text-slate-800">{item.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{item.href}</span>
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

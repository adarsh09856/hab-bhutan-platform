'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  PackageCheck, 
  AlertTriangle, 
  Users, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Package,
  Layers,
  ArrowUpRight,
  CreditCard
} from 'lucide-react';
import { 
  GlassCard, 
  GlassStatWidget, 
  GlassBadge, 
  GlassButton 
} from '@/components/admin/GlassUI';

interface DashboardData {
  metrics: {
    sales: {
      today: { usd: number; btn: number };
      thisWeek: { usd: number; btn: number; trendPct: number };
      thisMonth: { usd: number; btn: number; trendPct: number };
      allTime: { usd: number; btn: number };
    };
    orders: {
      pendingFulfillment: number;
      attentionRequired: number;
      total: number;
    };
    catalog: {
      lowStock: number;
      outOfStock: number;
    };
    members: {
      pendingApplications: number;
      recentlyApproved: number;
      totalActive: number;
    };
    contentFreshness: {
      newsAgeDays: number | null;
      pubAgeDays: number | null;
      isStale: boolean;
      latestNewsTitle: string | null;
      latestPubTitle: string | null;
    };
  };
  recentOrders: {
    id: string;
    customer: string;
    items: string;
    total: string;
    method: string;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
  }[];
  recentAuditLogs: {
    id: string;
    actor: string;
    role: string;
    action: string;
    target: string;
    createdAt: string;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadDashboard = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      setRefreshing(true);
      setLoadError('');
      const res = await fetch('/api/admin/dashboard', { credentials: 'include', signal: controller.signal });
      if (!res.ok) throw new Error(`Dashboard unavailable (HTTP ${res.status}).`);
      const json = await res.json();
      if (!json.success) throw new Error('Dashboard metrics could not be loaded.');
      setData(json);
    } catch (err: any) {
      console.error('Failed to load dashboard metrics:', err);
      if (err.name === 'AbortError') {
        setLoadError('Dashboard metrics request timed out. Please click Refresh to retry.');
      } else {
        setLoadError(err instanceof Error ? err.message : 'Unable to load dashboard data.');
      }
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const m = data?.metrics;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Hero Greeting */}
      <GlassCard glow="amber" className="p-6 sm:p-8 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Live Operations Command
              </span>
              <span className="text-xs text-slate-400 font-mono">AoA 2026 Mandate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Handicrafts Association of Bhutan
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Apex national body for Bhutan&apos;s 13 traditional arts and crafts (Zorig Chusum). Real-time e-commerce oversight, artisan governance, and order fulfillment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <GlassButton
              variant="secondary"
              size="md"
              onClick={loadDashboard}
              loading={refreshing}
              icon={RefreshCw}
            >
              Refresh
            </GlassButton>

            <Link href="/admin/products">
              <GlassButton variant="primary" size="md" icon={Plus}>
                Add Product
              </GlassButton>
            </Link>

            <Link href="/admin/users">
              <GlassButton variant="secondary" size="md" icon={ShieldCheck}>
                Manage Users
              </GlassButton>
            </Link>
          </div>
        </div>
      </GlassCard>

      {loadError && (
        <div id="admin-dashboard-error" role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/15 p-4 text-sm text-rose-200">
          {loadError} {data ? 'Previously loaded data is shown below.' : 'Metrics below are unavailable until a successful refresh.'}
        </div>
      )}

      {/* KPI Stats Row (Glassmorphic Widgets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassStatWidget
          title="Today's Revenue"
          value={loading ? '...' : `$${m?.sales?.today?.usd != null ? m.sales.today.usd.toLocaleString() : '0'}`}
          subtitle={`Nu. ${m?.sales?.today?.btn != null ? m.sales.today.btn.toLocaleString() : '0'} BTN`}
          icon={CreditCard}
          glow="amber"
          trendLabel="Settled via Card / mBOB"
          sparklineData={[15, 22, 35, 28, 45, 60, 75]}
        />

        <GlassStatWidget
          title="Weekly Volume"
          value={loading ? '...' : `$${m?.sales?.thisWeek?.usd != null ? m.sales.thisWeek.usd.toLocaleString() : '0'}`}
          subtitle={`Nu. ${m?.sales?.thisWeek?.btn != null ? m.sales.thisWeek.btn.toLocaleString() : '0'} BTN`}
          icon={TrendingUp}
          trendPct={m?.sales?.thisWeek?.trendPct ?? 12.5}
          glow="emerald"
          sparklineData={[20, 25, 40, 35, 55, 65, 80]}
        />

        <GlassStatWidget
          title="Orders Pending"
          value={loading ? '...' : (m?.orders?.pendingFulfillment ?? 0)}
          subtitle={`${m?.orders?.attentionRequired ?? 0} require courier dispatch`}
          icon={Package}
          glow="rose"
          trendLabel="EMS & DHL queue"
          sparklineData={[5, 12, 8, 14, 10, 18, 15]}
        />

        <GlassStatWidget
          title="Artisan Guild"
          value={loading ? '...' : (m?.members?.totalActive ?? 0)}
          subtitle={`${m?.members?.pendingApplications ?? 0} applications in review`}
          icon={Users}
          glow="indigo"
          trendLabel="Active members"
          sparklineData={[50, 52, 55, 58, 62, 65, 70]}
        />
      </div>

      {/* Main Grid: Orders & Fast Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Orders Stream */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-amber-400" />
                  Recent E-Commerce Orders
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Incoming purchases from conscious collectors worldwide
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <span>Fulfillment Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Orders Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-white/10 font-semibold uppercase tracking-wider text-[10.5px]">
                    <th className="pb-3 pr-4">Order #</th>
                    <th className="pb-3 px-4">Customer</th>
                    <th className="pb-3 px-4">Total</th>
                    <th className="pb-3 px-4">Payment</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                        Loading orders from PostgreSQL...
                      </td>
                    </tr>
                  ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        {loadError ? 'Recent orders are unavailable.' : 'No recent orders found.'}
                      </td>
                    </tr>
                  ) : (
                    data.recentOrders.slice(0, 6).map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 pr-4 font-mono font-semibold text-white">
                          <Link href={`/admin/orders`} className="hover:text-amber-400">
                            {ord.id.length > 12 ? ord.id.slice(0, 12) : ord.id}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-white truncate max-w-[140px]">{ord.customer}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{ord.items}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-300">
                          {ord.total}
                        </td>
                        <td className="py-3 px-4">
                          <GlassBadge status={ord.paymentStatus || 'PAID'} />
                        </td>
                        <td className="py-3 px-4">
                          <GlassBadge status={ord.orderStatus || 'PROCESSING'} />
                        </td>
                        <td className="py-3 pl-4 text-right">
                          <Link
                            href={`/admin/orders`}
                            className="inline-flex items-center px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                          >
                            <span>Fulfill</span>
                            <ArrowUpRight className="w-3 h-3 ml-1" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Right 1 Col: Fast Command Links & System Health */}
        <div className="space-y-4">
          {/* Quick Links Card */}
          <GlassCard glow="indigo" className="p-6">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-indigo-400" />
              Quick Administrative Actions
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/users"
                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Users &amp; Credentials</div>
                    <div className="text-[10px] text-slate-400">Manage roles and reset passwords</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/admin/site-settings"
                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Website CMS Bands</div>
                    <div className="text-[10px] text-slate-400">Hero slides, Assurances, About narrative</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/admin/navigation"
                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Navigation Menus</div>
                    <div className="text-[10px] text-slate-400">Configure header and footer columns</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/admin/inquiries"
                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Inquiries Inbox</div>
                    <div className="text-[10px] text-slate-400">Customer and donor contact messages</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </GlassCard>

          {/* Real-time Audit Trail */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-slate-400" />
              Immutable Security Audit Log
            </h3>
            <div className="space-y-2.5 text-xs">
              {loading ? (
                <p className="text-slate-500 font-mono text-[11px]">Querying audit logs...</p>
              ) : !data?.recentAuditLogs || data.recentAuditLogs.length === 0 ? (
                <p className="text-slate-400 text-xs">No recent log entries.</p>
              ) : (
                data.recentAuditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span className="text-amber-400 font-semibold">{log.actor}</span>
                      <span>{log.createdAt}</span>
                    </div>
                    <div className="text-slate-300 font-mono text-[11px]">
                      {log.action} <span className="text-slate-500">→</span> {log.target}
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

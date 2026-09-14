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
  recentInquiries?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: string;
    createdAt: string;
  }[];
  recentApplications?: {
    id: string;
    applicantName: string;
    email: string;
    phone: string;
    craftKey: string;
    dzongkhag: string;
    planTier: string;
    status: string;
    submittedAt: string;
  }[];
  recentDonations?: {
    id: string;
    donorName: string;
    donorEmail: string;
    amountUSD: number;
    pillarTitle: string;
    receiptNumber: string;
    status: string;
    createdAt: string;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [activityTab, setActivityTab] = useState<'orders' | 'inquiries' | 'applications' | 'donations'>('orders');

  const loadDashboard = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      setRefreshing(true);
      setLoadError('');
      const res = await fetch('/api/admin/dashboard', { credentials: 'include', cache: 'no-store', signal: controller.signal });
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
      <GlassCard glow="amber" className="p-6 sm:p-8 bg-gradient-to-r from-amber-50/50 via-white to-slate-50 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-700" />
                Live Operations Command
              </span>
              <span className="text-xs text-slate-500 font-mono">AoA 2026 Mandate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Handicrafts Association of Bhutan
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
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
        <div id="admin-dashboard-error" role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
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
        {/* Left 2 Cols: Live Public Store & User Activity Stream */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-[#8B2E24]" />
                  Public Store &amp; User Activity
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time checkouts, visitor inquiries, applications &amp; contributions
                </p>
              </div>

              {/* Activity Stream Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setActivityTab('orders')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    activityTab === 'orders' ? 'bg-[#8B2E24] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Orders ({data?.recentOrders?.length ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActivityTab('inquiries')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    activityTab === 'inquiries' ? 'bg-[#8B2E24] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Inquiries ({data?.recentInquiries?.length ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActivityTab('applications')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    activityTab === 'applications' ? 'bg-[#8B2E24] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Artisans ({data?.recentApplications?.length ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActivityTab('donations')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    activityTab === 'donations' ? 'bg-[#8B2E24] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Donations ({data?.recentDonations?.length ?? 0})
                </button>
              </div>
            </div>

            {/* Orders Stream Tab */}
            {activityTab === 'orders' && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10.5px]">
                      <th className="pb-3 pr-4">Order #</th>
                      <th className="pb-3 px-4">Customer</th>
                      <th className="pb-3 px-4">Total</th>
                      <th className="pb-3 px-4">Payment</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 pl-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                          Loading orders from PostgreSQL...
                        </td>
                      </tr>
                    ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          {loadError ? 'Recent orders are unavailable.' : 'No recent orders found.'}
                        </td>
                      </tr>
                    ) : (
                      data.recentOrders.slice(0, 6).map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-4 font-mono font-semibold text-slate-900">
                            <Link href={`/admin/orders`} className="hover:text-[#8B2E24]">
                              {ord.id.length > 12 ? ord.id.slice(0, 12) : ord.id}
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900 truncate max-w-[140px]">{ord.customer}</div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{ord.items}</div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-amber-800">
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
                              className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors font-medium"
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
            )}

            {/* Inquiries Stream Tab */}
            {activityTab === 'inquiries' && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10.5px]">
                      <th className="pb-3 pr-4">Sender</th>
                      <th className="pb-3 px-4">Subject</th>
                      <th className="pb-3 px-4">Message Preview</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 pl-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {!data?.recentInquiries || data.recentInquiries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No customer inquiries received yet.
                        </td>
                      </tr>
                    ) : (
                      data.recentInquiries.slice(0, 6).map((inq) => (
                        <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="font-semibold text-slate-900">{inq.name}</div>
                            <div className="text-[10px] text-slate-500">{inq.email}</div>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">{inq.subject}</td>
                          <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]">{inq.message}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                              {inq.status}
                            </span>
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <Link
                              href="/admin/inquiries"
                              className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors font-medium"
                            >
                              <span>Reply</span>
                              <ArrowUpRight className="w-3 h-3 ml-1" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Applications Stream Tab */}
            {activityTab === 'applications' && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10.5px]">
                      <th className="pb-3 pr-4">Artisan Applicant</th>
                      <th className="pb-3 px-4">Craft</th>
                      <th className="pb-3 px-4">Dzongkhag</th>
                      <th className="pb-3 px-4">Tier</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 pl-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {!data?.recentApplications || data.recentApplications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No pending membership applications.
                        </td>
                      </tr>
                    ) : (
                      data.recentApplications.slice(0, 6).map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="font-semibold text-slate-900">{app.applicantName}</div>
                            <div className="text-[10px] text-slate-500">{app.email}</div>
                          </td>
                          <td className="py-3 px-4 uppercase text-amber-800 font-mono text-[11px] font-semibold">{app.craftKey}</td>
                          <td className="py-3 px-4 text-slate-700">{app.dzongkhag}</td>
                          <td className="py-3 px-4 text-[10px] text-slate-500">{app.planTier}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {app.status}
                            </span>
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <Link
                              href="/admin/applications"
                              className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors font-medium"
                            >
                              <span>Review</span>
                              <ArrowUpRight className="w-3 h-3 ml-1" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Donations Stream Tab */}
            {activityTab === 'donations' && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10.5px]">
                      <th className="pb-3 pr-4">Donor</th>
                      <th className="pb-3 px-4">Pillar</th>
                      <th className="pb-3 px-4">Amount</th>
                      <th className="pb-3 px-4">Receipt #</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 pl-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {!data?.recentDonations || data.recentDonations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No recent public donations recorded.
                        </td>
                      </tr>
                    ) : (
                      data.recentDonations.slice(0, 6).map((don) => (
                        <tr key={don.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="font-semibold text-slate-900">{don.donorName}</div>
                            <div className="text-[10px] text-slate-500">{don.donorEmail}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-700">{don.pillarTitle}</td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-700">${don.amountUSD.toFixed(2)}</td>
                          <td className="py-3 px-4 font-mono text-[10px] text-slate-500">{don.receiptNumber}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {don.status}
                            </span>
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <Link
                              href="/admin/donate-settings"
                              className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors font-medium"
                            >
                              <span>Details</span>
                              <ArrowUpRight className="w-3 h-3 ml-1" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right 1 Col: Fast Command Links & System Health */}
        <div className="space-y-4">
          {/* Quick Links Card */}
          <GlassCard glow="indigo" className="p-6">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-[#8B2E24]" />
              Quick Administrative Actions
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/users"
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Users &amp; Staff Logins</div>
                    <div className="text-[10px] text-slate-500">Manage roles and reset passwords</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
              </Link>

              <Link
                href="/admin/site-settings"
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-rose-700" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Website Content &amp; Settings</div>
                    <div className="text-[10px] text-slate-500">Hero slides, Organization narrative &amp; footer</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
              </Link>

              <Link
                href="/admin/navigation"
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-emerald-700" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Navigation Menus</div>
                    <div className="text-[10px] text-slate-500">Configure header and footer links</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
              </Link>

              <Link
                href="/admin/inquiries"
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-700" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Inquiries Inbox</div>
                    <div className="text-[10px] text-slate-500">Customer and donor contact messages</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
              </Link>
            </div>
          </GlassCard>

          {/* Real-time Audit Trail */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-slate-500" />
              Recent Security Audit Activity
            </h3>
            <div className="space-y-2.5 text-xs">
              {loading ? (
                <p className="text-slate-500 font-mono text-[11px]">Querying audit logs...</p>
              ) : !data?.recentAuditLogs || data.recentAuditLogs.length === 0 ? (
                <p className="text-slate-500 text-xs">No recent log entries.</p>
              ) : (
                data.recentAuditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                      <span className="text-amber-800 font-semibold">{log.actor}</span>
                      <span>{log.createdAt}</span>
                    </div>
                    <div className="text-slate-800 font-mono text-[11px]">
                      {log.action} <span className="text-slate-400">→</span> {log.target}
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

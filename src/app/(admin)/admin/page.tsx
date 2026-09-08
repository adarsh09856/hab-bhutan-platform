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
  RefreshCw
} from 'lucide-react';
import { AdminBadge } from '@/components/admin/AdminUI';

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

  const loadDashboard = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/dashboard', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.success) setData(json);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const m = data?.metrics;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Operations Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time e-commerce oversight &amp; artisan governance for the Handicrafts Association of Bhutan (CSO/2011/043).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadDashboard}
            disabled={refreshing}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#8B2E24]' : ''}`} />
          </button>
          
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#8B2E24] text-white text-xs font-semibold rounded-lg hover:bg-[#72251D] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>

          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors shadow-xs"
          >
            <span>Review Applications</span>
          </Link>

          <Link
            href="/admin/content"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 bg-white text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            <span>Publish Post</span>
          </Link>
        </div>
      </div>

      {/* Revenue Performance Row (USD + BTN) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today */}
        <Link
          href="/admin/orders"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-[#8B2E24]/50 transition-all shadow-xs block"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Today&apos;s Revenue</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {loading ? '...' : `$${m?.sales.today.usd.toLocaleString() || '0'}`}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Nu. {m?.sales.today.btn.toLocaleString() || '0'} BTN
          </div>
        </Link>

        {/* This Week */}
        <Link
          href="/admin/reports"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-[#8B2E24]/50 transition-all shadow-xs block"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>This Week</span>
            {m && m.sales.thisWeek.trendPct >= 0 ? (
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +{m.sales.thisWeek.trendPct}%
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-semibold text-rose-600">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                {m?.sales.thisWeek.trendPct}%
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {loading ? '...' : `$${m?.sales.thisWeek.usd.toLocaleString() || '0'}`}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Nu. {m?.sales.thisWeek.btn.toLocaleString() || '0'} BTN
          </div>
        </Link>

        {/* This Month */}
        <Link
          href="/admin/reports"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-[#8B2E24]/50 transition-all shadow-xs block"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>This Month</span>
            {m && m.sales.thisMonth.trendPct >= 0 ? (
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +{m.sales.thisMonth.trendPct}%
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-semibold text-rose-600">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                {m?.sales.thisMonth.trendPct}%
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {loading ? '...' : `$${m?.sales.thisMonth.usd.toLocaleString() || '0'}`}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Nu. {m?.sales.thisMonth.btn.toLocaleString() || '0'} BTN
          </div>
        </Link>

        {/* Total All-Time */}
        <Link
          href="/admin/reports"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-[#8B2E24]/50 transition-all shadow-xs block"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Gross Sales</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
              Cumulative
            </span>
          </div>
          <div className="text-2xl font-bold text-[#8B2E24] mt-2">
            {loading ? '...' : `$${m?.sales.allTime.usd.toLocaleString() || '0'}`}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Nu. {m?.sales.allTime.btn.toLocaleString() || '0'} BTN
          </div>
        </Link>
      </div>

      {/* Operational Attention & Health Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Fulfillment */}
        <Link
          href="/admin/orders"
          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400 transition-all shadow-xs flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-medium text-slate-500">Pending Fulfillment</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : m?.orders.pendingFulfillment ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Parcels to dispatch</div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            (m?.orders.pendingFulfillment ?? 0) > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
          }`}>
            <PackageCheck className="w-5 h-5" />
          </div>
        </Link>

        {/* Attention Orders */}
        <Link
          href="/admin/orders"
          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400 transition-all shadow-xs flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-medium text-slate-500">Orders Need Attention</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : m?.orders.attentionRequired ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Failed payment / stuck &gt;48h</div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            (m?.orders.attentionRequired ?? 0) > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Link>

        {/* Catalog Stock Health */}
        <Link
          href="/admin/products"
          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400 transition-all shadow-xs flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-medium text-slate-500">Catalog Stock Health</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : (m?.catalog.lowStock ?? 0) + (m?.catalog.outOfStock ?? 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {m?.catalog.outOfStock ?? 0} out of stock · {m?.catalog.lowStock ?? 0} low
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            ((m?.catalog.lowStock ?? 0) + (m?.catalog.outOfStock ?? 0)) > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
          }`}>
            <ShoppingBag className="w-5 h-5" />
          </div>
        </Link>

        {/* Member Application Queue */}
        <Link
          href="/admin/applications"
          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-400 transition-all shadow-xs flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-medium text-slate-500">Pending Applications</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : m?.members.pendingApplications ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {m?.members.totalActive ?? 0} total active members
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            (m?.members.pendingApplications ?? 0) > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
          }`}>
            <Users className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Content Freshness Notice */}
      {m?.contentFreshness && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${
              m.contentFreshness.isStale ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                <span>Public Content Freshness</span>
                <AdminBadge variant={m.contentFreshness.isStale ? 'warning' : 'success'} size="sm">
                  {m.contentFreshness.isStale ? 'Attention: >60 Days' : 'Content Fresh'}
                </AdminBadge>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Latest News: {m.contentFreshness.latestNewsTitle || 'No news yet'} ({m.contentFreshness.newsAgeDays ?? 0}d ago) · 
                Latest Publication: {m.contentFreshness.latestPubTitle || 'None'} ({m.contentFreshness.pubAgeDays ?? 0}d ago)
              </div>
            </div>
          </div>
          <Link
            href="/admin/content"
            className="text-xs font-semibold text-[#8B2E24] hover:underline flex items-center gap-1 flex-none"
          >
            <span>Update Content</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Main Grid: Orders & Live Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Online Orders</h2>
              <p className="text-xs text-slate-500">Live order flow from public store and international collectors.</p>
            </div>
            <Link 
              href="/admin/orders" 
              className="text-xs font-semibold text-[#8B2E24] hover:underline flex items-center gap-1"
            >
              <span>View all orders</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Loading orders from live PostgreSQL database...
                    </td>
                  </tr>
                ) : (data?.recentOrders.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No orders recorded in catalog yet.
                    </td>
                  </tr>
                ) : (
                  data?.recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        <Link href="/admin/orders" className="hover:text-[#8B2E24] hover:underline">
                          {ord.id}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-700 truncate max-w-[150px]">{ord.customer}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono truncate max-w-[160px]">{ord.items}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{ord.total}</td>
                      <td className="py-3 px-4">
                        <AdminBadge 
                          variant={
                            ord.orderStatus === 'DELIVERED' || ord.orderStatus === 'SHIPPED'
                              ? 'success'
                              : ord.orderStatus === 'CANCELLED'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                          dot
                        >
                          {ord.orderStatus}
                        </AdminBadge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link 
                          href="/admin/orders" 
                          className="text-xs font-semibold text-[#8B2E24] hover:underline"
                        >
                          Fulfill →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Audit Stream (1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Live Security Trail</h2>
              <p className="text-[11px] text-slate-500">Audited operational events.</p>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
              AuditLog
            </span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Streaming audit logs...
              </div>
            ) : (data?.recentAuditLogs.length ?? 0) === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No audit events recorded yet.
              </div>
            ) : (
              data?.recentAuditLogs.map((ev) => (
                <div key={ev.id} className="text-xs pb-2 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                    <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                      {ev.role}
                    </span>
                    <span>
                      {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="font-medium text-slate-800 truncate">{ev.action}</div>
                  <div className="text-[11px] text-slate-500 truncate">{ev.target}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{ev.actor}</div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <Link
              href="/admin/settings"
              className="text-xs font-semibold text-[#8B2E24] hover:underline"
            >
              View Full Audit Log Explorer →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

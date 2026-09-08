'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardMetrics {
  totalSalesUSD: number;
  totalSalesBTN: number;
  pendingOrdersCount: number;
  lowStockCount: number;
  pendingApplicationsCount: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  items: string;
  total: string;
  method: string;
  status: string;
  createdAt: string;
}

interface RecentAudit {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [auditLogs, setAuditLogs] = useState<RecentAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            setMetrics(data.metrics);
            setOrders(data.recentOrders || []);
            setAuditLogs(data.recentAuditLogs || []);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const kpis = [
    {
      title: 'Gross Online Sales',
      value: metrics ? `$${metrics.totalSalesUSD.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '$0',
      note: metrics ? `Nu. ${metrics.totalSalesBTN.toLocaleString()} BTN equivalent` : 'Aggregating online volume',
      href: '/admin/orders',
      alert: false,
    },
    {
      title: 'Orders Pending Fulfillment',
      value: loading ? '...' : String(metrics?.pendingOrdersCount ?? 0),
      note: 'EMS parcels requiring dispatch',
      href: '/admin/orders',
      alert: (metrics?.pendingOrdersCount ?? 0) > 0,
    },
    {
      title: 'Low Stock Catalog Alerts',
      value: loading ? '...' : String(metrics?.lowStockCount ?? 0),
      note: 'Under 3 craft units remaining',
      href: '/admin/products',
      alert: (metrics?.lowStockCount ?? 0) > 0,
    },
    {
      title: 'Pending Applications',
      value: loading ? '...' : String(metrics?.pendingApplicationsCount ?? 0),
      note: 'Requires artisan review & CID check',
      href: '/admin/applications',
      alert: (metrics?.pendingApplicationsCount ?? 0) > 0,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Operations Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time online e-commerce oversight &amp; artisan governance for the Handicrafts Association of Bhutan secretariat.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-5">
        {kpis.map((kpi) => (
          <Link
            key={kpi.title}
            href={kpi.href}
            className="bg-white border border-slate-200 rounded-lg p-5 shadow-crm-sm hover:border-slate-400 transition-colors block"
          >
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {kpi.title}
            </div>
            <div className="text-3xl font-bold text-slate-900 mt-2 mb-1">
              {kpi.value}
            </div>
            <div className={`text-xs ${kpi.alert ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
              {kpi.note}
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Layout: Fulfillment & Audit Stream */}
      <div className="grid grid-cols-3 gap-8 items-start">
        {/* Fulfillment Queue (2 cols) */}
        <div className="col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-crm-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Online Orders</h2>
              <p className="text-xs text-slate-500">Commercial invoices and Bhutan Post EMS tracking generation.</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-semibold text-blue-600 hover:underline">
              View all orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 px-4 text-center text-xs text-slate-400">
                      {loading ? 'Loading orders from live PostgreSQL database...' : 'No orders recorded yet.'}
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{ord.id}</td>
                      <td className="py-3 px-4 text-slate-600">{ord.customer}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs font-mono truncate max-w-[180px]">{ord.items}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{ord.total}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            ord.status.includes('SHIPPED') || ord.status.includes('DELIVERED')
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link href="/admin/orders" className="text-xs font-semibold text-slate-700 hover:text-blue-600">
                          Process →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Stream (1 col) */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-crm-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-900">Security &amp; Audit Trail</h2>
            <span className="text-[11px] font-mono text-slate-400">Live DB</span>
          </div>

          <div className="flex flex-col divide-y divide-slate-100">
            {auditLogs.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                {loading ? 'Reading audit trail...' : 'No audit events recorded.'}
              </div>
            ) : (
              auditLogs.map((ev) => (
                <div key={ev.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {ev.role}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">{ev.action}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{ev.target}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">{ev.actor}</div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-center">
            <Link href="/admin/settings" className="text-xs font-semibold text-blue-600 hover:underline">
              Inspect complete audit logs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

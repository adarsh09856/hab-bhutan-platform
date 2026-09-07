'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const kpis = [
    { title: 'Pending Applications', value: '4', note: 'Requires document verification', href: '/admin/applications', alert: true },
    { title: 'Orders to Fulfill', value: '6', note: 'EMS parcels pending tracking', href: '/admin/orders', alert: true },
    { title: 'Low Stock Catalog Items', value: '2', note: 'Under 3 items remaining', href: '/admin/products', alert: false },
    { title: 'Audit Events (24h)', value: '34', note: 'Immutable log stream active', href: '/admin/settings', alert: false },
  ];

  const recentOrders = [
    { id: 'HAB-S-88214', customer: 'Sonam Dorji (Guest)', items: 'MAS01, DAP02', total: '$152', method: 'EMS', status: 'PAID · PENDING_TRACKING' },
    { id: 'HAB-S-88213', customer: 'Pema Wangmo (Member)', items: 'HHB01', total: '$64', method: 'EMS', status: 'SHIPPED · BP-99214-BT' },
    { id: 'HAB-S-88212', customer: 'International Buyer', items: 'LHA01', total: '$340', method: 'EXPRESS', status: 'PAID · PENDING_TRACKING' },
  ];

  const auditStream = [
    { time: '10 mins ago', actor: 'admin@handicraftsbhutan.org', role: 'STAFF', action: 'APPLICATION_APPROVED', target: 'Member: Norzin Tailoring' },
    { time: '42 mins ago', actor: 'shopper@example.com', role: 'GUEST', action: 'ORDER_PLACED_GUEST', target: 'Order: HAB-S-88214' },
    { time: '2 hours ago', actor: 'system-fx-sync', role: 'SYSTEM', action: 'FX_RATE_AUTOMATED_SYNC', target: 'USD/BTN 84.0' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Operations Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time oversight for the Handicrafts Association of Bhutan secretariat.
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
              <h2 className="text-base font-bold text-slate-900">Recent Orders Requiring Fulfillment</h2>
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
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">{ord.id}</td>
                    <td className="py-3 px-4 text-slate-600">{ord.customer}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs font-mono">{ord.items}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{ord.total}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        ord.status.includes('SHIPPED') ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href="/admin/orders" className="text-xs font-semibold text-slate-700 hover:text-blue-600">
                        Process →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Stream (1 col) */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-crm-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-900">Security &amp; Audit Trail</h2>
            <span className="text-[11px] font-mono text-slate-400">Live</span>
          </div>

          <div className="flex flex-col divide-y divide-slate-100">
            {auditStream.map((ev, i) => (
              <div key={i} className="py-3 first:pt-0 last:pb-0">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    {ev.role}
                  </span>
                  <span className="text-slate-400">{ev.time}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800">{ev.action}</div>
                <div className="text-xs text-slate-500 truncate mt-0.5">{ev.target}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{ev.actor}</div>
              </div>
            ))}
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

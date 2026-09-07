'use client';

import React from 'react';
import Link from 'next/link';
import { Package, DollarSign, ArrowUpRight, ShieldCheck, Clock, FileText, Globe2, AlertCircle } from 'lucide-react';
import { PRODUCTS } from '@/lib/data';

export default function MemberPortalDashboardPage() {
  const myProducts = PRODUCTS.filter(p => p.maker.includes('Choki') || p.craftId === 'thag-zo').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Welcome, Choki Weaving House</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
              VERIFIED ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise ID: <strong className="font-mono text-slate-700">MEM-THI-001</strong> • Thag-zo (Weaving) • Thimphu Dzongkhag
          </p>
        </div>
        <Link
          href="/portal/products/submit"
          className="px-4 py-2 bg-amber-700 text-white rounded text-xs font-semibold hover:bg-amber-800 shadow-sm inline-flex items-center gap-1.5"
        >
          <Package className="w-4 h-4" /> Submit New Item
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Shop Listings</p>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{myProducts.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">Featured on global public store</p>
            </div>
            <div className="p-2 bg-amber-50 text-amber-700 rounded">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Consignment Payouts</p>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">$1,936.00</p>
              <p className="text-[11px] text-amber-700 font-medium mt-1">Est. 80% net pass-through (provisional)</p>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Trade Delegations</p>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">1 Enrolled</p>
              <p className="text-[11px] text-slate-500 mt-1">Santa Fe Folk Art Market 2026</p>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded">
              <Globe2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Active Listings & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Consignment Items */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Global Shop Listings</h3>
            <Link href="/portal/consignments" className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1">
              View All Consignments <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Product Name</th>
                <th className="py-2.5 px-4">Code</th>
                <th className="py-2.5 px-4">Retail (USD)</th>
                <th className="py-2.5 px-4">Est. Share (80% Provisional)*</th>
                <th className="py-2.5 px-4">Inventory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {myProducts.map(p => (
                <tr key={p.code} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-sans font-medium text-slate-900">{p.name}</td>
                  <td className="py-3 px-4 text-slate-500">{p.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">${p.priceUsd.toFixed(2)}</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">${(p.priceUsd * 0.8).toFixed(2)}</td>
                  <td className="py-3 px-4 text-slate-700 font-sans">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-semibold">
                      {p.inventoryCount} units in vault
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500">
            * Note: The 80% artisan / 20% association consignment revenue split is provisional and subject to formal HAB Secretariat ratification prior to commercial operations.
          </div>
        </div>

        {/* Right: HAB Announcements & Actions */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Member Circular
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Annual General Meeting 2026:</strong> Notice is hereby issued to all certified producers that the 2026 AGM will be convened at the Royal Textile Academy Hall, Thimphu on October 14, 2026.
            </p>
            <div className="pt-2 border-t border-slate-100">
              <Link href="/portal/downloads" className="text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1">
                Download AGM Agenda & Proxy Vote <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-lg p-4 space-y-2 shadow-sm">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">Authenticity Guarantee</span>
            <p className="text-xs text-slate-200 leading-relaxed">
              Every shipment leaving the HAB Thimphu Vault is sealed with a holographic serial tag issued under the Seal of Origin.
            </p>
            <Link href="/portal/downloads" className="inline-block text-[11px] text-amber-300 font-semibold underline mt-1">
              Download Vector Seal Pack
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

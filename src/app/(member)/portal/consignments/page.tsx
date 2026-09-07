'use client';

import React, { useState } from 'react';
import { Receipt, Download, ExternalLink, CheckCircle, Clock, Truck } from 'lucide-react';

interface ConsignmentItem {
  id: string;
  sku: string;
  name: string;
  retailPrice: number;
  artisanShare: number;
  status: 'IN_VAULT' | 'SOLD' | 'DISBURSED';
  orderId?: string;
  soldDate?: string;
  payoutDate?: string;
  trackingNumber?: string;
}

const CONSIGNMENTS: ConsignmentItem[] = [
  {
    id: 'CSG-0441',
    sku: 'THAG-001',
    name: 'Kushuthara Silk Kira (Masterwork)',
    retailPrice: 480.00,
    artisanShare: 384.00,
    status: 'DISBURSED',
    orderId: 'HAB-2026-001',
    soldDate: '2026-09-02',
    payoutDate: '2026-09-04',
    trackingNumber: 'BP129482910BT'
  },
  {
    id: 'CSG-0442',
    sku: 'THAG-002',
    name: 'Pure Wild Bura Silk Scarf (Natural Indigo)',
    retailPrice: 165.00,
    artisanShare: 132.00,
    status: 'SOLD',
    orderId: 'HAB-2026-003',
    soldDate: '2026-09-05',
    trackingNumber: 'BP882019481BT'
  },
  {
    id: 'CSG-0489',
    sku: 'THAG-003',
    name: 'Handspun Yak Wool Blanket',
    retailPrice: 220.00,
    artisanShare: 176.00,
    status: 'IN_VAULT',
  },
  {
    id: 'CSG-0512',
    sku: 'THAG-004',
    name: 'Kira Weaving Sample Pack (Silk)',
    retailPrice: 95.00,
    artisanShare: 76.00,
    status: 'IN_VAULT',
  }
];

export default function MemberConsignmentsPage() {
  const [filter, setFilter] = useState<'ALL' | 'IN_VAULT' | 'SOLD' | 'DISBURSED'>('ALL');

  const filtered = CONSIGNMENTS.filter(c => filter === 'ALL' || c.status === filter);
  const totalEarned = CONSIGNMENTS.filter(c => c.status === 'DISBURSED').reduce((acc, curr) => acc + curr.artisanShare, 0);
  const pendingPayout = CONSIGNMENTS.filter(c => c.status === 'SOLD').reduce((acc, curr) => acc + curr.artisanShare, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-700" />
            Consignment Inventory & Payout Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track vaulted items, international order sales, and electronic bank remittance disbursements.
          </p>
        </div>
        <div>
          <button 
            onClick={() => alert('Exporting consignment reconciliation spreadsheet')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-slate-700 border border-slate-300 rounded shadow-sm hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5" /> Download Tax Statement (CSV)
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Payouts Disbursed</p>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">${totalEarned.toFixed(2)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Remitted via Bank of Bhutan (BoB)</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Remittance</p>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-1">${pendingPayout.toFixed(2)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Scheduled for next weekly payout batch</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active in Vault</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {CONSIGNMENTS.filter(c => c.status === 'IN_VAULT').length} Items
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Inspected & insured in Thimphu</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['ALL', 'IN_VAULT', 'SOLD', 'DISBURSED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filter === f 
                ? 'bg-amber-700 text-white font-semibold' 
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            {f === 'ALL' ? 'All Items' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Consignment Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Item & SKU</th>
              <th className="py-3 px-4">Vault Status</th>
              <th className="py-3 px-4 text-right">Global Retail</th>
              <th className="py-3 px-4 text-right">Est. Share (80% Provisional)*</th>
              <th className="py-3 px-4">Dispatch / Tracking</th>
              <th className="py-3 px-4 text-right">Remittance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="font-mono text-[11px] text-slate-500">{item.sku} • {item.id}</p>
                </td>
                <td className="py-3 px-4">
                  {item.status === 'IN_VAULT' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-slate-500" /> In Vault
                    </span>
                  )}
                  {item.status === 'SOLD' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Sold (Pending Batch)
                    </span>
                  )}
                  {item.status === 'DISBURSED' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Disbursed
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                  ${item.retailPrice.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                  ${item.artisanShare.toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  {item.trackingNumber ? (
                    <div className="flex items-center gap-1 font-mono text-[11px] text-indigo-600">
                      <Truck className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{item.trackingNumber}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[11px]">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {item.payoutDate ? (
                    <span className="font-mono text-[11px] text-slate-600">
                      Paid {item.payoutDate}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Awaiting settlement</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
          * Note: The 80% artisan / 20% association consignment revenue split is provisional and subject to formal HAB Secretariat ratification prior to commercial operations.
        </div>
      </div>
    </div>
  );
}

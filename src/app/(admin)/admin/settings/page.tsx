'use client';

import React, { useState } from 'react';
import { Settings, Shield, RefreshCw, AlertTriangle, CheckCircle, Clock, Key, Users, History, AlertOctagon } from 'lucide-react';
import { FX_CONFIG } from '@/lib/fx';

interface MockAuditLog {
  id: string;
  timestamp: string;
  actorType: 'STAFF' | 'MEMBER' | 'GUEST' | 'SYSTEM';
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
}

const INITIAL_AUDIT_LOGS: MockAuditLog[] = [
  {
    id: 'AUD-901',
    timestamp: '2026-09-06 20:45:12',
    actorType: 'STAFF',
    actorId: 'usr-admin-01 (Pema Lhamo)',
    action: 'ORDER_FULFILLED',
    entityType: 'Order',
    entityId: 'HAB-2026-001',
    ipAddress: '202.144.128.4'
  },
  {
    id: 'AUD-900',
    timestamp: '2026-09-06 18:32:04',
    actorType: 'SYSTEM',
    actorId: 'CRON_RMA_FX_SYNC',
    action: 'FX_RATE_INGESTED',
    entityType: 'FxRateRecord',
    entityId: 'fx-2026-09-06',
    ipAddress: '127.0.0.1'
  },
  {
    id: 'AUD-899',
    timestamp: '2026-09-06 15:10:22',
    actorType: 'MEMBER',
    actorId: 'mem-001 (Choki Weaving)',
    action: 'PRODUCT_SUBMITTED',
    entityType: 'Product',
    entityId: 'SUB-2026-042',
    ipAddress: '202.144.135.19'
  },
  {
    id: 'AUD-898',
    timestamp: '2026-09-06 12:00:55',
    actorType: 'GUEST',
    actorId: 'guest-sess-88a',
    action: 'CHECKOUT_COMPLETED',
    entityType: 'Order',
    entityId: 'HAB-2026-004',
    ipAddress: '157.240.22.35'
  }
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'FX' | 'RBAC' | 'AUDIT'>('FX');

  // FX state
  const [currentRate, setCurrentRate] = useState<number>(FX_CONFIG.DEFAULT_RATE);
  const [stalenessHours, setStalenessHours] = useState<number>(4);
  const [manualOverrideActive, setManualOverrideActive] = useState<boolean>(false);
  const [overrideRate, setOverrideRate] = useState<number>(85.50);
  const [overrideReason, setOverrideReason] = useState<string>('');

  // RBAC state
  const [roles, setRoles] = useState([
    { id: 'role-superadmin-v1', name: 'SUPERADMIN', revision: 1, isRetired: false, userCount: 2, permissions: ['*'] },
    { id: 'role-crm_staff-v1', name: 'CRM_STAFF', revision: 1, isRetired: false, userCount: 5, permissions: ['MEMBERS_VIEW', 'MEMBERS_EDIT', 'APPLICATIONS_REVIEW'] },
    { id: 'role-catalog_mgr-v1', name: 'CATALOG_MANAGER', revision: 1, isRetired: false, userCount: 3, permissions: ['CATALOG_CREATE', 'CATALOG_EDIT', 'CATALOG_DELETE'] },
    { id: 'role-finance-v1', name: 'FINANCE_OFFICER', revision: 1, isRetired: false, userCount: 2, permissions: ['ORDERS_VIEW', 'ORDERS_REFUND', 'FX_OVERRIDE', 'REPORTS_EXPORT'] },
    { id: 'role-crm_staff-v0-retired', name: 'CRM_STAFF_LEGACY', revision: 0, isRetired: true, userCount: 0, permissions: ['MEMBERS_VIEW'] }
  ]);

  // Audit state
  const [auditLogs, setAuditLogs] = useState<MockAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [actorFilter, setActorFilter] = useState<'ALL' | 'STAFF' | 'MEMBER' | 'GUEST' | 'SYSTEM'>('ALL');

  const handleApplyOverride = () => {
    if (!overrideReason) {
      alert('A valid administrative justification is required to override the Royal Monetary Authority FX rate.');
      return;
    }
    setManualOverrideActive(true);
    setCurrentRate(overrideRate);
    
    // Log to audit
    const newLog: MockAuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorType: 'STAFF',
      actorId: 'usr-admin-01 (Finance Officer)',
      action: 'FX_MANUAL_OVERRIDE_ENGAGED',
      entityType: 'FxRateRecord',
      entityId: `RATE-${overrideRate}`,
      ipAddress: '202.144.128.4'
    };
    setAuditLogs([newLog, ...auditLogs]);
    alert(`Manual FX rate override of 1 USD = ${overrideRate} BTN engaged. Reason: "${overrideReason}". Stamped in audit log.`);
  };

  const handleCancelOverride = () => {
    setManualOverrideActive(false);
    setCurrentRate(FX_CONFIG.DEFAULT_RATE);
    alert('Manual FX override cleared. Restored to Royal Monetary Authority reference feed.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            System Administration, RMA FX Engine & RBAC
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Royal Monetary Authority exchange rates, immutable role lifecycle, and polymorphic audit trail.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-6 text-xs font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('FX')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'FX' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <RefreshCw className="w-4 h-4" /> Royal Monetary Authority (RMA) FX Engine
        </button>
        <button
          onClick={() => setActiveTab('RBAC')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'RBAC' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Key className="w-4 h-4" /> Immutable RBAC Roles & Revisions
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'AUDIT' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" /> Polymorphic Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* Tab: FX Management */}
      {activeTab === 'FX' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">Effective Exchange Rate</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-900">1 USD = {currentRate.toFixed(2)} BTN</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Source: {manualOverrideActive ? 'Manual Administrative Override' : 'RMA Official Reference Feed'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">Feed Staleness Status</span>
              <div className="mt-2 flex items-center gap-2">
                {stalenessHours < 24 && (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-sm bg-emerald-50 px-2.5 py-1 rounded">
                    <CheckCircle className="w-4 h-4" /> FRESH ({stalenessHours}h old)
                  </span>
                )}
                {stalenessHours >= 24 && stalenessHours < 72 && (
                  <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-sm bg-amber-50 px-2.5 py-1 rounded">
                    <AlertTriangle className="w-4 h-4" /> STALE ({stalenessHours}h old)
                  </span>
                )}
                {stalenessHours >= 72 && (
                  <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-sm bg-rose-50 px-2.5 py-1 rounded">
                    <AlertOctagon className="w-4 h-4" /> CRITICAL CEILING EXCEEDED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Contract: 0–24h fresh. 24–72h stale warning. &gt;72h checkout blocked unless manually overridden.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">Simulate Feed Latency</span>
              <div className="mt-2 flex items-center gap-2">
                <button 
                  onClick={() => setStalenessHours(4)}
                  className={`px-2 py-1 text-xs rounded font-medium border ${stalenessHours === 4 ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-700'}`}
                >
                  4h (Fresh)
                </button>
                <button 
                  onClick={() => setStalenessHours(36)}
                  className={`px-2 py-1 text-xs rounded font-medium border ${stalenessHours === 36 ? 'bg-amber-600 text-white' : 'bg-slate-50 text-slate-700'}`}
                >
                  36h (Stale)
                </button>
                <button 
                  onClick={() => setStalenessHours(78)}
                  className={`px-2 py-1 text-xs rounded font-medium border ${stalenessHours === 78 ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-700'}`}
                >
                  78h (Halt)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Test how public checkout and cart behave under different RMA feed latency scenarios.
              </p>
            </div>
          </div>

          {/* Manual Override Protocol Box */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                Administrative Manual Override Protocol
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Allows authorized Finance Officers to unblock checkout when RMA API undergoes downtime or weekend holidays.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Override Exchange Rate (1 USD = X BTN)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={overrideRate}
                  onChange={(e) => setOverrideRate(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 font-mono text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Justification / Authorization Memo</label>
                <input 
                  type="text"
                  placeholder="e.g. Approved by Finance Officer per RMA circular dated 2026-09-06"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={handleApplyOverride}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm"
              >
                Engage Manual FX Override
              </button>
              {manualOverrideActive && (
                <button 
                  onClick={handleCancelOverride}
                  className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded"
                >
                  Clear Override & Return to Live Feed
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: RBAC */}
      {activeTab === 'RBAC' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Immutable Role Lifecycle Engine</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Roles are create-only. No in-place modification. Revisions supersede old roles, reassign users, and retire predecessors.
              </p>
            </div>
            <button 
              onClick={() => alert('Role revision generator: Creates role_v2 and prepares user migration.')}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              + Create Role Revision
            </button>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Role Identifier</th>
                <th className="py-2.5 px-4">Revision</th>
                <th className="py-2.5 px-4">Active Staff</th>
                <th className="py-2.5 px-4">Permissions Scope</th>
                <th className="py-2.5 px-4">Lifecycle State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {roles.map(r => (
                <tr key={r.id} className={r.isRetired ? 'bg-slate-50/70 opacity-60' : ''}>
                  <td className="py-3 px-4 font-sans font-bold text-slate-900">{r.name}</td>
                  <td className="py-3 px-4 text-slate-600">v{r.revision}</td>
                  <td className="py-3 px-4 text-slate-800">{r.userCount} users</td>
                  <td className="py-3 px-4 font-sans">
                    <span className="text-[11px] text-slate-600 truncate block max-w-xs">
                      {r.permissions.join(', ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans">
                    {r.isRetired ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-600 rounded">RETIRED</span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">ACTIVE</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Polymorphic Audit Trail */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Polymorphic Audit Trail</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Captures actions across STAFF, MEMBER, GUEST, and SYSTEM actors.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter Actor:</span>
              <select 
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value as any)}
                className="text-xs border border-slate-300 rounded px-2.5 py-1 bg-white text-slate-700 outline-none"
              >
                <option value="ALL">All Actors</option>
                <option value="STAFF">STAFF</option>
                <option value="MEMBER">MEMBER</option>
                <option value="GUEST">GUEST</option>
                <option value="SYSTEM">SYSTEM</option>
              </select>
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Actor Type</th>
                <th className="py-2.5 px-4">Actor Identity</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Target Entity</th>
                <th className="py-2.5 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs
                .filter(l => actorFilter === 'ALL' || l.actorType === actorFilter)
                .map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 text-slate-500">{log.timestamp}</td>
                    <td className="py-2.5 px-4 font-sans">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.actorType === 'STAFF' ? 'bg-indigo-100 text-indigo-700' :
                        log.actorType === 'MEMBER' ? 'bg-amber-100 text-amber-700' :
                        log.actorType === 'SYSTEM' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {log.actorType}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-800">{log.actorId}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{log.action}</td>
                    <td className="py-2.5 px-4 text-slate-600">{log.entityType} ({log.entityId})</td>
                    <td className="py-2.5 px-4 text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

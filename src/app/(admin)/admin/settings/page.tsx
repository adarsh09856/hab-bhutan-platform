'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Shield, RefreshCw, AlertTriangle, CheckCircle, Clock, Key, Users, History, AlertOctagon, Plus, Edit, Trash2 } from 'lucide-react';
import { PERMISSION_CATEGORIES, Permission } from '@/lib/permissions';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'FX' | 'USERS' | 'RBAC' | 'AUDIT'>('FX');
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1. FX STATE
  const [fxData, setFxData] = useState<any>(null);
  const [overrideRateInput, setOverrideRateInput] = useState<string>('85.50');
  const [overrideReasonInput, setOverrideReasonInput] = useState<string>('');

  // 2. USERS STATE
  const [users, setUsers] = useState<any[]>([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<any | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    roleId: '',
  });

  // 3. RBAC STATE
  const [roles, setRoles] = useState<any[]>([]);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [retiringRole, setRetiringRole] = useState<any | null>(null);
  const [targetMigrationRoleId, setTargetMigrationRoleId] = useState<string>('');
  const [roleForm, setRoleForm] = useState({
    name: '',
    slug: '',
    description: '',
    selectedPermissions: new Set<string>(['*']),
  });

  // 4. AUDIT STATE
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [actorFilter, setActorFilter] = useState<'ALL' | 'STAFF' | 'MEMBER' | 'GUEST' | 'SYSTEM'>('ALL');

  const loadFX = async () => {
    try {
      const res = await fetch('/api/fx', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFxData(data.data);
      }
    } catch (err: any) {
      console.error('Error fetching FX:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
    }
  };

  const loadRoles = async () => {
    try {
      const res = await fetch('/api/admin/roles', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles || []);
      }
    } catch (err: any) {
      console.error('Error fetching roles:', err);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const url = actorFilter === 'ALL'
        ? '/api/admin/audit?limit=50'
        : `/api/admin/audit?actorType=${actorFilter}&limit=50`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadFX(), loadUsers(), loadRoles(), loadAuditLogs()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'AUDIT') {
      loadAuditLogs();
    }
  }, [actorFilter, activeTab]);

  // FX Handlers
  const handleApplyFxOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/fx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rate: parseFloat(overrideRateInput),
          reason: overrideReasonInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(data.message || '✓ Manual FX override engaged.');
        setOverrideReasonInput('');
        await loadFX();
      } else {
        setActionError(data.error || 'Failed to engage FX override.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearFxOverride = async () => {
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/fx', {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(data.message || '✓ Manual FX override cleared. Automated feed restored.');
        await loadFX();
      } else {
        setActionError(data.error || 'Failed to clear FX override.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  // User Handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`✓ Staff operator account "${data.user.name}" (${data.user.email}) created.`);
        setShowCreateUserModal(false);
        setUserForm({ name: '', email: '', password: '', roleId: '' });
        await loadUsers();
      } else {
        setActionError(data.error || 'Failed to create staff user.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingUser),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`✓ User account "${data.user.email}" updated.`);
        setEditingUser(null);
        await loadUsers();
      } else {
        setActionError(data.error || 'Failed to update user.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateUser = async () => {
    if (!deactivatingUser) return;

    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch(`/api/admin/users?id=${deactivatingUser.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(data.message || '✓ Account deactivated.');
        setDeactivatingUser(null);
        await loadUsers();
      } else {
        setActionError(data.error || 'Failed to deactivate account.');
        setDeactivatingUser(null);
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
      setDeactivatingUser(null);
    } finally {
      setSubmitting(false);
    }
  };

  // RBAC Handlers
  const togglePermission = (slug: string) => {
    setRoleForm((prev) => {
      const updated = new Set(prev.selectedPermissions);
      if (updated.has(slug)) {
        updated.delete(slug);
      } else {
        updated.add(slug);
      }
      return { ...prev, selectedPermissions: updated };
    });
  };

  const toggleCategoryAll = (slugs: string[], selectAll: boolean) => {
    setRoleForm((prev) => {
      const updated = new Set(prev.selectedPermissions);
      slugs.forEach((slug) => {
        if (selectAll) updated.add(slug);
        else updated.delete(slug);
      });
      return { ...prev, selectedPermissions: updated };
    });
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    const permissionsArray = Array.from(roleForm.selectedPermissions);
    if (permissionsArray.length === 0) {
      setActionError('At least one permission must be granted to the role revision.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: roleForm.name,
          slug: roleForm.slug || roleForm.name.toLowerCase().replace(/\s+/g, '_'),
          permissions: permissionsArray,
          description: roleForm.description,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`✓ Immutable Role Revision published: ${data.role.name} (v${data.role.version}).`);
        setShowCreateRoleModal(false);
        setRoleForm({ name: '', slug: '', description: '', selectedPermissions: new Set(['*']) });
        await loadRoles();
      } else {
        setActionError(data.error || 'Failed to create role revision.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetireAndReassign = async () => {
    if (!retiringRole || !targetMigrationRoleId) {
      setActionError('Target migration role is required.');
      return;
    }

    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          oldRoleId: retiringRole.id,
          newRoleId: targetMigrationRoleId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(data.message || `✓ Role retired and users migrated.`);
        setRetiringRole(null);
        setTargetMigrationRoleId('');
        await loadRoles();
        await loadUsers();
      } else {
        setActionError(data.error || 'Failed to retire role.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            System Administration, RMA FX Engine &amp; RBAC
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Royal Monetary Authority exchange rates, staff operators, immutable role lifecycle, and cryptographic audit trail.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-md flex justify-between items-center">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-md flex justify-between items-center">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="font-bold ml-2">✕</button>
        </div>
      )}

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
          onClick={() => setActiveTab('USERS')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'USERS' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> Staff Operator Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('RBAC')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'RBAC' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Key className="w-4 h-4" /> Immutable RBAC Roles &amp; Revisions ({roles.length})
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'AUDIT' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" /> Cryptographic Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: RMA FX Engine */}
      {activeTab === 'FX' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
              <span className="text-[11px] font-medium text-slate-500 uppercase">Effective Exchange Rate</span>
              <div className="text-2xl font-bold font-mono text-slate-900">
                1 USD = {fxData?.rate?.toFixed(2) || '84.00'} BTN
              </div>
              <p className="text-xs text-slate-500">Applied automatically at point of purchase</p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
              <span className="text-[11px] font-medium text-slate-500 uppercase">Feed Health Status</span>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                    fxData?.isManualOverride
                      ? 'bg-amber-100 text-amber-900'
                      : fxData?.status === 'FRESH'
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-rose-100 text-rose-900'
                  }`}
                >
                  {fxData?.isManualOverride ? 'MANUAL OVERRIDE' : fxData?.status || 'FRESH'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {fxData?.isManualOverride ? 'Admin Locked' : `${fxData?.stalenessHours ?? 0}h staleness`}
                </span>
              </div>
              <p className="text-xs text-slate-500">Source: {fxData?.source || 'Automated Currency Sync'}</p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
              <span className="text-[11px] font-medium text-slate-500 uppercase">Checkout Gating Guard</span>
              <div className="flex items-center gap-2">
                {fxData?.blocked ? (
                  <span className="text-rose-600 font-semibold text-xs flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> BTN Checkout Suspended (&gt;72h stale)
                  </span>
                ) : (
                  <span className="text-emerald-600 font-semibold text-xs flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Active &amp; Unblocked
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Enforced by edge middleware</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Administrative FX Manual Override</h3>
                <p className="text-xs text-slate-500">
                  Override the RMA exchange rate in event of communication outage or extraordinary monetary directive.
                </p>
              </div>
              {fxData?.isManualOverride && (
                <button
                  onClick={handleClearFxOverride}
                  disabled={submitting}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold"
                >
                  Clear Manual Override &amp; Restore Feed
                </button>
              )}
            </div>

            <form onSubmit={handleApplyFxOverride} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">New Exchange Rate (BTN per 1 USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={overrideRateInput}
                  onChange={(e) => setOverrideRateInput(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Administrative Justification (Min 5 chars) *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Monetary Authority circular #409 peg adjustment"
                    value={overrideReasonInput}
                    onChange={(e) => setOverrideReasonInput(e.target.value)}
                    className="flex-1 border border-slate-300 rounded px-3 py-2"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold disabled:opacity-50 whitespace-nowrap"
                  >
                    {submitting ? 'Engaging...' : 'Engage Override'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Staff Users Accounts */}
      {activeTab === 'USERS' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Staff Operator Accounts</h3>
              <p className="text-xs text-slate-500">Back-office staff authorized to manage members, products, and dispatches.</p>
            </div>
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Staff Account</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Operator Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Assigned Role &amp; Version</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                        {u.role?.name || 'Unassigned'} (v{u.role?.version || 1})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setEditingUser({ ...u, password: '' })}
                        className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded text-[11px]"
                      >
                        Edit
                      </button>
                      {u.status === 'ACTIVE' && (
                        <button
                          onClick={() => setDeactivatingUser(u)}
                          className="px-2 py-1 text-rose-600 hover:text-rose-800 border border-rose-200 rounded text-[11px]"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No staff accounts found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Immutable RBAC Roles */}
      {activeTab === 'RBAC' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Immutable Roles &amp; Version History</h3>
              <p className="text-xs text-slate-500">
                Roles are create-only and never mutated in place. Upgrading permissions increments role version and records an immutable audit ledger entry.
              </p>
            </div>
            <button
              onClick={() => setShowCreateRoleModal(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Role Revision</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Role Identifier &amp; Slug</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Active Staff Users</th>
                  <th className="py-3 px-4">Permissions Coverage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roles.map((r) => {
                  const perms = Array.isArray(r.permissions) ? r.permissions : [];
                  const isWildcard = perms.includes('*');

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{r.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{r.slug}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">v{r.version}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">{r.userCount} assigned</td>
                      <td className="py-3 px-4 text-slate-600">
                        {isWildcard ? (
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">
                            Full Wildcard (*)
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-slate-500">
                            {perms.length} granular permissions
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {r.status === 'ACTIVE' && (
                          <button
                            onClick={() => setRetiringRole(r)}
                            className="px-2 py-1 text-rose-600 hover:text-rose-800 border border-rose-200 hover:bg-rose-50 rounded text-[11px]"
                          >
                            Retire &amp; Reassign
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {roles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No roles loaded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Cryptographic Audit Trail */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Polymorphic Cryptographic Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable ledger recording all administrative mutations and order events.</p>
            </div>
            <div className="flex items-center gap-1.5">
              {(['ALL', 'STAFF', 'MEMBER', 'GUEST', 'SYSTEM'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActorFilter(filter)}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                    actorFilter === filter
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity &amp; ID</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900">{log.actorIdentifier || log.actorType}</span>
                      <span className="ml-1.5 font-mono text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                        {log.actorType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-indigo-700">{log.action}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {log.entityType} <span className="text-slate-400">({log.entityId?.slice(0, 10)})</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{log.actorIp || '127.0.0.1'}</td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500 max-w-xs truncate" title={JSON.stringify(log.details)}>
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No audit log entries found matching selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Create Staff Account */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Create Staff Operator Account</h3>
              <button onClick={() => setShowCreateUserModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tshering Dema"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tshering@handicraftsbhutan.org"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Assigned Role *</label>
                <select
                  required
                  value={userForm.roleId}
                  onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                >
                  <option value="">Select Role...</option>
                  {roles.filter((r) => r.status === 'ACTIVE').map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (v{r.version})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Provision Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Staff Account */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit Staff User: {editingUser.name}</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={editingUser.roleId}
                  onChange={(e) => setEditingUser({ ...editingUser, roleId: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                >
                  {roles.filter((r) => r.status === 'ACTIVE').map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (v{r.version})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Account Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Reset Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep unchanged"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Deactivate User Confirmation */}
      {deactivatingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Deactivate Staff Account?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to deactivate <strong className="text-slate-900">{deactivatingUser.name}</strong> ({deactivatingUser.email})?
            </p>
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
              The user status will be set to SUSPENDED. All cryptographic audit log entries will remain preserved.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeactivatingUser(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateUser}
                disabled={submitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold disabled:opacity-50"
              >
                {submitting ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Role Revision with Interactive Checkbox Matrix */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Publish New Role Revision</h3>
                <p className="text-xs text-slate-500">Immutable revision matrix covering all granular permissions.</p>
              </div>
              <button onClick={() => setShowCreateRoleModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Role Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Catalog Manager or Senior Reviewer"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Slug Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. catalog_manager (auto-derived if blank)"
                    value={roleForm.slug}
                    onChange={(e) => setRoleForm({ ...roleForm, slug: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Revision Scope Description</label>
                <input
                  type="text"
                  placeholder="e.g. Updated product publish and discount capabilities for 2026"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              {/* Interactive Categorized Permissions Checkbox Matrix */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-sm">Granular Permission Matrix</h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => togglePermission('*')}
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border transition ${
                        roleForm.selectedPermissions.has('*')
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {roleForm.selectedPermissions.has('*') ? '✓ Full Superadmin (*)' : 'Enable Wildcard (*)'}
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50">
                  {PERMISSION_CATEGORIES.map((cat) => {
                    const catSlugs = cat.permissions.map((p) => p.slug);
                    const allSelected = catSlugs.every((s) => roleForm.selectedPermissions.has(s));

                    return (
                      <div key={cat.name} className="bg-white p-3 rounded border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="font-bold text-slate-900 text-xs">{cat.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleCategoryAll(catSlugs, !allSelected)}
                            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {cat.permissions.map((p) => {
                            const checked = roleForm.selectedPermissions.has(p.slug) || roleForm.selectedPermissions.has('*');

                            return (
                              <label
                                key={p.slug}
                                className="flex items-start gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => togglePermission(p.slug)}
                                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                  <div className="font-semibold text-slate-800 text-[11px]">{p.label}</div>
                                  <div className="text-slate-400 font-mono text-[9px]">{p.slug}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateRoleModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish Immutable Revision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Retire Role & Reassign Users */}
      {retiringRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Retire Role &amp; Reassign Users</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Retiring <strong className="text-slate-900">{retiringRole.name} (v{retiringRole.version})</strong> requires migrating all currently assigned users to an active replacement role revision.
            </p>

            <div>
              <label className="block font-medium text-slate-700 text-xs mb-1">
                Target Role for {retiringRole.userCount} Active User(s) *
              </label>
              <select
                required
                value={targetMigrationRoleId}
                onChange={(e) => setTargetMigrationRoleId(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white"
              >
                <option value="">Select Replacement Role...</option>
                {roles
                  .filter((r) => r.status === 'ACTIVE' && r.id !== retiringRole.id)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (v{r.version})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRetiringRole(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRetireAndReassign}
                disabled={submitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold disabled:opacity-50"
              >
                {submitting ? 'Migrating...' : 'Confirm Retirement & Migration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

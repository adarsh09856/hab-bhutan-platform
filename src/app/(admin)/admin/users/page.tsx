'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  Search, 
  KeyRound, 
  UserX, 
  UserCheck, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertCircle,
  Clock,
  Shield,
  Filter
} from 'lucide-react';
import { 
  GlassCard, 
  GlassStatWidget, 
  GlassBadge, 
  GlassButton, 
  GlassDrawer, 
  GlassInput, 
  GlassSelect 
} from '@/components/admin/GlassUI';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roleId: string;
  status: string;
  twoFactorEnabled?: boolean;
  createdAt: string;
  role: {
    id: string;
    name: string;
    slug: string;
    version: number;
    status: string;
  };
}

interface RoleRecord {
  id: string;
  name: string;
  slug: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create User Drawer
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    roleId: '',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Password Reset Modal / Dialog
  const [resetModalData, setResetModalData] = useState<{
    user: UserRecord | null;
    tempPassword?: string;
    copied?: boolean;
  } | null>(null);
  const [resetting, setResetting] = useState(false);

  // Edit Role Drawer
  const [editRoleUser, setEditRoleUser] = useState<UserRecord | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [updatingRole, setUpdatingRole] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/roles', { credentials: 'include' }),
      ]);

      if (usersRes.ok) {
        const uJson = await usersRes.json();
        if (uJson.success) setUsers(uJson.users || []);
      }

      if (rolesRes.ok) {
        const rJson = await rolesRes.json();
        if (rJson.success && rJson.roles) {
          setRoles(rJson.roles);
        } else if (rJson.activeRoles) {
          setRoles(rJson.activeRoles);
        }
      }
    } catch (err) {
      console.error('Failed to load users data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === 'ALL' || u.role?.slug === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchQuery && matchRole && matchStatus;
  });

  const staffCount = users.filter((u) => ['super_admin', 'staff_operator', 'trustee_viewer'].includes(u.role?.slug)).length;
  const memberCount = users.filter((u) => u.role?.slug === 'member' || u.role?.slug === 'artisan').length;
  const customerCount = users.filter((u) => u.role?.slug === 'customer').length;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!createForm.name || !createForm.email || !createForm.password || !createForm.roleId) {
      setCreateError('All fields are required.');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCreateDrawerOpen(false);
        setCreateForm({ name: '', email: '', password: '', roleId: '' });
        loadData();
      } else {
        setCreateError(data.error || 'Failed to create user.');
      }
    } catch {
      setCreateError('Connection error creating user.');
    } finally {
      setCreating(false);
    }
  };

  const handleResetPassword = async (user: UserRecord) => {
    setResetting(true);
    try {
      const res = await fetch('/api/admin/users/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: user.id, action: 'RESET_PASSWORD' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetModalData({ user, tempPassword: data.temporaryPassword, copied: false });
      } else {
        alert(data.error || 'Failed to reset password.');
      }
    } catch {
      alert('Error resetting password.');
    } finally {
      setResetting(false);
    }
  };

  const handleToggleStatus = async (user: UserRecord) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to change status of ${user.name} to ${nextStatus}?`)) return;

    try {
      const res = await fetch('/api/admin/users/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: user.id, action: 'TOGGLE_STATUS', status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loadData();
      } else {
        alert(data.error || 'Failed to update user status.');
      }
    } catch {
      alert('Error updating user status.');
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoleUser || !selectedRoleId) return;

    setUpdatingRole(true);
    try {
      const res = await fetch('/api/admin/users/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: editRoleUser.id, action: 'UPDATE_ROLE', roleId: selectedRoleId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditRoleUser(null);
        loadData();
      } else {
        alert(data.error || 'Failed to update user role.');
      }
    } catch {
      alert('Error updating user role.');
    } finally {
      setUpdatingRole(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add User Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            User Accounts &amp; Credentials Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            RBAC permission control, active directory, and one-click password resets for the HAB platform.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <GlassButton
            variant="secondary"
            size="md"
            onClick={loadData}
            icon={RefreshCw}
            loading={loading}
          >
            Refresh
          </GlassButton>
          <GlassButton
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setCreateDrawerOpen(true)}
          >
            Add New User
          </GlassButton>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassStatWidget
          title="Total Users"
          value={loading ? '...' : users.length}
          subtitle="System wide accounts"
          icon={Users}
          glow="amber"
          trendLabel="All roles"
        />
        <GlassStatWidget
          title="Staff & Admins"
          value={loading ? '...' : staffCount}
          subtitle="Secretariat & Trustees"
          icon={Shield}
          glow="indigo"
          trendLabel="Privileged access"
        />
        <GlassStatWidget
          title="Artisan Members"
          value={loading ? '...' : memberCount}
          subtitle="Producers & Guild"
          icon={ShieldCheck}
          glow="emerald"
          trendLabel="Artisan portal"
        />
        <GlassStatWidget
          title="Customer Buyers"
          value={loading ? '...' : customerCount}
          subtitle="Public e-commerce"
          icon={Users}
          glow="rose"
          trendLabel="Online collectors"
        />
      </div>

      {/* Main Glass Table Container */}
      <GlassCard className="p-6">
        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500/60"
            />
          </div>

          <div className="flex items-center gap-2.5">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-800/80 border border-white/10 text-slate-200 focus:outline-hidden"
            >
              <option value="ALL">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="staff_operator">Staff Operator</option>
              <option value="trustee_viewer">Trustee Viewer</option>
              <option value="member">Artisan Member</option>
              <option value="customer">Customer Buyer</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-800/80 border border-white/10 text-slate-200 focus:outline-hidden"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-white/10 font-semibold uppercase tracking-wider text-[10.5px]">
                <th className="py-3.5 pr-4">User</th>
                <th className="py-3.5 px-4">Role &amp; Permissions</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 pl-4 text-right">Credentials Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500 font-mono">
                    Loading users directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No matching user accounts found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    {/* User Profile */}
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-amber-400 text-xs flex-none">
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200">{u.role?.name || 'Custom Role'}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-400">
                          v{u.role?.version || 1}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <GlassBadge status={u.status} />
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditRoleUser(u);
                            setSelectedRoleId(u.roleId);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] transition-colors"
                          title="Change Role"
                        >
                          Change Role
                        </button>

                        <button
                          onClick={() => handleResetPassword(u)}
                          disabled={resetting}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[11px] font-medium flex items-center gap-1 transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Reset Pwd</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                          title={u.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
                        >
                          {u.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Create User Drawer */}
      <GlassDrawer
        isOpen={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        title="Provision New User Account"
        subtitle="Create an internal staff operator, trustee, or artisan user."
        width="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {createError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-none" />
              <span>{createError}</span>
            </div>
          )}

          <GlassInput
            label="Full Name *"
            required
            placeholder="e.g. Tshering Penjor"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
          />

          <GlassInput
            label="Official Email Address *"
            type="email"
            required
            placeholder="tshering@handicraftsbhutan.org"
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
          />

          <GlassInput
            label="Initial Password *"
            type="password"
            required
            placeholder="Minimum 8 characters"
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
          />

          <GlassSelect
            label="Designated Role *"
            required
            value={createForm.roleId}
            onChange={(e) => setCreateForm({ ...createForm, roleId: e.target.value })}
          >
            <option value="" disabled>Select a role...</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.slug})
              </option>
            ))}
          </GlassSelect>

          <div className="pt-4 flex items-center justify-end gap-2">
            <GlassButton
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setCreateDrawerOpen(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              loading={creating}
            >
              Create Account
            </GlassButton>
          </div>
        </form>
      </GlassDrawer>

      {/* Edit Role Drawer */}
      <GlassDrawer
        isOpen={Boolean(editRoleUser)}
        onClose={() => setEditRoleUser(null)}
        title="Update User Role"
        subtitle={`Modify permissions for ${editRoleUser?.name}`}
        width="md"
      >
        <form onSubmit={handleUpdateRole} className="space-y-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
            <div className="text-slate-400">Current Role:</div>
            <div className="text-white font-semibold">{editRoleUser?.role?.name} ({editRoleUser?.role?.slug})</div>
          </div>

          <GlassSelect
            label="Select New Role *"
            required
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.slug})
              </option>
            ))}
          </GlassSelect>

          <div className="pt-4 flex items-center justify-end gap-2">
            <GlassButton
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setEditRoleUser(null)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              loading={updatingRole}
            >
              Save New Role
            </GlassButton>
          </div>
        </form>
      </GlassDrawer>

      {/* Password Reset Modal */}
      {resetModalData && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 bg-black/70 backdrop-blur-md flex items-center justify-center">
          <div className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/15 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Temporary Password Generated</h3>
                <p className="text-xs text-slate-400">For {resetModalData.user?.email}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              The user&apos;s previous sessions have been invalidated. Hand this temporary password to the user. They will be prompted to choose a new password on their next login.
            </p>

            {/* Password Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/40 flex items-center justify-between gap-2 font-mono text-sm text-amber-300">
              <span className="select-all font-bold">{resetModalData.tempPassword}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(resetModalData.tempPassword || '');
                  setResetModalData({ ...resetModalData, copied: true });
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Copy Password"
              >
                {resetModalData.copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <GlassButton
                variant="primary"
                size="md"
                onClick={() => setResetModalData(null)}
              >
                Done
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

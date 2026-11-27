'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Shield, RefreshCw, AlertTriangle, CheckCircle, Clock, Key, Users, History, AlertOctagon, Plus, Edit, Trash2, Mail, ExternalLink, Save, Globe, Truck } from 'lucide-react';
import { PERMISSION_CATEGORIES, Permission } from '@/lib/permissions';
import { smtpConnectionOptions } from '@/lib/smtp-options';
import ShippingRatesPanel from '@/components/admin/ShippingRatesPanel';

function AdminSettingsContent() {
  const [activeTab, setActiveTab] = useState<'FX' | 'USERS' | 'RBAC' | 'GATEWAYS' | 'SHIPPING' | 'AUDIT'>('FX');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('tab');
      if (p === 'RBAC' || p === 'USERS' || p === 'GATEWAYS' || p === 'SHIPPING' || p === 'AUDIT') {
        setActiveTab(p as any);
      }
    }
  }, []);
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

  // Email notification settings
  const [activeEmailTab, setActiveEmailTab] = useState<'order_confirmation' | 'order_shipped' | 'application_approved' | 'application_rejected'>('order_confirmation');
  const [emailTemplates, setEmailTemplates] = useState<Record<string, { subject: string; body: string }>>({
    order_confirmation: {
      subject: 'Order Confirmation #{{orderNumber}} · Handicrafts Association of Bhutan',
      body: 'Kuzuzangpo la {{customerName}},\n\nThank you for supporting community artisans through the Handicrafts Association of Bhutan. Your order #{{orderNumber}} has been placed and received by our fulfillment center in Thimphu.\n\nOrder Total: {{totalAmount}}\nPayment Method: {{paymentMethod}}\n\nWe will notify you with Bhutan Post EMS tracking once dispatched.',
    },
    order_shipped: {
      subject: 'Your HAB Order #{{orderNumber}} Has Shipped via EMS Bhutan Post',
      body: 'Kuzuzangpo la {{customerName}},\n\nYour order has departed our Thimphu hub and is en route via {{shippingMethod}}.\n\nEMS Tracking Number: {{trackingNumber}}\nTrack live anytime at: /track-order\n\nEach item is accompanied by an official Zorig Chusum certificate of authenticity.',
    },
    application_approved: {
      subject: 'Welcome to HAB · Your Artisan Membership Application is Approved',
      body: 'Kuzuzangpo la {{applicantName}},\n\nCongratulations! The HAB Secretariat has verified your citizenship credentials and craft background. Your membership has been approved under registration #{{regNumber}}.\n\nPlease set up your member portal access here:\n{{activationUrl}}',
    },
    application_rejected: {
      subject: 'Update Regarding Your HAB Membership Application',
      body: 'Kuzuzangpo la {{applicantName}},\n\nThank you for your interest in joining the Handicrafts Association of Bhutan. Following verification review, your application could not be approved at this time.\n\nReason: {{rejectionReason}}\n\nYou may submit an amended application or contact the secretariat at officehab@gmail.com.',
    },
  });

  const [smtpSettings, setSmtpSettings] = useState({
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromName: 'Handicrafts Association of Bhutan',
    fromEmail: 'officehab@gmail.com',
  });
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailFeedback, setTestEmailFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const loadEmailSettings = async () => {
    try {
      const res = await fetch('/api/admin/site-settings', { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        const d = await res.json();
        if (d?.setting?.emailTemplates) {
          setEmailTemplates((prev) => ({ ...prev, ...d.setting.emailTemplates }));
        }
        if (d?.setting?.emailSettings) {
          setSmtpSettings((prev) => {
            const merged = { ...prev, ...d.setting.emailSettings };
            return { ...merged, secure: smtpConnectionOptions(merged).secure };
          });
        }
      }
    } catch (err) {
      console.error('Error fetching email settings:', err);
    }
  };

  const handleSaveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');
    try {
      const payload: any = {
        emailTemplates,
        emailSettings: smtpSettings,
      };

      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const d = await res.json();
      if (res.ok && d.success) {
        setActionSuccess('Email settings and notification templates saved successfully.');
      } else {
        setActionError(d.error || 'Failed to save email settings.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error saving settings.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      setTestEmailFeedback({ success: false, message: 'Please enter a valid recipient email address.' });
      return;
    }
    setTestingEmail(true);
    setTestEmailFeedback(null);
    try {
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          toEmail: testEmailRecipient,
          ...smtpSettings,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailFeedback({ success: true, message: data.message });
      } else {
        setTestEmailFeedback({ success: false, message: data.error || 'Failed to dispatch test email.' });
      }
    } catch (err: any) {
      setTestEmailFeedback({ success: false, message: err.message || 'Network error connecting to email service.' });
    } finally {
      setTestingEmail(false);
    }
  };

  const loadFX = async () => {
    try {
      const res = await fetch('/api/fx', { credentials: 'include', cache: 'no-store' });
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
      const res = await fetch('/api/admin/users', { credentials: 'include', cache: 'no-store' });
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
      const res = await fetch('/api/admin/roles', { credentials: 'include', cache: 'no-store' });
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
      const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
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
    Promise.all([loadFX(), loadUsers(), loadRoles(), loadAuditLogs(), loadEmailSettings()]).finally(() => setLoading(false));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b admin-border pb-5">
        <div>
          <h1 className="text-xl font-bold admin-title flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#8B2E24]" />
            Settings &amp; staff access
          </h1>
          <p className="text-sm admin-muted mt-1">
            Manage staff access, email notifications, shipping rates, the RMA exchange-rate override, and admin change history.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex justify-between items-center shadow-xs">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="font-bold ml-2 text-emerald-800 hover:text-emerald-950">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg flex justify-between items-center shadow-xs">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="font-bold ml-2 text-rose-800 hover:text-rose-950">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex flex-wrap gap-2 text-xs font-medium text-slate-700 pb-2">
        <Link
          href="/admin/localization"
          className="px-4 py-2.5 flex items-center gap-1.5 border-b-2 border-transparent text-[#8B2E24] hover:bg-slate-100 rounded-t-xl font-bold transition-all"
        >
          <Globe className="w-4 h-4 text-[#8B2E24]" /> Currency &amp; Language
        </Link>
        <button
          type="button"
          onClick={() => setActiveTab('FX')}
          className={`px-4 py-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'FX' ? 'border-[#8B2E24] text-[#8B2E24] font-bold bg-white rounded-t-xl shadow-xs' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-xl'
          }`}
        >
          <RefreshCw className="w-4 h-4 text-[#8B2E24]" /> Exchange Rates (RMA)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'USERS' ? 'border-[#8B2E24] text-[#8B2E24] font-bold bg-white rounded-t-xl shadow-xs' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-xl'
          }`}
        >
          <Users className="w-4 h-4 text-[#8B2E24]" /> Staff Accounts ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('RBAC')}
          className={`px-4 py-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'RBAC' ? 'border-[#8B2E24] text-[#8B2E24] font-bold bg-white rounded-t-xl shadow-xs' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-xl'
          }`}
        >
          <Key className="w-4 h-4 text-[#8B2E24]" /> Roles &amp; Permissions ({roles.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('GATEWAYS')}
          className={`px-4 py-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'GATEWAYS' ? 'border-[#8B2E24] text-[#8B2E24] font-bold bg-white rounded-t-xl shadow-xs' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-xl'
          }`}
        >
          <Mail className="w-4 h-4 text-[#8B2E24]" /> Email &amp; Notifications
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SHIPPING')}
          className={`px-4 py-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'SHIPPING' ? 'border-[#8B2E24] text-[#8B2E24] font-bold bg-white rounded-t-xl shadow-xs' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-xl'
          }`}
        >
          <Truck className="w-4 h-4 text-[#8B2E24]" /> Shipping Rates
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeTab === 'AUDIT' ? 'border-[#8B2E24] text-[#8B2E24] font-bold bg-white rounded-t-xl shadow-xs' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-xl'
          }`}
        >
          <History className="w-4 h-4 text-[#8B2E24]" /> Admin change history ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Exchange rates */}
      {activeTab === 'FX' && (
        <div className="space-y-6">
          {/* Store display preferences are managed on the primary Localization page. */}
          <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 flex-none">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Store display currency &amp; language
                  <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-mono font-bold">PRIMARY SETTINGS PAGE</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  This tab does not change the visitor’s default currency, default language, or header switcher options. Those are managed on the primary Currency &amp; Language page.
                </p>
              </div>
            </div>
            <Link
              href="/admin/localization"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#72241C] text-white text-xs font-bold transition-all shadow-xs flex-none self-start sm:self-auto"
            >
              Open primary Currency &amp; Language settings →
            </Link>
          </div>
          <p className="text-sm admin-muted">
            <strong className="admin-title">What changes in this tab:</strong> the effective USD–BTN rate can come from the RMA feed or an administrator override. Enter an override here with its justification, or clear it to restore the automatic feed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="admin-card p-5 rounded-lg border admin-border shadow-sm space-y-2">
              <span className="text-[11px] font-medium admin-muted uppercase">Effective Exchange Rate</span>
              <div className="text-2xl font-bold font-mono admin-title">
                1 USD = {fxData?.rate?.toFixed(2) || '84.00'} BTN
              </div>
              <p className="text-xs admin-muted">Applied automatically at point of purchase</p>
            </div>

            <div className="admin-card p-5 rounded-lg border admin-border shadow-sm space-y-2">
              <span className="text-[11px] font-medium admin-muted uppercase">Feed Health Status</span>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                    fxData?.isManualOverride
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : fxData?.status === 'FRESH'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {fxData?.isManualOverride ? 'MANUAL OVERRIDE' : fxData?.status || 'FRESH'}
                </span>
                <span className="text-xs admin-muted font-mono">
                  {fxData?.isManualOverride ? 'Admin Locked' : `${fxData?.stalenessHours ?? 0}h staleness`}
                </span>
              </div>
              <p className="text-xs admin-muted">Source: {fxData?.source || 'Automated Currency Sync'}</p>
            </div>

            <div className="admin-card p-5 rounded-lg border admin-border shadow-sm space-y-2">
              <span className="text-[11px] font-medium admin-muted uppercase">Checkout Gating Guard</span>
              <div className="flex items-center gap-2">
                {fxData?.blocked ? (
                  <span className="text-rose-700 font-semibold text-xs flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> BTN Checkout Suspended (&gt;72h stale)
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Active &amp; Unblocked
                  </span>
                )}
              </div>
              <p className="text-xs admin-muted">Enforced by edge middleware</p>
            </div>
          </div>

          <div className="admin-card p-6 rounded-lg border admin-border shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b admin-border pb-3">
              <div>
                <h3 className="font-bold admin-title text-sm">Set the exchange rate manually</h3>
                <p className="text-xs admin-muted">
                  Use this only when the automatic Royal Monetary Authority rate is unavailable or needs an approved correction.
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
                <label className="block font-medium admin-text mb-1">New Exchange Rate (BTN per 1 USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={overrideRateInput}
                  onChange={(e) => setOverrideRateInput(e.target.value)}
                  className="admin-input w-full border rounded px-3 py-2 font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium admin-text mb-1">Administrative Justification (Min 5 chars) *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Monetary Authority circular #409 peg adjustment"
                    value={overrideReasonInput}
                    onChange={(e) => setOverrideReasonInput(e.target.value)}
                    className="admin-input flex-1 border rounded px-3 py-2"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 admin-button-primary rounded font-semibold disabled:opacity-50 whitespace-nowrap"
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
        <div className="admin-card border admin-border rounded-lg shadow-sm overflow-hidden space-y-4">
          <div className="p-4 border-b admin-border flex justify-between items-center">
            <div>
              <h3 className="font-bold admin-title text-sm">Staff accounts</h3>
              <p className="text-xs admin-muted">Back-office staff authorized to manage members, products, and dispatches.</p>
            </div>
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="px-3 py-1.5 admin-button-primary text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Staff Account</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="admin-panel border-b admin-border admin-text font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Operator Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Assigned Role &amp; Version</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">2FA Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y admin-divider">
                {users.map((u) => (
                  <tr key={u.id} className="admin-hover transition-colors">
                    <td className="py-3 px-4 font-semibold admin-title">{u.name}</td>
                    <td className="py-3 px-4 font-mono admin-text">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-semibold">
                        {u.role?.name || 'Unassigned'} (v{u.role?.version || 1})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.twoFactorEnabled ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Enrolled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Not Enrolled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono admin-muted">
                      {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setEditingUser({ ...u, password: '' })}
                        className="px-2 py-1 admin-button-secondary border rounded text-[11px]"
                      >
                        Edit
                      </button>
                      {u.status === 'ACTIVE' && (
                        <button
                          onClick={() => setDeactivatingUser(u)}
                          className="px-2 py-1 text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded text-[11px]"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center admin-muted">
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
        <div className="admin-card border admin-border rounded-lg shadow-sm overflow-hidden space-y-4">
          <div className="p-4 border-b admin-border flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="font-bold admin-title text-sm">Staff roles &amp; change history</h3>
              <p className="text-xs admin-muted">
                Changing a role creates a new saved version. This keeps a record of which permissions changed and when.
              </p>
            </div>
            <button
              onClick={() => setShowCreateRoleModal(true)}
              className="px-3.5 py-1.5 admin-button-primary text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add or update a role</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="admin-panel border-b admin-border admin-text font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Role Identifier &amp; Slug</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Active Staff Users</th>
                  <th className="py-3 px-4">Permissions Coverage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y admin-divider">
                {roles.map((r) => {
                  const perms = Array.isArray(r.permissions) ? r.permissions : [];
                  const isWildcard = perms.includes('*');

                  return (
                    <tr key={r.id} className="admin-hover transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold admin-title">{r.name}</div>
                        <div className="text-[11px] admin-muted font-mono">{r.slug}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold admin-title">v{r.version}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono admin-text">{r.userCount} assigned</td>
                      <td className="py-3 px-4 admin-text">
                        {isWildcard ? (
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 font-bold">
                            Full Wildcard (*)
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] admin-muted">
                            {perms.length} granular permissions
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {r.status === 'ACTIVE' && (
                          <button
                            onClick={() => setRetiringRole(r)}
                            className="px-2 py-1 text-rose-700 hover:text-rose-800 border border-rose-200 hover:bg-rose-50 rounded text-[11px]"
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
                    <td colSpan={6} className="py-8 text-center admin-muted">
                      No roles loaded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Gateways & Email Notifications */}
      {activeTab === 'GATEWAYS' && (
        <div className="space-y-6">
          {/* Org Info Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div>
              <div className="font-bold text-slate-900 text-sm">Website contact details</div>
              <p className="text-slate-600 mt-0.5">
                  Edit the public organization name, address, phone numbers, and email on the Website Details page.
              </p>
            </div>
            <a
              href="/admin/site-settings"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8B2E24] hover:bg-[#72241C] text-white rounded-lg font-semibold shrink-0 transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Edit website details
            </a>
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Related settings">
            <Link href="/admin/payments" className="admin-button-secondary px-3 py-2 rounded-lg text-xs">Manage payment methods</Link>
            <a href="#email-templates" className="admin-button-secondary px-3 py-2 rounded-lg text-xs">Edit email messages</a>
            <a href="#mail-server" className="admin-button-secondary px-3 py-2 rounded-lg text-xs">Configure mail server</a>
          </div>

          <form onSubmit={handleSaveEmailSettings} className="space-y-6">
            <div className="admin-card border admin-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold admin-title text-sm">Payment methods are managed separately</h3>
                <p className="text-xs admin-muted mt-1">Update manual bank, mBoB, BNB and cash-on-delivery instructions from the Payments page. Card payments stay unavailable until a provider is connected and verified.</p>
              </div>
              <Link href="/admin/payments" className="admin-button-primary shrink-0 px-3 py-2 rounded-lg text-xs font-semibold">Open payment methods</Link>
            </div>
            {/* Email Notification Templates */}
            <div id="email-templates" className="admin-card border admin-border rounded-xl p-6 shadow-sm space-y-5 scroll-mt-4">
              <div className="border-b admin-border pb-3">
                <h3 className="font-bold admin-title text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#8B2E24]" />
                  Customer &amp; staff email messages
                </h3>
                <p className="text-xs admin-muted mt-0.5">
                  Manage automated transaction and onboarding notifications dispatched to customers and artisan applicants.
                </p>
              </div>

              {/* Template Selectors */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'order_confirmation', label: 'Order Confirmation' },
                  { key: 'order_shipped', label: 'Order Shipped / EMS' },
                  { key: 'application_approved', label: 'Membership Approved' },
                  { key: 'application_rejected', label: 'Membership Rejection' },
                ].map((tpl) => (
                  <button
                    key={tpl.key}
                    type="button"
                    onClick={() => setActiveEmailTab(tpl.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeEmailTab === tpl.key
                        ? 'admin-button-primary'
                        : 'admin-button-secondary'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>

              {/* Template Editor */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold admin-text mb-1">Email Subject Line</label>
                    <input
                      type="text"
                      value={emailTemplates[activeEmailTab]?.subject || ''}
                      onChange={(e) =>
                        setEmailTemplates({
                          ...emailTemplates,
                          [activeEmailTab]: {
                            ...emailTemplates[activeEmailTab],
                            subject: e.target.value,
                          },
                        })
                      }
                      className="admin-input w-full border rounded-lg px-3 py-2 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-semibold admin-text">Email Body (Markdown supported)</label>
                      <span className="text-[10px] admin-muted">Placeholders: &#123;&#123;variable&#125;&#125;</span>
                    </div>
                    <textarea
                      rows={9}
                      value={emailTemplates[activeEmailTab]?.body || ''}
                      onChange={(e) =>
                        setEmailTemplates({
                          ...emailTemplates,
                          [activeEmailTab]: {
                            ...emailTemplates[activeEmailTab],
                            body: e.target.value,
                          },
                        })
                      }
                      className="admin-input w-full border rounded-lg p-3 font-mono text-xs leading-relaxed"
                    />
                  </div>

                  {/* Available Variables Chips */}
                  <div>
                    <span className="text-[11px] font-semibold admin-text block mb-1.5">Supported Variable Tags:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        '{{customerName}}',
                        '{{orderNumber}}',
                        '{{trackingNumber}}',
                        '{{totalAmount}}',
                        '{{shippingMethod}}',
                        '{{applicantName}}',
                        '{{regNumber}}',
                        '{{rejectionReason}}',
                        '{{activationUrl}}',
                      ].map((tag) => (
                        <span key={tag} className="font-mono text-[10px] admin-panel admin-text px-2 py-0.5 rounded border admin-border">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="admin-panel border admin-border rounded-xl p-4 text-xs space-y-3">
                  <div className="font-bold admin-title text-xs border-b admin-border pb-2 flex items-center justify-between">
                    <span>Live Message Preview</span>
                    <span className="font-mono text-[10px] admin-muted font-normal">Recipient View</span>
                  </div>
                  <div className="p-3 admin-card border admin-border rounded-lg shadow-2xs space-y-2">
                    <div className="admin-muted text-[11px]">
                      <strong className="admin-text">Subject:</strong>{' '}
                      {emailTemplates[activeEmailTab]?.subject
                        ?.replace('{{orderNumber}}', 'HAB-S-88214')
                        ?.replace('{{customerName}}', 'Karma Wangchuk')
                        ?.replace('{{applicantName}}', 'Tshering Dema')
                        ?.replace('{{rejectionReason}}', 'Incomplete citizenship verification document')}
                    </div>
                    <div className="border-t admin-border pt-2 admin-text text-xs whitespace-pre-line leading-relaxed">
                      {emailTemplates[activeEmailTab]?.body
                        ?.replace(/\{\{customerName\}\}/g, 'Karma Wangchuk')
                        ?.replace(/\{\{orderNumber\}\}/g, 'HAB-S-88214')
                        ?.replace(/\{\{totalAmount\}\}/g, '$185.00 USD')
                        ?.replace(/\{\{paymentMethod\}\}/g, 'International Card')
                        ?.replace(/\{\{shippingMethod\}\}/g, 'EMS Bhutan Post')
                        ?.replace(/\{\{trackingNumber\}\}/g, 'BP-BT-982410-TH')
                        ?.replace(/\{\{applicantName\}\}/g, 'Tshering Dema')
                        ?.replace(/\{\{regNumber\}\}/g, 'HAB-2026-THA-042')
                        ?.replace(/\{\{rejectionReason\}\}/g, 'Incomplete citizenship verification document')
                        ?.replace(/\{\{activationUrl\}\}/g, 'https://hab.org.bt/auth/reset-password?token=act_9824fae10')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Outbound SMTP Server & Live Test Engine */}
            <div id="mail-server" className="admin-card border admin-border rounded-xl p-6 shadow-sm space-y-5 scroll-mt-4">
              <div className="flex justify-between items-center border-b admin-border pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold admin-title text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    Outgoing email server
                  </h3>
                  <p className="text-xs admin-muted mt-0.5">
                    Configure the mail server for customer confirmations and staff notifications. Emails are not sent until a working server is configured. Send a test and check the recipient inbox before relying on delivery.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Nodemailer Engine Ready
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold admin-text mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={smtpSettings.host}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
                    placeholder="smtp.gmail.com or mail.hab.org.bt"
                    className="admin-input w-full border rounded-lg px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold admin-text mb-1">SMTP Port</label>
                  <input
                    type="number"
                    value={smtpSettings.port}
                    onChange={(e) => {
                      const port = parseInt(e.target.value, 10) || 587;
                      setSmtpSettings({ ...smtpSettings, port, secure: smtpConnectionOptions({ port, secure: smtpSettings.secure }).secure });
                    }}
                    placeholder="587 or 465"
                    className="admin-input w-full border rounded-lg px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div className="flex items-end pb-1.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={smtpSettings.secure}
                      disabled={smtpSettings.port === 465 || smtpSettings.port === 587}
                      onChange={(e) => setSmtpSettings({ ...smtpSettings, secure: e.target.checked })}
                      className="rounded border-slate-300 text-[#8B2E24] focus:ring-[#8B2E24]"
                    />
                    <span className="text-xs font-semibold admin-text">{smtpSettings.port === 587 ? 'STARTTLS encryption (Port 587)' : 'Use SSL / TLS (Port 465)'}</span>
                  </label>
                </div>

                <div>
                  <label className="block font-semibold admin-text mb-1">SMTP Username / Auth User</label>
                  <input
                    type="text"
                    value={smtpSettings.username}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, username: e.target.value })}
                    placeholder="notifications@hab.org.bt"
                    className="admin-input w-full border rounded-lg px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold admin-text mb-1">SMTP Password / App Password</label>
                  <input
                    type="password"
                    value={smtpSettings.password}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, password: e.target.value })}
                    placeholder="App password or secret token"
                    className="admin-input w-full border rounded-lg px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold admin-text mb-1">Sender Email Address</label>
                  <input
                    type="email"
                    value={smtpSettings.fromEmail}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, fromEmail: e.target.value })}
                    placeholder="no-reply@hab.org.bt"
                    className="admin-input w-full border rounded-lg px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold admin-text mb-1">Sender Display Name</label>
                  <input
                    type="text"
                    value={smtpSettings.fromName}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, fromName: e.target.value })}
                    placeholder="Handicrafts Association of Bhutan"
                    className="admin-input w-full border rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Send Test Email Tool */}
              <div className="pt-3 border-t admin-border mt-3 bg-slate-50/60 dark:bg-slate-900/30 p-4 rounded-lg">
                <h4 className="font-bold admin-title text-xs mb-1 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    Send a test email
                </h4>
                <p className="text-[11px] admin-muted mb-3">
                  Send a live diagnostic test message to verify outbound credentials, TLS handshakes, and mailbox deliverability.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    placeholder="Enter recipient email (e.g. test@hab.org.bt)..."
                    className="admin-input flex-1 border rounded-lg px-3 py-2 text-xs font-mono w-full"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={testingEmail || !testEmailRecipient}
                    className="admin-button-secondary px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {testingEmail ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></span>
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        Send Test Email
                      </>
                    )}
                  </button>
                </div>

                {testEmailFeedback && (
                  <div
                    className={`mt-3 p-3 rounded-lg text-xs flex items-center gap-2 font-mono ${
                      testEmailFeedback.success
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-50 text-rose-900 border border-rose-200'
                    }`}
                  >
                    {testEmailFeedback.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{testEmailFeedback.message}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 admin-button-primary px-6 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Saving email settings...' : 'Save email settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'SHIPPING' && <ShippingRatesPanel />}

      {/* Tab: Cryptographic Audit Trail */}
      {activeTab === 'AUDIT' && (
        <div className="admin-card border admin-border rounded-lg shadow-sm overflow-hidden space-y-4">
          <div className="p-4 border-b admin-border flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 className="font-bold admin-title text-sm">Admin change history</h3>
              <p className="text-xs admin-muted">A record of important changes made by staff and changes to orders.</p>
            </div>
            <div className="flex items-center gap-1.5">
              {(['ALL', 'STAFF', 'MEMBER', 'GUEST', 'SYSTEM'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActorFilter(filter)}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                    actorFilter === filter
                      ? 'admin-button-primary'
                      : 'admin-button-secondary'
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
                <tr className="admin-panel border-b admin-border admin-text font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity &amp; ID</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y admin-divider">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="admin-hover transition-colors">
                    <td className="py-3 px-4 font-mono admin-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold admin-title">{log.actorIdentifier || log.actorType}</span>
                      <span className="ml-1.5 font-mono text-[10px] px-1 py-0.2 rounded admin-panel admin-text">
                        {log.actorType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#8B2E24]">{log.action}</td>
                    <td className="py-3 px-4 font-mono admin-text">
                      {log.entityType} <span className="admin-muted">({log.entityId?.slice(0, 10)})</span>
                    </td>
                    <td className="py-3 px-4 font-mono admin-muted">{log.actorIp || '127.0.0.1'}</td>
                    <td className="py-3 px-4 font-mono text-[10px] admin-muted max-w-xs truncate" title={JSON.stringify(log.details)}>
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center admin-muted">
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="admin-modal rounded-xl max-w-md w-full p-6 shadow-2xl border admin-border space-y-4 my-8">
            <div className="flex justify-between items-center border-b admin-border pb-3">
              <h3 className="font-bold admin-title text-base">Add a staff account</h3>
              <button onClick={() => setShowCreateUserModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-base">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium admin-text mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tshering Dema"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="admin-input w-full border rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-medium admin-text mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tshering@handicraftsbhutan.org"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="admin-input w-full border rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-medium admin-text mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="admin-input w-full border rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium admin-text mb-1">Assigned Role *</label>
                <select
                  required
                  value={userForm.roleId}
                  onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}
                  className="admin-input w-full border rounded px-2.5 py-1.5"
                >
                  <option value="">Select Role...</option>
                  {roles.filter((r) => r.status === 'ACTIVE').map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (v{r.version})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-3 py-1.5 admin-button-secondary border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 admin-button-primary rounded font-semibold disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="admin-modal rounded-xl max-w-md w-full p-6 shadow-2xl border admin-border space-y-4 my-8">
            <div className="flex justify-between items-center border-b admin-border pb-3">
              <h3 className="font-bold admin-title text-base">Edit Staff User: {editingUser.name}</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-700 font-bold text-base">✕</button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium admin-text mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="admin-input w-full border rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-medium admin-text mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="admin-input w-full border rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-medium admin-text mb-1">Assigned Role</label>
                <select
                  value={editingUser.roleId}
                  onChange={(e) => setEditingUser({ ...editingUser, roleId: e.target.value })}
                  className="admin-input w-full border rounded px-2.5 py-1.5"
                >
                  {roles.filter((r) => r.status === 'ACTIVE').map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (v{r.version})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium admin-text mb-1">Account Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                  className="admin-input w-full border rounded px-2.5 py-1.5"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div>
                <label className="block font-medium admin-text mb-1">Reset Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep unchanged"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="admin-input w-full border rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 admin-button-secondary border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 admin-button-primary rounded font-semibold disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="admin-modal rounded-xl max-w-md w-full p-6 shadow-2xl border admin-border space-y-4">
            <h3 className="font-bold admin-title text-base">Deactivate Staff Account?</h3>
            <p className="text-xs admin-text">
              Are you sure you want to deactivate <strong className="admin-title">{deactivatingUser.name}</strong> ({deactivatingUser.email})?
            </p>
            <p className="text-[11px] admin-muted admin-panel p-2.5 rounded border admin-border">
              The user status will be set to SUSPENDED. All cryptographic audit log entries will remain preserved.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeactivatingUser(null)}
                className="px-3 py-1.5 admin-button-secondary border rounded text-xs"
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="admin-modal rounded-xl max-w-3xl w-full p-6 shadow-2xl border admin-border space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b admin-border pb-3">
              <div>
                <h3 className="font-bold admin-title text-base">Add or update a staff role</h3>
                <p className="text-xs admin-muted">Choose which areas this role can view, add, edit or remove.</p>
              </div>
              <button onClick={() => setShowCreateRoleModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-base">✕</button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium admin-text mb-1">Role Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Catalog Manager or Senior Reviewer"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    className="admin-input w-full border rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-medium admin-text mb-1">Slug Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. catalog_manager (auto-derived if blank)"
                    value={roleForm.slug}
                    onChange={(e) => setRoleForm({ ...roleForm, slug: e.target.value })}
                    className="admin-input w-full border rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium admin-text mb-1">Revision Scope Description</label>
                <input
                  type="text"
                  placeholder="e.g. Updated product publish and discount capabilities for 2026"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="admin-input w-full border rounded px-2.5 py-1.5"
                />
              </div>

              {/* Interactive Categorized Permissions Checkbox Matrix */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold admin-title text-sm">Granular Permission Matrix</h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => togglePermission('*')}
                      className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold border transition ${
                        roleForm.selectedPermissions.has('*')
                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                          : 'admin-button-secondary'
                      }`}
                    >
                      {roleForm.selectedPermissions.has('*') ? '✓ Full Superadmin (*)' : 'Enable Wildcard (*)'}
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto border admin-border rounded-lg p-3 admin-panel">
                  {PERMISSION_CATEGORIES.map((cat) => {
                    const catSlugs = cat.permissions.map((p) => p.slug);
                    const allSelected = catSlugs.every((s) => roleForm.selectedPermissions.has(s));

                    return (
                      <div key={cat.name} className="admin-card p-3 rounded border admin-border space-y-2">
                        <div className="flex justify-between items-center border-b admin-border pb-1.5">
                          <span className="font-bold admin-title text-xs">{cat.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleCategoryAll(catSlugs, !allSelected)}
                            className="text-[10px] font-semibold text-[#8B2E24] hover:underline cursor-pointer"
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
                                className="flex items-start gap-2 p-1.5 rounded admin-hover cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => togglePermission(p.slug)}
                                  className="mt-0.5 rounded border-slate-300 text-[#8B2E24] focus:ring-[#8B2E24]"
                                />
                                <div>
                                  <div className="font-semibold admin-title text-[11px]">{p.label}</div>
                                  <div className="admin-muted font-mono text-[9px]">{p.slug}</div>
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

              <div className="flex justify-end gap-2 pt-3 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setShowCreateRoleModal(false)}
                  className="px-3 py-1.5 admin-button-secondary border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 admin-button-primary rounded font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save role version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Retire Role & Reassign Users */}
      {retiringRole && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="admin-modal rounded-xl max-w-md w-full p-6 shadow-2xl border admin-border space-y-4">
            <h3 className="font-bold admin-title text-base">Retire Role &amp; Reassign Users</h3>
            <p className="text-xs admin-text leading-relaxed">
              Retiring <strong className="admin-title">{retiringRole.name} (v{retiringRole.version})</strong> requires migrating all currently assigned users to an active replacement role revision.
            </p>

            <div>
              <label className="block font-medium admin-text text-xs mb-1">
                Target Role for {retiringRole.userCount} Active User(s) *
              </label>
              <select
                required
                value={targetMigrationRoleId}
                onChange={(e) => setTargetMigrationRoleId(e.target.value)}
                className="admin-input w-full border rounded px-2.5 py-1.5 text-xs"
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
                className="px-3 py-1.5 admin-button-secondary border rounded text-xs"
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

export default function AdminSettingsPage() {
  return <AdminSettingsContent />;
}

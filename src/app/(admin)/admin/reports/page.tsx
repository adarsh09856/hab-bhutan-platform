'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, DollarSign, RefreshCw, Landmark, Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalOrdersCount: 0,
    grossVolumeUSD: 0,
    artisanShareUSD: 0,
    duesCollectedBTN: 0,
    activeMembersCount: 0,
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [craftSales, setCraftSales] = useState<Record<string, { units: number; grossUSD: number }>>({});

  // Modals
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [deletingProject, setDeletingProject] = useState<any | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Form states
  const [projectForm, setProjectForm] = useState({
    name: '',
    partner: 'EU SWITCH-Asia',
    budget: '$150,000.00',
    period: '2025–2027',
    progressPercent: 25,
    summary: '',
    status: 'current',
  });

  const loadReports = async () => {
    setLoading(true);
    setActionError('');
    try {
      const res = await fetch('/api/admin/reports', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) {
          setMetrics(data.metrics);
        }
        setProjects(data.donorProjects || []);
        setCraftSales(data.craftSales || {});
      } else {
        const err = await res.json();
        setActionError(err.error || 'Failed to load report data from PostgreSQL.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`✓ Donor project "${data.project.name}" registered.`);
        setShowAddProjectModal(false);
        setProjectForm({
          name: '',
          partner: 'EU SWITCH-Asia',
          budget: '$150,000.00',
          period: '2025–2027',
          progressPercent: 25,
          summary: '',
          status: 'current',
        });
        await loadReports();
      } else {
        setActionError(data.error || 'Failed to create project.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProject),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`✓ Donor project "${data.project.name}" updated.`);
        setEditingProject(null);
        await loadReports();
      } else {
        setActionError(data.error || 'Failed to update project.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;

    setSubmitting(true);
    setActionError('');

    try {
      const res = await fetch(`/api/admin/reports?id=${deletingProject.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(data.message || '✓ Project deleted.');
        setDeletingProject(null);
        await loadReports();
      } else {
        setActionError(data.error || 'Failed to delete project.');
        setDeletingProject(null);
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
      setDeletingProject(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCSV = () => {
    window.location.href = '/api/admin/reports?format=csv';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Financial Reports, Dues &amp; Donor Audits
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time reconciliation of member dues, global e-commerce consignments, and multilateral donor grant drawdowns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadReports}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-slate-700 border border-slate-300 rounded shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded shadow-sm hover:bg-slate-800"
          >
            <Download className="w-3.5 h-3.5" /> Export Financial Statement (CSV)
          </button>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Gross E-Commerce Volume</p>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                ${metrics.grossVolumeUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Live from {metrics.totalOrdersCount} orders
              </p>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Artisan Dues Collected</p>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                BTN {metrics.duesCollectedBTN.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{metrics.activeMembersCount} verified enterprises</p>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Artisan Payouts Disbursed</p>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                ${metrics.artisanShareUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                  Provisional — Pending Secretariat Sign-off
                </span>
                <p className="text-[11px] text-slate-500">80/20 consignment split (subject to formal ratification)</p>
              </div>
            </div>
            <div className="p-2 bg-amber-50 text-amber-600 rounded">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Bilateral Grants</p>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">{projects.length} Projects</p>
              <p className="text-[11px] text-slate-500 mt-1">Multilateral &amp; civil society funded</p>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Donor Projects Module */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Donor Grants &amp; Bilateral Development Projects</h3>
            <p className="text-xs text-slate-500">Track drawdown budgets, execution phases, and milestone delivery.</p>
          </div>
          <button
            onClick={() => setShowAddProjectModal(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Donor Project</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">Bilateral Partner</th>
                <th className="py-3 px-4">Budget</th>
                <th className="py-3 px-4">Execution Period</th>
                <th className="py-3 px-4">Milestone Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                  <td className="py-3 px-4 text-slate-700">{p.partner}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.budget}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{p.period}</td>
                  <td className="py-3 px-4 w-48">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${p.progressPercent || 0}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-slate-600 font-medium">
                        {p.progressPercent || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'current'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p.status === 'current' ? 'ACTIVE' : 'COMPLETED'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => setEditingProject({ ...p })}
                      className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded text-[11px] inline-flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => setDeletingProject(p)}
                      className="px-2 py-1 text-rose-600 hover:text-rose-800 border border-rose-200 rounded text-[11px] inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No donor projects registered. Click &ldquo;Add Donor Project&rdquo; to initialize.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Register Bilateral Donor Project</h3>
              <button onClick={() => setShowAddProjectModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EU SWITCH-Asia Craft Value Chain Sustainability"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Donor / Bilateral Partner *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UNDP, EU SWITCH-Asia, Ernst & Young"
                    value={projectForm.partner}
                    onChange={(e) => setProjectForm({ ...projectForm, partner: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Approved Budget *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $180,000.00"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Period</label>
                  <input
                    type="text"
                    placeholder="2025–2027"
                    value={projectForm.period}
                    onChange={(e) => setProjectForm({ ...projectForm, period: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Progress %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={projectForm.progressPercent}
                    onChange={(e) => setProjectForm({ ...projectForm, progressPercent: parseInt(e.target.value, 10) || 0 })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Lifecycle Status</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="current">Current / Active</option>
                    <option value="past">Past / Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Project Summary &amp; Scope</label>
                <textarea
                  rows={3}
                  value={projectForm.summary}
                  onChange={(e) => setProjectForm({ ...projectForm, summary: e.target.value })}
                  placeholder="Supporting natural vegetable dyeing and raw material supply chain resilience..."
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit Project: {editingProject.name}</h3>
              <button onClick={() => setEditingProject(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleEditProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Partner</label>
                  <input
                    type="text"
                    required
                    value={editingProject.partner}
                    onChange={(e) => setEditingProject({ ...editingProject, partner: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Budget</label>
                  <input
                    type="text"
                    required
                    value={editingProject.budget}
                    onChange={(e) => setEditingProject({ ...editingProject, budget: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Period</label>
                  <input
                    type="text"
                    value={editingProject.period}
                    onChange={(e) => setEditingProject({ ...editingProject, period: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Progress %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingProject.progressPercent || 0}
                    onChange={(e) => setEditingProject({ ...editingProject, progressPercent: parseInt(e.target.value, 10) || 0 })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="current">Current / Active</option>
                    <option value="past">Past / Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Summary</label>
                <textarea
                  rows={3}
                  value={editingProject.summary}
                  onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
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

      {/* Delete Project Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Delete Donor Project?</h3>
            <p className="text-xs text-slate-600">
              Permanently remove project <strong className="text-slate-900">{deletingProject.name}</strong> from bilateral records?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingProject(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={submitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

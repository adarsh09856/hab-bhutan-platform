'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Briefcase, Calendar, Building, DollarSign } from 'lucide-react';

interface ProjectRecord {
  id: string;
  status: string;
  name: string;
  partner: string;
  period: string;
  budget: string;
  progressPercent: number;
  summary: string;
  activities: string[];
  results: string[];
  createdAt: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'current' | 'completed'>('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [form, setForm] = useState({
    status: 'current',
    name: '',
    partner: '',
    period: '2026 – 2028',
    budget: 'Undisclosed',
    progressPercent: 50,
    summary: '',
    activities: [] as string[],
    results: [] as string[],
  });

  const [activityInput, setActivityInput] = useState('');
  const [resultInput, setResultInput] = useState('');

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/projects', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', message: err.error || 'Failed to load projects.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error fetching projects.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openAddModal = () => {
    setEditingProject(null);
    setForm({
      status: 'current',
      name: '',
      partner: '',
      period: '2026 – 2028',
      budget: 'Undisclosed',
      progressPercent: 50,
      summary: '',
      activities: [],
      results: [],
    });
    setActivityInput('');
    setResultInput('');
    setShowModal(true);
  };

  const openEditModal = (p: ProjectRecord) => {
    setEditingProject(p);
    setForm({
      status: p.status,
      name: p.name,
      partner: p.partner,
      period: p.period,
      budget: p.budget,
      progressPercent: p.progressPercent,
      summary: p.summary,
      activities: Array.isArray(p.activities) ? p.activities : [],
      results: Array.isArray(p.results) ? p.results : [],
    });
    setActivityInput('');
    setResultInput('');
    setShowModal(true);
  };

  const addActivity = () => {
    if (!activityInput.trim()) return;
    setForm({ ...form, activities: [...form.activities, activityInput.trim()] });
    setActivityInput('');
  };

  const removeActivity = (idx: number) => {
    setForm({ ...form, activities: form.activities.filter((_, i) => i !== idx) });
  };

  const addResult = () => {
    if (!resultInput.trim()) return;
    setForm({ ...form, results: [...form.results, resultInput.trim()] });
    setResultInput('');
  };

  const removeResult = (idx: number) => {
    setForm({ ...form, results: form.results.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const url = '/api/admin/projects';
      const method = editingProject ? 'PUT' : 'POST';
      const body = editingProject ? { id: editingProject.id, ...form } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: editingProject ? 'Project updated successfully.' : 'New project added successfully.',
        });
        setShowModal(false);
        loadProjects();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to save project.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error occurred while saving.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete project: "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/projects?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'Project deleted successfully.' });
        loadProjects();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to delete project.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error deleting project.' });
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b admin-border pb-5">
        <div>
          <h1 className="text-2xl font-bold admin-title tracking-tight">Donor &amp; Institutional Projects</h1>
          <p className="text-sm admin-muted mt-1">
            Manage donor-funded initiatives, capacity-building grants, progress metrics, and key deliverables published on the public Projects portal.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 admin-button-primary px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {/* Alerts */}
      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-none" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-300 flex-none" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b admin-border gap-2">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            filter === 'ALL' ? 'border-amber-400 text-amber-300' : 'border-transparent admin-muted admin-hover'
          }`}
        >
          All Initiatives ({projects.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('current')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            filter === 'current' ? 'border-amber-400 text-amber-300' : 'border-transparent admin-muted admin-hover'
          }`}
        >
          Active / In-Flight ({projects.filter((p) => p.status === 'current').length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('completed')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            filter === 'completed' ? 'border-amber-400 text-amber-300' : 'border-transparent admin-muted admin-hover'
          }`}
        >
          Completed / Impact Archive ({projects.filter((p) => p.status === 'completed').length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-sm admin-muted admin-card rounded-xl border admin-border">
          Loading project portfolio...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center admin-card rounded-xl border border-dashed admin-border">
          <Briefcase className="w-12 h-12 admin-muted mx-auto mb-3" />
          <p className="admin-text font-semibold">No projects found</p>
          <p className="text-xs admin-muted mt-1">Get started by creating your first donor-funded or institutional project.</p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-2 admin-button-primary px-4 py-2 rounded-lg text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((p) => (
            <div key={p.id} className="admin-card border admin-border rounded-xl p-6 shadow-sm flex flex-col justify-between admin-hover transition-colors">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      p.status === 'current'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-700/30 text-slate-300 border border-slate-600/40'
                    }`}
                  >
                    {p.status === 'current' ? 'Active Programme' : 'Completed Archive'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(p)}
                      className="p-1.5 admin-muted admin-hover rounded-lg cursor-pointer"
                      title="Edit Project"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 admin-muted hover:text-rose-300 rounded-lg hover:bg-rose-500/15 cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold admin-title mb-2">{p.name}</h3>

                <div className="grid grid-cols-2 gap-2 text-xs admin-text mb-4 admin-panel p-3 rounded-lg border admin-border">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 admin-muted flex-none" />
                    <span className="font-semibold truncate">{p.partner}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 admin-muted flex-none" />
                    <span>{p.period}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <DollarSign className="w-3.5 h-3.5 admin-muted flex-none" />
                    <span>Budget: <strong className="admin-title">{p.budget}</strong></span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="admin-text">Implementation Progress</span>
                    <span className="text-amber-300">{p.progressPercent}%</span>
                  </div>
                  <div className="w-full admin-panel rounded-full h-2">
                    <div
                      className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, p.progressPercent))}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs admin-text line-clamp-3 mb-4">{p.summary}</p>

                {p.activities && p.activities.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[11px] font-bold admin-text uppercase tracking-wider block mb-1">
                      Key Activities ({p.activities.length})
                    </span>
                    <ul className="text-xs admin-text list-disc list-inside space-y-0.5">
                      {p.activities.slice(0, 3).map((act, i) => (
                        <li key={i} className="truncate">{act}</li>
                      ))}
                      {p.activities.length > 3 && (
                        <li className="admin-muted font-medium">+{p.activities.length - 3} more activities</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t admin-border flex items-center justify-between text-[11px] admin-muted">
                <span>Created {new Date(p.createdAt).toLocaleDateString()}</span>
                <span className="font-mono">{p.id.slice(0, 8)}...</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="admin-modal rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b admin-border pb-4">
              <h2 className="text-lg font-bold admin-title">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="admin-muted admin-hover font-bold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1">
                    Project Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2 border admin-input rounded-lg text-sm"
                  >
                    <option value="current">Active / Current</option>
                    <option value="completed">Completed / Archive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1">
                    Progress Percentage ({form.progressPercent}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={form.progressPercent}
                    onChange={(e) => setForm({ ...form, progressPercent: Number(e.target.value) })}
                    className="w-full mt-2 accent-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. EU SWITCH-Asia Craft Sustainable Value Chain"
                  className="w-full px-3.5 py-2 border admin-input rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1">
                    Funding Partner *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.partner}
                    onChange={(e) => setForm({ ...form, partner: e.target.value })}
                    placeholder="e.g. European Union / Helvetas"
                    className="w-full px-3.5 py-2 border admin-input rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1">
                    Period
                  </label>
                  <input
                    type="text"
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                    placeholder="e.g. 2024 – 2027"
                    className="w-full px-3.5 py-2 border admin-input rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1">
                    Budget / Grant
                  </label>
                  <input
                    type="text"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    placeholder="e.g. EUR 850,000"
                    className="w-full px-3.5 py-2 border admin-input rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1">
                  Summary &amp; Objectives *
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Comprehensive description of the project, rural beneficiaries, and target outcomes..."
                  className="w-full px-3.5 py-2 border admin-input rounded-lg text-sm"
                />
              </div>

              {/* Activities input */}
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1">
                  Key Activities &amp; Workstreams
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={activityInput}
                    onChange={(e) => setActivityInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addActivity(); } }}
                    placeholder="Add an activity (e.g. Natural dye training for 150 weavers)"
                    className="flex-1 px-3.5 py-2 border admin-input rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={addActivity}
                    className="px-3.5 py-2 admin-button-secondary rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.activities.map((act, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 admin-panel border admin-border rounded-full text-xs admin-text">
                      <span>{act}</span>
                      <button
                        type="button"
                        onClick={() => removeActivity(i)}
                        className="admin-muted hover:text-rose-300 font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Results input */}
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1">
                  Key Outcomes &amp; Impact Results
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={resultInput}
                    onChange={(e) => setResultInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addResult(); } }}
                    placeholder="Add an outcome (e.g. 35% household income uplift in eastern dzongkhags)"
                    className="flex-1 px-3.5 py-2 border admin-input rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={addResult}
                    className="px-3.5 py-2 admin-button-secondary rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.results.map((res, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-xs text-emerald-300">
                      <span>{res}</span>
                      <button
                        type="button"
                        onClick={() => removeResult(i)}
                        className="text-emerald-300 hover:text-rose-300 font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border admin-button-secondary rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 admin-button-primary rounded-lg text-sm font-semibold disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {submitting ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

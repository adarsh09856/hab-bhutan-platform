'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Info, 
  Users, 
  Award, 
  Calendar, 
  Save, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Target,
} from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import FileUploadInput from '@/components/admin/FileUploadInput';

interface GovRecord {
  id: string;
  category: string;
  roleTitle: string;
  individualName: string;
  chapterOrNote: string;
  sortOrder: number;
}

export default function AboutPageStudio() {
  const [activeTab, setActiveTab] = useState<'mandate' | 'objectives' | 'values' | 'facts' | 'board' | 'team' | 'milestones'>('mandate');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Settings state
  const [settings, setSettings] = useState({
    aboutMandateText: 'The Handicrafts Association of Bhutan (HAB) was established in 2005 under Royal Patronage and registered as a Civil Society Organisation (CSO/2011/043) and Public Benefit Organisation (PBO) under the Civil Society Organizations Act of Bhutan.',
    aboutMandatePara2: 'HAB supports local artisans by providing resources, training and policy interventions to improve their skills and increase their chances of success in local communities and the tourism industry.',
    visionTitle: 'Towards a vibrant & sustainable handicrafts sector',
    visionBody: 'A Bhutan where the thirteen crafts remain in daily practice, and where making them is a livelihood a young person would choose.',
    missionTitle: 'Promoting sustainability, inclusiveness and resilience',
    missionBody: 'HAB supports local artisans by providing resources, training and policy interventions to improve their skills and increase their chances of success in local communities and the tourism industry.',
    csoRegistration: '2011 · CSO/2011/043',
    aboutBandImageUrl: '/assets/photos/about-hab.jpg',
    aboutObjective1: 'Improve market access for Bhutanese artisans at home, in tourism and internationally.',
    aboutObjective2: 'Raise product quality and consistency through training, standards and inspection.',
    aboutObjective3: 'Guarantee fair compensation and prompt payment for handcrafted work.',
    aboutObjective4: 'Keep the thirteen crafts of Zorig Chusum in living practice, especially endangered ones.',
    aboutObjective5: 'Advocate for artisan rights, raw material access and sector-friendly policy interventions.',
    aboutObjective6: 'Build sustainable livelihoods for women, youth, and rural artisan communities.',
    aboutCraft1Name: 'Care',
    aboutCraft1Desc: 'Care for the maker, the material and the object.',
    aboutCraft2Name: 'Respect',
    aboutCraft2Desc: 'Respect for a tradition older than the association, and for the person who carries it.',
    aboutCraft3Name: 'Attentive',
    aboutCraft3Desc: 'Attentive to quality, to the market and to what members actually ask for.',
    aboutCraft4Name: 'Fair',
    aboutCraft4Desc: 'Fair dealing, in writing. Prices are agreed with the maker and paid upfront.',
    aboutCraft5Name: 'Transparent',
    aboutCraft5Desc: 'Transparent about money and results. Audited accounts published yearly.',
    fact1Key: 'Established',
    fact1Val: '2005',
    fact2Key: 'Registered CSO',
    fact2Val: '2011 · CSO/2011/043',
    fact3Key: 'Member enterprises',
    fact3Val: '7,500',
    fact4Key: 'Affiliated stores',
    fact4Val: '195',
  });

  // Governance records state
  const [records, setRecords] = useState<GovRecord[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordForm, setRecordForm] = useState({
    category: 'BOARD_OF_TRUSTEES',
    roleTitle: '',
    individualName: '',
    chapterOrNote: '',
    sortOrder: 0,
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Site Settings
      const resSettings = await fetch('/api/admin/site-settings', { cache: 'no-store' });
      if (resSettings.ok) {
        const d = await resSettings.json();
        if (d.setting) {
          const s = d.setting;
          setSettings((prev) => ({
            ...prev,
            ...s,
            aboutObjective1: s.aboutObjectives?.[0] || prev.aboutObjective1,
            aboutObjective2: s.aboutObjectives?.[1] || prev.aboutObjective2,
            aboutObjective3: s.aboutObjectives?.[2] || prev.aboutObjective3,
            aboutObjective4: s.aboutObjectives?.[3] || prev.aboutObjective4,
            aboutObjective5: s.aboutObjectives?.[4] || prev.aboutObjective5,
            aboutObjective6: s.aboutObjectives?.[5] || prev.aboutObjective6,
            aboutCraft1Name: s.aboutValues?.[0]?.title || prev.aboutCraft1Name,
            aboutCraft1Desc: s.aboutValues?.[0]?.body || prev.aboutCraft1Desc,
            aboutCraft2Name: s.aboutValues?.[1]?.title || prev.aboutCraft2Name,
            aboutCraft2Desc: s.aboutValues?.[1]?.body || prev.aboutCraft2Desc,
            aboutCraft3Name: s.aboutValues?.[2]?.title || prev.aboutCraft3Name,
            aboutCraft3Desc: s.aboutValues?.[2]?.body || prev.aboutCraft3Desc,
            aboutCraft4Name: s.aboutValues?.[3]?.title || prev.aboutCraft4Name,
            aboutCraft4Desc: s.aboutValues?.[3]?.body || prev.aboutCraft4Desc,
            aboutCraft5Name: s.aboutValues?.[4]?.title || prev.aboutCraft5Name,
            aboutCraft5Desc: s.aboutValues?.[4]?.body || prev.aboutCraft5Desc,
            fact1Key: s.aboutStats?.[0]?.label || prev.fact1Key,
            fact1Val: s.aboutStats?.[0]?.number || prev.fact1Val,
            fact2Key: s.aboutStats?.[1]?.label || prev.fact2Key,
            fact2Val: s.aboutStats?.[1]?.number || prev.fact2Val,
            fact3Key: s.aboutStats?.[2]?.label || prev.fact3Key,
            fact3Val: s.aboutStats?.[2]?.number || prev.fact3Val,
            fact4Key: s.aboutStats?.[3]?.label || prev.fact4Key,
            fact4Val: s.aboutStats?.[3]?.number || prev.fact4Val,
          }));
        }
      }

      // 2. Fetch Governance records
      const resGov = await fetch('/api/admin/governance', { cache: 'no-store' });
      if (resGov.ok) {
        const d = await resGov.json();
        setRecords(d.records || []);
      }
    } catch (e: any) {
      showToast('error', 'Failed to load About Us page data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        ...settings,
        aboutObjectives: [
          settings.aboutObjective1,
          settings.aboutObjective2,
          settings.aboutObjective3,
          settings.aboutObjective4,
          settings.aboutObjective5,
          settings.aboutObjective6,
        ].filter(Boolean),
        aboutValues: [
          { letter: 'C', title: settings.aboutCraft1Name || 'Care', body: settings.aboutCraft1Desc || '' },
          { letter: 'R', title: settings.aboutCraft2Name || 'Respect', body: settings.aboutCraft2Desc || '' },
          { letter: 'A', title: settings.aboutCraft3Name || 'Attentive', body: settings.aboutCraft3Desc || '' },
          { letter: 'F', title: settings.aboutCraft4Name || 'Fair', body: settings.aboutCraft4Desc || '' },
          { letter: 'T', title: settings.aboutCraft5Name || 'Transparent', body: settings.aboutCraft5Desc || '' },
        ].filter((v) => v.title),
        aboutStats: [
          { label: settings.fact1Key || 'Established', number: settings.fact1Val || '2005' },
          { label: settings.fact2Key || 'Registered CSO', number: settings.fact2Val || '2011 · CSO/2011/043' },
          { label: settings.fact3Key || 'Member enterprises', number: settings.fact3Val || '7,500' },
          { label: settings.fact4Key || 'Affiliated stores', number: settings.fact4Val || '195' },
        ].filter((s) => s.label),
      };

      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (res.ok) {
        showToast('success', 'About Us settings updated successfully!');
      } else {
        showToast('error', d.error || 'Failed to save settings.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  // CRUD for Governance Records
  const openNewRecord = (cat: string) => {
    setEditingId(null);
    setRecordForm({
      category: cat,
      roleTitle: '',
      individualName: '',
      chapterOrNote: '',
      sortOrder: records.filter((r) => r.category === cat).length + 1,
    });
    setFormOpen(true);
  };

  const openEditRecord = (rec: GovRecord) => {
    setEditingId(rec.id);
    setRecordForm({
      category: rec.category,
      roleTitle: rec.roleTitle,
      individualName: rec.individualName,
      chapterOrNote: rec.chapterOrNote,
      sortOrder: rec.sortOrder,
    });
    setFormOpen(true);
  };

  const handleSaveRecord = async () => {
    if (!recordForm.roleTitle.trim() || !recordForm.individualName.trim()) {
      showToast('error', 'Please fill in both the title/role and name fields.');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/governance';
      const method = editingId ? 'PUT' : 'POST';
      const payload = editingId ? { ...recordForm, id: editingId } : recordForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', editingId ? 'Record updated!' : 'Record created!');
        setFormOpen(false);
        setEditingId(null);
        // Reload records
        const rGov = await fetch('/api/admin/governance', { cache: 'no-store' });
        if (rGov.ok) {
          const d = await rGov.json();
          setRecords(d.records || []);
        }
      } else {
        showToast('error', data.error || 'Failed to save record.');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Error saving record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (id: string, name: string) => {
    if (!confirm(`Delete record "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/governance?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Record deleted successfully.');
        setRecords(records.filter((r) => r.id !== id));
      } else {
        showToast('error', 'Failed to delete record.');
      }
    } catch (e) {
      showToast('error', 'Error deleting record.');
    }
  };

  const boardMembers = records.filter((r) => r.category === 'BOARD_OF_TRUSTEES');
  const teamMembers = records.filter((r) => r.category === 'SECRETARIAT');
  const milestones = records.filter((r) => r.category === 'MILESTONE');

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Loading About Us Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border text-sm animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <Info className="w-4 h-4" />
            <span>WordPress-Style Page Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            About Us Page Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Manage the association mandate, vision, mission, Board of Trustees, Secretariat staff team, and historical milestones.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/about"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
          >
            <span>View Public About Page</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
          <button
            type="button"
            onClick={() => handleSaveSettings()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Narrative'}</span>
          </button>
        </div>
      </div>

      {/* WordPress-Style Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('mandate')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'mandate'
              ? 'border-[#8B2E24] text-[#8B2E24]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>1. Mandate, Vision &amp; Mission</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('objectives')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'objectives'
              ? 'border-[#8B2E24] text-[#8B2E24]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>2. Strategic Objectives (6)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('values')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'values'
              ? 'border-[#8B2E24] text-[#8B2E24]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>3. CRAFT Core Values (5)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('facts')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'facts'
              ? 'border-[#8B2E24] text-[#8B2E24]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>4. Sector Quick Facts (4)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('board')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'board'
              ? 'border-[#8B2E24] text-[#8B2E24]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>5. Board of Trustees</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-mono">
            {boardMembers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'team'
              ? 'border-[#8B2E24] text-[#8B2E24]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>6. Secretariat Team</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-mono">
            {teamMembers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('milestones')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'milestones'
              ? 'border-[#8B2E24] text-[#8B2E24]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>7. Milestones</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-mono">
            {milestones.length}
          </span>
        </button>
      </div>

      {/* TAB 1: MANDATE, VISION, MISSION */}
      {activeTab === 'mandate' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Mandate & Core Narrative</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit the official founding mandate, vision, mission, and legal registration details shown on the About Us page.
            </p>
          </div>

          <div className="space-y-5 max-w-4xl">
            <div className="space-y-1">
              <RichTextEditor
                label="Official Mandate Narrative"
                value={settings.aboutMandateText}
                onChange={(html) => setSettings((s) => ({ ...s, aboutMandateText: html }))}
                hint="Opening lead section detailing HAB's founding under Royal Patronage and legal CSO standing."
              />
            </div>

            <div className="pt-2">
              <FileUploadInput
                value={settings.aboutBandImageUrl || ''}
                onChange={(url) => setSettings((s) => ({ ...s, aboutBandImageUrl: url }))}
                label="About Page Hero Image"
                accept="image/*"
                hint="Supports JPG, PNG, WebP up to 15MB"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Vision</h3>
                <input
                  type="text"
                  value={settings.visionTitle}
                  onChange={(e) => setSettings((s) => ({ ...s, visionTitle: e.target.value }))}
                  placeholder="Vision Heading"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold"
                />
                <textarea
                  rows={3}
                  value={settings.visionBody}
                  onChange={(e) => setSettings((s) => ({ ...s, visionBody: e.target.value }))}
                  placeholder="Vision Statement Narrative"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
                />
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Mission</h3>
                <input
                  type="text"
                  value={settings.missionTitle}
                  onChange={(e) => setSettings((s) => ({ ...s, missionTitle: e.target.value }))}
                  placeholder="Mission Heading"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold"
                />
                <textarea
                  rows={3}
                  value={settings.missionBody}
                  onChange={(e) => setSettings((s) => ({ ...s, missionBody: e.target.value }))}
                  placeholder="Mission Statement Narrative"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                CSO Legal Registration Badge
              </label>
              <input
                type="text"
                value={settings.csoRegistration}
                onChange={(e) => setSettings((s) => ({ ...s, csoRegistration: e.target.value }))}
                placeholder="2011 · CSO/2011/043"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
              />
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Mandate & Vision</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 6 STRATEGIC OBJECTIVES */}
      {activeTab === 'objectives' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">6 Strategic Objectives</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The six core pillars guiding HAB&apos;s institutional strategy under the Civil Society Organizations Act.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSaveSettings()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Objectives'}</span>
            </button>
          </div>

          <div className="space-y-4 max-w-4xl">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B2E24] text-white flex items-center justify-center text-xs font-bold font-mono">
                    {num}
                  </span>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Strategic Objective #{num}
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={(settings as any)['aboutObjective' + num] || ''}
                  onChange={(e) => setSettings((s) => ({ ...s, ['aboutObjective' + num]: e.target.value }))}
                  placeholder={`Description of objective #${num}...`}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>
            ))}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save All Objectives</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 5 CRAFT CORE VALUES */}
      {activeTab === 'values' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">5 CRAFT Core Values (C-R-A-F-T)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The institutional acronym defining HAB&apos;s standards of care, integrity, and transparency.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSaveSettings()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Values'}</span>
            </button>
          </div>

          <div className="space-y-4 max-w-4xl">
            {[
              { num: 1, letter: 'C', defName: 'Care' },
              { num: 2, letter: 'R', defName: 'Respect' },
              { num: 3, letter: 'A', defName: 'Attentive' },
              { num: 4, letter: 'F', defName: 'Fair' },
              { num: 5, letter: 'T', defName: 'Transparent' },
            ].map(({ num, letter, defName }) => (
              <div key={num} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B2E24] text-white flex items-center justify-center text-xs font-bold">
                    {letter}
                  </span>
                  <input
                    type="text"
                    value={(settings as any)['aboutCraft' + num + 'Name'] || ''}
                    onChange={(e) => setSettings((s) => ({ ...s, ['aboutCraft' + num + 'Name']: e.target.value }))}
                    placeholder={`Value (${letter}) - ${defName}`}
                    className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
                  />
                </div>
                <textarea
                  rows={2}
                  value={(settings as any)['aboutCraft' + num + 'Desc'] || ''}
                  onChange={(e) => setSettings((s) => ({ ...s, ['aboutCraft' + num + 'Desc']: e.target.value }))}
                  placeholder={`Description of ${letter} commitment...`}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>
            ))}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save All Values</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 4 SECTOR QUICK FACTS */}
      {activeTab === 'facts' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">4 Sector Quick Facts</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The four highlight key metric cards shown on the public About Us page header.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSaveSettings()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Quick Facts'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-[#8B2E24]">Quick Fact #{num}</span>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Label / Title</label>
                  <input
                    type="text"
                    value={(settings as any)['fact' + num + 'Key'] || ''}
                    onChange={(e) => setSettings((s) => ({ ...s, ['fact' + num + 'Key']: e.target.value }))}
                    placeholder="e.g. Established"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Value</label>
                  <input
                    type="text"
                    value={(settings as any)['fact' + num + 'Val'] || ''}
                    onChange={(e) => setSettings((s) => ({ ...s, ['fact' + num + 'Val']: e.target.value }))}
                    placeholder="e.g. 2005"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleSaveSettings()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Quick Facts</span>
            </button>
          </div>
        </div>
      )}

      {/* CRUD MODAL FOR GOVERNANCE RECORDS */}
      {formOpen && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-md space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              {editingId ? 'Edit Entry' : 'Add New Entry'}
            </h3>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {recordForm.category === 'MILESTONE' ? 'Year (e.g. 2005)' : 'Role / Title *'}
              </label>
              <input
                type="text"
                value={recordForm.roleTitle}
                onChange={(e) => setRecordForm((f) => ({ ...f, roleTitle: e.target.value }))}
                placeholder={recordForm.category === 'MILESTONE' ? '2005' : 'e.g. Chair, Board of Trustees'}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {recordForm.category === 'MILESTONE' ? 'Milestone Milestone / Event *' : 'Full Name *'}
              </label>
              <input
                type="text"
                value={recordForm.individualName}
                onChange={(e) => setRecordForm((f) => ({ ...f, individualName: e.target.value }))}
                placeholder={recordForm.category === 'MILESTONE' ? 'Established under Royal Patronage' : 'e.g. Aum Karma Wangmo'}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
              />
            </div>

            {recordForm.category !== 'MILESTONE' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Dzongkhag Chapter / Affiliation Note / Email
                </label>
                <input
                  type="text"
                  value={recordForm.chapterOrNote}
                  onChange={(e) => setRecordForm((f) => ({ ...f, chapterOrNote: e.target.value }))}
                  placeholder="e.g. Master weaver, Lhuentse"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Display Sort Order
              </label>
              <input
                type="number"
                value={recordForm.sortOrder}
                onChange={(e) => setRecordForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveRecord}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingId ? 'Save Changes' : 'Add Entry'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: BOARD OF TRUSTEES CRUD */}
      {activeTab === 'board' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Board of Trustees</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Full CRUD control for members of the Board of Trustees.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openNewRecord('BOARD_OF_TRUSTEES')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Board Member</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Role / Office</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Dzongkhag / Note</th>
                  <th className="p-3.5 text-center">Order</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {boardMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No board members recorded yet. Click &ldquo;+ Add Board Member&rdquo; above.
                    </td>
                  </tr>
                ) : (
                  boardMembers.map((bm) => (
                    <tr key={bm.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-5 font-semibold text-slate-900">{bm.roleTitle}</td>
                      <td className="p-3.5 text-slate-800 font-medium">{bm.individualName}</td>
                      <td className="p-3.5 text-slate-500">{bm.chapterOrNote || '—'}</td>
                      <td className="p-3.5 text-center font-mono text-slate-400">#{bm.sortOrder}</td>
                      <td className="p-3.5 pr-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditRecord(bm)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#8B2E24] hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(bm.id, bm.individualName)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SECRETARIAT TEAM CRUD */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Secretariat Executive Team</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Full CRUD control for full-time executive staff at the HAB Secretariat in Thimphu.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openNewRecord('SECRETARIAT')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Staff Position / Role</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Contact / Department Note</th>
                  <th className="p-3.5 text-center">Order</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No secretariat staff recorded yet. Click &ldquo;+ Add Staff Member&rdquo; above.
                    </td>
                  </tr>
                ) : (
                  teamMembers.map((tm) => (
                    <tr key={tm.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-5 font-semibold text-slate-900">{tm.roleTitle}</td>
                      <td className="p-3.5 text-slate-800 font-medium">{tm.individualName}</td>
                      <td className="p-3.5 text-slate-500">{tm.chapterOrNote || '—'}</td>
                      <td className="p-3.5 text-center font-mono text-slate-400">#{tm.sortOrder}</td>
                      <td className="p-3.5 pr-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditRecord(tm)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#8B2E24] hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(tm.id, tm.individualName)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: HISTORICAL MILESTONES CRUD */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Historical Milestones Timeline</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Full CRUD control for key founding and operational milestones of HAB.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openNewRecord('MILESTONE')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Milestone</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Year</th>
                  <th className="p-3.5">Historical Milestone Event</th>
                  <th className="p-3.5 text-center">Order</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {milestones.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      No milestones recorded yet. Click &ldquo;+ Add Milestone&rdquo; above.
                    </td>
                  </tr>
                ) : (
                  milestones.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-5 font-bold text-[#8B2E24] font-mono">{m.roleTitle}</td>
                      <td className="p-3.5 text-slate-800 font-medium">{m.individualName}</td>
                      <td className="p-3.5 text-center font-mono text-slate-400">#{m.sortOrder}</td>
                      <td className="p-3.5 pr-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditRecord(m)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#8B2E24] hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(m.id, m.individualName)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

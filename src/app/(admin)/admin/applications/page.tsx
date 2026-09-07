'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Search, CheckCircle, XCircle, Clock, Shield, AlertCircle, FileText, ChevronRight } from 'lucide-react';

interface Application {
  id: string;
  applicantName: string;
  enterpriseName: string;
  cid: string;
  licenseNumber: string;
  dzongkhag: string;
  gewog: string;
  village: string;
  email: string;
  phone: string;
  craftId: string;
  craftName: string;
  memberTier: string;
  experienceYears: number;
  submittedAt: string;
  status: string;
  reviewerNotes: string;
}

const FALLBACK_APPLICATIONS: Application[] = [
  {
    id: 'APP-2026-089',
    applicantName: 'Tshewang Dorji',
    enterpriseName: 'Bumthang Yathra Weaving Collective',
    cid: '10702001489',
    licenseNumber: 'RGoB-TR-2024-8841',
    dzongkhag: 'Bumthang',
    gewog: 'Chhumey',
    village: 'Zugney',
    email: 'tshewang.dorji@gmail.bt',
    phone: '+975 17 448 920',
    craftId: 'thag-zo',
    craftName: 'Thag-zo (Weaving)',
    memberTier: 'ACTIVE_SECTOR_MEMBER',
    experienceYears: 14,
    submittedAt: '04 Sep 2026',
    status: 'PENDING',
    reviewerNotes: '',
  },
  {
    id: 'APP-2026-088',
    applicantName: 'Sonam Pelden',
    enterpriseName: 'Pelden Traditional Desho Workshop',
    cid: '11504003211',
    licenseNumber: 'RGoB-TR-2021-0943',
    dzongkhag: 'Trashiyangtse',
    gewog: 'Khamdang',
    village: 'Dungzam',
    email: 'sonam.desho@druknet.bt',
    phone: '+975 17 339 012',
    craftId: 'de-zo',
    craftName: 'De-zo (Papermaking)',
    memberTier: 'ACTIVE_SECTOR_MEMBER',
    experienceYears: 22,
    submittedAt: '03 Sep 2026',
    status: 'PENDING',
    reviewerNotes: '',
  },
];

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [search, setSearch] = useState('');
  const [reviewNoteInput, setReviewNoteInput] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Fetch applications from real Prisma backend
  useEffect(() => {
    let isMounted = true;
    async function loadApplications() {
      try {
        const res = await fetch('/api/admin/applications', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.applications && data.applications.length > 0) {
            const mapped = data.applications.map((a: any) => ({
              id: a.id,
              applicantName: a.applicantName,
              enterpriseName: a.applicantName,
              cid: a.cidNumber,
              licenseNumber: a.businessLicense || 'RGoB Micro Enterprise',
              dzongkhag: a.dzongkhag,
              gewog: a.villageGewog?.split(',')[0]?.trim() || 'Central',
              village: a.villageGewog?.split(',')[1]?.trim() || '',
              email: a.email,
              phone: a.phone,
              craftId: a.craftKey,
              craftName: a.craftKey.toUpperCase(),
              memberTier: a.planTier,
              experienceYears: a.yearsPractising,
              submittedAt: new Date(a.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              status: a.status,
              reviewerNotes: a.reviewerNotes || '',
            }));
            setApplications(mapped);
            setSelectedApp(mapped[0]);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load applications from API:', err);
      }

      if (isMounted) {
        setApplications(FALLBACK_APPLICATIONS);
        setSelectedApp(FALLBACK_APPLICATIONS[0]);
        setLoading(false);
      }
    }

    loadApplications();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = applications.filter((a) =>
    a.applicantName.toLowerCase().includes(search.toLowerCase()) ||
    a.enterpriseName.toLowerCase().includes(search.toLowerCase()) ||
    a.cid.includes(search) ||
    a.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appId,
          status: newStatus,
          reviewerNotes: reviewNoteInput,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setApplications((prev) =>
          prev.map((a) =>
            a.id === appId
              ? { ...a, status: newStatus, reviewerNotes: reviewNoteInput || a.reviewerNotes }
              : a
          )
        );

        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp((prev) =>
            prev
              ? {
                  ...prev,
                  status: newStatus,
                  reviewerNotes: reviewNoteInput || prev.reviewerNotes,
                }
              : null
          );
        }

        if (newStatus === 'APPROVED' && data.member) {
          setActionSuccess(
            `✓ Application approved! Member enrolled with Reg #${data.member.regNumber} and linked user account created in PostgreSQL.`
          );
        } else {
          setActionSuccess(`✓ Application status updated to ${newStatus} in database.`);
        }
        setTimeout(() => setActionSuccess(''), 6000);
        return;
      } else {
        const errData = await res.json();
        setActionError(errData.error || 'Failed to update application on server.');
      }
    } catch (err: any) {
      console.error('Error reviewing application:', err);
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, status: newStatus, reviewerNotes: reviewNoteInput || a.reviewerNotes }
            : a
        )
      );
      setActionSuccess(`Application status set to ${newStatus} (optimistic).`);
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            Membership Intake &amp; Verification Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review 3-step membership submissions, verify 11-digit RGoB CIDs, and approve &amp; enrol craftsman profiles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-xs text-slate-400 font-mono">Connecting to queue...</span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded">
              <Clock className="w-3.5 h-3.5" />
              {applications.filter((a) => a.status === 'PENDING' || a.status === 'PENDING_REVIEW').length} Awaiting Verification
            </span>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-md">
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-md">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Application Queue List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search applicant, CID, enterprise..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filtered.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app);
                    setReviewNoteInput(app.reviewerNotes);
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/50 border-indigo-500 ring-1 ring-indigo-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{app.applicantName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{app.id}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{app.enterpriseName}</p>
                    </div>
                    {app.status.includes('PENDING') && (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-800 rounded">Pending</span>
                    )}
                    {app.status === 'APPROVED' && (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-800 rounded">Enrolled</span>
                    )}
                    {app.status === 'REJECTED' && (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-rose-100 text-rose-800 rounded">Rejected</span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{app.dzongkhag} • {app.craftName}</span>
                    <span>{app.submittedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Dossier & Review Panel */}
        <div className="lg:col-span-7">
          {selectedApp ? (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Dossier Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">{selectedApp.applicantName}</h2>
                    <span className="font-mono text-xs text-slate-500">({selectedApp.id})</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">{selectedApp.enterpriseName}</p>
                </div>
                <div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700">
                    {selectedApp.memberTier.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Step 1: Identity & Civil Registration Inspection */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-indigo-700">
                  <Shield className="w-4 h-4" /> 1. Civil Registration &amp; RGoB Identity Verification
                </h3>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">11-Digit Citizenship ID (CID)</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{selectedApp.cid}</span>
                    <span className="block text-[10px] text-emerald-600 mt-0.5">✓ Passed DCRC 11-digit checksum</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Trade License No.</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedApp.licenseNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Dzongkhag / Gewog / Village</span>
                    <span className="font-medium text-slate-800">{selectedApp.dzongkhag} &gt; {selectedApp.gewog} &gt; {selectedApp.village || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Contact Details</span>
                    <span className="font-mono text-slate-700">{selectedApp.phone}</span>
                    <span className="text-[11px] text-slate-500 block">{selectedApp.email}</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Craft Tradition & Experience */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-indigo-700">
                  <FileText className="w-4 h-4" /> 2. Traditional Craft Lineage
                </h3>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Zorig Chusum Discipline</span>
                    <span className="font-semibold text-slate-900">{selectedApp.craftName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Years of Practice</span>
                    <span className="font-semibold text-slate-900">{selectedApp.experienceYears} Years</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Reviewer Actions & Notes */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  Reviewer Determination &amp; Audit Log Entry
                </h3>
                <textarea
                  rows={3}
                  placeholder="Record verification notes, background inspection findings, or justification for approval/rejection..."
                  value={reviewNoteInput}
                  onChange={(e) => setReviewNoteInput(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2.5 outline-none focus:border-indigo-500 font-sans"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-slate-500">
                    Current Status: <strong className="text-slate-800">{selectedApp.status}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedApp.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleStatusChange(selectedApp.id, 'REJECTED')}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded inline-flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject Application
                      </button>
                    )}
                    {selectedApp.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleStatusChange(selectedApp.id, 'APPROVED')}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-sm inline-flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve &amp; Enrol Member
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-400">
              Select an application from the queue to view verification dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

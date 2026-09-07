'use client';

import React, { useState } from 'react';
import { Globe2, Calendar, MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface TradeFair {
  id: string;
  name: string;
  location: string;
  dates: string;
  boothGrant: string;
  deadline: string;
  status: 'ENROLLED' | 'OPEN_FOR_APPLICATIONS' | 'CLOSED';
}

const FAIRS: TradeFair[] = [
  {
    id: 'TF-2026-01',
    name: 'Santa Fe International Folk Art Market',
    location: 'Santa Fe, New Mexico, USA',
    dates: 'July 8 – 12, 2026',
    boothGrant: '100% booth + airfare stipend via Helvetas Swiss Intercooperation',
    deadline: 'April 30, 2026',
    status: 'ENROLLED'
  },
  {
    id: 'TF-2026-02',
    name: 'Ambiente Frankfurt International Fair',
    location: 'Frankfurt am Main, Germany',
    dates: 'February 13 – 17, 2027',
    boothGrant: 'Shared Bhutan Pavilion co-funded by Dept. of Industry (MoICE)',
    deadline: 'October 15, 2026',
    status: 'OPEN_FOR_APPLICATIONS'
  },
  {
    id: 'TF-2026-03',
    name: 'Druk Heritage Master Craftsmen Exhibition',
    location: 'Ginza Six, Tokyo, Japan',
    dates: 'November 20 – 26, 2026',
    boothGrant: 'Full logistical handling + interpreter support via Bhutan-Japan Friendship',
    deadline: 'September 1, 2026',
    status: 'OPEN_FOR_APPLICATIONS'
  },
  {
    id: 'TF-2026-04',
    name: 'SAARC Handicrafts B2B Buyer-Seller Expo',
    location: 'Pragati Maidan, New Delhi, India',
    dates: 'December 4 – 8, 2026',
    boothGrant: 'Subsidized stall space under SAARC Trade Promotion programme',
    deadline: 'October 30, 2026',
    status: 'OPEN_FOR_APPLICATIONS'
  }
];

export default function MemberTradeFairsPage() {
  const [fairs, setFairs] = useState<TradeFair[]>(FAIRS);

  const handleApply = (id: string, name: string) => {
    setFairs(prev => prev.map(f => f.id === id ? { ...f, status: 'ENROLLED' } : f));
    alert(`Application submitted for ${name}. HAB Trade Desk will issue your official delegation sponsorship memo.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-amber-700" />
          International Trade Missions & Delegations
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Apply for subsidized international exhibition pavilions, embassy visa endorsement, and bilateral export missions.
        </p>
      </div>

      <div className="space-y-4">
        {fairs.map(fair => (
          <div key={fair.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{fair.name}</h3>
                {fair.status === 'ENROLLED' && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded inline-flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> DELEGATION CONFIRMED
                  </span>
                )}
                {fair.status === 'OPEN_FOR_APPLICATIONS' && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                    APPLICATIONS OPEN
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-mono">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {fair.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {fair.dates}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Deadline: {fair.deadline}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-1">
                <strong>Subsidy:</strong> {fair.boothGrant}
              </p>
            </div>

            <div>
              {fair.status === 'ENROLLED' ? (
                <button
                  disabled
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold cursor-default"
                >
                  Visa Letter Issued
                </button>
              ) : (
                <button
                  onClick={() => handleApply(fair.id, fair.name)}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                >
                  Apply for Delegation
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

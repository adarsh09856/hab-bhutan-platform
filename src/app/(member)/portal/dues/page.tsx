'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle, ShieldCheck, Download, Calendar, Landmark } from 'lucide-react';

export default function MemberDuesPage() {
  const [paid, setPaid] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'MBOB' | 'MPAY' | 'RMA_EFT'>('MBOB');

  const handlePay = () => {
    setPaid(true);
    alert('Annual membership renewal for 2027 confirmed via Royal Monetary Authority gateway. Official CSO receipt issued.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-amber-700" />
          Annual Membership Dues & Good Standing
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Maintain active CSO voter accreditation, authenticity mark licensing, and international store access.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Status & Payment */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs text-slate-500 uppercase">Current Registration Cycle</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Calendar Year 2026</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Accreditation Tier: <strong>Craft Producer Enterprise</strong>
                </p>
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> GOOD STANDING
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[11px]">Valid Until</span>
                <span className="font-bold text-slate-900">December 31, 2026</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Annual Statutory Dues</span>
                <span className="font-bold text-slate-900">BTN 5,000 / year</span>
              </div>
            </div>

            {/* Advance Renewal Box */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Renew for Calendar Year 2027
              </h4>

              {paid ? (
                <div className="p-4 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    2027 Membership Dues Paid (BTN 5,000)
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Registration renewed through December 31, 2027. Transaction Ref: RMA-TXN-2026-90412.
                  </p>
                  <button 
                    onClick={() => alert('Official Tax-Exempt CSO Receipt PDF generated.')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 underline"
                  >
                    <Download className="w-3 h-3" /> Download Receipt #HAB-REC-2027-042
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('MBOB')}
                      className={`p-3 rounded border text-center transition-all ${
                        selectedMethod === 'MBOB' 
                          ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600 font-bold text-amber-900' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs block">Bank of Bhutan</span>
                      <span className="text-[10px] text-slate-500 font-mono">mBoB Mobile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('MPAY')}
                      className={`p-3 rounded border text-center transition-all ${
                        selectedMethod === 'MPAY' 
                          ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600 font-bold text-amber-900' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs block">BNB mPay</span>
                      <span className="text-[10px] text-slate-500 font-mono">BNB App</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('RMA_EFT')}
                      className={`p-3 rounded border text-center transition-all ${
                        selectedMethod === 'RMA_EFT' 
                          ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600 font-bold text-amber-900' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs block">RMA BFS</span>
                      <span className="text-[10px] text-slate-500 font-mono">Interbank Switch</span>
                    </button>
                  </div>

                  <button
                    onClick={handlePay}
                    className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded font-semibold text-xs shadow-sm transition-colors"
                  >
                    Pay BTN 5,000 for 2027 Renewal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Statutory Rights */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-amber-700" /> Statutory Entitlements
            </h3>
            <ul className="space-y-2 text-slate-600 list-disc pl-4">
              <li>One voting ballot at the Annual General Meeting (AoA Art. 6).</li>
              <li>Free access to international e-commerce consignment vault listing.</li>
              <li>Official endorsement for international exhibition visa letters.</li>
              <li>Tax-deductible receipt registered with Dept. of Revenue & Customs.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

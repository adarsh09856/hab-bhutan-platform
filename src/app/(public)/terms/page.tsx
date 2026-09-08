'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/policies?slug=terms')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.policy) {
          setPolicy(data.policy);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-[85vh] bg-[#FBF9F5] py-8 sm:py-12 px-4 sm:px-6 lg:px-10 font-figtree">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="font-mono text-[11.5px] text-[#6B5A4C]">
          <Link href="/" className="hover:underline">Home</Link> /{' '}
          <span className="text-[#33261F]">Terms of Service</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E4DDD1] p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-[#E4DDD1]">
            <div className="w-12 h-12 rounded-xl bg-[#8B2E24]/10 text-[#8B2E24] flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-marcellus text-2xl sm:text-3xl text-[#33261F]">
                {policy?.title || 'Terms & Conditions of Service'}
              </h1>
              <p className="text-xs text-[#6B5A4C] mt-1 font-mono">
                Statutory Governance · CSO Registration No. CSO/2011/043
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-[#4A3C33] leading-relaxed space-y-4 font-lora whitespace-pre-wrap">
            {loading ? (
              <p className="font-mono text-xs text-slate-400">Loading statutory terms...</p>
            ) : policy?.content ? (
              policy.content
            ) : (
              <p>Statutory terms under review by the Secretariat.</p>
            )}
          </div>

          <div className="pt-6 border-t border-[#E4DDD1] flex items-center justify-between text-xs text-[#6B5A4C]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Civil Society Organizations Authority (CSOA) Compliance</span>
            </div>
            <Link href="/" className="text-[#8B2E24] font-semibold hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

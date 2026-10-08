'use client';

import { useEffect, useState } from 'react';
import QuickEditRecords from '@/components/public/QuickEditRecords';

type Section = 'strategic' | 'mandate' | 'ethics';
const options: Array<{ key: Section; label: string }> = [
  { key: 'strategic', label: 'Strategic plan pillars' },
  { key: 'mandate', label: 'Mandate articles' },
  { key: 'ethics', label: 'Ethical standards' },
];

export default function GovernanceCardsAdminPage() {
  const [section, setSection] = useState<Section>('strategic');
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('section');
    if (requested === 'strategic' || requested === 'mandate' || requested === 'ethics') setSection(requested);
  }, []);
  return <main className="mx-auto max-w-7xl p-5 sm:p-8">
    <p className="text-xs font-bold uppercase tracking-widest text-[#8B2E24]">Website & Pages</p>
    <h1 className="mt-1 text-2xl font-bold text-slate-900">Governance page cards</h1>
    <p className="mt-2 text-sm text-slate-600">Create, edit, order or hide the original card collections on the three governance pages. Hidden cards can be made visible again.</p>
    <div className="my-5 flex flex-wrap gap-2">{options.map((option) => <button key={option.key} type="button" onClick={() => setSection(option.key)} className={`rounded-lg px-3 py-2 text-xs font-bold ${section === option.key ? 'bg-[#8B2E24] text-white' : 'border bg-white text-slate-700'}`}>{option.label}</button>)}</div>
    <div className="rounded-xl border bg-white"><QuickEditRecords key={section} sectionType={`${section}-cards`} /></div>
  </main>;
}

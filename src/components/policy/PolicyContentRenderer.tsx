import React from 'react';
import { splitPolicyBlocks } from '@/lib/policy-blocks';

export function PolicyContentRenderer({ content }: { content: string }) {
  const blocks = splitPolicyBlocks(content);

  return (
    <div className="space-y-4 text-inherit">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('## ')) {
          const heading = trimmed.replace(/^##\s+/, '');
          const id = heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const lower = heading.toLowerCase();
          const exactAliases: Record<string, string> = {
            'who we are': 'who', 'using this site': 'use', 'prices & payment': 'prices',
            'intellectual property': 'ip', 'governing law': 'law', 'governing law & changes': 'law',
            'what we collect': 'collect', 'why we hold it': 'why', 'member data and the directory': 'members',
            'payment data': 'payment', 'cookies & local storage': 'cookies', 'who we share it with': 'sharing',
            'how long we keep it': 'retention', 'your rights': 'rights', 'free ems conditions': 'free',
          };
          const alias = exactAliases[lower] || (lower.includes('return') || lower.includes('refund') ? 'returns' :
            lower.includes('duty') || lower.includes('custom') ? 'duty' :
            lower.includes('dispatch') || lower.includes('handling') ? 'dispatch' :
            lower.includes('method') || lower.includes('delivery') ? 'methods' :
            lower.includes('charge') ? 'charges' :
            lower.includes('track') ? 'tracking' :
            lower.includes('damage') || lower.includes('loss') ? 'damage' :
            lower.includes('trade') || lower.includes('wholesale') ? 'trade' : null);
          return (
            <div key={idx} className="relative">
              {alias && alias !== id && <span id={alias} className="absolute -top-24 block invisible" />}
              <h2 id={id} className="text-xl font-bold mt-6 mb-2">
                {heading}
              </h2>
            </div>
          );
        }

        if (trimmed.startsWith('### ')) {
          const heading = trimmed.replace(/^###\s+/, '');
          return (
            <h3 key={idx} className="text-base font-semibold mt-4 mb-1">
              {heading}
            </h3>
          );
        }

        const lines = trimmed.split('\n');
        if (lines.length > 1 && lines.every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '))) {
          const items = lines.map((line) => line.trim().replace(/^[-*]\s+/, ''));
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1.5 my-2">
              {items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

import React from 'react';

export function PolicyContentRenderer({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-4 text-inherit">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('## ')) {
          const heading = trimmed.replace(/^##\s+/, '');
          const id = heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return (
            <h2 key={idx} id={id} className="text-xl font-bold mt-6 mb-2">
              {heading}
            </h2>
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

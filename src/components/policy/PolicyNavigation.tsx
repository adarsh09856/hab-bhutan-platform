import React from 'react';
import { policyHeadings } from '@/lib/policy-blocks';

export function PolicyNavigation({ content }: { content: string }) {
  const headings = policyHeadings(content);
  if (!headings.length) return null;
  return <nav className="policy__nav" aria-label="On this page">
    {headings.map(heading => <a key={heading.id} href={`#${heading.id}`}>{heading.text}</a>)}
  </nav>;
}

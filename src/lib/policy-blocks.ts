import { isPolicyHtml, preparePolicyHtml } from './policy-html';

export function splitPolicyBlocks(content: string): string[] {
  const blocks: string[] = [];
  let lines: string[] = [];
  let kind = '';
  const flush = () => { if (lines.length) blocks.push(lines.join('\n')); lines = []; kind = ''; };
  for (const raw of content.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    if (/^#{2,3}\s/.test(line)) { flush(); blocks.push(line); continue; }
    const nextKind = /^[-*]\s/.test(line) ? 'list' : 'paragraph';
    if (kind && kind !== nextKind) flush();
    kind = nextKind;
    lines.push(line);
  }
  flush();
  return blocks;
}

export function policyHeadings(content: string) {
  if (isPolicyHtml(content)) return preparePolicyHtml(content).headings;
  const used = new Map<string, number>();
  return splitPolicyBlocks(content).flatMap((block, blockIndex) => {
    if (!/^##\s/.test(block)) return [];
    const text = block.replace(/^##\s+/, '');
    const base = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '') || 'section';
    const count = (used.get(base) || 0) + 1;
    used.set(base, count);
    return [{ text, id: count === 1 ? base : `${base}-${count}`, blockIndex }];
  });
}

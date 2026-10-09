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

const INLINE_TEXT_TAGS = new Set([
  'ABBR', 'B', 'BDI', 'BDO', 'CITE', 'CODE', 'DEL', 'EM', 'I', 'INS', 'KBD', 'MARK', 'Q', 'S', 'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TIME', 'U', 'VAR', 'WBR',
]);

/** Allow formatted inline text inside a selected node without absorbing nested links, controls, or block content. */
export function isEditableInlineTextPath(rootTag: string, ancestorTags: string[]): boolean {
  const root = rootTag.toUpperCase();
  const ancestors = ancestorTags.map((tag) => tag.toUpperCase());
  if (['SVG', 'SCRIPT', 'STYLE', 'NOSCRIPT'].includes(root)) return false;
  if (ancestors.some((tag) => ['SVG', 'SCRIPT', 'STYLE', 'NOSCRIPT'].includes(tag))) return false;
  return ancestors.every((tag) => INLINE_TEXT_TAGS.has(tag));
}

export function joinEditableText(nodes: ArrayLike<{ textContent: string | null }>): string {
  return Array.from(nodes).map((node) => node.textContent || '').join('').replace(/\s+/g, ' ').trim();
}

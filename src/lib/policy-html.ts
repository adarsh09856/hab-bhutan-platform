import { FilterXSS, getDefaultWhiteList } from 'xss';
import { parseDocument } from 'htmlparser2';

export function isPolicyHtml(content: string) {
  return /<\/?(?:p|div|h[1-6]|ul|ol|li|table|blockquote|strong|em|a|br|span)\b/i.test(content);
}

function plainText(html: string): string {
  const document = parseDocument(html);
  const read = (node: any): string => node.type === 'text' ? node.data : (node.children || []).map(read).join('');
  return read(document).replace(/\s+/g, ' ').trim();
}

export function preparePolicyHtml(content: string, options: { inheritTypography?: boolean } = {}) {
  const filter = new FilterXSS({
    whiteList: {
      ...getDefaultWhiteList(),
      a: ['href', 'title'], img: ['src', 'alt', 'width', 'height', 'loading'],
      p: ['style'], div: ['style'], span: ['style'],
      h2: ['style'], h3: ['style'],
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style', 'textarea', 'svg', 'math', 'iframe'],
  });
  let safe = filter.process(content);
  if (options.inheritTypography) {
    // Rich text pasted from Word/Google Docs may carry Arial/black/11pt inline
    // styles. Keep layout and emphasis styles, but let the site set typography.
    safe = safe.replace(/\sstyle=(["'])(.*?)\1/gi, (_attribute, quote: string, value: string) => {
      const kept = value
        .split(';')
        .map((declaration) => declaration.trim())
        .filter((declaration) => declaration && !/^(?:font-family|font-size|color|background-color)\s*:/i.test(declaration));
      return kept.length ? ` style=${quote}${kept.join('; ')}${quote}` : '';
    });
  }
  const used = new Map<string, number>();
  const headings: { text: string; id: string; blockIndex: number }[] = [];
  const html = safe.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, (_, inner: string) => {
    const text = plainText(inner);
    const base = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '') || 'section';
    const count = (used.get(base) || 0) + 1;
    used.set(base, count);
    const id = count === 1 ? base : `${base}-${count}`;
    headings.push({ text, id, blockIndex: headings.length });
    return `<h2 id="${id}" class="text-xl font-bold mt-6 mb-2">${inner}</h2>`;
  });
  return { html, headings };
}

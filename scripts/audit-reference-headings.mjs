import fs from 'node:fs';
import path from 'node:path';

// Read-only signal audit, not a claim of visual or fully hydrated parity.
const root = process.env.HAB_HTML_REFERENCE || 'E:/Downloads/Final_webdesign/hab-site';
const base = process.env.HAB_REFERENCE_TARGET || 'https://hab.touratbhutan.info';
const examples = {
  index: '/', craft: '/craft/thagzo', cluster: '/clusters/khoma',
  member: '/members/HAB-2011-100', product: '/product/HHB10',
  event: '/events/craft-bazaar-2026', 'news-post': '/news/trade-facilitation-desk-autumn',
  outlet: '/outlets/punakha-market', project: '/projects/switch-asia',
  programme: '/programmes/a', 'membership-category': '/membership/individual-artisan',
  'wholesale-shop': '/wholesale/shop', 'wholesale-register': '/wholesale/register',
  'wholesale-cart': '/wholesale/cart',
};
const text = value => value.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
function headings(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
  return [...main.matchAll(/<(h[12])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(match => text(match[2])).filter(Boolean);
}
const files = fs.readdirSync(root).filter(file => file.endsWith('.html')).sort();
const results = [];
for (let index = 0; index < files.length; index += 4) {
  const batch = await Promise.all(files.slice(index, index + 4).map(async file => {
    const name = path.basename(file, '.html');
    const route = examples[name] || `/${name}`;
    const reference = headings(fs.readFileSync(path.join(root, file), 'utf8'));
    try {
      const response = await fetch(new URL(route, base), { signal: AbortSignal.timeout(20000) });
      const rendered = headings(await response.text());
      return { file, route, status: response.status, missingReferenceHeadings: reference.filter(heading => !rendered.includes(heading)), addedHeadings: rendered.filter(heading => !reference.includes(heading)), evidence: rendered.length ? 'SSR_HEADING_SIGNALS_ONLY' : 'CLIENT_RENDERING_REQUIRES_BROWSER_CHECK' };
    } catch (error) { return { file, route, error: error.message }; }
  }));
  results.push(...batch);
}
console.log(JSON.stringify({ referenceFiles: files.length, target: base, limitation: 'Headings only; dynamic reference JavaScript and browser layout/text/images are not evaluated. Differences are audit candidates, not automatic fixes.', results }, null, 2));

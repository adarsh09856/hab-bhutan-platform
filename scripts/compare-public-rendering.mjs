import fs from 'node:fs';

// Read-only SSR comparison. It intentionally reports structural/text signals,
// not pixel-level parity or client-hydrated content.
const liveBase = new URL(process.env.HAB_LIVE_BASE_URL || 'https://hab.touratbhutan.info');
const localBase = new URL(process.env.HAB_LOCAL_BASE_URL || 'http://127.0.0.1:3038');
const manifest = JSON.parse(fs.readFileSync('.next/server/app-paths-manifest.json', 'utf8'));
const dynamicExamples = {
  '/clusters/[key]': '/clusters/khoma',
  '/members/[slug]': '/members/Khoma%20Weavers%20Group',
  '/crafts/[craft]': '/crafts/shingzo',
  '/craft/[craft]': '/craft/shingzo',
  '/events/[key]': '/events/craft-bazaar-2026',
  '/news/[slug]': '/news/trade-facilitation-desk-autumn',
  '/membership/[category]': '/membership/individual-artisan',
  '/outlets/[key]': '/outlets/punakha-market',
  '/policies/[slug]': '/policies/shipping-policy',
  '/projects/[key]': '/projects/switch-asia',
  '/programmes/[ref]': '/programmes/a',
  '/product/[code]': '/product/HHB10',
  '/shop/[craft]': '/shop/shingzo',
  '/order-confirmation/[orderNumber]': '/order-confirmation/HAB-UNKNOWN',
};

const routes = [...new Set(Object.keys(manifest)
  .filter((key) => key.startsWith('/(public)/'))
  .map((key) => key.replace('/(public)', '').replace(/\/page$/, ''))
  .map((path) => path === '/' ? '/' : dynamicExamples[path] || (path.includes('[') ? null : path))
  .filter(Boolean))].sort();

function decodeText(text) {
  return text
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/\s+/g, ' ').trim();
}

function textBetween(html, tag) {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeText(match[1].replace(/<[^>]*>/g, ' ')) : '';
}

async function inspect(base, route) {
  try {
    const response = await fetch(new URL(route, base), { redirect: 'follow', signal: AbortSignal.timeout(20_000) });
    const html = response.ok ? await response.text() : '';
    return {
      status: response.status,
      title: textBetween(html, 'title'),
      h1: [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => decodeText(m[1].replace(/<[^>]*>/g, ' '))).filter(Boolean),
    };
  } catch (error) {
    return { status: 'ERROR', title: '', h1: [], error: error.name || 'FETCH_FAILED' };
  }
}

const routeDifferences = [];
for (let i = 0; i < routes.length; i += 4) {
  const batch = routes.slice(i, i + 4);
  const results = await Promise.all(batch.map(async (route) => ({
    route,
    local: await inspect(localBase, route),
    live: await inspect(liveBase, route),
  })));
  for (const result of results) {
    const fields = ['status', 'title', 'h1'];
    const changed = fields.filter((field) => JSON.stringify(result.local[field]) !== JSON.stringify(result.live[field]));
    if (changed.length) routeDifferences.push({ route: result.route, changed, local: result.local, live: result.live });
  }
}

async function getNavigation(base) {
  const response = await fetch(new URL('/api/navigation', base), { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`navigation API returned ${response.status}`);
  return response.json();
}

const [localNavigation, liveNavigation] = await Promise.all([getNavigation(localBase), getNavigation(liveBase)]);
const primaryHeader = (data) => data.header.filter((item) => !item.parent).map(({ label, href }) => `${label}|${href}`).sort();
const footerLinks = (data) => Object.values(data.footer).flat().map(({ label, href }) => `${label}|${href}`).sort();
function printSetDifference(label, localItems, liveItems) {
  const localSet = new Set(localItems);
  const liveSet = new Set(liveItems);
  const localOnly = [...localSet].filter((item) => !liveSet.has(item));
  const liveOnly = [...liveSet].filter((item) => !localSet.has(item));
  console.log(`${label}: local ${localItems.length}, live ${liveItems.length}, local-only ${localOnly.length}, live-only ${liveOnly.length}`);
  for (const item of localOnly.slice(0, 16)) console.log(`  LOCAL ONLY  ${item}`);
  for (const item of liveOnly.slice(0, 16)) console.log(`  LIVE ONLY   ${item}`);
  if (localOnly.length + liveOnly.length > 32) console.log('  (remaining link differences omitted)');
}

console.log(`Routes compared: ${routes.length}`);
console.log(`Routes with status/title/H1 differences: ${routeDifferences.length}`);
for (const difference of routeDifferences.slice(0, 30)) console.log(`  ${difference.route}: ${difference.changed.join(', ')}`);
if (routeDifferences.length > 30) console.log(`  (${routeDifferences.length - 30} additional route differences omitted)`);
printSetDifference('Top-level header navigation', primaryHeader(localNavigation), primaryHeader(liveNavigation));
printSetDifference('Footer navigation', footerLinks(localNavigation), footerLinks(liveNavigation));
console.log('\nScope limits: comparison is SSR-only; it does not verify visual layout, client hydration, image quality, or localized interaction.');

#!/usr/bin/env node

const baseUrl = new URL(process.env.HAB_AUDIT_BASE_URL || 'https://hab.touratbhutan.info');
const routeManifest = await import('../.next/server/app-paths-manifest.json', { with: { type: 'json' } });
const dynamicRouteExamples = {
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
  '/product/[code]': '/product/LHA01',
  '/shop/[craft]': '/shop/shingzo',
  '/order-confirmation/[orderNumber]': '/order-confirmation/HAB-UNKNOWN',
  '/pages/[slug]': '/pages/strategic-plan',
};

function collectPublicRoutes() {
  return Object.keys(routeManifest.default)
    .filter((route) => route.startsWith('/(public)/'))
    .map((route) => {
      const path = route.replace('/(public)', '').replace(/\/page$/, '');
      if (path === '/') return path;
      if (dynamicRouteExamples[path]) return dynamicRouteExamples[path];
      return path.includes('[') ? null : path;
    })
    .filter(Boolean);
}

function addUrl(urls, raw, pageUrl) {
  try {
    const resolved = new URL(raw, pageUrl);
    if (resolved.protocol === 'http:' || resolved.protocol === 'https:') urls.add(resolved.href);
  } catch {
    // Ignore malformed, data:, and non-URL image values.
  }
}

function imageUrlsFromHtml(html, pageUrl) {
  const urls = new Set();
  for (const match of html.matchAll(/<(?:img|source)\b[^>]*>/gi)) {
    const tag = match[0];
    for (const attribute of tag.matchAll(/\b(?:src|data-src|data-lazy-src)=["']([^"']+)["']/gi)) {
      addUrl(urls, attribute[1], pageUrl);
    }
    for (const attribute of tag.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
      for (const candidate of attribute[1].split(',')) {
        const raw = candidate.trim().split(/\s+/)[0];
        if (raw) addUrl(urls, raw, pageUrl);
      }
    }
  }
  for (const match of html.matchAll(/style=["'][^"']*url\((["']?)([^)"']+)\1\)[^"']*["']/gi)) {
    addUrl(urls, match[2], pageUrl);
  }
  return urls;
}

async function fetchHtml(path) {
  const url = new URL(path, baseUrl);
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000), redirect: 'follow' });
  if (!response.ok) return { path, status: response.status, html: '' };
  return { path, status: response.status, html: await response.text() };
}

async function checkAsset(url) {
  const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(12_000), redirect: 'follow' });
  return response.status;
}

const routes = collectPublicRoutes();
const pageResults = [];
for (let index = 0; index < routes.length; index += 5) {
  pageResults.push(...await Promise.all(routes.slice(index, index + 5).map(fetchHtml)));
}

const images = new Map();
const imagePages = new Map();
for (const page of pageResults) {
  const pageUrl = new URL(page.path, baseUrl).href;
  for (const imageUrl of imageUrlsFromHtml(page.html, pageUrl)) {
    images.set(imageUrl, (images.get(imageUrl) || 0) + 1);
    if (!imagePages.has(imageUrl)) imagePages.set(imageUrl, new Set());
    imagePages.get(imageUrl).add(page.path);
  }
}

const sameOrigin = [...images.keys()].filter((url) => new URL(url).origin === baseUrl.origin);
const externalCount = images.size - sameOrigin.length;
const failures = [];
for (let index = 0; index < sameOrigin.length; index += 10) {
  const batch = sameOrigin.slice(index, index + 10);
  const results = await Promise.all(batch.map(async (url) => {
    try {
      return { url, status: await checkAsset(url) };
    } catch (error) {
      return { url, status: error.name || 'REQUEST_FAILED' };
    }
  }));
  failures.push(...results.filter((result) => typeof result.status !== 'number' || result.status < 200 || result.status >= 400));
}

console.log(`Pages fetched: ${pageResults.length}; non-200 pages: ${pageResults.filter((page) => page.status !== 200).length}`);
console.log(`Unique rendered image/media URLs: ${images.size}; same-origin checked: ${sameOrigin.length}; external URLs skipped: ${externalCount}`);
if (failures.length) {
  console.error('Failed same-origin image/media URLs:');
  for (const failure of failures) {
    console.error(`${failure.status} ${failure.url}`);
    console.error(`  pages: ${[...(imagePages.get(failure.url) || [])].join(', ')}`);
  }
  process.exitCode = 1;
} else {
  console.log('No broken same-origin rendered image/media URLs detected in the fetched HTML. CSS-only and client-only images were not covered.');
}

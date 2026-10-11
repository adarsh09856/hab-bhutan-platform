#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const baseUrl = new URL(process.env.HAB_AUDIT_BASE_URL || 'https://hab.touratbhutan.info');
const publicPagesRoot = fileURLToPath(new URL('../src/app/(public)/', import.meta.url));
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
};
const publicMediaApis = [
  '/api/products?limit=1000&shuffle=false', '/api/outlets?shuffle=false',
  '/api/crafts', '/api/projects', '/api/hero-slides', '/api/news',
  '/api/events', '/api/members', '/api/publications',
];
const imageFields = new Set([
  'image', 'imageUrl', 'image_url', 'image_path', 'photoUrl', 'portraitUrl',
  'coverPhotoUrl', 'coverImageUrl', 'bannerUrl', 'thumbnailUrl', 'logoUrl',
]);
const imageCollections = new Set(['images', 'galleryImages', 'photos', 'slides']);

function collectPublicRoutes() {
  const pageFiles = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const child = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(child);
      else if (entry.isFile() && entry.name === 'page.tsx') pageFiles.push(child);
    }
  };
  visit(publicPagesRoot);
  return pageFiles
    .map((file) => `/${path.relative(publicPagesRoot, path.dirname(file)).split(path.sep).filter(Boolean).join('/')}`)
    .map((route) => dynamicRouteExamples[route] || (route.includes('[') ? null : route))
    .filter(Boolean);
}

async function discoverLinkedCustomPages() {
  try {
    const response = await fetch(new URL('/api/navigation', baseUrl), { signal: AbortSignal.timeout(12_000) });
    if (!response.ok) return [];
    const navigation = await response.json();
    const links = [...(navigation.header || []), ...(navigation.footer || [])];
    return links
      .map((item) => String(item.href || '').split(/[?#]/)[0])
      .filter((href) => /^\/pages\/[a-z0-9-]+$/i.test(href));
  } catch {
    return [];
  }
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

function stylesheetUrlsFromHtml(html, pageUrl) {
  const urls = new Set();
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/\brel=["'][^"']*stylesheet/i.test(tag)) continue;
    const href = tag.match(/\bhref=["']([^"']+)['"]/i)?.[1];
    if (href) addUrl(urls, href, pageUrl);
  }
  return urls;
}

function imageUrlsFromCss(css, stylesheetUrl) {
  const urls = new Set();
  for (const match of css.matchAll(/url\(\s*(["']?)([^)'"\s]+)\1\s*\)/gi)) {
    const raw = match[2];
    if (/\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#]|$)/i.test(raw)) addUrl(urls, raw, stylesheetUrl);
  }
  return urls;
}

function imageUrlsFromApi(value, apiUrl, urls, insideImageCollection = false) {
  if (Array.isArray(value)) {
    for (const item of value) imageUrlsFromApi(item, apiUrl, urls, insideImageCollection);
    return;
  }
  if (!value || typeof value !== 'object') {
    if (insideImageCollection && typeof value === 'string' && /^(?:\/(?!\/)|https?:\/\/)/i.test(value)) addUrl(urls, value, apiUrl);
    return;
  }
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'string') {
      if ((imageFields.has(key) || (insideImageCollection && key === 'url')) && /^(?:\/(?!\/)|https?:\/\/)/i.test(item)) addUrl(urls, item, apiUrl);
    } else if (Array.isArray(item) || (item && typeof item === 'object')) {
      imageUrlsFromApi(item, apiUrl, urls, imageCollections.has(key));
    }
  }
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

async function fetchStylesheet(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000), redirect: 'follow' });
  return response.ok ? await response.text() : '';
}

const routes = [...new Set([...collectPublicRoutes(), ...await discoverLinkedCustomPages()])];
if (routes.length < 30) throw new Error(`Public route audit discovered only ${routes.length} routes; refusing an incomplete pass.`);
const pageResults = [];
for (let index = 0; index < routes.length; index += 5) {
  pageResults.push(...await Promise.all(routes.slice(index, index + 5).map(fetchHtml)));
}

const images = new Map();
const imagePages = new Map();
const stylesheets = new Map();
for (const page of pageResults) {
  const pageUrl = new URL(page.path, baseUrl).href;
  for (const imageUrl of imageUrlsFromHtml(page.html, pageUrl)) {
    images.set(imageUrl, (images.get(imageUrl) || 0) + 1);
    if (!imagePages.has(imageUrl)) imagePages.set(imageUrl, new Set());
    imagePages.get(imageUrl).add(page.path);
  }
  for (const stylesheetUrl of stylesheetUrlsFromHtml(page.html, pageUrl)) {
    if (new URL(stylesheetUrl).origin === baseUrl.origin) stylesheets.set(stylesheetUrl, page.path);
  }
}

const apiFailures = [];
for (const apiPath of publicMediaApis) {
  const apiUrl = new URL(apiPath, baseUrl);
  try {
    const response = await fetch(apiUrl, { signal: AbortSignal.timeout(20_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data?.success) throw new Error(data?.error || 'API returned unsuccessful result');
    const urls = new Set();
    imageUrlsFromApi(data, apiUrl.href, urls);
    for (const url of urls) {
      images.set(url, (images.get(url) || 0) + 1);
      if (!imagePages.has(url)) imagePages.set(url, new Set());
      imagePages.get(url).add(`API ${apiPath}`);
    }
  } catch (error) {
    apiFailures.push(`${apiPath}: ${error.message || error}`);
  }
}

for (const [stylesheetUrl, pagePath] of stylesheets) {
  try {
    const css = await fetchStylesheet(stylesheetUrl);
    for (const imageUrl of imageUrlsFromCss(css, stylesheetUrl)) {
      images.set(imageUrl, (images.get(imageUrl) || 0) + 1);
      if (!imagePages.has(imageUrl)) imagePages.set(imageUrl, new Set());
      imagePages.get(imageUrl).add(`${pagePath} (stylesheet)`);
    }
  } catch (error) {
    console.error(`Stylesheet fetch failed (${error.name || 'REQUEST_FAILED'}): ${stylesheetUrl}`);
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

const non200Pages = pageResults.filter((page) => page.status !== 200);
console.log(`Pages fetched: ${pageResults.length}; non-200 pages: ${non200Pages.length}`);
for (const page of non200Pages) console.error(`Page request failed: ${page.status} ${page.path}`);
console.log(`Public media APIs checked: ${publicMediaApis.length}; failed APIs: ${apiFailures.length}`);
for (const failure of apiFailures) console.error(`API request failed: ${failure}`);
console.log(`Unique rendered and CSS image URLs: ${images.size}; same-origin checked: ${sameOrigin.length}; external URLs skipped: ${externalCount}; same-origin stylesheets scanned: ${stylesheets.size}`);
if (failures.length) {
  console.error('Failed same-origin image/media URLs:');
  for (const failure of failures) {
    console.error(`${failure.status} ${failure.url}`);
    console.error(`  pages: ${[...(imagePages.get(failure.url) || [])].join(', ')}`);
  }
  process.exitCode = 1;
} else {
  console.log('No broken same-origin image URLs detected in the fetched HTML, linked CSS, or public media APIs. External-host and other client-only images were not covered.');
}
if (non200Pages.length || apiFailures.length) process.exitCode = 1;

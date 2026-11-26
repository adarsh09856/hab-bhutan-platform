import { loadEnvConfig } from '@next/env';
import prisma from '../src/lib/prisma';
import { sendEmail } from '../src/lib/email-service';
import { bhutanDayStartUtc } from '../src/lib/trader-expiry';

loadEnvConfig(process.cwd());

type PublicProduct = { code?: unknown; name?: unknown };

const SITE_URL = (process.env.HAB_PUBLIC_URL || 'https://handicraftsbhutan.org').replace(/\/+$/, '');
const CONCURRENCY = 4;
const MAX_PUBLIC_PAGES = 500;
const DRY_RUN = process.env.LINK_CHECK_DRY_RUN === '1';

type LinkCheck = { url: string; status: number; kind: 'page' | 'file' };

function normalizePublicLink(href: string, fromUrl: string): string | null {
  try {
    const target = new URL(href.replace(/&amp;/g, '&'), fromUrl);
    const base = new URL(SITE_URL);
    if (!['http:', 'https:'].includes(target.protocol) || target.origin !== base.origin) return null;
    if (/^\/(?:api|admin|_next)(?:\/|$)/i.test(target.pathname) || target.pathname === '/cdn-cgi/l/email-protection') return null;
    target.search = '';
    target.hash = '';
    if (target.pathname.length > 1) target.pathname = target.pathname.replace(/\/+$/, '');
    return target.toString();
  } catch {
    return null;
  }
}

function extractPublicLinks(html: string, pageUrl: string): string[] {
  const links = new Set<string>();
  const hrefPattern = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;
  for (const match of html.matchAll(hrefPattern)) {
    const href = match[1] || match[2] || match[3] || '';
    const normalized = normalizePublicLink(href, pageUrl);
    if (normalized) links.add(normalized);
  }
  return [...links];
}

async function checkPublicLink(url: string): Promise<{ check: LinkCheck; links: string[] }> {
  const path = new URL(url).pathname;
  const isFile = /\.(?:pdf|docx?|xlsx?|zip)$/i.test(path);
  try {
    const response = await fetch(url, {
      method: isFile ? 'HEAD' : 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
      headers: { Accept: isFile ? '*/*' : 'text/html,application/xhtml+xml' },
    });
    if (isFile && [405, 501].includes(response.status)) {
      const retry = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(20000),
        headers: { Accept: '*/*', Range: 'bytes=0-0' },
      });
      return { check: { url, status: retry.status, kind: 'file' }, links: [] };
    }
    const kind = isFile ? 'file' : 'page';
    if (!response.ok || isFile || !response.headers.get('content-type')?.toLowerCase().includes('html')) {
      return { check: { url, status: response.status, kind }, links: [] };
    }
    const html = await response.text();
    return { check: { url, status: response.status, kind }, links: extractPublicLinks(html, response.url || url) };
  } catch {
    return { check: { url, status: 0, kind: isFile ? 'file' : 'page' }, links: [] };
  }
}

async function checkPublicSite(): Promise<{ results: LinkCheck[]; limitReached: boolean }> {
  const start = new URL('/', SITE_URL).toString();
  const queued = new Set([start]);
  const checked = new Set<string>();
  const queue = [start];
  const results: LinkCheck[] = [];
  let limitReached = false;

  while (queue.length && checked.size < MAX_PUBLIC_PAGES) {
    const batch = queue.splice(0, Math.min(CONCURRENCY, MAX_PUBLIC_PAGES - checked.size));
    const batchResults = await Promise.all(batch.map((url) => checkPublicLink(url)));
    for (let index = 0; index < batch.length; index++) {
      checked.add(batch[index]);
      const result = batchResults[index];
      results.push(result.check);
      for (const link of result.links) {
        if (queued.has(link)) continue;
        if (queued.size >= MAX_PUBLIC_PAGES) {
          limitReached = true;
        } else {
          queued.add(link);
          queue.push(link);
        }
      }
    }
  }

  return { results, limitReached };
}

async function checkProduct(product: PublicProduct) {
  const code = String(product.code || '').trim();
  if (!code) return { code: '(missing SKU)', name: String(product.name || ''), status: 0, url: SITE_URL };
  const url = `${SITE_URL}/product/${encodeURIComponent(code)}`;
  try {
    // Product routes render their shell client-side and may return HTTP 200
    // even when the SKU lookup later fails. Check the public detail endpoint
    // so the scheduled report reflects the same lookup the page depends on.
    const response = await fetch(`${SITE_URL}/api/products/${encodeURIComponent(code)}`, {
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return { code, name: String(product.name || ''), status: response.status, url };
    const payload = await response.json() as { success?: boolean; product?: { code?: string } };
    const matchesProduct = payload.success === true && String(payload.product?.code || '').toLowerCase() === code.toLowerCase();
    return { code, name: String(product.name || ''), status: matchesProduct ? response.status : 502, url };
  } catch {
    return { code, name: String(product.name || ''), status: 0, url };
  }
}

async function main() {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: 'default' },
    select: { secretaryEmail: true, officialEmail: true },
  });
  const recipient = String(setting?.secretaryEmail || setting?.officialEmail || '').trim();
  if (!recipient) throw new Error('No Secretariat or official email address is configured in Site Settings.');

  const now = new Date();
  const expiredTraders = await prisma.traderRecord.findMany({
    where: { isVisible: true, expiresAt: { lt: bhutanDayStartUtc(now) }, expiryNoticeSentAt: null },
    select: { id: true, shopName: true, registrationNumber: true, expiresAt: true },
    orderBy: { expiresAt: 'asc' },
  });
  if (expiredTraders.length) {
    if (DRY_RUN) {
      console.log(JSON.stringify({ expiredTraderNotices: expiredTraders.length, dryRun: true }));
    } else {
      const expiryEmail = await sendEmail({
        to: recipient,
        subject: `HAB trader accreditation expired (${expiredTraders.length})`,
        body: `The following trader listings have expired and are hidden from the public directory:\n\n${expiredTraders.map((trader) => `${trader.shopName} · ${trader.registrationNumber} · expired ${trader.expiresAt.toISOString().slice(0, 10)}`).join('\n')}\n\nReview the records in Admin → Accredited Traders.`,
        templateKey: 'trader_expiry_notice',
        auditEntityType: 'TraderRecord',
        auditEntityId: expiredTraders.map((trader) => trader.id).join(','),
      });
      if (!expiryEmail.success) throw new Error(expiryEmail.error || 'Expired trader notice email was not delivered.');
      await prisma.traderRecord.updateMany({
        where: { id: { in: expiredTraders.map((trader) => trader.id) }, expiryNoticeSentAt: null },
        data: { expiryNoticeSentAt: now },
      });
    }
  }

  const bhutanWeekday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Asia/Thimphu' }).format(now);
  if (bhutanWeekday !== 'Mon' && process.env.LINK_CHECK_FORCE_REPORT !== '1') {
    console.log(JSON.stringify({ expiredTraderNotices: expiredTraders.length, linkReport: 'not scheduled today' }));
    return;
  }

  const catalogueResponse = await fetch(`${SITE_URL}/api/products`, { cache: 'no-store', signal: AbortSignal.timeout(20000) });
  if (!catalogueResponse.ok) throw new Error(`Public catalogue returned HTTP ${catalogueResponse.status}`);
  const catalogue = await catalogueResponse.json() as { success?: boolean; products?: PublicProduct[] };
  if (!catalogue.success || !Array.isArray(catalogue.products)) throw new Error('Public catalogue response was not successful.');

  const results: Awaited<ReturnType<typeof checkProduct>>[] = [];
  for (let index = 0; index < catalogue.products.length; index += CONCURRENCY) {
    const group = catalogue.products.slice(index, index + CONCURRENCY);
    results.push(...await Promise.all(group.map(checkProduct)));
  }

  const publicSite = await checkPublicSite();
  const brokenProducts = results.filter((item) => item.status < 200 || item.status >= 300);
  const brokenPages = publicSite.results.filter((item) => item.status < 200 || item.status >= 300);
  const brokenCount = brokenProducts.length + brokenPages.length;
  const checkedAt = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Thimphu',
  }).format(new Date());
  const details = [
    ...brokenProducts.map((item) => `- Product ${item.code}${item.name ? ` · ${item.name}` : ''}: ${item.status || 'unreachable'} · ${item.url}`),
    ...brokenPages.map((item) => `- Public ${item.kind}: ${item.status || 'unreachable'} · ${item.url}`),
  ].join('\n') || 'No broken same-origin public links or published product links were found.';

  const subject = `HAB weekly website link check: ${brokenCount} issue${brokenCount === 1 ? '' : 's'}`;
  const body = [
    'HAB weekly public website link check',
    `Checked: ${checkedAt} (Bhutan time)`,
    `Public pages/files checked: ${publicSite.results.length}${publicSite.limitReached ? ` (crawl limit ${MAX_PUBLIC_PAGES} reached)` : ''}`,
    `Published products checked: ${results.length}`,
    `Broken or unreachable public links: ${brokenCount}`,
    '',
    details,
  ].join('\n');
  if (DRY_RUN) {
    console.log(JSON.stringify({ publicLinksChecked: publicSite.results.length, productsChecked: results.length, broken: brokenCount, recipient, delivered: false, dryRun: true, report: body }));
    return;
  }

  const email = await sendEmail({ to: recipient, subject, body, templateKey: 'weekly_product_link_check' });
  if (!email.success) throw new Error(email.error || 'Weekly report email was not delivered.');

  console.log(JSON.stringify({ publicLinksChecked: publicSite.results.length, productsChecked: results.length, broken: brokenCount, recipient, delivered: true }));
  if (brokenCount) process.exitCode = 1;
}

main().catch((error) => {
  console.error('[weekly-product-link-check]', error instanceof Error ? error.message : 'Unknown error');
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});

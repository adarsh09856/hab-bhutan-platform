import 'dotenv/config';
import prisma from '../src/lib/prisma';
import { sendEmail } from '../src/lib/email-service';

type PublicProduct = { code?: unknown; name?: unknown };

const SITE_URL = (process.env.HAB_PUBLIC_URL || 'https://hab.touratbhutan.info').replace(/\/+$/, '');
const CONCURRENCY = 4;

async function checkProduct(product: PublicProduct) {
  const code = String(product.code || '').trim();
  if (!code) return { code: '(missing SKU)', name: String(product.name || ''), status: 0, url: SITE_URL };
  const url = `${SITE_URL}/product/${encodeURIComponent(code)}`;
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(20000) });
    return { code, name: String(product.name || ''), status: response.status, url };
  } catch {
    return { code, name: String(product.name || ''), status: 0, url };
  }
}

async function main() {
  const catalogueResponse = await fetch(`${SITE_URL}/api/products`, { cache: 'no-store', signal: AbortSignal.timeout(20000) });
  if (!catalogueResponse.ok) throw new Error(`Public catalogue returned HTTP ${catalogueResponse.status}`);
  const catalogue = await catalogueResponse.json() as { success?: boolean; products?: PublicProduct[] };
  if (!catalogue.success || !Array.isArray(catalogue.products)) throw new Error('Public catalogue response was not successful.');

  const results: Awaited<ReturnType<typeof checkProduct>>[] = [];
  for (let index = 0; index < catalogue.products.length; index += CONCURRENCY) {
    const group = catalogue.products.slice(index, index + CONCURRENCY);
    results.push(...await Promise.all(group.map(checkProduct)));
  }

  const broken = results.filter((item) => item.status < 200 || item.status >= 300);
  const checkedAt = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Thimphu',
  }).format(new Date());
  const details = broken.length
    ? broken.map((item) => `- ${item.code}${item.name ? ` · ${item.name}` : ''}: ${item.status || 'unreachable'} · ${item.url}`).join('\n')
    : 'No broken published product links were found.';

  const setting = await prisma.siteSetting.findUnique({
    where: { id: 'default' },
    select: { secretaryEmail: true, officialEmail: true },
  });
  const recipient = String(setting?.secretaryEmail || setting?.officialEmail || '').trim();
  if (!recipient) throw new Error('No Secretariat or official email address is configured in Site Settings.');

  const subject = `HAB weekly product link check: ${broken.length} issue${broken.length === 1 ? '' : 's'}`;
  const body = [
    'HAB weekly published-product link check',
    `Checked: ${checkedAt} (Bhutan time)`,
    `Working links: ${results.length - broken.length}`,
    `Broken or unreachable links: ${broken.length}`,
    '',
    details,
  ].join('\n');
  if (process.env.LINK_CHECK_DRY_RUN === '1') {
    console.log(JSON.stringify({ checked: results.length, broken: broken.length, recipient, delivered: false, dryRun: true, report: body }));
    return;
  }

  const email = await sendEmail({ to: recipient, subject, body, templateKey: 'weekly_product_link_check' });
  if (!email.success) throw new Error(email.error || 'Weekly report email was not delivered.');

  console.log(JSON.stringify({ checked: results.length, broken: broken.length, recipient, delivered: true }));
  if (broken.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error('[weekly-product-link-check]', error instanceof Error ? error.message : 'Unknown error');
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});

import { PrismaClient } from '@prisma/client';

const liveBase = new URL(process.env.HAB_LIVE_BASE_URL || 'https://hab.touratbhutan.info');
const apply = process.argv.includes('--apply');
const databaseUrl = process.env.DATABASE_URL || '';
let databaseHost;
try {
  databaseHost = new URL(databaseUrl).hostname;
} catch {
  throw new Error('DATABASE_URL must point to an explicit local PostgreSQL instance.');
}
if (!['localhost', '127.0.0.1', '::1'].includes(databaseHost)) {
  throw new Error(`Refusing to write navigation to non-local database host: ${databaseHost}`);
}

const response = await fetch(new URL('/api/navigation', liveBase), { signal: AbortSignal.timeout(15_000) });
if (!response.ok) throw new Error(`Live navigation API returned ${response.status}; nothing changed.`);
const live = await response.json();
const desired = [
  ...live.header.map((item, index) => ({
    menuType: 'HEADER', column: null, label: String(item.label), href: String(item.href),
    parent: item.parent || null, sortOrder: Number(item.sortOrder ?? index),
    isActive: true, isExternal: Boolean(item.isExternal),
  })),
  ...Object.entries(live.footer).flatMap(([column, items]) => items.map((item, index) => ({
    menuType: 'FOOTER', column, label: String(item.label), href: String(item.href),
    parent: null, sortOrder: Number(item.sortOrder ?? index),
    isActive: true, isExternal: Boolean(item.isExternal),
  }))),
];
if (!desired.length || desired.some((item) => !item.label || !item.href || item.href.startsWith('javascript:'))) {
  throw new Error('Live navigation payload failed validation; nothing changed.');
}

const prisma = new PrismaClient();
const signature = (item) => [item.menuType, item.column || '', item.label, item.href, item.parent || ''].join('\u001f');
try {
  const current = await prisma.navigationItem.findMany({ where: { menuType: { in: ['HEADER', 'FOOTER'] } } });
  const currentActive = current.filter((item) => item.isActive);
  const desiredSignatures = new Set(desired.map(signature));
  const currentActiveSignatures = new Set(currentActive.map(signature));
  const toDeactivate = currentActive.filter((item) => !desiredSignatures.has(signature(item)));
  const toCreateOrUpdate = desired.filter((item) => !currentActiveSignatures.has(signature(item))
    || !currentActive.some((old) => signature(old) === signature(item) && old.sortOrder === item.sortOrder && old.isExternal === item.isExternal));

  console.log(`Local active navigation: ${currentActive.length}; live target: ${desired.length}`);
  console.log(`Would retain as inactive: ${toDeactivate.length}; would create/update: ${toCreateOrUpdate.length}`);
  for (const item of toDeactivate) console.log(`  INACTIVE (retained): ${item.menuType} ${item.label} -> ${item.href}`);
  for (const item of toCreateOrUpdate) console.log(`  UPSERT: ${item.menuType} ${item.label} -> ${item.href}`);
  if (!apply) {
    console.log('Dry run only. Pass --apply to update the guarded local database; live data is never written.');
    process.exitCode = 0;
  } else {
    await prisma.$transaction(async (tx) => {
      for (const item of desired) {
        const match = current.find((old) => signature(old) === signature(item));
        if (match) {
          await tx.navigationItem.update({ where: { id: match.id }, data: { ...item, isActive: true } });
        } else {
          await tx.navigationItem.create({ data: item });
        }
      }
      if (toDeactivate.length) {
        await tx.navigationItem.updateMany({
          where: { id: { in: toDeactivate.map((item) => item.id) } },
          data: { isActive: false },
        });
      }
    });
    const activeAfter = await prisma.navigationItem.findMany({
      where: { menuType: { in: ['HEADER', 'FOOTER'] }, isActive: true },
    });
    const actualSignatures = new Set(activeAfter.map(signature));
    const missing = desired.filter((item) => !actualSignatures.has(signature(item)));
    const unexpected = activeAfter.filter((item) => !desiredSignatures.has(signature(item)));
    if (missing.length || unexpected.length) throw new Error(`Post-sync verification failed: ${missing.length} missing, ${unexpected.length} extra.`);
    console.log(`Verified local active navigation now matches the live API: ${activeAfter.length} entries. Inactive history is retained.`);
  }
} finally {
  await prisma.$disconnect();
}

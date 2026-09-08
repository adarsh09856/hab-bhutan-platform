import { PrismaClient } from '@prisma/client';

const targetUrl = process.argv[2] || process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL;

if (!targetUrl) {
  console.error('Usage: node scripts/audit-check.mjs [DATABASE_URL]');
  process.exit(1);
}

const isLocalhost = targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1');

console.log('====================================================');
console.log(`🔍 AUDIT LOG INCIDENT INSPECTION TOOL`);
console.log(`Target Environment: ${isLocalhost ? '⚠️ LOCAL DEVELOPMENT DB' : '🌐 PRODUCTION DEPLOYED POSTGRESQL'}`);
console.log(`Database Host: ${targetUrl.replace(/:[^:@]+@/, ':****@')}`);
console.log('====================================================\n');

const prisma = new PrismaClient({
  datasources: {
    db: { url: targetUrl }
  }
});

async function main() {
  const totalCount = await prisma.auditLog.count();
  console.log(`Total Audit Records in Table: ${totalCount}`);

  // Summary by Action
  const actions = await prisma.auditLog.groupBy({
    by: ['action'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });
  console.log('\nAudit Actions Summary:');
  for (const a of actions) {
    console.log(`  - ${a.action.padEnd(28)} : ${a._count.id} events`);
  }

  // Summary by Actor IP
  const ips = await prisma.auditLog.groupBy({
    by: ['actorIp'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });
  console.log('\nActor IP Distribution:');
  for (const ip of ips) {
    console.log(`  - ${(ip.actorIp || 'NULL / System').padEnd(28)} : ${ip._count.id} events`);
  }

  // Check specifically for LOGIN or AUTH events
  const authEvents = await prisma.auditLog.findMany({
    where: {
      action: { in: ['LOGIN', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'ADMIN_LOGIN', 'SESSION_REVOKED'] }
    },
    orderBy: { createdAt: 'desc' }
  });
  console.log(`\nAuthentication Events Count: ${authEvents.length}`);
  for (const evt of authEvents) {
    console.log(`  [${evt.createdAt.toISOString()}] Action: ${evt.action}, Actor: ${evt.actorIdentifier || evt.actorId}, IP: ${evt.actorIp}`);
  }

  // Check any non-local IPs across all records
  const externalIps = await prisma.auditLog.findMany({
    where: {
      NOT: [
        { actorIp: '127.0.0.1' },
        { actorIp: '::1' },
        { actorIp: null }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('\n----------------------------------------------------');
  if (externalIps.length === 0) {
    console.log('✅ ZERO External IP events found in this database instance.');
  } else {
    console.log(`⚠️ ALERT: ${externalIps.length} records originated from non-local IP addresses:`);
    for (const record of externalIps) {
      console.log(`  [${record.createdAt.toISOString()}] ${record.action} by ${record.actorIdentifier || record.actorId} (IP: ${record.actorIp})`);
    }
  }
  console.log('----------------------------------------------------\n');
}

main().catch(err => {
  console.error('Audit inspection error:', err);
  process.exit(1);
}).finally(() => prisma.$disconnect());

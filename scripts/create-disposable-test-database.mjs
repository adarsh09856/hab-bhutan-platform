import { PrismaClient } from '@prisma/client';
import { validateTestDatabaseUrl } from './lib/safe-test-database.mjs';

const target = new URL(validateTestDatabaseUrl(process.env.TEST_DATABASE_URL));
const databaseName = decodeURIComponent(target.pathname.slice(1));
if (!/^[a-z0-9_-]+$/i.test(databaseName)) throw new Error('Test database name contains unsupported characters.');
target.pathname = '/postgres';
const prisma = new PrismaClient({ datasources: { db: { url: target.toString() } } });
try {
  await prisma.$executeRawUnsafe(`CREATE DATABASE "${databaseName}" WITH ENCODING 'UTF8' TEMPLATE template0`);
  console.log(`Created isolated UTF-8 database ${databaseName} on loopback.`);
} finally {
  await prisma.$disconnect();
}

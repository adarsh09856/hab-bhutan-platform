import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');
const reference = require('../src/lib/client-data.json');
const prisma = new PrismaClient();

try {
  for (const craft of reference.crafts) {
    const current = await prisma.craft.findUnique({ where: { key: craft.key } });
    if (!current) continue;
    const data = {};
    if (!current.longDescription && craft.long_description) data.longDescription = craft.long_description;
    if (!current.typicalProducts && craft.typical_products) data.typicalProducts = craft.typical_products;
    if (!current.history && craft.history) data.history = craft.history;
    if (Object.keys(data).length === 0) continue;
    await prisma.craft.update({ where: { key: craft.key }, data });
    console.log(`${craft.key}: filled ${Object.keys(data).join(', ')}`);
  }
} finally {
  await prisma.$disconnect();
}

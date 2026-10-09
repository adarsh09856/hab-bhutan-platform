import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import assert from 'node:assert/strict';

nextEnv.loadEnvConfig(process.cwd(), true);
const base = process.env.GOVERNANCE_TEST_URL || 'http://127.0.0.1:3039';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Only local HTTP servers are permitted.');
assert(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname), 'Only a local database is permitted.');
const prisma = new PrismaClient();
let fixture;
try {
  fixture = await prisma.governanceRecord.create({ data: {
    category: 'BOARD_OF_TRUSTEES', roleTitle: 'Local display verification',
    individualName: `Local verification ${Date.now()}`,
    chapterOrNote: 'Local test note||photo:/assets/photos/hero-1-weaving.jpg',
    photoUrl: '/assets/photos/about-hab.jpg', bio: 'Temporary local biography.', sortOrder: 9999,
  }});
  const response = await fetch(`${base}/api/governance`);
  assert.equal(response.status, 200);
  const data = await response.json();
  const person = data.board.find(row => row.name === fixture.individualName);
  assert.equal(person.photo, fixture.photoUrl, 'Saved portrait must take priority over legacy photo notes.');
  assert.equal(person.bio, fixture.bio);
  assert.equal(person.note, 'Local test note', 'Internal legacy photo syntax must not appear in public notes.');
  const html = await (await fetch(`${base}/board-of-trustees`)).text();
  assert(html.includes(fixture.individualName) && html.includes(fixture.bio), 'Saved board member must render publicly.');
  console.log('PASS: saved board name, portrait, biography and clean note reach public API/page.');
} finally {
  if (fixture) await prisma.governanceRecord.delete({ where: { id: fixture.id } });
  await prisma.$disconnect();
}

import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import assert from 'node:assert/strict';

nextEnv.loadEnvConfig(process.cwd(), true);
const base = process.env.GOVERNANCE_TEST_URL || 'http://127.0.0.1:3039';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Only local HTTP servers are permitted.');
assert(['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname), 'Only a local database is permitted.');
const prisma = new PrismaClient();
let fixture;
let unnamedFixture;
let unnamedSecretariatFixture;
try {
  unnamedFixture = await prisma.governanceRecord.create({ data: {
    category: 'BOARD_OF_TRUSTEES', roleTitle: `Unconfirmed role ${Date.now()}`,
    individualName: 'Name to confirm', chapterOrNote: 'Role awaiting confirmation', sortOrder: 9998,
  }});
  unnamedSecretariatFixture = await prisma.governanceRecord.create({ data: {
    category: 'SECRETARIAT', roleTitle: `Unconfirmed staff role ${Date.now()}`,
    individualName: 'Name to confirm', chapterOrNote: 'Staff role awaiting confirmation', sortOrder: 9997,
    phone: '+975-17654321', email: 'private.secretariat.fixture@example.test',
    photoUrl: '/uploads/private-secretariat-fixture.jpg', bio: 'SECRETARIAT_PRIVATE_BIO_FIXTURE',
  }});
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
  assert(html.includes(unnamedFixture.roleTitle) && html.includes('Name to be confirmed'), 'Unnamed saved trustee roles must remain visible.');
  const secretariatHtml = await (await fetch(`${base}/secretariat`)).text();
  assert(secretariatHtml.includes(unnamedSecretariatFixture.roleTitle), 'Unnamed saved Secretariat roles must remain visible.');
  assert(secretariatHtml.includes('Name to be confirmed'), 'Unconfirmed Secretariat staff must not be assigned invented names.');
  for (const privateValue of [unnamedSecretariatFixture.phone, unnamedSecretariatFixture.email, unnamedSecretariatFixture.photoUrl, unnamedSecretariatFixture.bio]) {
    assert(!secretariatHtml.includes(privateValue), 'Unconfirmed Secretariat staff contact details, photos and bios must not render publicly.');
  }
  const members = await prisma.member.findMany({ where: { status: 'VERIFIED' }, select: { name: true, regNumber: true } });
  const memberHtml = await (await fetch(`${base}/members`)).text();
  for (const member of members) {
    assert(memberHtml.includes(member.name.replaceAll('&', '&amp;')), 'Verified registry member must appear in directory.');
    assert(memberHtml.includes(encodeURIComponent(member.regNumber)), 'Member profile link must use registered number.');
  }
  console.log(`PASS: unnamed trustee roles and ${members.length} verified registry members render publicly.`);
  console.log('PASS: unnamed saved Secretariat roles render without names or private staff details.');
  console.log('PASS: saved board name, portrait, biography and clean note reach public API/page.');
} finally {
  if (fixture) await prisma.governanceRecord.delete({ where: { id: fixture.id } });
  if (unnamedFixture) await prisma.governanceRecord.delete({ where: { id: unnamedFixture.id } });
  if (unnamedSecretariatFixture) await prisma.governanceRecord.delete({ where: { id: unnamedSecretariatFixture.id } });
  await prisma.$disconnect();
}

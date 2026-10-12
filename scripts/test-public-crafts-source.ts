import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { GET } from '../src/app/api/crafts/route';

async function main() {
  const originalFindMany = prisma.craft.findMany;
  const originalFindFirst = prisma.craft.findFirst;
  try {
    (prisma.craft as any).findMany = async () => [];
    (prisma.craft as any).findFirst = async () => null;

    const empty = await GET(new NextRequest('http://localhost/api/crafts'));
    assert.equal(empty.status, 200);
    assert.deepEqual((await empty.json()).crafts, []);

    const missing = await GET(new NextRequest('http://localhost/api/crafts?key=thagzo'));
    assert.equal(missing.status, 200);
    assert.equal((await missing.json()).craft, null);

    (prisma.craft as any).findMany = async () => [{
      key: 'thagzo', name: 'Saved craft', english: 'Saved weaving', dzongkha: '',
      description: 'Saved description', descriptionDz: 'ལག་བཟོའི་གསལ་བཤད།',
      longDescription: 'Saved long description', longDescriptionDz: 'ལག་བཟོའི་རྒྱས་བཤད།',
      typicalProducts: null, history: 'Saved history', historyDz: 'ལོ་རྒྱུས།',
      bannerUrl: null, isActive: true, sortOrder: 1,
    }, {
      key: 'dozo', name: 'Masonry', english: 'Masonry', dzongkha: '',
      description: 'Masonry description', descriptionDz: null, longDescription: null,
      longDescriptionDz: null, typicalProducts: null, history: null, historyDz: null,
      bannerUrl: null, isActive: true, sortOrder: 2,
    }, {
      key: 'shingzo', name: 'Carpentry', english: 'Carpentry', dzongkha: '',
      description: 'Carpentry description', descriptionDz: null, longDescription: null,
      longDescriptionDz: null, typicalProducts: null, history: null, historyDz: null,
      bannerUrl: '/uploads/approved-carpentry.webp', isActive: true, sortOrder: 3,
    }];
    const saved = await GET(new NextRequest('http://localhost/api/crafts'));
    const body = await saved.json();
    assert.equal(body.crafts[0].name, 'Saved craft');
    assert.equal(body.crafts[0].description, 'Saved description');
    assert.equal(body.crafts[0].descriptionDz, 'ལག་བཟོའི་གསལ་བཤད།');
    assert.equal(body.crafts[0].longDescriptionDz, 'ལག་བཟོའི་རྒྱས་བཤད།');
    assert.equal(body.crafts[0].historyDz, 'ལོ་རྒྱུས།');
    assert.equal(body.crafts[0].bannerUrl, '/images/crafts/thagzo.jpg');
    assert.equal(body.crafts[1].bannerUrl, null, 'Dozo must not receive the unrelated bundled candy image');
    assert.equal(body.crafts[2].bannerUrl, '/uploads/approved-carpentry.webp', 'an Admin-saved craft photo takes precedence');

    (prisma.craft as any).findMany = async () => { throw new Error('Simulated database outage'); };
    const outage = await GET(new NextRequest('http://localhost/api/crafts'));
    assert.equal(outage.status, 503);
    assert.equal((await outage.json()).success, false);
  } finally {
    (prisma.craft as any).findMany = originalFindMany;
    (prisma.craft as any).findFirst = originalFindFirst;
  }
  console.log('PASS: public crafts use saved records; empty, missing and outage do not substitute reference crafts. No database writes.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });

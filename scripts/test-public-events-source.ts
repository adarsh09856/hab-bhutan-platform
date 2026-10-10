import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { GET as getEvents } from '../src/app/api/events/route';

async function main() {
  const originalMany = prisma.eventRecord.findMany;
  const originalFirst = prisma.eventRecord.findFirst;
  try {
    (prisma.eventRecord as any).findMany = async (args: any) => {
      assert.equal(args.where.isActive, true);
      return [];
    };
    (prisma.eventRecord as any).findFirst = async (args: any) => {
      assert.equal(args.where.isActive, true);
      return null;
    };
    const empty = await getEvents(new NextRequest('http://localhost/api/events'));
    assert.equal(empty.status, 200);
    assert.deepEqual((await empty.json()).events, []);
    const missing = await getEvents(new NextRequest('http://localhost/api/events?key=unsaved'));
    assert.equal(missing.status, 200);
    assert.equal((await missing.json()).event, null);

    (prisma.eventRecord as any).findMany = async () => [{
      key: 'saved', title: 'Saved Event', category: 'Exhibition', dateDisplay: 'October 2026',
      location: 'Thimphu', description: 'A saved event', schedule: null, imageUrl: null,
    }];
    const saved = await getEvents(new NextRequest('http://localhost/api/events'));
    const body = await saved.json();
    assert.equal(body.events.length, 1);
    assert.equal(body.events[0].key, 'saved');
    assert.equal(body.events[0].day, '');
    assert.equal(body.events[0].time, '');

    (prisma.eventRecord as any).findMany = async () => [{
      key: 'dated', title: 'Dated Event', category: 'Exhibition', dateDisplay: '2026-09-12',
      location: 'Thimphu', description: 'A dated event', schedule: null, imageUrl: null,
    }];
    const dated = await getEvents(new NextRequest('http://localhost/api/events'));
    const datedEvent = (await dated.json()).events[0];
    assert.equal(datedEvent.day, '12');
    assert.equal(datedEvent.mon, 'SEP');
    assert.equal(datedEvent.year, 2026);

    (prisma.eventRecord as any).findMany = async () => { throw new Error('Simulated outage'); };
    const outage = await getEvents(new NextRequest('http://localhost/api/events'));
    assert.equal(outage.status, 503);
    assert.equal((await outage.json()).success, false);
  } finally {
    (prisma.eventRecord as any).findMany = originalMany;
    (prisma.eventRecord as any).findFirst = originalFirst;
  }
  console.log('PASS: event API shows only saved active records, no invented dates or fallback on missing/empty/outage. No database writes.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });

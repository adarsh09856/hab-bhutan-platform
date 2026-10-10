import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { GET as getClusters } from '../src/app/api/clusters/route';
import { GET as getOutlets } from '../src/app/api/outlets/route';

async function main() {
  const original = {
    clusterMany: prisma.clusterRecord.findMany,
    clusterOne: prisma.clusterRecord.findUnique,
    outletMany: prisma.outletRecord.findMany,
    outletOne: prisma.outletRecord.findUnique,
  };
  try {
    (prisma.clusterRecord as any).findMany = async () => [];
    (prisma.clusterRecord as any).findUnique = async () => null;
    (prisma.outletRecord as any).findMany = async () => [];
    (prisma.outletRecord as any).findUnique = async () => null;

    const clustersEmpty = await getClusters(new NextRequest('http://localhost/api/clusters'));
    assert.equal(clustersEmpty.status, 200);
    assert.deepEqual((await clustersEmpty.json()).clusters, []);
    const clusterMissing = await getClusters(new NextRequest('http://localhost/api/clusters?key=unsaved'));
    assert.equal((await clusterMissing.json()).cluster, null);

    const outletsEmpty = await getOutlets(new NextRequest('http://localhost/api/outlets'));
    assert.equal(outletsEmpty.status, 200);
    assert.deepEqual((await outletsEmpty.json()).outlets, []);
    const outletMissing = await getOutlets(new NextRequest('http://localhost/api/outlets?key=unsaved'));
    assert.equal((await outletMissing.json()).outlet, null);

    (prisma.clusterRecord as any).findMany = async () => { throw new Error('Simulated database outage'); };
    (prisma.outletRecord as any).findMany = async () => { throw new Error('Simulated database outage'); };
    const clustersOutage = await getClusters(new NextRequest('http://localhost/api/clusters'));
    const outletsOutage = await getOutlets(new NextRequest('http://localhost/api/outlets'));
    assert.equal(clustersOutage.status, 503);
    assert.equal(outletsOutage.status, 503);
    assert.equal((await clustersOutage.json()).success, false);
    assert.equal((await outletsOutage.json()).success, false);
  } finally {
    (prisma.clusterRecord as any).findMany = original.clusterMany;
    (prisma.clusterRecord as any).findUnique = original.clusterOne;
    (prisma.outletRecord as any).findMany = original.outletMany;
    (prisma.outletRecord as any).findUnique = original.outletOne;
  }
  console.log('PASS: empty/missing/outage location API reads never substitute bundled records. No database writes.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });

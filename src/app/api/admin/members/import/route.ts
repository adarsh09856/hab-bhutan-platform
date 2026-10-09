import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { MemberStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'members:create');
    const { rows } = await req.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided for bulk member import' }, { status: 400 });
    }
    if (rows.length > 5000) {
      return NextResponse.json({ error: 'Member imports are limited to 5,000 rows per file.' }, { status: 400 });
    }

    const requestedStatuses = new Set(rows
      .filter((row) => row && typeof row === 'object' && !Array.isArray(row))
      .map((row) => String(row.status || 'PENDING').toUpperCase()));
    if (requestedStatuses.has('VERIFIED')) await requirePermission(req, 'members:verify');
    if (requestedStatuses.has('SUSPENDED')) await requirePermission(req, 'members:suspend');
    if (requestedStatuses.has('REJECTED')) await requirePermission(req, 'members:edit');

    let importedCount = 0;
    let skippedCount = 0;
    const badRows: { rowNumber: number; reason: string }[] = [];
    const seenCids = new Set<string>();
    const existingMembers = await prisma.member.findMany({ select: { cidNumber: true } });
    const existingCids = new Set(existingMembers.map((member) => member.cidNumber.trim().toLowerCase()));
    const crafts = new Set((await prisma.craft.findMany({ select: { key: true } })).map(craft => craft.key));

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        badRows.push({ rowNumber: index + 2, reason: 'Row must contain member fields.' });
        continue;
      }
      const sourceRowNumber = Number(row._sourceRowNumber);
      const rowNumber = Number.isSafeInteger(sourceRowNumber) && sourceRowNumber >= 2 && sourceRowNumber <= 100000
        ? sourceRowNumber : index + 2;
      const cidNumber = String(row.cidNumber || '').trim();
      const name = String(row.name || '').trim();
      const requestedStatus = String(row.status || 'PENDING').toUpperCase();
      if (!name || !row.craftKey || !row.dzongkhag || !cidNumber) {
        badRows.push({ rowNumber, reason: 'Name, craft, dzongkhag and CID/license are required.' });
        continue;
      }
      if (!['VERIFIED', 'PENDING', 'REJECTED', 'SUSPENDED'].includes(requestedStatus)) {
        badRows.push({ rowNumber, reason: 'Status must be PENDING, VERIFIED, REJECTED, or SUSPENDED.' });
        continue;
      }
      const craftKey = String(row.craftKey).trim().toLowerCase();
      const email = String(row.email || '').trim().toLowerCase();
      const joinYear = Number(row.joinYear || new Date().getFullYear());
      if (!crafts.has(craftKey)) {
        badRows.push({ rowNumber, reason: 'Unknown craft key. Choose a configured HAB craft.' });
        continue;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        badRows.push({ rowNumber, reason: 'Contact email is invalid.' });
        continue;
      }
      if (!Number.isInteger(joinYear) || joinYear < 1900 || joinYear > new Date().getFullYear()) {
        badRows.push({ rowNumber, reason: 'Join year must be a whole year from 1900 to the current year.' });
        continue;
      }
      const normalizedCid = cidNumber.toLowerCase();
      if (seenCids.has(normalizedCid) || existingCids.has(normalizedCid)) {
        skippedCount++;
        badRows.push({ rowNumber, reason: 'Duplicate skipped: CID/license is repeated in this file or already exists.' });
        continue;
      }
      seenCids.add(normalizedCid);
      const memberId = crypto.randomUUID();
      const regNumber = row.regNumber || `HAB-M-${Math.floor(100000 + Math.random() * 900000)}`;
      const bioText = row.bio || (row.village ? `Village: ${row.village}. Registered artisan member of HAB.` : 'Registered artisan member of Handicrafts Association of Bhutan.');

      try {
        await prisma.member.create({
          data: {
            id: memberId,
            name,
            craftKey,
            dzongkhag: row.dzongkhag || 'Thimphu',
            cidNumber,
            regNumber,
            businessLicense: row.businessLicense || null,
            village: String(row.village || '').trim() || null,
            phone: String(row.phone || '').trim() || null,
            email: email || null,
            tier: row.tier || 'ACTIVE_SECTOR_MEMBER',
            status: requestedStatus as MemberStatus,
            joinYear,
            bio: bioText,
            portraitUrl: null,
            duesExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        });
        importedCount++;
      } catch (dbErr: any) {
        badRows.push({ rowNumber, reason: dbErr.message || 'Database insert failed.' });
      }
    }

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'MEMBERS_BULK_IMPORTED',
      entityType: 'Member',
      entityId: 'BULK_IMPORT',
      details: { count: importedCount, skippedCount, badRows },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      count: importedCount,
      skippedCount,
      badRows,
      message: `Imported ${importedCount} artisan members; skipped ${skippedCount} duplicates.`,
    });
  } catch (err: any) {
    console.error('Error during members bulk import:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error during member bulk import' },
      { status: err.statusCode || 500 }
    );
  }
}

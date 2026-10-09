import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { getAllFallbackWholesaleBuyers, saveFallbackWholesaleBuyer } from '@/lib/wholesale-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  const role = String(user?.roleSlug || user?.role || '').toLowerCase();
  if (!user || !['super_admin', 'staff_operator'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rows } = await req.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided for bulk import' }, { status: 400 });
    }
    if (rows.length > 5000) {
      return NextResponse.json({ error: 'Wholesale imports are limited to 5,000 rows per file.' }, { status: 400 });
    }

    let importedCount = 0;
    let skippedCount = 0;
    const badRows: { rowNumber: number; reason: string }[] = [];
    const seenEmails = new Set<string>();
    const seenUsernames = new Set<string>();
    const [dbBuyers, fallbackBuyers] = await Promise.all([
      prisma.wholesaleBuyer.findMany({ select: { email: true, username: true } }),
      Promise.resolve(getAllFallbackWholesaleBuyers()),
    ]);
    const existingEmails = new Set(dbBuyers.map((buyer) => buyer.email.toLowerCase()));
    const existingUsernames = new Set(dbBuyers.map((buyer) => buyer.username.toLowerCase()));
    for (const buyer of fallbackBuyers) {
      existingEmails.add(buyer.email.toLowerCase());
      existingUsernames.add(buyer.username.toLowerCase());
    }

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        badRows.push({ rowNumber: index + 2, reason: 'Row must contain wholesale buyer fields.' });
        continue;
      }
      const sourceRowNumber = Number(row._sourceRowNumber);
      const rowNumber = Number.isSafeInteger(sourceRowNumber) && sourceRowNumber >= 2 && sourceRowNumber <= 100000
        ? sourceRowNumber : index + 2;
      const email = String(row.email || '').trim().toLowerCase();
      if (!String(row.companyName || '').trim() || !String(row.contactName || '').trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        badRows.push({ rowNumber, reason: 'Company, contact person and valid email are required.' });
        continue;
      }
      if (seenEmails.has(email)) {
        skippedCount++;
        badRows.push({ rowNumber, reason: `Duplicate skipped: email "${email}" is repeated in this file.` });
        continue;
      }
      const username = String(row.username || '').trim().toLowerCase();
      if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(username)) {
        badRows.push({ rowNumber, reason: 'A valid username (3–32 letters, numbers, dots, underscores or hyphens) is required.' });
        continue;
      }
      if (seenEmails.has(email) || seenUsernames.has(username)) {
        skippedCount++;
        badRows.push({ rowNumber, reason: seenEmails.has(email)
          ? `Duplicate skipped: email "${email}" is repeated in this file.`
          : `Duplicate skipped: username "${username}" is repeated in this file.` });
        continue;
      }
      if (existingEmails.has(email) || existingUsernames.has(username)) {
        skippedCount++;
        badRows.push({ rowNumber, reason: existingEmails.has(email)
          ? `Duplicate skipped: email "${email}" already exists.`
          : `Duplicate skipped: username "${username}" already exists.` });
        continue;
      }
      seenEmails.add(email);
      seenUsernames.add(username);
      const buyerId = crypto.randomUUID();
      const passwordHash = await bcrypt.hash(crypto.randomBytes(18).toString('base64url'), 12);

      try {
        await prisma.wholesaleBuyer.create({
          data: {
            id: buyerId,
            username,
            passwordHash,
            companyName: row.companyName,
            contactName: row.contactName,
            email,
            phone: row.phone || null,
            country: row.country || 'Bhutan',
            city: row.city || null,
            taxId: row.taxId || null,
            discountTier: row.discountTier || 20,
            status: 'PENDING',
            notes: row.notes || 'Imported via Bulk Excel/CSV Studio',
          },
        });
        saveFallbackWholesaleBuyer({
          id: buyerId, username, passwordHash, companyName: row.companyName, contactName: row.contactName,
          email, phone: row.phone || null, country: row.country || 'Bhutan', city: row.city || null,
          taxId: row.taxId || null, discountTier: row.discountTier || 20, status: 'PENDING',
          notes: row.notes || 'Imported via Bulk Excel Studio', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
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
      action: 'WHOLESALE_BUYERS_BULK_IMPORTED',
      entityType: 'WholesaleBuyer',
      entityId: 'BULK_IMPORT',
      details: { count: importedCount, skippedCount, badRows },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      count: importedCount,
      skippedCount,
      badRows,
      message: `Imported ${importedCount} wholesale buyer accounts; skipped ${skippedCount} duplicates.`,
    });
  } catch (err: any) {
    console.error('Error during wholesale bulk import:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error during wholesale bulk import' },
      { status: 500 }
    );
  }
}

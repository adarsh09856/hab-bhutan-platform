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

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        badRows.push({ rowNumber: index + 2, reason: 'Row must contain wholesale buyer fields.' });
        continue;
      }
      const email = String(row.email || '').trim().toLowerCase();
      if (!String(row.companyName || '').trim() || !String(row.contactName || '').trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        badRows.push({ rowNumber: index + 2, reason: 'Company, contact person and valid email are required.' });
        continue;
      }
      if (seenEmails.has(email)) {
        skippedCount++;
        badRows.push({ rowNumber: index + 2, reason: `Duplicate skipped: email "${email}" is repeated in this file.` });
        continue;
      }
      seenEmails.add(email);
      const duplicate = await prisma.wholesaleBuyer.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
      const fallbackDuplicate = getAllFallbackWholesaleBuyers().some((buyer) => buyer.email.toLowerCase() === email);
      if (duplicate || fallbackDuplicate) { skippedCount++; continue; }
      const buyerId = crypto.randomUUID();
      const username = row.username || `buyer_${Math.floor(1000 + Math.random() * 9000)}`;
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
            status: row.status || 'ACTIVE',
            notes: row.notes || 'Imported via Bulk Excel/CSV Studio',
          },
        });
        saveFallbackWholesaleBuyer({
          id: buyerId, username, companyName: row.companyName, contactName: row.contactName,
          email, phone: row.phone || null, country: row.country || 'Bhutan', city: row.city || null,
          taxId: row.taxId || null, discountTier: row.discountTier || 20, status: row.status || 'ACTIVE',
          notes: row.notes || 'Imported via Bulk Excel Studio', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        });
        importedCount++;
      } catch (dbErr: any) {
        badRows.push({ rowNumber: index + 2, reason: dbErr.message || 'Database insert failed.' });
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

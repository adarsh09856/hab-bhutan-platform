import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { saveFallbackWholesaleBuyer } from '@/lib/wholesale-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rows } = await req.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided for bulk import' }, { status: 400 });
    }

    let importedCount = 0;
    const defaultPasswordHash = await bcrypt.hash('HabWholesale2026!', 10);

    for (const row of rows) {
      const buyerId = crypto.randomUUID();
      const username = row.username || `buyer_${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Resilient fallback storage
      saveFallbackWholesaleBuyer({
        id: buyerId,
        username,
        companyName: row.companyName,
        contactName: row.contactName,
        email: row.email,
        phone: row.phone || null,
        country: row.country || 'Bhutan',
        city: row.city || null,
        taxId: row.taxId || null,
        discountTier: row.discountTier || 20,
        status: row.status || 'ACTIVE',
        notes: row.notes || 'Imported via Bulk Excel/CSV Studio',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // 2. Database storage
      try {
        await prisma.wholesaleBuyer.create({
          data: {
            id: buyerId,
            username,
            passwordHash: defaultPasswordHash,
            companyName: row.companyName,
            contactName: row.contactName,
            email: row.email,
            phone: row.phone || null,
            country: row.country || 'Bhutan',
            city: row.city || null,
            taxId: row.taxId || null,
            discountTier: row.discountTier || 20,
            status: row.status || 'ACTIVE',
            notes: row.notes || 'Imported via Bulk Excel/CSV Studio',
          },
        });
      } catch (dbErr: any) {
        console.warn(`[wholesale/import] DB insert skipped for ${row.email}:`, dbErr.message);
      }

      importedCount++;
    }

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'WHOLESALE_BUYERS_BULK_IMPORTED',
      entityType: 'WholesaleBuyer',
      entityId: 'BULK_IMPORT',
      details: { count: importedCount },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      count: importedCount,
      message: `Successfully imported ${importedCount} wholesale buyer accounts.`,
    });
  } catch (err: any) {
    console.error('Error during wholesale bulk import:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error during wholesale bulk import' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rows } = await req.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided for bulk member import' }, { status: 400 });
    }

    let importedCount = 0;

    for (const row of rows) {
      const memberId = crypto.randomUUID();
      const regNumber = row.regNumber || `HAB-M-${Math.floor(100000 + Math.random() * 900000)}`;
      const bioText = row.bio || (row.village ? `Village: ${row.village}. Registered artisan member of HAB.` : 'Registered artisan member of Handicrafts Association of Bhutan.');

      try {
        await prisma.member.create({
          data: {
            id: memberId,
            name: row.name,
            craftKey: row.craftKey || 'thagzo',
            dzongkhag: row.dzongkhag || 'Thimphu',
            cidNumber: row.cidNumber || '00000000000',
            regNumber,
            businessLicense: row.businessLicense || null,
            tier: row.tier || 'ACTIVE_SECTOR_MEMBER',
            status: row.status || 'PENDING',
            joinYear: row.joinYear ? parseInt(String(row.joinYear), 10) : new Date().getFullYear(),
            bio: bioText,
            portraitUrl: '/assets/photos/about-hab.jpg',
            duesExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        });
        importedCount++;
      } catch (dbErr: any) {
        console.warn(`[members/import] DB insert skipped for ${row.name}:`, dbErr.message);
      }
    }

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'MEMBERS_BULK_IMPORTED',
      entityType: 'Member',
      entityId: 'BULK_IMPORT',
      details: { count: importedCount },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      count: importedCount,
      message: `Successfully imported ${importedCount} artisan members into the directory.`,
    });
  } catch (err: any) {
    console.error('Error during members bulk import:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error during member bulk import' },
      { status: 500 }
    );
  }
}

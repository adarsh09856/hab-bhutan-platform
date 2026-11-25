import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserForAnyPermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { parseSpreadsheetFile } from '@/lib/spreadsheet';

export const dynamic = 'force-dynamic';
const slugify = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const splitList = (value: string) => value.split('|').map((item) => item.trim()).filter(Boolean);

export async function POST(req: NextRequest) {
  const user = await getSessionUserForAnyPermission(req, ['content:create', 'content:edit']);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File) || !/\.(csv|xlsx)$/i.test(file.name)) return NextResponse.json({ success: false, error: 'Choose a .csv or .xlsx file.' }, { status: 400 });
    if (file.size > 2_000_000) return NextResponse.json({ success: false, error: 'Spreadsheet must be under 2 MB.' }, { status: 413 });
    const rows = await parseSpreadsheetFile(file);
    if (rows.length < 2) return NextResponse.json({ success: false, error: 'Spreadsheet must contain a header and at least one trader row.' }, { status: 400 });
    const headers = rows[0].map((header) => header.trim().toLowerCase().replace(/[^a-z0-9]+/g, ''));
    const at = (...names: string[]) => headers.findIndex((header) => names.includes(header));
    const cell = (row: string[], ...names: string[]) => { const index = at(...names); return index >= 0 ? row[index]?.trim() || '' : ''; };
    const required = ['shopname', 'registrationnumber', 'dzongkhag', 'town', 'address', 'shortdescription', 'description', 'expiresat'];
    const missing = required.filter((key) => !headers.includes(key));
    if (missing.length) return NextResponse.json({ success: false, error: `Missing columns: ${missing.join(', ')}` }, { status: 400 });
    let created = 0, updated = 0;
    const errors: string[] = [];
    for (let index = 1; index < rows.length; index++) {
      const row = rows[index];
      const shopName = cell(row, 'shopname');
      const registrationNumber = cell(row, 'registrationnumber');
      const expiry = new Date(cell(row, 'expiresat'));
      if (!shopName || !registrationNumber || Number.isNaN(expiry.getTime())) { errors.push(`Row ${index + 1}: shop name, registration number and valid expiresAt are required.`); continue; }
      const slug = slugify(cell(row, 'slug') || shopName);
      const data = {
        shopName, registrationNumber, slug,
        ownerName: cell(row, 'ownername') || null,
        dzongkhag: cell(row, 'dzongkhag'), town: cell(row, 'town'), address: cell(row, 'address'),
        mapUrl: cell(row, 'mapurl') || null, openingHours: cell(row, 'openinghours') || null,
        shortDescription: cell(row, 'shortdescription'), quote: cell(row, 'quote') || null, description: cell(row, 'description'),
        craftKeys: splitList(cell(row, 'craftkeys')), productTypes: splitList(cell(row, 'producttypes')),
        productPhotoUrls: splitList(cell(row, 'productphotourls')).slice(0, 8), bannerUrl: cell(row, 'bannerurl') || null,
        expiresAt: expiry, isVisible: !['false', '0', 'no'].includes(cell(row, 'isvisible').toLowerCase()),
        verifiedSince: Number(cell(row, 'verifiedsince')) || null, sortOrder: Number(cell(row, 'sortorder')) || 0,
      };
      try {
        const existing = await prisma.traderRecord.findUnique({ where: { registrationNumber } });
        if (existing) { await prisma.traderRecord.update({ where: { id: existing.id }, data }); updated++; }
        else { await prisma.traderRecord.create({ data }); created++; }
      } catch (error: any) { errors.push(`Row ${index + 1}: ${error.message || 'could not save'}`); }
    }
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'TRADERS_SPREADSHEET_IMPORTED', entityType: 'TraderRecord', entityId: 'bulk', details: { created, updated, failed: errors.length, sourceFormat: file.name.toLowerCase().endsWith('.xlsx') ? 'xlsx' : 'csv' } });
    return NextResponse.json({ success: true, created, updated, errors });
  } catch (error: any) { return NextResponse.json({ success: false, error: error.message || 'Spreadsheet import failed.' }, { status: 400 }); }
}

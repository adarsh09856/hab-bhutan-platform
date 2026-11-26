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
    let created = 0, updated = 0, hiddenForPhotos = 0;
    const errors: string[] = [];
    for (let index = 1; index < rows.length; index++) {
      const row = rows[index];
      const shopName = cell(row, 'shopname');
      const registrationNumber = cell(row, 'registrationnumber');
      const expiry = new Date(cell(row, 'expiresat'));
      const missingValues = [
        ['shop name', shopName], ['registration number', registrationNumber], ['dzongkhag', cell(row, 'dzongkhag')],
        ['town', cell(row, 'town')], ['address', cell(row, 'address')], ['short description', cell(row, 'shortdescription')],
        ['description', cell(row, 'description')],
      ].filter(([, value]) => !String(value || '').trim()).map(([label]) => label);
      if (missingValues.length || Number.isNaN(expiry.getTime())) {
        errors.push(`Row ${index + 1}: ${[...missingValues, ...(Number.isNaN(expiry.getTime()) ? ['valid expiresAt'] : [])].join(', ')} required.`);
        continue;
      }
      const slug = slugify(cell(row, 'slug') || shopName);
      const registrationNumber = cell(row, 'registrationnumber');
      const existing = await prisma.traderRecord.findUnique({ where: { registrationNumber } });
      const importedPhotos = splitList(cell(row, 'productphotourls')).slice(0, 8);
      const existingPhotos = Array.isArray(existing?.productPhotoUrls)
        ? existing.productPhotoUrls.filter((photo): photo is string => typeof photo === 'string' && Boolean(photo.trim()))
        : [];
      // Never reduce a saved gallery through a partial spreadsheet photo list.
      const productPhotoUrls = importedPhotos.length >= existingPhotos.length && importedPhotos.length > 0
        ? importedPhotos
        : existingPhotos;
      const visibilityCell = cell(row, 'isvisible').toLowerCase();
      const requestedVisible = visibilityCell
        ? !['false', '0', 'no'].includes(visibilityCell)
        : existing?.isVisible ?? productPhotoUrls.length >= 4;
      if (requestedVisible && productPhotoUrls.length < 4 && !existing?.isVisible) {
        errors.push(`Row ${index + 1}: at least 4 product photos are required to publish this trader.`);
        continue;
      }
      const autoHiddenForPhotos = !existing && !visibilityCell && importedPhotos.length < 4;
      const data = {
        shopName, registrationNumber, slug,
        ownerName: cell(row, 'ownername') || null,
        dzongkhag: cell(row, 'dzongkhag'), town: cell(row, 'town'), address: cell(row, 'address'),
        mapUrl: cell(row, 'mapurl') || null, openingHours: cell(row, 'openinghours') || null,
        shortDescription: cell(row, 'shortdescription'), quote: cell(row, 'quote') || null, description: cell(row, 'description'),
        craftKeys: splitList(cell(row, 'craftkeys')), productTypes: splitList(cell(row, 'producttypes')),
        // Blank spreadsheet photo cells mean “add later”; they must not erase
        // photos already uploaded in the admin editor.
        productPhotoUrls,
        bannerUrl: cell(row, 'bannerurl') || existing?.bannerUrl || null,
        expiresAt: expiry, isVisible: requestedVisible,
        verifiedSince: Number(cell(row, 'verifiedsince')) || null, sortOrder: Number(cell(row, 'sortorder')) || 0,
      };
      try {
        if (existing) { await prisma.traderRecord.update({ where: { id: existing.id }, data }); updated++; }
        else { await prisma.traderRecord.create({ data }); created++; if (autoHiddenForPhotos) hiddenForPhotos++; }
      } catch (error: any) { errors.push(`Row ${index + 1}: ${error.message || 'could not save'}`); }
    }
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'TRADERS_SPREADSHEET_IMPORTED', entityType: 'TraderRecord', entityId: 'bulk', details: { created, updated, failed: errors.length, sourceFormat: file.name.toLowerCase().endsWith('.xlsx') ? 'xlsx' : 'csv' } });
    return NextResponse.json({ success: true, created, updated, hiddenForPhotos, errors });
  } catch (error: any) { return NextResponse.json({ success: false, error: error.message || 'Spreadsheet import failed.' }, { status: 400 }); }
}

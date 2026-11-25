import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserForAnyPermission } from '@/lib/rbac';
import { createExcelWorkbookBuffer, generateExcelCsv } from '@/lib/spreadsheet';

export const dynamic = 'force-dynamic';

const HEADERS = [
  'shopName', 'registrationNumber', 'ownerName', 'slug', 'dzongkhag', 'town', 'address',
  'mapUrl', 'openingHours', 'shortDescription', 'quote', 'description', 'craftKeys',
  'productTypes', 'productPhotoUrls', 'bannerUrl', 'expiresAt', 'isVisible', 'verifiedSince', 'sortOrder',
];

function exportRows(traders: any[]) {
  return traders.map((trader) => [
    trader.shopName, trader.registrationNumber, trader.ownerName || '', trader.slug,
    trader.dzongkhag, trader.town, trader.address, trader.mapUrl || '', trader.openingHours || '',
    trader.shortDescription, trader.quote || '', trader.description,
    Array.isArray(trader.craftKeys) ? trader.craftKeys.join('|') : '',
    Array.isArray(trader.productTypes) ? trader.productTypes.join('|') : '',
    Array.isArray(trader.productPhotoUrls) ? trader.productPhotoUrls.join('|') : '',
    trader.bannerUrl || '', trader.expiresAt.toISOString(), trader.isVisible ? 'true' : 'false',
    trader.verifiedSince ?? '', trader.sortOrder,
  ] as (string | number)[]);
}

export async function GET(request: NextRequest) {
  const user = await getSessionUserForAnyPermission(request, ['content:view', 'content:edit']);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const format = new URL(request.url).searchParams.get('format')?.toLowerCase() || 'csv';
  if (format !== 'csv' && format !== 'xlsx') {
    return NextResponse.json({ success: false, error: 'Choose csv or xlsx format.' }, { status: 400 });
  }

  try {
    const traders = await prisma.traderRecord.findMany({ orderBy: [{ sortOrder: 'asc' }, { shopName: 'asc' }] });
    const rows = exportRows(traders);
    const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

    if (format === 'xlsx') {
      const buffer = await createExcelWorkbookBuffer('Accredited Traders', HEADERS, rows);
      return new NextResponse(buffer, {
        headers: {
          ...headers,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="hab-traders.xlsx"',
        },
      });
    }

    // Prefix formula-leading values so spreadsheet applications treat exported
    // user-entered text as text when opening the CSV.
    const safeRows = rows.map((row) => row.map((value) =>
      typeof value === 'string' && /^[=+\-@\t\r]/.test(value) ? `'${value}` : value,
    ));
    return new NextResponse(generateExcelCsv(HEADERS, safeRows), {
      headers: {
        ...headers,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="hab-traders.csv"',
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Could not export trader listings.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserForAnyPermission } from '@/lib/rbac';
import { generateExcelCsv } from '@/lib/spreadsheet';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const user = await getSessionUserForAnyPermission(request, ['content:view', 'content:edit']);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const csv = generateExcelCsv(['shopName','registrationNumber','ownerName','slug','dzongkhag','town','address','mapUrl','openingHours','shortDescription','quote','description','craftKeys','productTypes','productPhotoUrls','bannerUrl','expiresAt','isVisible','verifiedSince','sortOrder'], []);
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="hab-traders-template.csv"', 'Cache-Control': 'no-store' } });
}

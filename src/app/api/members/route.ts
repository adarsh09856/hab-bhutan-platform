import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  void req;
  return NextResponse.json({ success: false, error: 'Member profiles are available to authorised HAB staff only. Browse accredited traders instead.' }, { status: 410, headers: { 'Cache-Control': 'no-store' } });
}

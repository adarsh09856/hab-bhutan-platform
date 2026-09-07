import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveFxRate, setManualFxOverride, clearManualFxOverride } from '@/lib/fx';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fxInfo = await getEffectiveFxRate();
    return NextResponse.json({
      success: true,
      data: fxInfo,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'fx:override');
    const body = await req.json();
    const { rate, reason } = body;

    if (!rate || isNaN(rate) || rate <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid positive exchange rate number is required.' },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Administrative justification reason must be provided (min 5 characters).' },
        { status: 400 }
      );
    }

    const ip = getClientIp(req);
    const record = await setManualFxOverride(rate, reason, session.id, ip);

    return NextResponse.json({
      success: true,
      message: `Manual FX rate 1 USD = ${rate} BTN successfully engaged.`,
      record,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'fx:override');
    const ip = getClientIp(req);

    await clearManualFxOverride(session, ip);

    return NextResponse.json({
      success: true,
      message: 'Manual FX override cleared. Automated currency feed restored.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}

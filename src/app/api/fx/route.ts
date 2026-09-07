import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveFxRate, setManualFxOverride } from '@/lib/fx';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const fxInfo = await getEffectiveFxRate();
    return NextResponse.json({
      success: true,
      data: fxInfo
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
    // Check staff permissions
    const session = await requirePermission(req, 'FX_OVERRIDE');
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

    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    const record = await setManualFxOverride(rate, reason, session.userId);

    await logAudit({
      actorType: 'STAFF',
      actorId: session.userId,
      action: 'FX_MANUAL_OVERRIDE_APPLIED',
      entityType: 'FxRateRecord',
      entityId: record.id,
      ipAddress: ip,
      metadata: { newRate: rate, reason }
    });

    return NextResponse.json({
      success: true,
      message: `Manual FX rate 1 USD = ${rate} BTN successfully engaged.`,
      record
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}

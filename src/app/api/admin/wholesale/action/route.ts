import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { getAllFallbackWholesaleBuyers, saveFallbackWholesaleBuyer } from '@/lib/wholesale-store';
import { sendEmail } from '@/lib/email-service';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  const role = String(user?.roleSlug || user?.role || '').toLowerCase();
  if (!user || !['super_admin', 'staff_operator'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { buyerId, action, reason } = await req.json();

    if (!buyerId || !['APPROVE', 'DECLINE'].includes(action)) {
      return NextResponse.json({ error: 'Valid buyerId and action (APPROVE/DECLINE) are required.' }, { status: 400 });
    }

    const newStatus = action === 'APPROVE' ? 'ACTIVE' : 'REJECTED';
    const temporaryPassword = action === 'APPROVE'
      ? `HAB-${crypto.randomBytes(6).toString('base64url')}`
      : null;
    const passwordHash = temporaryPassword ? await bcrypt.hash(temporaryPassword, 12) : null;

    // 1. Fetch buyer info and remember whether it came from durable DB storage.
    let databaseLookupFailed = false;
    let buyer: any = await prisma.wholesaleBuyer.findUnique({
      where: { id: buyerId },
    }).catch((error) => {
      databaseLookupFailed = true;
      console.warn('[wholesale/action] Database lookup failed:', error?.message);
      return null;
    });
    const databaseBuyer = Boolean(buyer);

    if (!buyer) {
      buyer = getAllFallbackWholesaleBuyers().find((b) => b.id === buyerId) as any;
    }

    if (!buyer) {
      return NextResponse.json({ error: 'Wholesale buyer record not found.' }, { status: 404 });
    }

    // 2. Persist the decision before sending credentials or reporting success.
    const updatedNotes = reason ? `${buyer.notes || ''}\n[${action}]: ${reason}` : buyer.notes;
    if (databaseBuyer) {
      try {
        buyer = await prisma.wholesaleBuyer.update({
          where: { id: buyerId },
          data: {
            status: newStatus,
            ...(passwordHash ? { passwordHash } : {}),
            notes: updatedNotes,
          },
        });
      } catch (dbErr: any) {
        console.error('[wholesale/action] Could not persist the account decision:', dbErr?.message);
        return NextResponse.json({ error: 'The buyer account could not be updated. No approval email was sent; retry after the database is available.' }, { status: 503 });
      }
    } else {
      if (databaseLookupFailed) {
        const fallbackExists = getAllFallbackWholesaleBuyers().some((record) => record.id === buyerId);
        if (!fallbackExists) {
          return NextResponse.json({ error: 'The database is unavailable and no fallback account exists. No decision or email was sent.' }, { status: 503 });
        }
      }
      const fallbackRecord = getAllFallbackWholesaleBuyers().find((record) => record.id === buyerId);
      if (!fallbackRecord) {
        return NextResponse.json({ error: 'Wholesale buyer record not found.' }, { status: 404 });
      }
      const saved = saveFallbackWholesaleBuyer({
        ...fallbackRecord,
        status: newStatus,
        ...(passwordHash ? { passwordHash } : {}),
        notes: updatedNotes,
        updatedAt: new Date().toISOString(),
      });
      const persisted = getAllFallbackWholesaleBuyers().find((record) => record.id === buyerId);
      if (!persisted || persisted.status !== newStatus || (passwordHash && persisted.passwordHash !== passwordHash) || saved.id !== buyerId) {
        return NextResponse.json({ error: 'The buyer decision could not be persisted. No approval email was sent.' }, { status: 503 });
      }
      buyer = persisted as any;
    }

    // 3. Dispatch automated notification email
    const subject = action === 'APPROVE'
      ? `Wholesale Account Approved — Handicrafts Association of Bhutan`
      : `Update on your Wholesale Account Application — Handicrafts Association of Bhutan`;

    const htmlBody = action === 'APPROVE'
      ? `
        <div style="font-family: serif; color: #222; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px;">
          <h2 style="color: #8B2E24; margin-top: 0;">Congratulations, ${buyer.contactName}!</h2>
          <p>Your wholesale trade application on behalf of <strong>${buyer.companyName}</strong> has been officially approved by the Handicrafts Association of Bhutan Secretariat.</p>
          <p>Your account details:</p>
          <ul>
            <li><strong>Username:</strong> @${buyer.username}</li>
            <li><strong>Temporary password:</strong> ${temporaryPassword}</li>
            <li><strong>Discount Tier:</strong> ${buyer.discountTier || 20}% OFF Catalogue Pricing</li>
            <li><strong>Catalogue Access:</strong> <a href="https://hab.touratbhutan.info/wholesale/shop" style="color: #8B2E24;">Visit Wholesale Shop</a></li>
          </ul>
          <p>You can now sign in at the Trade Desk to place bulk purchase orders, request custom specifications, and download commercial invoices.</p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">Handicrafts Association of Bhutan (HAB) · Metog Lam, Thimphu · trade@hab.org.bt</p>
        </div>
      `
      : `
        <div style="font-family: serif; color: #222; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px;">
          <h2 style="color: #8B2E24; margin-top: 0;">Wholesale Application Status Update</h2>
          <p>Dear ${buyer.contactName},</p>
          <p>Thank you for your interest in partnering with the Handicrafts Association of Bhutan for wholesale sourcing.</p>
          <p>Following review of your application for <strong>${buyer.companyName}</strong>, the Secretariat is unable to approve your wholesale account at this time.</p>
          ${reason ? `<p><strong>Reason provided:</strong> ${reason}</p>` : ''}
          <p>If you believe this is in error or would like to provide updated documentation (such as tax licenses or resale certificates), please contact our trade desk directly at <a href="mailto:trade@hab.org.bt" style="color: #8B2E24;">trade@hab.org.bt</a>.</p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">Handicrafts Association of Bhutan (HAB) · Metog Lam, Thimphu</p>
        </div>
      `;

    let emailSent = false;
    let emailSimulated = false;
    try {
      const emailResult = await sendEmail({
        to: buyer.email,
        subject,
        body: action === 'APPROVE'
          ? `Kuzuzangpo la ${buyer.contactName},\n\nYour wholesale trade application for ${buyer.companyName} has been approved.\n\nUsername: ${buyer.username}\nTemporary password: ${temporaryPassword}\nSign in: https://hab.touratbhutan.info/wholesale/login\n\nPlease change your password after signing in.`
          : `Kuzuzangpo la ${buyer.contactName},\n\nYour wholesale application for ${buyer.companyName} was not approved.${reason ? ` Reason: ${reason}` : ''}`,
        html: htmlBody,
        auditEntityType: 'WholesaleBuyer',
        auditEntityId: buyerId,
      });
      emailSent = emailResult.success && !emailResult.simulated;
      emailSimulated = Boolean(emailResult.simulated);
    } catch (e: any) {
      console.warn('[wholesale/action] Automated email send failed (or simulated):', e.message);
    }

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: action === 'APPROVE' ? 'WHOLESALE_BUYER_APPROVED' : 'WHOLESALE_BUYER_DECLINED',
      entityType: 'WholesaleBuyer',
      entityId: buyerId,
      details: {
        email: buyer.email,
        companyName: buyer.companyName,
        emailSent,
        emailSimulated,
        reason: reason || null,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      action,
      status: newStatus,
      emailSent,
      emailSimulated,
      temporaryPassword: action === 'APPROVE' ? temporaryPassword : undefined,
      message: `Account for ${buyer.companyName} ${action === 'APPROVE' ? 'approved' : 'declined'} successfully. ${emailSent ? 'Notification email dispatched.' : emailSimulated ? 'SMTP is not configured; email was simulated and credentials are shown in Admin.' : 'Email delivery failed; review the audit log.'}`,
    });
  } catch (err: any) {
    console.error('Error handling wholesale action:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error processing wholesale action' },
      { status: 500 }
    );
  }
}

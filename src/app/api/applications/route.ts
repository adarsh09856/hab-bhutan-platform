import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { notifySubmission } from '@/lib/transaction-notifications';
import prisma from '@/lib/prisma';
import { getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { CLIENT_DATA } from '@/lib/client-data';
import { getAllFallbackApplications, saveFallbackApplication } from '@/lib/application-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const applicantName = (body.applicantName || body.fullName || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const phone = (body.phone || '').trim();
    const rawCID = (body.cidNumber || body.cidOrReg || '').trim();
    const businessLicense = (body.businessLicense || '').trim() || null;
    const craftKey = body.craftKey || body.primaryCraft || '';
    const dzongkhag = (body.dzongkhag || '').trim();
    const villageGewog = (body.villageGewog || body.village || 'Central').trim();
    const yearsPractising = body.yearsPractising ? parseInt(String(body.yearsPractising), 10) || 1 : 1;
    const planTierRaw = body.planTier || body.categoryKey || 'ACTIVE_SECTOR_MEMBER';
    const paymentMethodRaw = body.paymentMethod || 'CARD';
    const noFeeApplication = ['honorary', 'HONORARY'].includes(String(planTierRaw).trim());
    const normalizedPaymentMethod = String(paymentMethodRaw).trim().toUpperCase();
    const uploadedDocUrl = body.uploadedDocUrl || body.proofUrl || null;
    const uploadedCidUrl = body.uploadedCidUrl || null;
    const paymentNotes = noFeeApplication
      ? 'No payment required for honorary application.'
      : body.paymentRef
      ? `Payment: ${paymentMethodRaw.toUpperCase()} · Ref: ${body.paymentRef}${body.mobilePhone ? ` · Phone: ${body.mobilePhone}` : ''}`
      : null;
    const offlinePayment = ['MBOB', 'BANK'].includes(String(paymentMethodRaw).toUpperCase());
    if (!noFeeApplication && normalizedPaymentMethod === 'CARD') {
      return NextResponse.json({ success: false, error: 'Card checkout is not configured for membership applications. Pay by mBoB or bank transfer and submit your reference and proof.' }, { status: 503 });
    }
    if (!noFeeApplication && !offlinePayment) {
      return NextResponse.json({ success: false, error: 'Choose a supported membership payment method.' }, { status: 400 });
    }
    if (offlinePayment && (!String(body.paymentRef || '').trim() || !uploadedDocUrl)) {
      return NextResponse.json({ success: false, error: 'Payment reference and deposit proof are required for mBoB or bank transfer.' }, { status: 400 });
    }

    if (!applicantName || !email || !phone || !rawCID || !craftKey || !dzongkhag) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, phone, CID, craft category, and dzongkhag are required.' },
        { status: 400 }
      );
    }

    if (!CLIENT_DATA.crafts.some((craft) => craft.key === craftKey)) {
      return NextResponse.json({ success: false, error: 'Choose a valid HAB craft category before submitting.' }, { status: 400 });
    }

    const cleanCID = String(rawCID).replace(/\D/g, '');
    if (cleanCID.length !== 11) {
      return NextResponse.json(
        { success: false, error: 'Bhutan Citizenship ID (CID) must be exactly 11 numeric digits.' },
        { status: 400 }
      );
    }

    // Map planTier to schema MemberTier enum
    let mappedTier: 'ACTIVE_SECTOR_MEMBER' | 'ASSOCIATE_SECTOR_MEMBER' | 'INSTITUTIONAL' = 'ACTIVE_SECTOR_MEMBER';
    if (planTierRaw === 'enterprise' || planTierRaw === 'ASSOCIATE_SECTOR_MEMBER' || planTierRaw === 'associate') {
      mappedTier = 'ASSOCIATE_SECTOR_MEMBER';
    } else if (planTierRaw === 'institution' || planTierRaw === 'INSTITUTIONAL' || planTierRaw === 'honorary') {
      mappedTier = 'INSTITUTIONAL';
    }

    // Map payment method to schema PaymentMethod enum
    let mappedPayment: 'CARD' | 'MBOB' | 'BANK' = noFeeApplication ? 'CARD' : 'MBOB';
    if (String(paymentMethodRaw).toUpperCase() === 'MBOB') mappedPayment = 'MBOB';
    else if (String(paymentMethodRaw).toUpperCase() === 'BANK') mappedPayment = 'BANK';

    const appId = crypto.randomUUID();
    const reference = `HAB-2026-${appId.slice(0, 6).toUpperCase()}`;

    const submittedAt = new Date().toISOString();
    const fallbackApplication = {
      id: appId,
      applicantName,
      email,
      phone,
      cidNumber: cleanCID,
      businessLicense,
      craftKey,
      dzongkhag,
      villageGewog,
      yearsPractising,
      planTier: mappedTier,
      paymentMethod: mappedPayment,
      uploadedDocUrl,
      uploadedCidUrl,
      reviewerNotes: paymentNotes,
      status: 'PENDING',
      submittedAt,
      updatedAt: submittedAt,
      referenceNumber: reference,
    } as const;

    let dbApp: any = null;
    try {
      // Verify craftKey exists or auto-provision from canonical list
      let craft = await prisma.craft.findUnique({ where: { key: craftKey } }).catch(() => null);
      if (!craft) {
        const canonical = CLIENT_DATA.crafts.find((c) => c.key === craftKey);
        if (canonical) {
          craft = await prisma.craft.create({
            data: {
              key: canonical.key,
              name: canonical.name,
              english: canonical.english,
              description: canonical.description,
              isActive: true,
            },
          }).catch(() => null);
        }
      }

      if (craft) {
        dbApp = await prisma.membershipApplication.create({
          data: {
            id: appId,
            applicantName,
            email,
            phone,
            cidNumber: cleanCID,
            businessLicense,
            craftKey,
            dzongkhag,
            villageGewog,
            yearsPractising,
            planTier: mappedTier,
            paymentMethod: mappedPayment,
            uploadedDocUrl,
            uploadedCidUrl,
            reviewerNotes: paymentNotes,
            status: 'PENDING',
          },
        }).catch((err) => {
          console.warn('[api/applications] Database insert error (fallback preserved):', err.message);
          return null;
        });

        if (dbApp) {
          const ip = getClientIp(req);
          logAudit({
            actorType: 'GUEST',
            actorIdentifier: email,
            actorIp: ip,
            action: 'MEMBERSHIP_APPLICATION_SUBMITTED',
            entityType: 'MembershipApplication',
            entityId: dbApp.id,
            details: {
              applicantName,
              email,
              cidNumber: cleanCID,
              craftKey,
              planTier: mappedTier,
            },
          }).catch(() => {});
        }
      }
    } catch (dbErr: any) {
      console.warn('[api/applications] Database operation failed; will verify fallback persistence:', dbErr.message);
    }

    // Use the JSON fallback only when PostgreSQL did not accept the application.
    // A success response must correspond to a record that was actually persisted.
    let fallbackPersisted = false;
    if (!dbApp) {
      try {
        saveFallbackApplication(fallbackApplication);
        fallbackPersisted = getAllFallbackApplications().some((saved) => saved.id === appId && saved.email === email);
      } catch (fallbackError: any) {
        console.error('[api/applications] Fallback persistence failed:', fallbackError?.message);
      }
    }
    if (!dbApp && !fallbackPersisted) {
      return NextResponse.json(
        { success: false, error: 'The application could not be saved. No application was submitted; please try again later.' },
        { status: 503 }
      );
    }

    const emailDelivery = await notifySubmission({ kind: 'membership', email, name: applicantName, id: appId, reference, siteUrl: req.nextUrl.origin });
    return NextResponse.json({
      success: true,
      emailDelivery,
      reference,
      applicationId: dbApp ? dbApp.id : appId,
      message: 'Application received and registered successfully.',
    });
  } catch (err: any) {
    console.error('Error submitting application:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error processing application.' },
      { status: 500 }
    );
  }
}

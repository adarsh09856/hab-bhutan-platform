import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { DEFAULT_PAYMENT_CONFIG } from '@/lib/payments';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'orders:view');

    const setting = await prisma.siteSetting.findUnique({
      where: { id: 'default' },
      select: {
        paymentGateways: true,
        checkoutBankName: true,
        checkoutAccountNumber: true,
        checkoutAccountTitle: true,
        checkoutSwiftCode: true,
        checkoutBankAddress: true,
      },
    });

    const gateways = (setting?.paymentGateways as any) || {};

    // Merge stored config with defaults
    const card = { ...DEFAULT_PAYMENT_CONFIG.card, ...(gateways.card || {}) };
    const cod = { ...DEFAULT_PAYMENT_CONFIG.cod, ...(gateways.cod || {}) };
    const mbob = { ...DEFAULT_PAYMENT_CONFIG.mbob, ...(gateways.mbob || {}) };
    const bank = {
      ...DEFAULT_PAYMENT_CONFIG.bank,
      bankName: setting?.checkoutBankName || gateways.bank?.bankName || DEFAULT_PAYMENT_CONFIG.bank.bankName,
      accountTitle: setting?.checkoutAccountTitle || gateways.bank?.accountTitle || DEFAULT_PAYMENT_CONFIG.bank.accountTitle,
      accountNumber: setting?.checkoutAccountNumber || gateways.bank?.accountNumber || DEFAULT_PAYMENT_CONFIG.bank.accountNumber,
      swiftCode: setting?.checkoutSwiftCode || gateways.bank?.swiftCode || DEFAULT_PAYMENT_CONFIG.bank.swiftCode,
      branch: setting?.checkoutBankAddress || gateways.bank?.branch || DEFAULT_PAYMENT_CONFIG.bank.branch,
      ...(gateways.bank || {}),
    };

    // Mask secret keys for UI safety
    const safeCard = {
      ...card,
      secretKey: card.secretKey
        ? card.secretKey.slice(0, 7) + '••••••••' + card.secretKey.slice(-4)
        : '',
      webhookSecret: card.webhookSecret ? 'whsec_••••••••' : '',
    };

    return NextResponse.json({
      success: true,
      gateways: {
        card: safeCard,
        cod,
        mbob,
        bank,
      },
    });
  } catch (err: any) {
    console.error('Error fetching payment gateways config:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching payment gateways config.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'orders:edit');
    const body = await req.json();
    const { card, cod, mbob, bank } = body;

    const existing = await prisma.siteSetting.findUnique({
      where: { id: 'default' },
      select: { paymentGateways: true },
    });

    const existingGateways = (existing?.paymentGateways as any) || {};
    const existingCard = existingGateways.card || {};

    // Preserve secret keys if the user didn't change the masked string
    let finalSecretKey = card?.secretKey;
    if (!finalSecretKey || finalSecretKey.includes('••••')) {
      finalSecretKey = existingCard.secretKey || '';
    }

    let finalWebhookSecret = card?.webhookSecret;
    if (!finalWebhookSecret || finalWebhookSecret.includes('••••')) {
      finalWebhookSecret = existingCard.webhookSecret || '';
    }

    const updatedPaymentGateways = {
      card: {
        enabled: Boolean(card?.enabled),
        mode: card?.mode === 'LIVE' ? 'LIVE' : 'TEST',
        provider: 'STRIPE',
        publishableKey: (card?.publishableKey || '').trim(),
        secretKey: (finalSecretKey || '').trim(),
        webhookSecret: (finalWebhookSecret || '').trim(),
      },
      cod: {
        enabled: Boolean(cod?.enabled),
        bhutanOnly: cod?.bhutanOnly !== false,
        maxOrderAmountBTN: Number(cod?.maxOrderAmountBTN) || 50000,
        instructions: (cod?.instructions || '').trim(),
      },
      mbob: {
        enabled: Boolean(mbob?.enabled),
        accountTitle: (mbob?.accountTitle || '').trim(),
        accountNumber: (mbob?.accountNumber || '').trim(),
        phone: (mbob?.phone || '').trim(),
        qrImageUrl: (mbob?.qrImageUrl || '').trim(),
        requireJournalRef: mbob?.requireJournalRef !== false,
        instructions: (mbob?.instructions || '').trim(),
      },
      bank: {
        enabled: Boolean(bank?.enabled),
        bankName: (bank?.bankName || '').trim(),
        accountTitle: (bank?.accountTitle || '').trim(),
        accountNumber: (bank?.accountNumber || '').trim(),
        swiftCode: (bank?.swiftCode || '').trim(),
        branch: (bank?.branch || '').trim(),
        instructions: (bank?.instructions || '').trim(),
      },
    };

    await prisma.siteSetting.upsert({
      where: { id: 'default' },
      update: {
        paymentGateways: updatedPaymentGateways,
        checkoutBankName: updatedPaymentGateways.bank.bankName,
        checkoutAccountNumber: updatedPaymentGateways.bank.accountNumber,
        checkoutAccountTitle: updatedPaymentGateways.bank.accountTitle,
        checkoutSwiftCode: updatedPaymentGateways.bank.swiftCode,
        checkoutBankAddress: updatedPaymentGateways.bank.branch,
      },
      create: {
        id: 'default',
        tagline: 'Authentic Bhutanese Crafts',
        heroParagraph: 'Preserving Zorig Chusum traditions.',
        footerAbout: 'Handicrafts Association of Bhutan.',
        punakhaMarketNotice: '',
        partnersList: [],
        paymentGateways: updatedPaymentGateways,
        checkoutBankName: updatedPaymentGateways.bank.bankName,
        checkoutAccountNumber: updatedPaymentGateways.bank.accountNumber,
        checkoutAccountTitle: updatedPaymentGateways.bank.accountTitle,
        checkoutSwiftCode: updatedPaymentGateways.bank.swiftCode,
        checkoutBankAddress: updatedPaymentGateways.bank.branch,
      },
    });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'PAYMENT_GATEWAYS_UPDATED',
      entityType: 'SiteSetting',
      entityId: 'default',
      details: {
        cardEnabled: updatedPaymentGateways.card.enabled,
        cardMode: updatedPaymentGateways.card.mode,
        codEnabled: updatedPaymentGateways.cod.enabled,
        mbobEnabled: updatedPaymentGateways.mbob.enabled,
        bankEnabled: updatedPaymentGateways.bank.enabled,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment gateway configurations saved successfully.',
    });
  } catch (err: any) {
    console.error('Error updating payment gateways config:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error updating payment gateways.' },
      { status: err.statusCode || 400 }
    );
  }
}

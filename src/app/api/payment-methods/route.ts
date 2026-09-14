import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DEFAULT_PAYMENT_CONFIG } from '@/lib/payments';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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

    return NextResponse.json({
      success: true,
      methods: {
        card: {
          enabled: card.enabled,
          mode: card.mode, // 'TEST' | 'LIVE'
          publishableKey: card.publishableKey || '',
          isSandbox: card.mode === 'TEST' || !card.publishableKey,
        },
        cod: {
          enabled: cod.enabled,
          bhutanOnly: cod.bhutanOnly,
          maxOrderAmountBTN: cod.maxOrderAmountBTN,
          instructions: cod.instructions,
        },
        mbob: {
          enabled: mbob.enabled,
          accountTitle: mbob.accountTitle,
          accountNumber: mbob.accountNumber,
          phone: mbob.phone,
          qrImageUrl: mbob.qrImageUrl || '',
          requireJournalRef: mbob.requireJournalRef,
          instructions: mbob.instructions,
        },
        bank: {
          enabled: bank.enabled,
          bankName: bank.bankName,
          accountTitle: bank.accountTitle,
          accountNumber: bank.accountNumber,
          swiftCode: bank.swiftCode,
          branch: bank.branch,
          instructions: bank.instructions,
        },
      },
    });
  } catch (err: any) {
    console.error('Error fetching public payment methods:', err);
    return NextResponse.json(
      { success: false, error: 'Could not load payment methods.' },
      { status: 500 }
    );
  }
}

export const DEFAULT_PAYMENT_CONFIG = {
  card: {
    enabled: false,
    mode: 'TEST' as 'TEST' | 'LIVE',
    provider: 'STRIPE',
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
  },
  cod: {
    enabled: true,
    bhutanOnly: true,
    maxOrderAmountBTN: 50000,
    instructions: 'Pay in cash or via mBoB directly to the delivery courier upon receiving your parcel.',
  },
  mbob: {
    enabled: true,
    accountTitle: 'Handicrafts Association of Bhutan',
    accountNumber: '',
    phone: '',
    qrImageUrl: '',
    requireJournalRef: true,
    instructions: 'Transfer via mBoB / B-Wallet or scan QR. Enter your Bank Journal / Reference Number during checkout.',
  },
  bank: {
    enabled: true,
    bankName: 'Bank of Bhutan Ltd',
    accountTitle: 'Handicrafts Association of Bhutan',
    accountNumber: '',
    swiftCode: '',
    branch: '',
    instructions: 'Transfer the order total to the account shown, then submit your bank reference and deposit slip for HAB to verify.',
  },
};

export function resolveBankTransferConfig(setting: any) {
  const saved = setting?.paymentGateways?.bank || {};
  const bank = {
    ...DEFAULT_PAYMENT_CONFIG.bank,
    ...saved,
    bankName: setting?.checkoutBankName || saved.bankName || '',
    accountTitle: setting?.checkoutAccountTitle || saved.accountTitle || '',
    accountNumber: setting?.checkoutAccountNumber || saved.accountNumber || '',
    swiftCode: setting?.checkoutSwiftCode || saved.swiftCode || '',
    branch: setting?.checkoutBankAddress || saved.branch || '',
  };
  bank.enabled = saved.enabled !== false && [bank.bankName, bank.accountTitle, bank.accountNumber].every(value => typeof value === 'string' && value.trim().length > 0);
  return bank;
}

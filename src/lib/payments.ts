export const DEFAULT_PAYMENT_CONFIG = {
  card: {
    enabled: true,
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
    accountNumber: '200847291 - Bank of Bhutan',
    phone: '+975 17462636',
    qrImageUrl: '',
    requireJournalRef: true,
    instructions: 'Transfer via mBoB / B-Wallet or scan QR. Enter your Bank Journal / Reference Number during checkout.',
  },
  bank: {
    enabled: true,
    bankName: 'Bank of Bhutan Ltd',
    accountTitle: 'Handicrafts Association of Bhutan',
    accountNumber: '1009234810293',
    swiftCode: 'BOBBBT22',
    branch: 'Corporate Branch, Norzin Lam, Thimphu, Bhutan',
    instructions: 'Transfer order amount in USD or BTN to our official CSO account. Reference your order number on the wire advice.',
  },
};

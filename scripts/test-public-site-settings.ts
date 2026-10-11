import assert from 'node:assert/strict';
import { sanitizePublicSiteSettings } from '../src/lib/public-site-settings';

const publicSetting = sanitizePublicSiteSettings({
  id: 'default',
  officialEmail: 'office@example.bt',
  checkoutAccountNumber: 'PUBLIC-BANK-ACCOUNT',
  emailSettings: {
    host: 'smtp.internal.example',
    username: 'mailer@example.bt',
    password: 'never-return-this-smtp-password',
  },
  emailTemplates: { approval: { body: 'internal mail template' } },
  paymentGateways: {
    localization: {
      defaultCurrency: 'BTN',
      defaultLanguage: 'dz',
      supportedCurrencies: ['BTN', 'USD', 123],
      supportedLanguages: ['dz', 'en'],
      fxRate: 84,
      stripeSecretKey: 'never-return-this-localization-secret',
    },
    styling: {
      globalScale: 1.1,
      voice: 'editorial',
      homeScale: 1.2,
      webhookSecret: 'never-return-this-style-secret',
    },
    card: { secretKey: 'never-return-this-card-secret' },
    stripeSecretKey: 'never-return-this-gateway-secret',
  },
});

assert.equal('emailSettings' in publicSetting, false, 'SMTP settings must not be present in the public response.');
assert.equal('emailTemplates' in publicSetting, false, 'Admin email templates must not be present in the public response.');
assert.equal(publicSetting.checkoutAccountNumber, 'PUBLIC-BANK-ACCOUNT', 'Intentional public payment instructions remain available.');
assert.deepEqual(publicSetting.paymentGateways, {
  localization: {
    defaultCurrency: 'BTN',
    defaultLanguage: 'dz',
    supportedCurrencies: ['BTN', 'USD'],
    supportedLanguages: ['dz', 'en'],
    fxRate: 84,
  },
  styling: { globalScale: 1.1, voice: 'editorial' },
});
assert.equal(JSON.stringify(publicSetting).includes('never-return-this'), false, 'No synthetic private credential may survive sanitization.');

console.log('Public site settings sanitizer passed: SMTP credentials, email templates, and gateway secrets are excluded; public locale/style/bank fields remain.');

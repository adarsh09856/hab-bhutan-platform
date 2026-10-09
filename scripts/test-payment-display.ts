import assert from 'node:assert/strict';
import {
  CARD_CHECKOUT_AVAILABLE,
  CARD_PAYMENT_UNAVAILABLE_COPY,
  MEMBERSHIP_PAYMENT_COPY,
  removeUnavailableCardClaim,
} from '../src/lib/payment-display';

assert.equal(CARD_CHECKOUT_AVAILABLE, false);
assert.equal(removeUnavailableCardClaim('3-D Secure cards, mBoB and bank transfer.', CARD_PAYMENT_UNAVAILABLE_COPY), CARD_PAYMENT_UNAVAILABLE_COPY);
assert.equal(removeUnavailableCardClaim('Visa or Mastercard accepted.', CARD_PAYMENT_UNAVAILABLE_COPY), CARD_PAYMENT_UNAVAILABLE_COPY);
assert.equal(removeUnavailableCardClaim('mBoB and bank transfers are reviewed by HAB.', CARD_PAYMENT_UNAVAILABLE_COPY), 'mBoB and bank transfers are reviewed by HAB.');
assert.equal(removeUnavailableCardClaim('', MEMBERSHIP_PAYMENT_COPY), MEMBERSHIP_PAYMENT_COPY);

console.log('Payment display tests passed: unavailable card claims are suppressed and accurate transfer text is retained.');

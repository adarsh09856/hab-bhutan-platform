export const CARD_CHECKOUT_AVAILABLE = false;

export const CARD_PAYMENT_UNAVAILABLE_COPY =
  'mBoB, BNB and bank transfers are reviewed by HAB. Online card processing is not configured.';

export const MEMBERSHIP_PAYMENT_COPY =
  'Apply online, pay annual dues by mBoB or bank transfer, and get listed once approved. Online card payments are not configured.';

const unsupportedCardClaim = /\b(?:cards?|credit|debit|visa|mastercard|amex|stripe)\b|3\s*[-–]?\s*d\s*secure/i;

export function removeUnavailableCardClaim(value: string | null | undefined, fallback: string): string {
  const copy = value?.trim();
  if (!copy || unsupportedCardClaim.test(copy)) return fallback;
  return copy;
}

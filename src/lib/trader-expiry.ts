const BHUTAN_TIME_ZONE = 'Asia/Thimphu';

export function bhutanDateKey(value: Date | string = new Date()): string {
  // A bare date from an <input type="date"> is already a Bhutan calendar day.
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: BHUTAN_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

/** Date-only accreditations remain active for the whole expiry date in Bhutan. */
export function bhutanDayStartUtc(now: Date = new Date()): Date {
  // Thimphu is UTC+06:00. Represent local midnight as a UTC instant so SQL
  // comparisons keep a date-only accreditation active through that whole day.
  return new Date(`${bhutanDateKey(now)}T00:00:00.000+06:00`);
}

export function traderIsExpired(expiresAt: Date | string, now: Date = new Date()): boolean {
  return bhutanDateKey(expiresAt) < bhutanDateKey(now);
}

export function formatTraderExpiryDate(value: Date | string): string {
  const date = new Date(`${bhutanDateKey(value)}T12:00:00.000Z`);
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: BHUTAN_TIME_ZONE }).format(date);
}

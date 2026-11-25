const BHUTAN_TZ = 'Asia/Thimphu';

export function dateDisplayHasRange(value?: string | null): boolean {
  const text = String(value || '').trim();
  const isoDates = text.match(/\b\d{4}-\d{2}-\d{2}\b/g) || [];
  if (isoDates.length > 1) return true;
  const withoutIsoDates = text.replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ');
  return /\b\d{1,2}\s*[–—-]\s*\d{1,2}\b/.test(withoutIsoDates) ||
    /\b[A-Za-z]{3,9}\s+\d{1,2}\s*[–—-]\s*\d{1,2}\b/.test(withoutIsoDates);
}

const EVENT_DURATION_PATTERN = /\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s*[- ]?(?:day|week|month)s?\b/i;

/** Duration belongs in the event's end date, never in the hours-only Time field. */
export function timeContainsEventDuration(value?: string | null): boolean {
  return EVENT_DURATION_PATTERN.test(String(value || ''));
}

export function eventDateKey(value?: string | Date | null): string | null {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: BHUTAN_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function bhutanTodayKey(now = new Date()): string {
  return eventDateKey(now)!;
}

export function eventIsUpcoming(event: { startDate?: string | Date | null; endDate?: string | Date | null; dateDisplay?: string | null }, today = bhutanTodayKey()): boolean {
  const end = eventDateKey(event.endDate) || eventDateKey(event.startDate) || eventDateKey(event.dateDisplay);
  return !end || end >= today;
}

/** Google Calendar all-day dates use an exclusive end date. Return null for invalid or reversed ranges. */
export function calendarEventDateRange(startValue?: string | Date | null, endValue?: string | Date | null): string | null {
  const start = eventDateKey(startValue);
  const end = eventDateKey(endValue) || start;
  if (!start || !end || end < start) return null;
  const exclusiveEnd = new Date(`${end}T00:00:00.000Z`);
  exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
  const endKey = exclusiveEnd.toISOString().slice(0, 10);
  return `${start.replace(/-/g, '')}/${endKey.replace(/-/g, '')}`;
}

export function formatEventDateRange(startValue?: string | Date | null, endValue?: string | Date | null, fallback = ''): string {
  const start = eventDateKey(startValue);
  const end = eventDateKey(endValue);
  if (!start) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(fallback)) return formatEventDateRange(fallback, null, fallback);
    return fallback;
  }
  const toDate = (key: string) => new Date(`${key}T12:00:00+06:00`);
  const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: BHUTAN_TZ, day: 'numeric', month: 'long', year: 'numeric' });
  const first = toDate(start);
  if (!end || end === start) return formatter.format(first);
  const last = toDate(end);
  const firstParts = new Intl.DateTimeFormat('en-GB', { timeZone: BHUTAN_TZ, day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(first);
  const lastParts = formatter.formatToParts(last);
  const firstPart = (type: string) => firstParts.find((item) => item.type === type)?.value || '';
  const lastPart = (type: string) => lastParts.find((item) => item.type === type)?.value || '';
  if (firstPart('year') === lastPart('year') && firstPart('month') === lastPart('month')) return `${firstPart('day')}–${lastPart('day')} ${lastPart('month')} ${lastPart('year')}`;
  if (firstPart('year') === lastPart('year')) return `${firstPart('day')} ${firstPart('month')}–${lastPart('day')} ${lastPart('month')} ${lastPart('year')}`;
  return `${formatter.format(first)}–${formatter.format(last)}`;
}

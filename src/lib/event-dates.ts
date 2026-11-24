const BHUTAN_TZ = 'Asia/Thimphu';

function dateKey(value?: string | Date | null): string | null {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: BHUTAN_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function bhutanTodayKey(now = new Date()): string {
  return dateKey(now)!;
}

export function eventIsUpcoming(event: { startDate?: string | Date | null; endDate?: string | Date | null; dateDisplay?: string | null }, today = bhutanTodayKey()): boolean {
  const end = dateKey(event.endDate) || dateKey(event.startDate) || dateKey(event.dateDisplay);
  return !end || end >= today;
}

export function formatEventDateRange(startValue?: string | Date | null, endValue?: string | Date | null, fallback = ''): string {
  const start = dateKey(startValue);
  const end = dateKey(endValue);
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

export function shortenEventSummary(value: string | null | undefined, maximum = 160): string {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maximum) return text;
  const limit = Math.max(1, maximum - 1);
  const boundary = text.lastIndexOf(' ', limit);
  return `${text.slice(0, boundary > 0 ? boundary : limit).trimEnd()}…`;
}

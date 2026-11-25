export function shortenEventSummary(value: string | null | undefined, maximum = 160): string {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maximum) return text;
  const limit = Math.max(1, maximum - 1);
  const boundary = text.lastIndexOf(' ', limit);
  if (boundary > 0) return `${text.slice(0, boundary).trimEnd()}…`;

  // A single long token has no safe truncation point; keep it intact rather than
  // cutting through a word. The caller can render the full token as needed.
  const nextBoundary = text.indexOf(' ', limit);
  if (nextBoundary < 0) return text;
  return `${text.slice(0, nextBoundary).trimEnd()}…`;
}

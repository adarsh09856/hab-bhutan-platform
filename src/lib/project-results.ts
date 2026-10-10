export type ProjectResult = { n: string; l: string };

export function projectResultLine(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  const result = value as Partial<ProjectResult>;
  const label = String(result.l || '').trim();
  const number = String(result.n || '').trim();
  return number ? `${number} | ${label}` : label;
}

export function parseProjectResultLine(value: string): ProjectResult {
  const line = value.trim();
  const separator = line.indexOf(' | ');
  return separator < 0
    ? { n: '', l: line }
    : { n: line.slice(0, separator).trim(), l: line.slice(separator + 3).trim() };
}

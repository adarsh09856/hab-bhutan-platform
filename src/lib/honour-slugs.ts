export type HonourSlugRecord = {
  id?: string;
  slug?: string | null;
  name: string;
  yearAwarded: number;
};

export function buildHonourSlug(name: string, yearAwarded: number): string {
  return `${name}-${yearAwarded}`
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function resolvedHonourSlug(record: HonourSlugRecord): string {
  return record.slug || buildHonourSlug(record.name, record.yearAwarded) || record.id || '';
}

export function allocateHonourSlug(
  name: string,
  yearAwarded: number,
  existing: HonourSlugRecord[],
  excludeId?: string,
): string {
  const base = buildHonourSlug(name, yearAwarded) || 'awardee';
  const occupied = new Set(existing.filter((record) => record.id !== excludeId).map(resolvedHonourSlug));
  let candidate = base;
  let suffix = 2;
  while (occupied.has(candidate)) candidate = `${base}-${suffix++}`;
  return candidate;
}

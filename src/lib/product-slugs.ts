/** Convert a product name to a stable, readable URL slug. */
export function productNameSlug(name: string): string {
  const slug = String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'product';
}

/** Generate a unique name-based slug while retaining a readable collision suffix. */
export async function uniqueProductSlug(
  name: string,
  code: string,
  findBySlug: (slug: string) => Promise<{ id?: string } | null>,
): Promise<string> {
  const base = productNameSlug(name);
  if (!(await findBySlug(base))) return base;

  const codeSuffix = productNameSlug(code).slice(0, 48) || 'item';
  const withCode = `${base}-${codeSuffix}`;
  if (!(await findBySlug(withCode))) return withCode;

  for (let suffix = 2; suffix < 10000; suffix += 1) {
    const candidate = `${withCode}-${suffix}`;
    if (!(await findBySlug(candidate))) return candidate;
  }
  throw new Error('Unable to create a unique product URL.');
}

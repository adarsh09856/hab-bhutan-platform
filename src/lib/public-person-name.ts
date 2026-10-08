/** Avoid presenting editorial placeholders as real people on public pages. */
export function isConfirmedPublicPersonName(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const name = value.trim();
  return name.length > 0 && !/^(?:name\s+to\s+confirm|to\s+be\s+confirmed|tbc|placeholder|not\s+provided)$/i.test(name);
}

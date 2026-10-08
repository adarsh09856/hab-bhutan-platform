/** Avoid repeating a card's lead sentence when the full description includes it. */
export function removeRepeatedLead(lead: string, body: string): string {
  const normalizedLead = lead.trim();
  const normalizedBody = body.trim();
  if (!normalizedLead || !normalizedBody) return normalizedBody;
  if (normalizedBody.slice(0, normalizedLead.length).toLocaleLowerCase() !== normalizedLead.toLocaleLowerCase()) {
    return normalizedBody;
  }

  const remainder = normalizedBody.slice(normalizedLead.length);
  if (remainder && !/^[\s.!?:—-]/u.test(remainder)) return normalizedBody;
  return remainder.replace(/^[\s.!?:—-]+/u, '').trim();
}

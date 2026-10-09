export function policyLookupSlugs(slug: string) {
  return ['shipping', 'shipping-policy'].includes(slug) ? ['shipping', 'shipping-policy'] : [slug];
}

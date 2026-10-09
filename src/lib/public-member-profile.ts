export const PUBLIC_MEMBER_PROFILE_SELECT = {
  name: true,
  craftKey: true,
  dzongkhag: true,
  joinYear: true,
  regNumber: true,
  tier: true,
  bio: true,
  portraitUrl: true,
  craft: { select: { key: true, name: true, english: true } },
  products: {
    where: { status: 'PUBLISHED' },
    select: {
      code: true,
      name: true,
      priceUSD: true,
      images: true,
      stock: true,
      craftKey: true,
      region: true,
    },
  },
} as const;

export function toPublicMemberProfile(member: any) {
  if (!member) return null;
  return {
    name: member.name,
    craftKey: member.craftKey,
    dzongkhag: member.dzongkhag,
    joinYear: member.joinYear,
    regNumber: member.regNumber,
    tier: member.tier,
    bio: member.bio,
    portraitUrl: member.portraitUrl,
    craft: member.craft
      ? { key: member.craft.key, name: member.craft.name, english: member.craft.english }
      : null,
    products: (member.products || []).map((product: any) => ({
      code: product.code,
      name: product.name,
      priceUSD: product.priceUSD,
      images: product.images,
      stock: product.stock,
      craftKey: product.craftKey,
      region: product.region,
    })),
  };
}

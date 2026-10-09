export const PUBLIC_PRODUCT_MAKER_SELECT = {
  name: true,
  bio: true,
  joinYear: true,
  portraitUrl: true,
  dzongkhag: true,
  craft: { select: { key: true, name: true, english: true } },
} as const;

export const PUBLIC_PRODUCT_CARD_MAKER_SELECT = {
  name: true,
  dzongkhag: true,
} as const;

export function toPublicProductMaker(maker: any) {
  if (!maker) return null;
  return {
    name: maker.name,
    bio: maker.bio,
    joinYear: maker.joinYear,
    portraitUrl: maker.portraitUrl,
    dzongkhag: maker.dzongkhag,
    craft: maker.craft
      ? { key: maker.craft.key, name: maker.craft.name, english: maker.craft.english }
      : null,
  };
}

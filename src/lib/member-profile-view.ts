export function toMemberProfileView(record: any) {
  return {
    name: record.name,
    craft_key: record.craftKey,
    dzongkhag: record.dzongkhag || '',
    member_since: record.joinYear || null,
    blurb: record.bio || '',
    portraitUrl: record.portraitUrl || '',
  };
}

export function toMemberProductViews(products: any[], member: { name: string; dzongkhag?: string }) {
  return products.slice(0, 4).map((product) => ({
    code: product.code,
    name: product.name,
    craft_key: product.craftKey,
    region: product.region || member.dzongkhag || '',
    maker: member.name,
    price_usd: product.priceUSD,
    image_path: Array.isArray(product.images)
      ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url || '')
      : '',
  }));
}

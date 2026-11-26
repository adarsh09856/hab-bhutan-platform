export const PRODUCT_TYPES = ['Bags', 'Cushions', 'Textiles', 'Home décor'] as const;
export type ProductType = string;

export function inferProductType(product: { productType?: string | null; name?: string; craftKey?: string; materials?: string | null }): ProductType | '' {
  const saved = PRODUCT_TYPES.find((type) => type.toLowerCase() === product.productType?.toLowerCase());
  if (saved) return saved;
  if (product.productType?.trim()) return product.productType.trim();
  const text = `${product.name || ''} ${product.materials || ''}`.toLowerCase();
  if (/cushion|pillow/.test(text)) return 'Cushions';
  if (/bag|pouch|clutch|purse|sling|saddle|wallet/.test(text)) return 'Bags';
  if (/bowl|basket|mask|vase|lamp|dapa|phob|decor|decoration|ornament/.test(text)) return 'Home décor';
  if (['thagzo', 'tshemzo', 'tshazo'].includes((product.craftKey || '').toLowerCase())) return 'Textiles';
  return '';
}

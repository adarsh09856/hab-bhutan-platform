import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/wholesale/cart', 'Wholesale basket', 'Review products and quantities in your wholesale basket.', { noIndex: true });
export default function WholesaleCartLayout({ children }: { children: React.ReactNode }) { return children; }

import type { Metadata } from 'next';
import { publicPageMetadata } from '@/lib/public-metadata';

export const metadata: Metadata = publicPageMetadata('/basket', 'Your basket', 'Review the products in your HAB e-shop basket before checkout.', { noIndex: true });

export default function BasketLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from 'next';
import { publicPageMetadata } from '@/lib/public-metadata';

export const metadata: Metadata = publicPageMetadata('/checkout', 'Secure checkout', 'Enter delivery details and choose a payment method for your HAB e-shop order.', { noIndex: true });

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

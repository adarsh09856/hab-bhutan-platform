import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Bhutanese Handicrafts · HAB',
  description: 'Browse authentic Bhutanese handicrafts from HAB-accredited makers by craft, product type, availability and price.',
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}

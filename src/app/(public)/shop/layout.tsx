import { publicPageMetadata } from '@/lib/public-metadata';

export const metadata = publicPageMetadata('/shop', 'Shop Bhutanese handicrafts', 'Browse authentic Bhutanese handicrafts from HAB-accredited makers by craft, product type, availability and price.');

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Basket · HAB E-shop',
  robots: { index: false, follow: false },
};

export default function BasketLayout({ children }: { children: React.ReactNode }) {
  return children;
}

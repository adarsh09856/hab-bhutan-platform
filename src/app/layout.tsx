import type { Metadata } from 'next';
import '@/styles/globals.css';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'Handicrafts Association of Bhutan · HAB',
  description: 'Towards a vibrant & sustainable handicrafts sector in Bhutan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CurrencyProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}

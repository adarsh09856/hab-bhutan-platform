import type { Metadata } from 'next';
import WholesaleProductDetail from '@/components/public/WholesaleProductDetail';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Trade product · Handicrafts Association of Bhutan',
  description: 'View product details and wholesale terms for approved HAB trade buyers.',
};

export default async function WholesaleProductPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <WholesaleProductDetail code={code} />;
}

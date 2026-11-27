import { redirect } from 'next/navigation';

export default async function TradersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  redirect(q ? `/outlets?directory=1&q=${encodeURIComponent(q)}` : '/outlets?directory=1');
}

import { redirect } from 'next/navigation';

export default async function CraftsRedirectPage({ params }: { params: Promise<{ craft: string }> }) {
  const { craft } = await params;
  redirect(`/craft/${craft || 'thagzo'}`);
}

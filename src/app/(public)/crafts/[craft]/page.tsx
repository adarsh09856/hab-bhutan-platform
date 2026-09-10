import { redirect } from 'next/navigation';

export default function CraftsRedirectPage({ params }: { params: { craft: string } }) {
  redirect(`/craft/${params.craft || 'thagzo'}`);
}

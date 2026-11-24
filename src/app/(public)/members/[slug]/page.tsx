import { redirect } from 'next/navigation';

export default function LegacyMemberProfileRedirect() {
  redirect('/traders');
}

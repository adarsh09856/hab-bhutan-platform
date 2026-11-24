import { redirect } from 'next/navigation';

export default function LegacyMembersDirectoryRedirect() {
  redirect('/traders');
}

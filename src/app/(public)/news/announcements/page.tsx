import NewsListing from '@/components/public/NewsListing';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Announcements · News & Events · HAB', description: 'Official announcements from the Handicrafts Association of Bhutan.' };

export default function AnnouncementsPage() {
  return <NewsListing category="Announcements" />;
}

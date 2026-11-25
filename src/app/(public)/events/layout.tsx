import { publicPageMetadata } from '@/lib/public-metadata';
export const metadata = publicPageMetadata('/events', 'News, events and reports', 'Read the latest HAB news, event announcements, programme updates and sector reports.');
export default function EventsLayout({ children }: { children: React.ReactNode }) { return children; }

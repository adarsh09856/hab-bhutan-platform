import NewsListing from '@/components/public/NewsListing';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Vacancies · News & Events · HAB', description: 'Vacancy notices and opportunities at the Handicrafts Association of Bhutan.' };

export default function VacanciesPage() {
  return <NewsListing category="Vacancies" />;
}

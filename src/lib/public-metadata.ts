import type { Metadata } from 'next';

const SITE_NAME = 'Handicrafts Association of Bhutan';
const SITE_URL = 'https://hab.touratbhutan.info';

export function publicPageMetadata(
  pathname: string,
  title: string,
  description: string,
  options: { noIndex?: boolean } = {},
): Metadata {
  const brandedTitle = `${title} · HAB`;
  const metadata: Metadata = {
    title: brandedTitle,
    description,
    alternates: { canonical: `${SITE_URL}${pathname}` },
    openGraph: {
      title: brandedTitle,
      description,
      siteName: SITE_NAME,
      type: 'website',
      url: `${SITE_URL}${pathname}`,
    },
    twitter: { card: 'summary', title: brandedTitle, description },
  };

  if (options.noIndex) metadata.robots = { index: false, follow: false };
  return metadata;
}

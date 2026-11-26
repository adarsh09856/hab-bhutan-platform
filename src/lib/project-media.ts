import { CLIENT_DATA } from '@/lib/client-data';

type ProjectWithMedia = {
  name?: string | null;
  activities?: unknown;
  coverPhotoUrl?: unknown;
  image_path?: unknown;
};

/**
 * Return the saved project cover, or the existing curated project photo when
 * an older record has never had a cover setting. An explicit empty cover in
 * the current Admin format means the editor intentionally cleared the image.
 */
export function getProjectCoverPhotoUrl(project: ProjectWithMedia): string {
  const storedMedia = project.activities && !Array.isArray(project.activities) && typeof project.activities === 'object'
    ? project.activities as Record<string, unknown>
    : null;
  const hasExplicitCover = Boolean(storedMedia && Object.prototype.hasOwnProperty.call(storedMedia, 'coverPhotoUrl'));
  const savedCover = [storedMedia?.coverPhotoUrl, project.coverPhotoUrl, project.image_path]
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0);

  // This legacy Admin record carries a photo uploaded from the COVID
  // re-skilling project. Use the matching existing reference photo for the
  // Innovation Lab record until its cover is replaced in Admin. The database
  // value remains untouched, and any other newly selected cover is respected.
  if (
    project.name === 'Craft Product Innovation Lab' &&
    savedCover && /reskilling-artisans-covid19/i.test(savedCover)
  ) {
    return CLIENT_DATA.projects.find((item) => item.key === 'innovation-lab')?.image_path || '';
  }

  if (savedCover) return savedCover.trim();
  if (hasExplicitCover) return '';

  return CLIENT_DATA.projects.find((item) => item.name === project.name)?.image_path || '';
}

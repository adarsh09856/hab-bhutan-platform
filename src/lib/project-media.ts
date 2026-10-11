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

  if (savedCover) return savedCover.trim();
  if (hasExplicitCover) return '';

  return CLIENT_DATA.projects.find((item) => item.name === project.name)?.image_path || '';
}

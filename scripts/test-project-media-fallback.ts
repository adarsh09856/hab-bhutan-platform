import assert from 'node:assert/strict';
import { CLIENT_DATA } from '../src/lib/client-data';
import { getProjectCoverPhotoUrl } from '../src/lib/project-media';

for (const project of CLIENT_DATA.projects) {
  assert.ok(project.image_path, `${project.name} has an existing curated project image`);
  assert.equal(
    getProjectCoverPhotoUrl({ name: project.name, activities: [] }),
    project.image_path,
    `${project.name} uses its curated fallback when the database record predates cover images`,
  );
}

assert.equal(
  getProjectCoverPhotoUrl({ name: CLIENT_DATA.projects[0].name, activities: { list: [], coverPhotoUrl: '' } }),
  '',
  'An explicit empty cover saved by Admin stays empty instead of restoring the fallback',
);
assert.equal(
  getProjectCoverPhotoUrl({ name: CLIENT_DATA.projects[0].name, activities: { list: [], coverPhotoUrl: '/uploads/approved-cover.jpg' } }),
  '/uploads/approved-cover.jpg',
  'An Admin-uploaded cover takes priority over the fallback',
);
assert.equal(
  getProjectCoverPhotoUrl({ name: 'New project without an approved cover', activities: [] }),
  '',
  'Unmatched projects do not receive unrelated stock photography',
);

console.log('PASS: all six existing project mappings resolve; saved replacements and explicit clears are respected; unmatched records remain image-free.');

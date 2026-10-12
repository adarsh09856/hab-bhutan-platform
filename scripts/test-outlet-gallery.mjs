import assert from 'node:assert/strict';
import {
  displayOutletGallery,
  hasOutletGalleryMarker,
  packOutletGallery,
  PUNAKHA_REFERENCE_GALLERY,
  readOutletGallery,
} from '../src/lib/outlet-gallery.ts';

const legacyNote = 'Open daily';
assert.equal(hasOutletGalleryMarker(legacyNote), false);
assert.deepEqual(displayOutletGallery('punakha-market', readOutletGallery(legacyNote), hasOutletGalleryMarker(legacyNote)), PUNAKHA_REFERENCE_GALLERY);

const explicitlyEmpty = packOutletGallery(legacyNote, []);
assert.equal(hasOutletGalleryMarker(explicitlyEmpty), true);
assert.deepEqual(readOutletGallery(explicitlyEmpty), []);
assert.deepEqual(displayOutletGallery('punakha-market', readOutletGallery(explicitlyEmpty), hasOutletGalleryMarker(explicitlyEmpty)), []);

const preservedLegacy = packOutletGallery(legacyNote, [], false);
assert.equal(hasOutletGalleryMarker(preservedLegacy), false);
assert.deepEqual(displayOutletGallery('punakha-market', readOutletGallery(preservedLegacy), hasOutletGalleryMarker(preservedLegacy)), PUNAKHA_REFERENCE_GALLERY);

const saved = packOutletGallery(legacyNote, ['/uploads/outlet-one.jpg']);
assert.deepEqual(displayOutletGallery('punakha-market', readOutletGallery(saved), hasOutletGalleryMarker(saved)), ['/uploads/outlet-one.jpg']);
assert.deepEqual(displayOutletGallery('other-outlet', [], false), []);

console.log('PASS: outlet reference slides, saved gallery, and explicit empty-gallery state.');

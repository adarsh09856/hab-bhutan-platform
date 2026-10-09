import assert from 'node:assert/strict';
import { getCraftFacts } from '../src/lib/craft-facts';

assert.deepEqual(getCraftFacts({ name: 'Thagzo', english: 'Weaving' }), [
  { label: 'Craft', value: 'Thagzo · Weaving' },
], 'Missing database values must not be replaced by invented craft facts.');

assert.deepEqual(getCraftFacts({
  name: 'Thagzo',
  english: 'Weaving',
  technique: ' Backstrap loom ',
  materials: ' Cotton, wool ',
  practised_in: ' Bumthang and Lhuentse ',
}), [
  { label: 'Craft', value: 'Thagzo · Weaving' },
  { label: 'Technique', value: 'Backstrap loom' },
  { label: 'Materials', value: 'Cotton, wool' },
  { label: 'Practised in', value: 'Bumthang and Lhuentse' },
], 'Every saved craft fact must appear with whitespace normalized.');

console.log('Craft detail field check passed: saved details render; missing values are not fabricated.');

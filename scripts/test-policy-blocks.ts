import assert from 'node:assert/strict';
import { splitPolicyBlocks } from '../src/lib/policy-blocks';
assert.deepEqual(splitPolicyBlocks('## Dispatch & handling\nOrders are packed.\nAnother line.\n- One\n- Two\n## Charges\nNo hidden fees.'), [
  '## Dispatch & handling', 'Orders are packed.\nAnother line.', '- One\n- Two', '## Charges', 'No hidden fees.',
]);
assert.deepEqual(splitPolicyBlocks('### Detail\r\nBody\r\n\r\nNext paragraph'), ['### Detail', 'Body', 'Next paragraph']);
assert.deepEqual(splitPolicyBlocks(''), []);
console.log('PASS: headings, paragraphs and lists remain separate, including single-newline policy content.');

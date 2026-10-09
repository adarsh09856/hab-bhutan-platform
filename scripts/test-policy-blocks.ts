import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PolicyContentRenderer } from '../src/components/policy/PolicyContentRenderer';
import { splitPolicyBlocks } from '../src/lib/policy-blocks';
assert.deepEqual(splitPolicyBlocks('## Dispatch & handling\nOrders are packed.\nAnother line.\n- One\n- Two\n## Charges\nNo hidden fees.'), [
  '## Dispatch & handling', 'Orders are packed.\nAnother line.', '- One\n- Two', '## Charges', 'No hidden fees.',
]);
assert.deepEqual(splitPolicyBlocks('### Detail\r\nBody\r\n\r\nNext paragraph'), ['### Detail', 'Body', 'Next paragraph']);
assert.deepEqual(splitPolicyBlocks(''), []);
const html = renderToStaticMarkup(React.createElement(PolicyContentRenderer, {
  content: '## What we collect\nSaved paragraph.\n- First item\n- Second item\n## Free EMS conditions\nSaved conditions.',
}));
assert(html.includes('id="collect"'));
assert(html.includes('id="free"'));
assert(html.includes('<li>First item</li>'));
assert(!/<h2[^>]*>[^<]*Saved paragraph/.test(html));
console.log('PASS: headings, paragraphs and lists remain separate, including single-newline policy content.');

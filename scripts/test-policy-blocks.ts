import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PolicyContentRenderer } from '../src/components/policy/PolicyContentRenderer';
import { splitPolicyBlocks, policyHeadings } from '../src/lib/policy-blocks';
import { PolicyNavigation } from '../src/components/policy/PolicyNavigation';
import { preparePolicyHtml } from '../src/lib/policy-html';
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
const content = '## Details\nFirst paragraph.\n## Details\n- Single item\n## སྐད་ཡིག\nBody.';
const headings = policyHeadings(content);
assert.equal(new Set(headings.map(heading => heading.id)).size, 3);
assert.equal(headings[1].id, 'details-2');
assert(headings[2].id.length > 0);
const body = renderToStaticMarkup(React.createElement(PolicyContentRenderer, { content }));
const navigation = renderToStaticMarkup(React.createElement(PolicyNavigation, { content }));
for (const heading of headings) {
  assert(body.includes(`id="${heading.id}"`));
  assert(navigation.includes(`href="#${heading.id}"`));
}
assert(body.includes('<li>Single item</li>'));
assert(!navigation.includes('href="#tracking"'));
const rich = '<h2>Privacy &amp; security</h2><p><strong>Saved rich body</strong></p><ul><li>One</li></ul><h2>Privacy &amp; security</h2><a href="javascript:alert(1)">Bad link</a><img src="/uploads/photo.jpg" onerror="alert(1)"><script>alert(1)</script>';
const safe = preparePolicyHtml(rich);
assert(!safe.html.includes('javascript:'));
assert(!safe.html.includes('onerror'));
assert(!safe.html.includes('<script'));
assert(safe.html.includes('<strong>Saved rich body</strong>'));
assert(safe.html.includes('<li>One</li>'));
assert.equal(safe.headings[0].text, 'Privacy & security');
assert.equal(safe.headings[1].id, 'privacy-security-2');
for (const payload of [
  '<svg><animate href="javascript:alert(1)"></animate></svg>',
  '<textarea></textarea/><img src=x onerror=alert(1)>',
  '<a href="&#106;avascript:alert(1)">Link</a>',
  '<p style="background-image:url(javascript:alert(1));color:#8B2E24">Text</p>',
]) {
  const output = preparePolicyHtml(payload).html;
  assert(!/javascript:|onerror|<svg|<animate|<textarea/i.test(output));
}
const richBody = renderToStaticMarkup(React.createElement(PolicyContentRenderer, { content: rich }));
const richNav = renderToStaticMarkup(React.createElement(PolicyNavigation, { content: rich }));
for (const heading of safe.headings) {
  assert(richBody.includes(`id="${heading.id}"`));
  assert(richNav.includes(`href="#${heading.id}"`));
}
console.log('PASS: headings, paragraphs and lists remain separate, including single-newline policy content.');

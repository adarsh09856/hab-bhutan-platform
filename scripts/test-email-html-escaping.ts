import assert from 'node:assert/strict';
import { escapeEmailHtml } from '../src/lib/email-html';

assert.equal(
  escapeEmailHtml(`<img src=x onerror="alert('x')"> & HAB`),
  '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt; &amp; HAB',
);
assert.equal(escapeEmailHtml(null), '');
assert.equal(escapeEmailHtml('HAB-123'), 'HAB-123');
console.log('Email HTML escaping passed for user-supplied names, reasons, and plain-text message bodies.');

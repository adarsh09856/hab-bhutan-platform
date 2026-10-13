import assert from 'node:assert/strict';
import { publicDocumentUrl, WITHDRAWN_BUNDLED_DOCUMENTS } from '../src/lib/public-documents';
for (const url of WITHDRAWN_BUNDLED_DOCUMENTS) {
  assert.equal(publicDocumentUrl(url), null);
  assert.equal(publicDocumentUrl(`https://hab.touratbhutan.info${url}?download=1#page=2`), null);
  assert.equal(publicDocumentUrl(`http://127.0.0.1:3041${url}`), null);
  assert.equal(publicDocumentUrl(`https://other.example${url}`), `https://other.example${url}`);
}
assert.equal(publicDocumentUrl('/uploads/genuine-publication.pdf'), '/uploads/genuine-publication.pdf');
assert.equal(publicDocumentUrl('/api/payment-proofs/test.pdf'), '/api/payment-proofs/test.pdf');
assert.equal(publicDocumentUrl(null), null);
console.log('PASS: withdrawn report copies are hidden; genuine uploads and independent external documents are preserved.');

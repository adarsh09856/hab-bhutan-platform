// These four bundled files were copies of the internal Admin report, not the
// publications/tenders named by their URLs. Genuine Admin uploads are unaffected.
export const WITHDRAWN_BUNDLED_DOCUMENTS = new Set([
  '/docs/news/annual-report-2025.pdf',
  '/docs/news/product-innovation-lab.pdf',
  '/docs/tenders/HAB_Tender_2026_001_DyeMachinery.pdf',
  '/docs/tenders/HAB_RFP_2026_002_Provenance.pdf',
]);

export function publicDocumentUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value, 'https://hab.touratbhutan.info');
    const local = ['hab.touratbhutan.info', 'localhost', '127.0.0.1'].includes(url.hostname);
    if (local && WITHDRAWN_BUNDLED_DOCUMENTS.has(decodeURIComponent(url.pathname))) return null;
  } catch { return null; }
  return value;
}

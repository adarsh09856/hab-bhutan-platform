import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import {
  MEMBER_HEADERS,
  WHOLESALE_HEADERS,
  WHOLESALE_SAMPLE_ROWS,
  MEMBER_SAMPLE_ROWS,
  createExcelWorkbookBuffer,
  downloadExcelWorkbook,
  parseSpreadsheetFile,
  validateMemberImport,
  validateWholesaleImport,
  wholesaleBuyerExportRows,
} from '../src/lib/spreadsheet';

async function verifyBrowserDownload(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
) {
  const previousDocument = (globalThis as any).document;
  const previousCreateObjectURL = URL.createObjectURL;
  const previousRevokeObjectURL = URL.revokeObjectURL;
  const blobs = new Map<string, Blob>();
  const clicked: Array<{ href: string; download: string }> = [];
  const revoked: string[] = [];
  let nextUrl = 0;
  (URL as any).createObjectURL = (blob: Blob) => {
    const url = `blob:spreadsheet-test-${++nextUrl}`;
    blobs.set(url, blob);
    return url;
  };
  (URL as any).revokeObjectURL = (url: string) => { revoked.push(url); };
  (globalThis as any).document = {
    createElement: (tag: string) => {
      assert.equal(tag, 'a', 'Excel export creates a download link.');
      const link: any = { click: () => clicked.push({ href: link.href, download: link.download }) };
      return link;
    },
  };
  try {
    await downloadExcelWorkbook(filename, sheetName, headers, rows);
    assert.equal(clicked.length, 1, 'Excel export clicks the download link exactly once.');
    assert.equal(clicked[0].download, filename, 'Excel export uses the requested filename.');
    const blob = blobs.get(clicked[0].href);
    assert(blob, 'Excel export creates a downloadable Blob URL.');
    assert.equal(blob.type, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const downloadedFile = {
      name: filename,
      arrayBuffer: () => blob.arrayBuffer(),
    } as File;
    const parsed = await parseSpreadsheetFile(downloadedFile);
    assert.deepEqual(parsed[0], headers, `${filename} preserves every header after browser-download round-trip.`);
    assert.deepEqual(parsed.slice(1), rows.map((row) => row.map((value) => String(value ?? ''))),
      `${filename} preserves every data row after browser-download round-trip.`);
    assert.deepEqual(revoked, [clicked[0].href], 'Excel export revokes its temporary Blob URL.');
  } finally {
    (URL as any).createObjectURL = previousCreateObjectURL;
    (URL as any).revokeObjectURL = previousRevokeObjectURL;
    if (previousDocument === undefined) delete (globalThis as any).document;
    else (globalThis as any).document = previousDocument;
  }
}

async function main() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Members');
  sheet.addRow(MEMBER_HEADERS);
  sheet.addRow(['བུམ་ཐང་ལག་བཟོ', 'thagzo', 'Bumthang', 'Chumey', 'CID-TEST-01', '', '', 'ACTIVE_SECTOR_MEMBER', 'VERIFIED', '2024', 'འཐག་འཐག']);
  const output = Buffer.from(await workbook.xlsx.writeBuffer());
  const file = {
    name: 'unicode-members.xlsx',
    arrayBuffer: async () => output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength),
  } as File;
  const parsed = await parseSpreadsheetFile(file);
  assert.equal(parsed[1][0], 'བུམ་ཐང་ལག་བཟོ', 'XLSX parser preserves Dzongkha cell values.');

  for (const [sheetName, headers, samples] of [
    ['Members', MEMBER_HEADERS, MEMBER_SAMPLE_ROWS],
    ['Wholesalers', WHOLESALE_HEADERS, WHOLESALE_SAMPLE_ROWS],
  ] as const) {
    assert.equal(samples.length, 0, `${sheetName} import template must not contain fabricated records.`);
    const exported = await createExcelWorkbookBuffer(sheetName, [...headers], []);
    const exportedFile = {
      name: `${sheetName.toLowerCase()}.xlsx`,
      arrayBuffer: async () => exported,
    } as File;
    const reopened = await parseSpreadsheetFile(exportedFile);
    assert.deepEqual(reopened[0], [...headers], `${sheetName} XLSX download contains its complete template headers.`);
    assert.equal(reopened.length, 1, `${sheetName} import template contains headers only and cannot seed fake records.`);
  }

  const buyerWithPrivateFields = {
    companyName: 'Bhutan Craft Store', contactName: 'Pema Dorji', email: 'buyer@example.bt',
    phone: '+975 1712 3456', country: 'Bhutan', city: 'Thimphu', taxId: 'LIC-100',
    discountTier: 20, status: 'ACTIVE', notes: 'First line\nSecond line',
    passwordHash: 'must-never-be-exported',
  };
  const exportRows = wholesaleBuyerExportRows([buyerWithPrivateFields]);
  assert.deepEqual(exportRows[0], [
    'Bhutan Craft Store', 'Pema Dorji', 'buyer@example.bt', '+975 1712 3456', 'Bhutan',
    'Thimphu', 'LIC-100', 20, 'ACTIVE', 'First line | Second line',
  ], 'Wholesale export maps every approved column and excludes password data.');
  const buyerWorkbook = await createExcelWorkbookBuffer('Wholesale Buyers', [...WHOLESALE_HEADERS], exportRows);
  const buyerWorkbookFile = {
    name: 'wholesale-export.xlsx',
    arrayBuffer: async () => buyerWorkbook,
  } as File;
  const roundTrippedBuyer = await parseSpreadsheetFile(buyerWorkbookFile);
  assert.deepEqual(roundTrippedBuyer[0], [...WHOLESALE_HEADERS], 'Wholesale export workbook preserves the published headers.');
  assert.deepEqual(roundTrippedBuyer[1], exportRows[0].map(String), 'Wholesale export workbook preserves buyer values and sanitized notes.');
  assert.equal(roundTrippedBuyer.flat().includes('must-never-be-exported'), false, 'Wholesale export workbook never contains password hashes.');

  await verifyBrowserDownload('HAB_Certified_Members_test.xlsx', 'Members', MEMBER_HEADERS, [
    ['Test Artisan', 'thagzo', 'Bumthang', 'Chumey', 'CID-TEST-01', '', '', 'ACTIVE_SECTOR_MEMBER', 'VERIFIED', 2024, 'Dzongkha: འཐག'],
  ]);
  await verifyBrowserDownload('HAB_Wholesale_Buyers_test.xlsx', 'Wholesale Buyers', WHOLESALE_HEADERS, exportRows);
  await verifyBrowserDownload('HAB_Member_Import_Template.xlsx', 'Import Template', MEMBER_HEADERS, MEMBER_SAMPLE_ROWS);
  await verifyBrowserDownload('HAB_Wholesale_Import_Template.xlsx', 'Import Template', WHOLESALE_HEADERS, WHOLESALE_SAMPLE_ROWS);

  const validMember = ['Pema Workshop', 'thagzo', 'Lhuentse', 'Khoma', 'CID-100', '', '', '', 'PENDING', '', ''];
  const repeatedMember = ['Another Workshop', 'thagzo', 'Lhuentse', 'Khoma', 'cid-100', '', '', '', '', '', ''];
  const missingCraft = ['No Craft', '', 'Thimphu', '', 'CID-101', '', '', '', '', '', ''];
  const missingDzongkhag = ['No Region', 'shingzo', '', '', 'CID-102', '', '', '', '', '', ''];
  const unknownCraft = ['Unknown Craft', 'not-a-hab-craft', 'Thimphu', '', 'CID-104', '', '', '', '', '', ''];
  const sameNameDifferentCid = ['Pema Workshop', 'shingzo', 'Lhuentse', 'Khoma', 'CID-103', '', '', '', '', '', ''];
  const memberResult = validateMemberImport(
    [MEMBER_HEADERS, validMember, repeatedMember, sameNameDifferentCid, missingCraft, missingDzongkhag, unknownCraft],
    new Set(),
    new Set(['thagzo', 'shingzo']),
  );
  assert.equal(memberResult.validRows.length, 2, 'Complete rows with distinct CID/licence keys are accepted even where names match.');
  assert.equal(memberResult.duplicateCount, 1, 'Case-insensitive duplicate CID within file is detected.');
  assert.equal(memberResult.badRows.length, 4, 'Duplicate CID, unknown craft keys, and missing required fields appear as preview errors.');
  assert.match(memberResult.badRows[3].reason, /Unknown craft key/i, 'A craft key outside the configured HAB list is preview-invalid.');
  assert.equal(memberResult.validRows[0]._sourceRowNumber, 2, 'Member preview retains the original spreadsheet row number for server-side results.');
  assert.equal(memberResult.badRows[0].rowNumber, 3, 'Member preview issues use one-based spreadsheet row numbers including the header.');
  assert.equal(memberResult.validRows[0].status, 'VERIFIED', 'Admin member imports override a PENDING spreadsheet value.');

  const validBuyer = ['Bhutan Craft Store', 'Pema Dorji', 'BUYER@example.bt', '', 'Bhutan', '', '', '20', 'PENDING', ''];
  const duplicateBuyer = ['Second Store', 'Pema Dorji', 'buyer@example.bt', '', 'Bhutan', '', '', '20', 'PENDING', ''];
  const invalidEmailBuyer = ['Bad Store', 'Pema Dorji', 'not-an-email', '', 'Bhutan', '', '', '20', 'ACTIVE', ''];
  const wholesaleResult = validateWholesaleImport(
    [WHOLESALE_HEADERS, validBuyer, duplicateBuyer, invalidEmailBuyer],
    new Set(),
    new Set(),
  );
  assert.equal(wholesaleResult.validRows.length, 1, 'Only one unique valid wholesaler is preview-valid.');
  assert.equal(wholesaleResult.duplicateCount, 1, 'Case-insensitive duplicate email within file is detected.');
  assert.equal(wholesaleResult.badRows.length, 2, 'Duplicate and invalid email are listed with reasons.');
  assert.equal(wholesaleResult.validRows[0]._sourceRowNumber, 2, 'Wholesale preview retains original spreadsheet row numbers.');
  assert.equal(wholesaleResult.validRows[0].status, 'ACTIVE', 'Admin-imported wholesale buyers are marked active/verified regardless of the supplied sheet status.');
  assert.equal(wholesaleResult.badRows[0].rowNumber, 3, 'Wholesale preview issues use one-based spreadsheet row numbers including the header.');

  console.log('Spreadsheet checks passed: validation/import mapping plus four intercepted XLSX browser-download round-trips (members, buyers, and both header-only templates).');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

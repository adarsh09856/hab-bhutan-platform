import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import {
  MEMBER_HEADERS,
  WHOLESALE_HEADERS,
  parseSpreadsheetFile,
  validateMemberImport,
  validateWholesaleImport,
} from '../src/lib/spreadsheet';

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

  const validMember = ['Pema Workshop', 'thagzo', 'Lhuentse', 'Khoma', 'CID-100', '', '', '', '', '', ''];
  const repeatedMember = ['Another Workshop', 'thagzo', 'Lhuentse', 'Khoma', 'cid-100', '', '', '', '', '', ''];
  const missingCraft = ['No Craft', '', 'Thimphu', '', 'CID-101', '', '', '', '', '', ''];
  const missingDzongkhag = ['No Region', 'shingzo', '', '', 'CID-102', '', '', '', '', '', ''];
  const memberResult = validateMemberImport(
    [MEMBER_HEADERS, validMember, repeatedMember, missingCraft, missingDzongkhag],
    new Set(),
    new Set(),
  );
  assert.equal(memberResult.validRows.length, 1, 'Only the complete unique member row is preview-valid.');
  assert.equal(memberResult.duplicateCount, 1, 'Case-insensitive duplicate CID within file is detected.');
  assert.equal(memberResult.badRows.length, 3, 'Duplicate and missing required fields appear as preview errors.');

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

  console.log('Spreadsheet validation passed: XLSX Unicode round-trip, required member fields, within-file duplicate CID/email, and invalid wholesaler email.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

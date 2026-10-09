/**
 * Comprehensive RFC-4180 compliant CSV / Excel spreadsheet generator and parser.
 * Supports UTF-8 BOM (\uFEFF) for seamless Microsoft Excel import without encoding corruption.
 */
import ExcelJS from 'exceljs';

export function generateExcelCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escapeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = rows.map((r) => r.map(escapeCell).join(','));
  
  // Prepend UTF-8 BOM for Microsoft Excel auto-detection
  return '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
}

export function parseCsv(text: string): string[][] {
  // Strip UTF-8 BOM if present
  let cleanText = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
  cleanText = cleanText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  let i = 0;

  while (i < cleanText.length) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentCell += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentCell += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        if (currentRow.some((cell) => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
        i++;
        continue;
      } else {
        currentCell += char;
        i++;
        continue;
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export function triggerDownload(filename: string, content: string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function createExcelWorkbookBuffer(
  sheetName: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Handicrafts Association of Bhutan';
  const worksheet = workbook.addWorksheet(sheetName.slice(0, 31));
  worksheet.addRow(headers);
  rows.forEach((row) => worksheet.addRow(row.map((value) => value ?? '')));
  worksheet.getRow(1).font = { bold: true };
  worksheet.columns = headers.map((header, index) => ({
    width: Math.min(60, Math.max(header.length + 2, ...rows.map((row) => String(row[index] ?? '').length + 2))),
  }));
  const bytes = new Uint8Array(await workbook.xlsx.writeBuffer());
  const output = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(output).set(bytes);
  return output;
}

export async function downloadExcelWorkbook(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  const output = await createExcelWorkbookBuffer(sheetName, headers, rows);
  const blob = new Blob([output], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function parseSpreadsheetFile(file: File): Promise<string[][]> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.xlsx')) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const worksheet = workbook.worksheets[0];
    if (!worksheet) return [];
    const rows: string[][] = [];
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      const values = row.values as ExcelJS.CellValue[];
      rows.push(values.slice(1).map((value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') {
          if ('text' in value) return String(value.text).trim();
          if ('result' in value) return String(value.result ?? '').trim();
        }
        return String(value).trim();
      }));
    });
    return rows;
  }
  if (lower.endsWith('.xls')) {
    throw new Error('Legacy .xls files are not supported. Save the workbook as .xlsx or CSV and try again.');
  }
  return parseCsv(await file.text());
}

// ---------------------------------------------------------------------------
// Wholesale Buyer Schema & Validation
// ---------------------------------------------------------------------------

export const WHOLESALE_HEADERS = [
  'Company Name*',
  'Contact Person*',
  'Email*',
  'Phone',
  'Country*',
  'City',
  'Tax or License ID',
  'Discount Tier (%)',
  'Requested Status (all imported buyers start PENDING)',
  'Notes / Purchasing Purpose',
];

export const WHOLESALE_SAMPLE_ROWS = [
  [
    'Aman Kora Resorts',
    'Tashi Wangchuk',
    'procurement@amankora.bt',
    '+975-2-321234',
    'Bhutan',
    'Thimphu',
    'HAB-TL-48921',
    '25',
    'PENDING',
    'Luxury resort group sourcing authentic Bhutanese textiles and bamboo ware for 5 lodges',
  ],
  [
    'Himalayan Heritage Gallery Inc',
    'Sarah Jenkins',
    's.jenkins@himalayangallery.com',
    '+1-415-555-0199',
    'United States',
    'San Francisco',
    'US-EIN-94-382910',
    '30',
    'PENDING',
    'Specialist Himalayan cultural craft retailer with quarterly wholesale purchase cycle',
  ],
  [
    'Kyoto Silk & Wood Guild',
    'Kenji Sato',
    'orders@kyotocraftguild.jp',
    '+81-75-746-2001',
    'Japan',
    'Kyoto',
    'JP-CORP-0182-3819',
    '20',
    'PENDING',
    'Artisanal cooperative seeking Yathra wool and handwoven Kira fabrics',
  ],
];

export interface WholesaleImportValidationResult {
  validRows: any[];
  badRows: { rowNumber: number; data: string[]; reason: string }[];
  duplicateCount: number;
}

export function validateWholesaleImport(
  rawRows: string[][],
  existingEmails: Set<string>,
  existingUsernames: Set<string>
): WholesaleImportValidationResult {
  const validRows: any[] = [];
  const badRows: { rowNumber: number; data: string[]; reason: string }[] = [];
  let duplicateCount = 0;
  const seenEmails = new Set([...existingEmails].map((email) => email.trim().toLowerCase()));
  const seenUsernames = new Set([...existingUsernames].map((username) => username.trim().toLowerCase()));

  if (rawRows.length <= 1) {
    return { validRows: [], badRows: [{ rowNumber: 1, data: [], reason: 'File contains no data rows.' }], duplicateCount: 0 };
  }

  // Row 0 is header
  for (let idx = 1; idx < rawRows.length; idx++) {
    const row = rawRows[idx];
    const company = row[0]?.trim();
    const contact = row[1]?.trim();
    const email = row[2]?.trim().toLowerCase();
    const phone = row[3]?.trim();
    const country = row[4]?.trim() || 'Bhutan';
    const city = row[5]?.trim();
    const taxId = row[6]?.trim();
    const discount = parseInt(row[7]?.trim() || '20', 10);
    const notes = row[9]?.trim();

    if (!company) {
      badRows.push({ rowNumber: idx + 1, data: row, reason: 'Missing required Company Name.' });
      continue;
    }
    if (!contact) {
      badRows.push({ rowNumber: idx + 1, data: row, reason: 'Missing required Contact Person.' });
      continue;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      badRows.push({ rowNumber: idx + 1, data: row, reason: `Invalid or missing email: "${email || ''}".` });
      continue;
    }

    if (seenEmails.has(email)) {
      duplicateCount++;
      badRows.push({ rowNumber: idx + 1, data: row, reason: `Duplicate skipped: Email "${email}" is already registered or repeated in this file.` });
      continue;
    }

    // Generate clean username base
    const usernameBase = (email.split('@')[0] || company)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15);
    let username = `${usernameBase || 'buyer'}_${Math.floor(100 + Math.random() * 900)}`;
    let attempt = 0;
    while (seenUsernames.has(username.toLowerCase())) {
      attempt++;
      username = `${usernameBase || 'buyer'}_${Date.now().toString().slice(-6)}${attempt}`;
    }
    seenEmails.add(email);
    seenUsernames.add(username.toLowerCase());

    validRows.push({
      _sourceRowNumber: idx + 1,
      companyName: company,
      contactName: contact,
      email,
      phone: phone || null,
      country,
      city: city || null,
      taxId: taxId || null,
      discountTier: isNaN(discount) ? 20 : Math.min(50, Math.max(5, discount)),
      // Imported buyers receive no plaintext credential. They must stay pending
      // until staff approval generates and delivers a usable login credential.
      status: 'PENDING',
      notes: notes || null,
      username,
    });
  }

  return { validRows, badRows, duplicateCount };
}

// ---------------------------------------------------------------------------
// Member Schema & Validation
// ---------------------------------------------------------------------------

export const MEMBER_HEADERS = [
  'Artisan / Enterprise Name*',
  'Craft Key (e.g. thagzo, shingzo)*',
  'Dzongkhag*',
  'Village / Place',
  'CID or Business License*',
  'Contact Phone',
  'Email',
  'Membership Tier (ACTIVE_SECTOR_MEMBER/ASSOCIATE/INSTITUTIONAL)',
  'Verification Status (defaults PENDING; VERIFIED only if confirmed)',
  'Join Year',
  'Bio / Description',
];

export const MEMBER_SAMPLE_ROWS = [
  [
    'Pema Choden Weaving Workshop',
    'thagzo',
    'Lhuentse',
    'Khoma Village',
    'CID-10802001924',
    '+975-17123456',
    'pema.khoma@hab.bt',
    'ACTIVE_SECTOR_MEMBER',
    'VERIFIED',
    '2018',
    'Master weaver specializing in supplementary-weft silk Kishuthara with 22 years on the backstrap loom.',
  ],
  [
    'Kelzang Dorji Woodcrafts',
    'shingzo',
    'Trashi Yangtse',
    'Dongdi',
    'CID-11603004821',
    '+975-17654321',
    'kelzang.dorji@gmail.com',
    'ACTIVE_SECTOR_MEMBER',
    'VERIFIED',
    '2015',
    'Traditional carpentry and religious wood carving for temple restorations and altar cabinetry.',
  ],
  [
    'Kheng Bamboo & Cane Collective',
    'tshazo',
    'Zhemgang',
    'Buli',
    'CID-12001000341',
    '+975-77889900',
    'kheng.bamboo@hab.bt',
    'ACTIVE_SECTOR_MEMBER',
    'VERIFIED',
    '2019',
    'Cooperative of 34 bamboo harvesters producing woven bangchung baskets and floor mats.',
  ],
];

export interface MemberImportValidationResult {
  validRows: any[];
  badRows: { rowNumber: number; data: string[]; reason: string }[];
  duplicateCount: number;
}

export function validateMemberImport(
  rawRows: string[][],
  existingCids: Set<string>
): MemberImportValidationResult {
  const validRows: any[] = [];
  const badRows: { rowNumber: number; data: string[]; reason: string }[] = [];
  let duplicateCount = 0;
  const seenCids = new Set([...existingCids].map((cid) => cid.trim().toLowerCase()));

  if (rawRows.length <= 1) {
    return { validRows: [], badRows: [{ rowNumber: 1, data: [], reason: 'File contains no data rows.' }], duplicateCount: 0 };
  }

  for (let idx = 1; idx < rawRows.length; idx++) {
    const row = rawRows[idx];
    const name = row[0]?.trim();
    const craftKey = row[1]?.trim().toLowerCase();
    const dzongkhag = row[2]?.trim();
    const village = row[3]?.trim();
    const cid = row[4]?.trim();
    const phone = row[5]?.trim();
    const email = row[6]?.trim().toLowerCase();
    const tier = row[7]?.trim().toUpperCase() || 'ACTIVE_SECTOR_MEMBER';
    const status = row[8]?.trim().toUpperCase() || 'PENDING';
    const joinYear = Number(row[9]?.trim() || new Date().getFullYear().toString());
    const bio = row[10]?.trim();

    if (!name) {
      badRows.push({ rowNumber: idx + 1, data: row, reason: 'Missing required Artisan/Enterprise Name.' });
      continue;
    }
    if (!cid) {
      badRows.push({ rowNumber: idx + 1, data: row, reason: 'Missing required CID or Business License.' });
      continue;
    }
    if (!craftKey) {
      badRows.push({ rowNumber: idx + 1, data: row, reason: 'Missing required craft key.' });
      continue;
    }
    if (!dzongkhag) {
      badRows.push({ rowNumber: idx + 1, data: row, reason: 'Missing required Dzongkhag.' });
      continue;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      badRows.push({ rowNumber: idx + 1, data: row, reason: 'Contact email is invalid.' });
      continue;
    }
    if (!Number.isInteger(joinYear) || joinYear < 1900 || joinYear > new Date().getFullYear()) {
      badRows.push({ rowNumber: idx + 1, data: row, reason: 'Join year must be a whole year from 1900 to the current year.' });
      continue;
    }

    const normalizedCid = cid.toLowerCase();
    if (seenCids.has(normalizedCid)) {
      duplicateCount++;
      badRows.push({ rowNumber: idx + 1, data: row, reason: `Duplicate skipped: CID or business licence "${cid}" already exists or is repeated in this file.` });
      continue;
    }

    seenCids.add(normalizedCid);

    validRows.push({
      _sourceRowNumber: idx + 1,
      name,
      craftKey,
      dzongkhag,
      village: village || null,
      cidNumber: cid,
      businessLicense: cid.startsWith('CID') ? null : cid,
      phone: phone || null,
      email: email || null,
      tier: ['ACTIVE_SECTOR_MEMBER', 'ASSOCIATE_SECTOR_MEMBER', 'INSTITUTIONAL'].includes(tier)
        ? tier
        : 'ACTIVE_SECTOR_MEMBER',
      status: ['VERIFIED', 'PENDING', 'REJECTED', 'SUSPENDED'].includes(status) ? status : 'PENDING',
      joinYear: isNaN(joinYear) ? new Date().getFullYear() : joinYear,
      bio: bio || null,
    });
  }

  return { validRows, badRows, duplicateCount };
}

import assert from 'node:assert/strict';
import { preparePolicyHtml } from '../src/lib/policy-html.ts';

const pastedSheetsMarkup = '<span data-sheets-root="1" style="font-size:12pt;font-family:Calibri;color:rgb(0,0,0)">Handcrafted in Bhutan</span><script>alert(1)</script>';
const safeHtml = preparePolicyHtml(pastedSheetsMarkup, { inheritTypography: true }).html;

assert.match(safeHtml, /Handcrafted in Bhutan/);
assert.doesNotMatch(safeHtml, /data-sheets-root|font-family|<script/i);

console.log('PASS: product descriptions render readable sanitized text from pasted Google Sheets markup.');

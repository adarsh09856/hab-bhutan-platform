import assert from 'node:assert/strict';
import { isEditableInlineTextPath, joinEditableText } from '../src/lib/quick-edit-text';

assert.equal(isEditableInlineTextPath('H2', ['EM', 'SPAN']), true, 'Headings should include nested inline emphasis/span text.');
assert.equal(isEditableInlineTextPath('P', ['STRONG']), true, 'Paragraphs should include nested bold text.');
assert.equal(isEditableInlineTextPath('P', ['A']), false, 'Editing paragraph copy must not absorb nested link text.');
assert.equal(isEditableInlineTextPath('DIV', ['P']), false, 'Editing a wrapper must not absorb nested block content.');
assert.equal(isEditableInlineTextPath('BUTTON', ['SVG']), false, 'Icon text must not be editable button copy.');
assert.equal(joinEditableText([{ textContent: 'HAB' }, { textContent: ' — ' }, { textContent: 'Craft' }]), 'HAB — Craft');
console.log('Quick Edit nested text checks passed: inline descendants, isolated links/blocks/icons and text concatenation.');

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Palette,
  Undo,
  Redo,
  Code,
  RemoveFormatting
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  hint?: string;
}

const BRAND_COLORS = [
  { name: 'Madder Red (HAB)', hex: '#8B2E24' },
  { name: 'Bhutan Gold', hex: '#D97706' },
  { name: 'Deep Indigo', hex: '#1A365D' },
  { name: 'Forest Slate', hex: '#334155' },
  { name: 'Dark Slate', hex: '#0F172A' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Warm Charcoal', hex: '#33261F' },
];

export default function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = 'Write content here...',
  minHeight = '180px',
  className = '',
  hint,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#8B2E24');

  // Keep editor content in sync when value changes externally
  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, isHtmlMode]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const applyHeading = (tag: string) => {
    exec('formatBlock', `<${tag}>`);
  };

  const applyColor = (color: string) => {
    exec('foreColor', color);
    setShowColorPicker(false);
  };

  const applyLink = () => {
    const url = prompt('Enter destination link URL (e.g. https://... or /about):');
    if (url) {
      exec('createLink', url);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {label}
          </label>
          <button
            type="button"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            className="text-[11px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            <Code className="w-3 h-3" />
            <span>{isHtmlMode ? 'Visual Mode' : 'HTML Code Mode'}</span>
          </button>
        </div>
      )}

      <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs focus-within:border-[#8B2E24] focus-within:ring-1 focus-within:ring-[#8B2E24] transition-all">
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-50 border-b border-slate-200 text-slate-700 select-none">
          {/* Headings */}
          <button
            type="button"
            onClick={() => applyHeading('p')}
            title="Normal Paragraph"
            className="px-2 py-1 text-xs font-medium hover:bg-slate-200 rounded transition-colors"
          >
            P
          </button>
          <button
            type="button"
            onClick={() => applyHeading('h2')}
            title="Heading 2"
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyHeading('h3')}
            title="Heading 3"
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyHeading('h4')}
            title="Heading 4"
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-slate-300 mx-0.5" />

          {/* Formatting */}
          <button
            type="button"
            onClick={() => exec('bold')}
            title="Bold (Ctrl+B)"
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            title="Italic (Ctrl+I)"
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('underline')}
            title="Underline (Ctrl+U)"
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('strikeThrough')}
            title="Strikethrough"
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-slate-300 mx-0.5" />

          {/* Color Palette Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Text Color"
              className="p-1 hover:bg-slate-200 rounded transition-colors flex items-center gap-0.5 text-slate-700"
            >
              <Palette className="w-4 h-4 text-[#8B2E24]" />
            </button>

            {showColorPicker && (
              <div className="absolute left-0 top-full mt-1 z-30 p-2.5 bg-white border border-slate-200 rounded-xl shadow-xl w-48 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Brand Colors
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {BRAND_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => applyColor(c.hex)}
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      className="w-7 h-7 rounded-lg border border-slate-300 hover:scale-110 transition-transform shadow-xs"
                    />
                  ))}
                </div>
                <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => applyColor(customColor)}
                    className="text-[11px] font-medium text-slate-700 hover:text-slate-900"
                  >
                    Custom Color
                  </button>
                </div>
              </div>
            )}
          </div>

          <span className="w-px h-4 bg-slate-300 mx-0.5" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            title="Bulleted List"
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            title="Numbered List"
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-slate-300 mx-0.5" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => exec('justifyLeft')}
            title="Align Left"
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyCenter')}
            title="Align Center"
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyRight')}
            title="Align Right"
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-slate-300 mx-0.5" />

          {/* Link */}
          <button
            type="button"
            onClick={applyLink}
            title="Insert Link"
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {/* Clear Formatting */}
          <button
            type="button"
            onClick={() => exec('removeFormat')}
            title="Clear Formatting"
            className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-500 hover:text-slate-800"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => exec('undo')}
              title="Undo (Ctrl+Z)"
              className="p-1 hover:bg-slate-200 rounded transition-colors"
            >
              <Undo className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button
              type="button"
              onClick={() => exec('redo')}
              title="Redo (Ctrl+Y)"
              className="p-1 hover:bg-slate-200 rounded transition-colors"
            >
              <Redo className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Editor Surface */}
        {isHtmlMode ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="<div>Enter raw HTML here...</div>"
            style={{ minHeight }}
            className="w-full p-3 text-xs font-mono bg-slate-900 text-slate-100 focus:outline-hidden"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            data-placeholder={placeholder}
            style={{ minHeight }}
            className="p-3 text-xs text-slate-800 focus:outline-hidden leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2"
          />
        )}
      </div>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

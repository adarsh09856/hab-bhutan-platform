'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle2, Loader2, Edit3, Trash2, Plus } from 'lucide-react';
import FileUploadInput from '@/components/admin/FileUploadInput';
import RichTextEditor from '@/components/admin/RichTextEditor';

interface VisualSectionEditorProps {
  sectionId: string;
  sectionTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  initialData?: any;
  saveApiUrl: string;
  fields?: {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'richtext' | 'image' | 'number';
    placeholder?: string;
  }[];
}

export default function VisualSectionEditor({
  sectionId,
  sectionTitle,
  isOpen,
  onClose,
  onSaved,
  initialData = {},
  saveApiUrl,
  fields = [],
}: VisualSectionEditorProps) {
  const [formData, setFormData] = useState<any>(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(saveApiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok || (data.success === false)) {
        throw new Error(data.error || 'Failed to save changes.');
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSaved) onSaved();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Error saving changes to database.');
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl my-auto flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Sticky Header */}
        <div className="flex-shrink-0 p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8B2E24] text-white flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Quick Edit: {sectionTitle}
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Target Section: #{sectionId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Changes saved successfully to database! Updating live page...</span>
              </div>
            )}

            {fields.map((field) => {
              const val = formData[field.key] ?? '';

              if (field.type === 'image') {
                return (
                  <div key={field.key} className="pt-2">
                    <FileUploadInput
                      label={field.label}
                      value={val}
                      onChange={(newUrl) => handleFieldChange(field.key, newUrl)}
                    />
                  </div>
                );
              }

              if (field.type === 'richtext') {
                return (
                  <div key={field.key} className="pt-2">
                    <RichTextEditor
                      label={field.label}
                      value={val}
                      onChange={(html) => handleFieldChange(field.key, html)}
                    />
                  </div>
                );
              }

              if (field.type === 'textarea') {
                return (
                  <div key={field.key} className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {field.label}
                    </label>
                    <textarea
                      rows={3}
                      value={val}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                    />
                  </div>
                );
              }

              return (
                <div key={field.key} className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                  />
                </div>
              );
            })}
          </div>

          {/* Sticky Footer */}
          <div className="flex-shrink-0 p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to database...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

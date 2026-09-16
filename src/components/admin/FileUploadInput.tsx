'use client';

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, FileText, CheckCircle2, AlertCircle, Loader2, X, RefreshCw, ExternalLink } from 'lucide-react';

interface FileUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  hint?: string;
  className?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export default function FileUploadInput({
  value,
  onChange,
  label = 'Upload File or Photo',
  accept = 'image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv',
  hint = 'Supports JPG, PNG, WebP, SVG, and PDF up to 30MB',
  className = '',
  maxSizeMB = 30,
  disabled = false,
}: FileUploadInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPdf = value && (value.toLowerCase().endsWith('.pdf') || value.toLowerCase().includes('.pdf'));
  const isImage = value && !isPdf && (
    value.match(/\.(jpeg|jpg|gif|png|webp|svg|avif)($|\?)/i) ||
    value.startsWith('/uploads/') ||
    value.startsWith('/assets/photos/') ||
    value.startsWith('http')
  );

  const uploadFile = async (file: File) => {
    setError(null);

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds maximum allowable limit of ${maxSizeMB}MB.`);
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed. Please try again.');
      }

      onChange(data.url);
    } catch (err: any) {
      setError(err.message || 'Error uploading file to server.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {label}
          </label>
          <button
            type="button"
            onClick={() => setShowManualUrl(!showManualUrl)}
            className="text-[11px] font-medium text-slate-500 hover:text-slate-800 underline transition-colors"
          >
            {showManualUrl ? 'Switch to file picker' : 'Paste web URL'}
          </button>
        </div>
      )}

      {showManualUrl ? (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/file.jpg or /assets/..."
              disabled={disabled}
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200"
                title="Clear URL"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Tip: You can also click &ldquo;Switch to file picker&rdquo; above to choose directly from your computer.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Always mounted hidden file input to ensure Replace button and drag/drop always work */}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled || uploading}
            className="hidden"
          />

          {value ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex items-center gap-3 p-3 bg-white border rounded-xl shadow-xs transition-all ${
                isDragging
                  ? 'border-[#8B2E24] bg-red-50/20 ring-2 ring-[#8B2E24]/20'
                  : 'border-slate-200'
              }`}
            >
              {isPdf ? (
                <div className="w-12 h-12 rounded-lg bg-rose-50 border border-rose-200 flex flex-col items-center justify-center text-rose-600 flex-shrink-0">
                  <FileText className="w-6 h-6" />
                  <span className="text-[9px] font-bold uppercase font-mono mt-0.5">PDF</span>
                </div>
              ) : isImage ? (
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                  <img
                    src={value}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {value.split('/').pop() || 'Uploaded File'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono truncate">
                  <span className="truncate">{value}</span>
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8B2E24] hover:underline flex items-center gap-0.5 flex-shrink-0"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {isDragging && (
                  <p className="text-[10px] text-[#8B2E24] font-medium mt-0.5 animate-pulse">
                    Drop here to replace this file
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || disabled}
                  className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Choose a new file to replace the current one"
                >
                  <RefreshCw className={`w-3 h-3 ${uploading ? 'animate-spin text-[#8B2E24]' : ''}`} />
                  <span>{uploading ? 'Uploading...' : 'Replace'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  disabled={disabled || uploading}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !uploading && !disabled && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#8B2E24] bg-slate-100'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-100/60'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {uploading ? (
                <div className="py-2 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-6 h-6 text-[#8B2E24] animate-spin" />
                  <p className="text-xs font-medium text-slate-700">Uploading to server...</p>
                  <p className="text-[11px] text-slate-400">Please wait a moment</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600">
                    <Upload className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-xs hover:bg-slate-50">
                      Choose File from Computer
                    </span>
                    <p className="text-xs text-slate-500 mt-1.5">or drag and drop here</p>
                  </div>
                  {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Layers
} from 'lucide-react';

/* =========================================================================
   1. Admin Badge (Dark Glass Glowing Pills)
   ========================================================================= */
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'slate';

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export function AdminBadge({ 
  children, 
  variant = 'slate', 
  size = 'md',
  className = '',
  dot = false,
}: AdminBadgeProps) {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dotColor: string }> = {
    success: { 
      bg: 'bg-emerald-500/15', 
      text: 'text-emerald-300', 
      border: 'border-emerald-500/30', 
      dotColor: 'bg-emerald-400' 
    },
    warning: { 
      bg: 'bg-amber-500/15', 
      text: 'text-amber-300', 
      border: 'border-amber-500/30', 
      dotColor: 'bg-amber-400' 
    },
    danger: { 
      bg: 'bg-rose-500/15', 
      text: 'text-rose-300', 
      border: 'border-rose-500/30', 
      dotColor: 'bg-rose-400' 
    },
    info: { 
      bg: 'bg-sky-500/15', 
      text: 'text-sky-300', 
      border: 'border-sky-500/30', 
      dotColor: 'bg-sky-400' 
    },
    purple: { 
      bg: 'bg-purple-500/15', 
      text: 'text-purple-300', 
      border: 'border-purple-500/30', 
      dotColor: 'bg-purple-400' 
    },
    slate: { 
      bg: 'bg-slate-800/60', 
      text: 'text-slate-300', 
      border: 'border-white/10', 
      dotColor: 'bg-slate-400' 
    },
  };

  const style = variantStyles[variant] || variantStyles.slate;
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border backdrop-blur-md shadow-xs ${style.bg} ${style.text} ${style.border} ${sizeClasses} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse ${style.dotColor}`} />}
      {children}
    </span>
  );
}

/* =========================================================================
   2. Admin Empty State (Dark Glass Card)
   ========================================================================= */
interface AdminEmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function AdminEmptyState({
  title,
  description,
  icon: Icon = Layers,
  actionLabel,
  onAction,
  className = '',
}: AdminEmptyStateProps) {
  return (
    <div className={`p-12 text-center bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col items-center justify-center shadow-xl ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-white mb-1 tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8B2E24] to-[#B23E30] hover:from-[#A0352A] hover:to-[#C64738] text-white text-xs font-semibold rounded-xl border border-rose-400/30 shadow-[0_4px_15px_rgba(139,46,36,0.3)] transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* =========================================================================
   3. Admin Modal (Floating Translucent Glass Dialog)
   ========================================================================= */
interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}: AdminModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className={`w-full ${maxWidthClasses} bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] border border-white/15 overflow-hidden flex flex-col max-h-[90vh] text-white`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4.5 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   4. Admin Skeleton Loader (Dark Slate Shimmer)
   ========================================================================= */
export function AdminSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
      <div className="p-4 bg-slate-950/40 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-800/80 rounded-lg animate-pulse flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="p-4 flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <div 
              key={c} 
              className={`h-4 bg-slate-800/50 rounded-lg animate-pulse ${c === 0 ? 'w-1/3' : 'flex-1'}`} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* =========================================================================
   5. Admin Pagination (Dark Glass Bar)
   ========================================================================= */
interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3.5 bg-slate-950/50 backdrop-blur-xl border-t border-white/10 sm:px-6 rounded-b-2xl">
      <div className="text-xs text-slate-400">
        Showing <span className="font-semibold text-white">{start}</span> to{' '}
        <span className="font-semibold text-white">{end}</span> of{' '}
        <span className="font-semibold text-amber-400">{totalItems}</span> results
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center p-2 text-xs font-semibold rounded-xl border border-white/10 bg-slate-800/60 text-slate-200 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono font-medium text-slate-300 px-2.5">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center p-2 text-xs font-semibold rounded-xl border border-white/10 bg-slate-800/60 text-slate-200 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   6. Admin Search & Filter Bar (Dark Glass Input)
   ========================================================================= */
interface AdminSearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}

export function AdminSearchBar({
  searchQuery,
  onSearchChange,
  placeholder = 'Search...',
  children,
}: AdminSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800/70 border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-md transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

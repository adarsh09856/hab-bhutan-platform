'use client';

import React, { ReactNode } from 'react';
import { LucideIcon, Loader2, X, TrendingUp, TrendingDown } from 'lucide-react';

/* =========================================================================
   1. GlassCard: Clean high-contrast card container
   ========================================================================= */
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'none' | 'amber' | 'rose' | 'emerald' | 'indigo';
  onClick?: () => void;
}

export function GlassCard({
  children,
  className = '',
  glow = 'none',
  onClick,
}: GlassCardProps) {
  const glowStyles = {
    none: 'hover:border-slate-300',
    amber: 'hover:border-amber-400 hover:shadow-md',
    rose: 'hover:border-rose-400 hover:shadow-md',
    emerald: 'hover:border-emerald-400 hover:shadow-md',
    indigo: 'hover:border-indigo-400 hover:shadow-md',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xs transition-all duration-200 text-slate-900 ${glowStyles[glow]} ${className}`}
    >
      {children}
    </div>
  );
}

/* =========================================================================
   2. GlassStatWidget: Executive KPI Widget with Sparkline & Trend
   ========================================================================= */
interface GlassStatWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trendPct?: number;
  trendLabel?: string;
  glow?: 'amber' | 'rose' | 'emerald' | 'indigo';
  sparklineData?: number[];
  onClick?: () => void;
}

export function GlassStatWidget({
  title,
  value,
  subtitle,
  icon: Icon,
  trendPct,
  trendLabel = 'vs last period',
  glow = 'amber',
  sparklineData = [30, 45, 38, 52, 60, 55, 70],
  onClick,
}: GlassStatWidgetProps) {
  const iconGlows = {
    amber: 'bg-slate-100 text-[#8B2E24] border border-slate-200',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  };

  // Generate SVG sparkline path
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const points = sparklineData
    .map((v, i) => {
      const x = (i / (sparklineData.length - 1)) * 90;
      const y = 28 - ((v - minVal) / range) * 22;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <GlassCard
      glow={glow}
      onClick={onClick}
      className={`p-5 group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
          {subtitle && (
            <p className="mt-0.5 text-xs font-mono text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${iconGlows[glow]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
        {trendPct !== undefined ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`inline-flex items-center font-semibold px-2 py-0.5 rounded-full border ${
                trendPct >= 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {trendPct >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {trendPct >= 0 ? `+${trendPct}%` : `${trendPct}%`}
            </span>
            <span className="text-[11px] text-slate-500">{trendLabel}</span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-500">{trendLabel}</div>
        )}

        {/* Miniature SVG Sparkline */}
        <div className="w-[90px] h-[28px] opacity-80 group-hover:opacity-100 transition-opacity">
          <svg viewBox="0 0 90 28" className="w-full h-full overflow-visible">
            <polyline
              fill="none"
              stroke={glow === 'emerald' ? '#059669' : glow === 'rose' ? '#e11d48' : glow === 'indigo' ? '#4f46e5' : '#d97706'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </GlassCard>
  );
}

/* =========================================================================
   3. GlassBadge: Clear Status Badge with Pulsing Dot
   ========================================================================= */
interface GlassBadgeProps {
  status?: string;
  children?: ReactNode;
  variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'indigo' | 'slate' | 'secondary';
  pulse?: boolean;
}

export function GlassBadge({
  status,
  children,
  variant,
  pulse = true,
}: GlassBadgeProps) {
  const label = children !== undefined ? children : (status || '').replace(/_/g, ' ');
  const norm = typeof status === 'string' ? status.toUpperCase() : typeof children === 'string' ? children.toUpperCase() : '';

  let v: 'emerald' | 'amber' | 'rose' | 'blue' | 'indigo' | 'slate' = 'slate';
  if (variant && variant !== 'secondary') {
    v = variant;
  } else if (variant === 'secondary') {
    v = 'slate';
  } else if (norm) {
    if (['ACTIVE', 'PAID', 'DELIVERED', 'VERIFIED', 'APPROVED', 'PUBLISHED', 'FRESH'].includes(norm)) {
      v = 'emerald';
    } else if (['PENDING', 'PROCESSING', 'UNDER_REVIEW', 'PENDING_PAYMENT'].includes(norm)) {
      v = 'amber';
    } else if (['SHIPPED', 'DISPATCHED', 'IN_TRANSIT'].includes(norm)) {
      v = 'blue';
    } else if (['REJECTED', 'SUSPENDED', 'CANCELLED', 'FAILED', 'STALE'].includes(norm)) {
      v = 'rose';
    } else if (['SUPER_ADMIN', 'STAFF_OPERATOR'].includes(norm)) {
      v = 'indigo';
    } else {
      v = 'slate';
    }
  }

  const styles = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-slate-100 text-slate-800 border-slate-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
    blue: 'bg-sky-50 text-sky-800 border-sky-200',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dots = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    blue: 'bg-sky-500',
    indigo: 'bg-indigo-500',
    slate: 'bg-slate-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border shadow-2xs ${styles[v]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[v]} ${pulse ? 'animate-pulse' : ''}`} />
      <span>{label}</span>
    </span>
  );
}

/* =========================================================================
   4. GlassButton: Tactile Action Button
   ========================================================================= */
interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: LucideIcon;
}

export function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  className = '',
  disabled,
  ...props
}: GlassButtonProps) {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-xs font-semibold rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm font-semibold rounded-xl gap-2.5',
  };

  const variants = {
    primary:
      'bg-[#8B2E24] hover:bg-[#73241C] text-white shadow-xs border border-[#73241C]',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-xs border border-rose-700',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 border border-transparent',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

/* =========================================================================
   5. GlassDrawer: Slide-Over Inspection & Edit Panel
   ========================================================================= */
interface GlassDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export function GlassDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'lg',
}: GlassDrawerProps) {
  if (!isOpen) return null;

  const widths = {
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={`w-screen ${widths[width]} transform bg-white border-l border-slate-200 shadow-2xl flex flex-col`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   6. GlassInput & GlassSelect: Form Elements
   ========================================================================= */
export function GlassInput({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:border-[#8B2E24] focus:ring-2 focus:ring-[#8B2E24]/20 transition-all"
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function GlassSelect({
  label,
  children,
  error,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-[#8B2E24] focus:ring-2 focus:ring-[#8B2E24]/20 transition-all cursor-pointer"
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

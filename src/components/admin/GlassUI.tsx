'use client';

import React, { ReactNode } from 'react';
import { LucideIcon, Loader2, X, TrendingUp, TrendingDown } from 'lucide-react';

/* =========================================================================
   1. GlassCard: Frosted translucent container with glowing borders
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
    none: 'hover:border-white/20',
    amber: 'hover:border-amber-500/40 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)]',
    rose: 'hover:border-rose-500/40 hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.15)]',
    emerald: 'hover:border-emerald-500/40 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)]',
    indigo: 'hover:border-indigo-500/40 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)]',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-slate-900/65 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] transition-all duration-300 ${glowStyles[glow]} ${className}`}
    >
      {/* Subtle top ambient sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
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
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    rose: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    indigo: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
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
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-1 text-2xl font-bold tracking-tight text-white">{value}</div>
          {subtitle && (
            <p className="mt-0.5 text-xs font-mono text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${iconGlows[glow]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
        {trendPct !== undefined ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`inline-flex items-center font-semibold px-2 py-0.5 rounded-full border ${
                trendPct >= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {trendPct >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {trendPct >= 0 ? `+${trendPct}%` : `${trendPct}%`}
            </span>
            <span className="text-[11px] text-slate-400">{trendLabel}</span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400">{trendLabel}</div>
        )}

        {/* Miniature SVG Sparkline */}
        <div className="w-[90px] h-[28px] opacity-75 group-hover:opacity-100 transition-opacity">
          <svg viewBox="0 0 90 28" className="w-full h-full overflow-visible">
            <polyline
              fill="none"
              stroke={glow === 'emerald' ? '#34d399' : glow === 'rose' ? '#fb7185' : glow === 'indigo' ? '#818cf8' : '#fbbf24'}
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
   3. GlassBadge: Frosted Status Badge with Pulsing Dot
   ========================================================================= */
interface GlassBadgeProps {
  status: string;
  variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'indigo' | 'slate';
  pulse?: boolean;
}

export function GlassBadge({
  status,
  variant,
  pulse = true,
}: GlassBadgeProps) {
  const norm = (status || '').toUpperCase();

  // Automatic variant inference if not specified
  let v = variant;
  if (!v) {
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
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    blue: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    slate: 'bg-slate-700/30 text-slate-300 border-slate-600/40',
  };

  const dots = {
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    blue: 'bg-sky-400',
    indigo: 'bg-indigo-400',
    slate: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border backdrop-blur-md shadow-xs ${styles[v]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[v]} ${pulse ? 'animate-pulse' : ''}`} />
      <span>{status.replace(/_/g, ' ')}</span>
    </span>
  );
}

/* =========================================================================
   4. GlassButton: Tactile Action Button with subtle shimmer
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
      'bg-gradient-to-r from-[#8B2E24] to-[#B23E30] hover:from-[#A0352A] hover:to-[#C64738] text-white shadow-[0_4px_20px_rgba(139,46,36,0.35)] border border-rose-400/30 hover:border-rose-300/50',
    secondary:
      'bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-white/25 backdrop-blur-xl shadow-xs',
    danger:
      'bg-gradient-to-r from-rose-900/80 to-rose-800/80 hover:from-rose-800 hover:to-rose-700 text-rose-100 border border-rose-500/40 shadow-[0_4px_15px_rgba(244,63,94,0.25)]',
    ghost:
      'bg-transparent hover:bg-white/10 text-slate-300 hover:text-white border border-transparent',
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={`w-screen ${widths[width]} transform bg-slate-900/90 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.7)] flex flex-col`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
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
            <div className="px-6 py-4 border-t border-white/10 bg-slate-950/40 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   6. GlassInput & GlassSelect: Translucent Form Elements
   ========================================================================= */
export function GlassInput({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-md transition-all"
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
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
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-sm focus:outline-hidden focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-md transition-all cursor-pointer"
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

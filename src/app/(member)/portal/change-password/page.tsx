'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, ShieldCheck, AlertCircle, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isDifferent = newPassword !== '' && newPassword !== currentPassword;
  const matchesConfirm = newPassword !== '' && newPassword === confirmPassword;

  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && isDifferent && matchesConfirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isValid) {
      setErrorMsg('Please ensure all password requirements below are satisfied.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Password updated successfully! Redirecting to member portal...');
        setTimeout(() => {
          router.push(data.redirectUrl || '/portal');
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Failed to update password. Please check your credentials.');
      }
    } catch {
      setErrorMsg('Network error communicating with authentication service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white rounded-xl border border-slate-200 shadow-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Set Your Permanent Password</h1>
            <p className="text-xs text-slate-500 mt-0.5">Mandatory security requirement on first login</p>
          </div>
        </div>

        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 mb-6 leading-relaxed">
          <span className="font-semibold block mb-0.5">Welcome to Handicrafts Association of Bhutan!</span>
          Your account was provisioned with a temporary access key. In accordance with HAB IT Security Regulations, you must establish a personal permanent password before accessing the member portal.
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 mb-5 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 mb-5 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current (Temporary) Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter temporary password issued by admin"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create new permanent password"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Password Complexity Checklist */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] space-y-1.5 text-slate-600">
            <span className="font-semibold text-slate-700 block mb-1">Password Requirements:</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasMinLength ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                {hasMinLength ? '✓' : '•'}
              </span>
              <span className={hasMinLength ? 'text-emerald-700 font-medium' : ''}>At least 8 characters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasUpper ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                {hasUpper ? '✓' : '•'}
              </span>
              <span className={hasUpper ? 'text-emerald-700 font-medium' : ''}>At least one uppercase letter (A–Z)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasLower ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                {hasLower ? '✓' : '•'}
              </span>
              <span className={hasLower ? 'text-emerald-700 font-medium' : ''}>At least one lowercase letter (a–z)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasNumber ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                {hasNumber ? '✓' : '•'}
              </span>
              <span className={hasNumber ? 'text-emerald-700 font-medium' : ''}>At least one number (0–9)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${isDifferent ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                {isDifferent ? '✓' : '•'}
              </span>
              <span className={isDifferent ? 'text-emerald-700 font-medium' : ''}>Different from current temporary password</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${matchesConfirm ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
                {matchesConfirm ? '✓' : '•'}
              </span>
              <span className={matchesConfirm ? 'text-emerald-700 font-medium' : ''}>Passwords match</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !isValid}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm"
          >
            {submitting ? 'Updating Password...' : 'Save Password & Enter Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

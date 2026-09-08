'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  ShieldCheck, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [accountType, setAccountType] = useState<'CUSTOMER' | 'ARTISAN'>('CUSTOMER');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: 'Thimphu',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = calculateStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim() || null,
          accountType,
          address: formData.address.trim() || null,
          city: formData.city.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create your account.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(data.redirectUrl || '/account');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FBF9F5]">
      <div className="w-full max-w-lg">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-10 h-10 rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-md group-hover:bg-[#72251D] transition-colors">
              HAB
            </div>
            <div className="text-left font-figtree leading-tight">
              <span className="font-bold text-sm text-[#33261F] block">Handicrafts Association</span>
              <span className="text-[10px] text-[#6B5A4C] tracking-wider block">KINGDOM OF BHUTAN</span>
            </div>
          </Link>
          <h1 className="font-marcellus text-2xl sm:text-3xl text-[#33261F] font-normal">
            Create Your Account
          </h1>
          <p className="font-lora text-xs sm:text-sm text-[#6B5A4C] mt-1.5">
            Join the national platform connecting Bhutanese master artisans to collectors worldwide.
          </p>
        </div>

        {/* Account Type Toggle */}
        <div className="bg-[#EDE5D6]/60 p-1 rounded-2xl flex items-center gap-1 mb-6 border border-[#E4DDD1]">
          <button
            type="button"
            onClick={() => setAccountType('CUSTOMER')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              accountType === 'CUSTOMER'
                ? 'bg-white text-[#8B2E24] shadow-xs'
                : 'text-[#6B5A4C] hover:text-[#33261F]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer / Buyer</span>
          </button>
          <button
            type="button"
            onClick={() => setAccountType('ARTISAN')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              accountType === 'ARTISAN'
                ? 'bg-white text-[#8B2E24] shadow-xs'
                : 'text-[#6B5A4C] hover:text-[#33261F]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Artisan / Producer</span>
          </button>
        </div>

        {/* Form Container Card */}
        <div className="bg-white rounded-2xl border border-[#E4DDD1] shadow-xs p-6 sm:p-8">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-marcellus text-xl text-[#33261F]">Welcome to HAB!</h3>
              <p className="text-xs sm:text-sm text-[#6B5A4C]">
                Your account has been registered successfully. Logging you in now...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-figtree">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-none mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                  Full Legal Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-[#A39281]" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sonam Dorji"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] placeholder-[#A39281] focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#A39281]" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sonam@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] placeholder-[#A39281] focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                  Phone / Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#A39281]" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+975 1712 3456"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] placeholder-[#A39281] focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                  Password (8+ Characters) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#A39281]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] placeholder-[#A39281] focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-[#A39281] hover:text-[#33261F]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 ${strength >= 1 ? 'bg-rose-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strength >= 2 ? 'bg-amber-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strength >= 3 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strength >= 4 ? 'bg-emerald-600' : 'bg-transparent'}`} />
                    </div>
                    <span className="text-[10px] text-[#6B5A4C] font-mono">
                      {strength <= 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#A39281]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] placeholder-[#A39281] focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-[#8B2E24] rounded border-[#E4DDD1] focus:ring-[#8B2E24]"
                />
                <label htmlFor="agreeTerms" className="text-xs text-[#6B5A4C] leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" target="_blank" className="text-[#8B2E24] underline">
                    Terms &amp; Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" target="_blank" className="text-[#8B2E24] underline">
                    Privacy Policy
                  </Link>{' '}
                  of the Handicrafts Association of Bhutan.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#8B2E24] hover:bg-[#72251D] text-white text-sm font-semibold shadow-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <span>Creating your account...</span>
                ) : (
                  <>
                    <span>
                      {accountType === 'ARTISAN' ? 'Register & Begin Application' : 'Create Customer Account'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Sign-in Link */}
          <div className="mt-6 pt-5 border-t border-[#E4DDD1] text-center text-xs text-[#6B5A4C]">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#8B2E24] hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>

        {/* Security & CSO Seal Notice */}
        <div className="mt-6 text-center text-[11px] text-[#6B5A4C] flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Registered under CSO Act of Bhutan 2007 (CSO/2011/043). Your credentials are encrypted.</span>
        </div>
      </div>
    </main>
  );
}

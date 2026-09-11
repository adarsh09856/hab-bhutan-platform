'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Globe2, 
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

export default function ContactPage() {
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((d) => {
        if (d?.setting || d?.settings) {
          setSiteSettings(d.setting || d.settings);
        }
      })
      .catch(() => {});
  }, []);

  const s = siteSettings;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setForm({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
      } else {
        setError(data.error || 'Failed to submit inquiry.');
      }
    } catch {
      setError('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] bg-[#FBF9F5] py-8 sm:py-12 px-4 sm:px-6 lg:px-10 font-figtree">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Breadcrumbs & Title */}
        <div>
          <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-2">
            <Link href="/" className="hover:underline">Home</Link> /{' '}
            <span className="text-[#33261F]">Contact Secretariat</span>
          </div>
          <h1 className="font-marcellus text-3xl sm:text-4xl text-[#33261F]">
            Contact the Secretariat
          </h1>
          <p className="font-lora text-sm sm:text-base text-[#6B5A4C] mt-2 max-w-2xl">
            {s?.contactLede || 'Whether you are an artisan inquiring about guild membership, an international collector seeking custom orders, or a development donor partnering on heritage projects, we welcome your communication.'}
          </p>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Headquarters */}
          <div className="bg-white rounded-2xl border border-[#E4DDD1] p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B2E24]/10 text-[#8B2E24] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-marcellus text-base text-[#33261F]">National Secretariat</h3>
            <p className="text-xs text-[#6B5A4C] leading-relaxed">
              Handicrafts Association of Bhutan (HAB)<br />
              {s?.officeAddress || 'Metog Lam, Kawajangsa'}<br />
              {s?.contactPoBox || 'Post Box 1129, Thimphu 11001'}<br />
              Kingdom of Bhutan
            </p>
            <div className="pt-2 text-[11px] text-[#A39281] font-mono">
              {s?.csoRegistration || 'CSO Reg: CSO/2011/043'}
            </div>
          </div>

          {/* Direct Communication */}
          <div className="bg-white rounded-2xl border border-[#E4DDD1] p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-marcellus text-base text-[#33261F]">Inquiries &amp; Orders</h3>
            <div className="space-y-1.5 text-xs text-[#6B5A4C]">
              <div>
                <span className="font-semibold text-[#33261F]">Official Desk: </span>
                <a href={`mailto:${s?.officialEmail || 'officehab@gmail.com'}`} className="text-[#8B2E24] hover:underline">
                  {s?.officialEmail || 'officehab@gmail.com'}
                </a>
              </div>
              {s?.edPhone && (
                <div>
                  <span className="font-semibold text-[#33261F]">Executive Desk: </span>
                  <span className="font-mono text-[#33261F]">{s.edPhone}</span>
                </div>
              )}
              <div>
                <span className="font-semibold text-[#33261F]">Telephone: </span>
                <span className="font-mono text-[#33261F]">{s?.officePhone || '+975 2 338089'}</span>
              </div>
            </div>
          </div>

          {/* Working Hours & Chapters */}
          <div className="bg-white rounded-2xl border border-[#E4DDD1] p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-marcellus text-base text-[#33261F]">Secretariat Hours</h3>
            <p className="text-xs text-[#6B5A4C] leading-relaxed">
              {s?.contactHours || 'Monday to Friday: 9:00 AM – 5:00 PM (BST / UTC+6)'}<br />
              Saturday &amp; Sunday: Closed<br />
              Closed on Bhutanese National &amp; Religious Holidays
            </p>
            <div className="pt-2 text-xs text-[#6B5A4C]">
              <strong>Visitor Directions:</strong> {s?.contactDirections || 'Opposite National Library, Kawajangsa, Thimphu'}
            </div>
          </div>
        </div>

        {/* Main Grid: Form Left, FAQ Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4DDD1] p-6 sm:p-8 shadow-xs">
            <h2 className="font-marcellus text-xl text-[#33261F] mb-1">
              Send an Official Message
            </h2>
            <p className="text-xs text-[#6B5A4C] mb-6">
              Our Secretariat team responds to verified inquiries within 2 business days.
            </p>

            {success ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-marcellus text-xl text-[#33261F]">Message Dispatched</h3>
                <p className="text-xs text-[#6B5A4C] max-w-md mx-auto">
                  Thank you for contacting the Handicrafts Association of Bhutan. Your message has been routed to the relevant Secretariat division.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#8B2E24] text-white text-xs font-semibold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-none" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Karma Wangmo"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="karma@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+975 1712 3456"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                      Inquiry Category *
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                    >
                      <option value="General Inquiry">General Public Inquiry</option>
                      <option value="Artisan Membership">Artisan Guild Membership</option>
                      <option value="Order & Wholesale">International Orders &amp; Wholesale</option>
                      <option value="Donor & Projects">Donor &amp; Development Partnerships</option>
                      <option value="Cultural Heritage">Cultural &amp; Zorig Chusum Research</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Write your message or inquiry here..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="py-3 px-6 rounded-xl bg-[#8B2E24] hover:bg-[#72251D] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Submitting...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

          {/* FAQ & Information Right */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E4DDD1] p-6 shadow-xs space-y-4">
              <h3 className="font-marcellus text-base text-[#33261F] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#8B2E24]" />
                Frequently Asked Inquiries
              </h3>

              <div className="space-y-3 text-xs text-[#6B5A4C]">
                <div>
                  <div className="font-bold text-[#33261F] mb-0.5">How do I verify if my product is authentic?</div>
                  <p>Every piece dispatched includes the official tamper-evident HAB Seal of Authenticity with export accreditation.</p>
                </div>

                <div className="pt-2 border-t border-[#E4DDD1]">
                  <div className="font-bold text-[#33261F] mb-0.5">Can rural artisans register without a business license?</div>
                  <p>Yes. Individual village artisans may apply under Active Sector Membership using their Citizenship Identity (CID) card.</p>
                </div>

                <div className="pt-2 border-t border-[#E4DDD1]">
                  <div className="font-bold text-[#33261F] mb-0.5">How are international shipments tracked?</div>
                  <p>Live tracking is available on our platform with carrier integration for Bhutan Post EMS and DHL Express Courier.</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#EDE5D6]/40 border border-[#E4DDD1] text-xs text-[#6B5A4C] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#8B2E24] flex-none mt-0.5" />
              <div>
                <strong className="text-[#33261F] block mb-0.5">Public Benefit CSO Accountability</strong>
                HAB operates under statutory supervision of the Civil Society Organizations Authority (CSOA) of Bhutan.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

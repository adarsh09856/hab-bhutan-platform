'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApplicationFormData {
  planTier: 'artisan' | 'enterprise' | 'institution';
  craftKey: string;
  dzongkhag: string;
  fullName: string;
  cidNumber: string;
  businessLicense: string;
  mobile: string;
  email: string;
  villageGewog: string;
  yearsPractising: string;
  paymentMethod: 'card' | 'mbob' | 'bank';
}

interface CraftItem {
  key: string;
  name: string;
  english: string;
}

export default function MembershipApplyPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [membershipSettings, setMembershipSettings] = useState({
    activeDuesBTN: 1200,
    associateDuesBTN: 2500,
    institutionalDuesBTN: 10000,
    bankName: 'Bank of Bhutan (BoB)',
    accountNumber: '200847291038',
    accountTitle: 'Handicrafts Association of Bhutan',
    mbobQrUrl: '/images/mbob_qr_placeholder.png',
  });

  const [craftsList, setCraftsList] = useState<CraftItem[]>([
    { key: 'thagzo', name: 'Thagzo', english: 'Weaving' },
    { key: 'shingzo', name: 'Shingzo', english: 'Woodwork & Joinery' },
    { key: 'jimzo', name: 'Jimzo', english: 'Clay Sculpting' },
    { key: 'lhazo', name: 'Lhazo', english: 'Painting & Thangka' },
    { key: 'tshazo', name: 'Tshazo', english: 'Cane & Bamboo' },
    { key: 'garzo', name: 'Garzo', english: 'Blacksmithing' },
    { key: 'troeko', name: 'Troeko', english: 'Gold & Silversmithing' },
    { key: 'parzo', name: 'Parzo', english: 'Woodcarving & Block Printing' },
    { key: 'chuzo', name: 'Chuzo', english: 'Paper Making (Desho)' },
    { key: 'dezo', name: 'Dezo', english: 'Leather Work' },
    { key: 'tshemzo', name: 'Tshemzo', english: 'Tailoring & Embroidery' },
    { key: 'dozo', name: 'Dozo', english: 'Masonry' },
    { key: 'lugzo', name: 'Lugzo', english: 'Bronze Casting' },
  ]);

  const [formData, setFormData] = useState<ApplicationFormData>({
    planTier: 'artisan',
    craftKey: 'thagzo',
    dzongkhag: 'Lhuentse',
    fullName: '',
    cidNumber: '',
    businessLicense: '',
    mobile: '',
    email: '',
    villageGewog: '',
    yearsPractising: '',
    paymentMethod: 'card',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [appRefNumber, setAppRefNumber] = useState('HAB-2026-0417');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    // Fetch dynamic membership settings & dues
    fetch('/api/membership-settings')
      .then((res) => res.json())
      .then((d) => {
        if (d?.setting) {
          setMembershipSettings(d.setting);
        }
      })
      .catch(() => {});

    // Fetch dynamic crafts from DB
    fetch('/api/crafts')
      .then((res) => res.json())
      .then((d) => {
        if (d?.crafts && Array.isArray(d.crafts) && d.crafts.length > 0) {
          setCraftsList(d.crafts);
        }
      })
      .catch(() => {});
  }, []);

  const plans = [
    {
      key: 'artisan',
      name: 'Active Sector Member',
      price: `Nu. ${membershipSettings.activeDuesBTN.toLocaleString()} / year`,
      who: 'For an individual artisan or household workshop.',
      perks: 'Directory listing · training access · shop consignment · certificate',
    },
    {
      key: 'enterprise',
      name: 'Associate Sector Member',
      price: `Nu. ${membershipSettings.associateDuesBTN.toLocaleString()} / year`,
      who: 'For registered workshops, retail clusters and cooperatives.',
      perks: 'All artisan benefits · wholesale leads · trade fair slots · export support',
    },
    {
      key: 'institution',
      name: 'Institutional Member',
      price: `Nu. ${membershipSettings.institutionalDuesBTN.toLocaleString()} / year`,
      who: 'For schools, commercial galleries, corporations and partner organisations.',
      perks: 'Directory listing · annual publications · governance invitations',
    },
  ];

  const currentPlan = plans.find((p) => p.key === formData.planTier) || plans[0];

  // Validation for Step 2
  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name or enterprise name is required';
    if (!formData.cidNumber.trim()) {
      errors.cidNumber = 'Citizenship ID (CID) is required';
    } else if (!/^\d{11}$/.test(formData.cidNumber.trim())) {
      errors.cidNumber = 'Bhutanese CID must be exactly 11 numeric digits';
    }
    if (!formData.mobile.trim()) errors.mobile = 'Mobile phone number is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Valid email address is required';
    if (!formData.villageGewog.trim()) errors.villageGewog = 'Village / gewog is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      window.scrollTo(0, 0);
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
        window.scrollTo(0, 0);
      }
    } else if (currentStep === 3) {
      // Real submission to /api/applications
      setSubmitting(true);
      setSubmitError('');
      try {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicantName: formData.fullName,
            email: formData.email,
            phone: formData.mobile,
            cidNumber: formData.cidNumber,
            businessLicense: formData.businessLicense,
            craftKey: formData.craftKey,
            dzongkhag: formData.dzongkhag,
            villageGewog: formData.villageGewog,
            yearsPractising: formData.yearsPractising,
            planTier: formData.planTier,
            paymentMethod: formData.paymentMethod,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setAppRefNumber(data.reference);
          setCurrentStep(4);
          window.scrollTo(0, 0);
        } else {
          setSubmitError(data.error || 'Failed to submit application. Please check your information.');
        }
      } catch (err: any) {
        setSubmitError(err.message || 'Network error submitting application. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep < 4) {
      setCurrentStep((prev) => (prev - 1) as any);
      window.scrollTo(0, 0);
    }
  };

  const stepLabels = [
    { n: 1, label: 'Category & dues' },
    { n: 2, label: 'Your details' },
    { n: 3, label: 'Payment' },
  ];

  return (
    <main className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-16 sm:pb-24">
      {/* Breadcrumb */}
      <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-6 sm:mb-8">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        <Link href="/about" className="hover:underline">Membership</Link> /{' '}
        <span>Apply</span>
      </div>

      {currentStep < 4 ? (
        <>
          <div className="mb-8 sm:mb-10">
            <h1 className="font-marcellus text-2xl sm:text-3xl lg:text-[42px] font-normal text-[#33261F] mb-3">
              Apply for HAB membership
            </h1>
            <p className="font-lora text-sm sm:text-[17px] text-[#6B5A4C] leading-[1.6]">
              Three steps, about five minutes. Dues are annual and can be paid by card, mBoB or bank transfer.
            </p>
          </div>

          {/* Step Indicators */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-8 sm:mb-12">
            {stepLabels.map((st) => (
              <div
                key={st.n}
                className={`pt-2 sm:pt-3 border-t-[3px] transition-colors ${
                  st.n <= currentStep ? 'border-[#8B2E24]' : 'border-[#E4DDD1]'
                }`}
              >
                <div className="font-mono text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.14em] text-[#8B2E24] mb-1">
                  STEP {st.n}
                </div>
                <div className="font-figtree font-semibold text-xs sm:text-[15.5px] text-[#33261F] truncate">
                  {st.label}
                </div>
              </div>
            ))}
          </div>

          {submitError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-center justify-between">
              <span>{submitError}</span>
              <button onClick={() => setSubmitError('')} className="font-bold ml-2">✕</button>
            </div>
          )}

          {/* Step 1: Category & Dues */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-4">
                {plans.map((p) => {
                  const isSelected = formData.planTier === p.key;
                  return (
                    <div
                      key={p.key}
                      onClick={() => setFormData({ ...formData, planTier: p.key as any })}
                      className={`p-5 sm:p-6 rounded-[12px] border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#8B2E24] bg-[#FFFCF8]'
                          : 'border-[#E4DDD1] bg-[#FFFCF8] hover:border-[#CDBEA8]'
                      }`}
                    >
                      <div>
                        <div className="font-figtree font-bold text-lg sm:text-[20px] text-[#33261F] mb-1">
                          {p.name}
                        </div>
                        <div className="font-figtree font-bold text-base sm:text-[18px] text-[#8B2E24] mb-3">
                          {p.price}
                        </div>
                        <p className="font-lora text-xs sm:text-[14px] leading-[1.5] text-[#6B5A4C] mb-6">
                          {p.who}
                        </p>
                      </div>
                      <div className="font-mono text-[11px] text-[#4A3C33] pt-4 border-t border-[#EFE9DE]">
                        {p.perks}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Craft and Dzongkhag Select */}
              <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-5 sm:p-6 flex flex-col gap-4">
                <label className="font-figtree font-bold text-[14.5px] text-[#33261F]">
                  Primary craft category
                </label>
                <select
                  value={formData.craftKey}
                  onChange={(e) => setFormData({ ...formData, craftKey: e.target.value })}
                  className="bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-3 text-[14px] font-figtree outline-none"
                >
                  {craftsList.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name} — {c.english}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-5 sm:p-6 flex flex-col gap-4">
                <label className="font-figtree font-bold text-[14.5px] text-[#33261F]">
                  Dzongkhag (District)
                </label>
                <select
                  value={formData.dzongkhag}
                  onChange={(e) => setFormData({ ...formData, dzongkhag: e.target.value })}
                  className="bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-3 text-[14px] font-figtree outline-none"
                >
                  {['Bumthang', 'Chhukha', 'Dagana', 'Gasa', 'Haa', 'Lhuentse', 'Mongar', 'Paro', 'Pema Gatshel', 'Punakha', 'Samdrup Jongkhar', 'Samtse', 'Sarpang', 'Thimphu', 'Trashigang', 'Trashiyangtse', 'Trongsa', 'Tsirang', 'Wangdue Phodrang', 'Zhemgang'].map((dz) => (
                    <option key={dz} value={dz}>{dz}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 md:col-span-2 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-[#E4DDD1]">
                <div className="font-mono text-[12px] text-[#6B5A4C]">
                  Selected: {currentPlan.name} · {currentPlan.price}
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto font-figtree font-semibold text-[15px] bg-[#8B2E24] text-white px-7 py-3.5 rounded-[7px] hover:bg-[#6E241C] transition-colors cursor-pointer text-center"
                >
                  Continue to details →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Your Details */}
          {currentStep === 2 && (
            <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-5 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                <div className="col-span-2">
                  <label className="font-figtree font-bold text-[14px] text-[#33261F] block mb-2">
                    Full name / enterprise name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Kelzang Dorji"
                    className="w-full bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-3 text-[14px] font-figtree outline-none"
                  />
                  {formErrors.fullName && (
                    <span className="text-[12px] text-red-600 mt-1 block">{formErrors.fullName}</span>
                  )}
                </div>

                <div>
                  <label className="font-figtree font-bold text-[14px] text-[#33261F] block mb-2">
                    Citizenship ID (CID) *
                  </label>
                  <input
                    type="text"
                    value={formData.cidNumber}
                    onChange={(e) => setFormData({ ...formData, cidNumber: e.target.value })}
                    placeholder="11 digits (e.g. 10602001122)"
                    maxLength={11}
                    className="w-full bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-3 text-[14px] font-figtree outline-none"
                  />
                  {formErrors.cidNumber && (
                    <span className="text-[12px] text-red-600 mt-1 block">{formErrors.cidNumber}</span>
                  )}
                </div>

                <div>
                  <label className="font-figtree font-bold text-[14px] text-[#33261F] block mb-2">
                    Business licence no. (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.businessLicense}
                    onChange={(e) => setFormData({ ...formData, businessLicense: e.target.value })}
                    placeholder="BL-…"
                    className="w-full bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-3 text-[14px] font-figtree outline-none"
                  />
                </div>

                <div>
                  <label className="font-figtree font-bold text-[14px] text-[#33261F] block mb-2">
                    Mobile *
                  </label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+975 17 …"
                    className="w-full bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-3 text-[14px] font-figtree outline-none"
                  />
                  {formErrors.mobile && (
                    <span className="text-[12px] text-red-600 mt-1 block">{formErrors.mobile}</span>
                  )}
                </div>

                <div>
                  <label className="font-figtree font-bold text-[14px] text-[#33261F] block mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.bt"
                    className="w-full bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-3 text-[14px] font-figtree outline-none"
                  />
                  {formErrors.email && (
                    <span className="text-[12px] text-red-600 mt-1 block">{formErrors.email}</span>
                  )}
                </div>

                <div>
                  <label className="font-figtree font-bold text-[14px] text-[#33261F] block mb-2">
                    Village / gewog *
                  </label>
                  <input
                    type="text"
                    value={formData.villageGewog}
                    onChange={(e) => setFormData({ ...formData, villageGewog: e.target.value })}
                    placeholder="Khoma, Lhuentse"
                    className="w-full bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-3 text-[14px] font-figtree outline-none"
                  />
                  {formErrors.villageGewog && (
                    <span className="text-[12px] text-red-600 mt-1 block">{formErrors.villageGewog}</span>
                  )}
                </div>

                <div>
                  <label className="font-figtree font-bold text-[14px] text-[#33261F] block mb-2">
                    Years practising the craft
                  </label>
                  <input
                    type="number"
                    value={formData.yearsPractising}
                    onChange={(e) => setFormData({ ...formData, yearsPractising: e.target.value })}
                    placeholder="12"
                    className="w-full bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-3 text-[14px] font-figtree outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#E4DDD1]">
                <button
                  type="button"
                  onClick={handleBack}
                  className="font-figtree font-semibold text-[14.5px] border border-[#33261F] text-[#33261F] px-6 py-3 rounded-[7px] hover:bg-[#33261F] hover:text-white transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="font-figtree font-semibold text-[15px] bg-[#8B2E24] text-white px-7 py-3 rounded-[7px] hover:bg-[#6E241C] transition-colors cursor-pointer"
                >
                  Continue to payment →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
              {/* Payment Methods */}
              <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-5 sm:p-8 space-y-6">
                <h3 className="font-marcellus text-xl sm:text-[24px] font-normal text-[#33261F]">
                  Pay your annual dues
                </h3>

                <div className="flex flex-col gap-4">
                  {[
                    { key: 'card', name: 'International card', note: 'Visa, Mastercard, Amex — 3-D Secure' },
                    { key: 'mbob', name: 'Bhutan mobile pay (mBoB)', note: 'mBoB / RMA-approved QR wallets, in Nu.' },
                    { key: 'bank', name: 'Direct bank transfer', note: `${membershipSettings.bankName}, account ${membershipSettings.accountNumber}` },
                  ].map((pay) => {
                    const isSelected = formData.paymentMethod === pay.key;
                    return (
                      <div
                        key={pay.key}
                        onClick={() => setFormData({ ...formData, paymentMethod: pay.key as any })}
                        className={`p-4 sm:p-5 rounded-[10px] border-2 cursor-pointer transition-all flex items-start gap-4 ${
                          isSelected ? 'border-[#8B2E24] bg-[#FFFCF8]' : 'border-[#E4DDD1] hover:border-[#CDBEA8]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 ${
                            isSelected ? 'border-[#8B2E24]' : 'border-[#CDBEA8]'
                          }`}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#8B2E24]" />}
                        </div>
                        <div>
                          <div className="font-figtree font-bold text-base sm:text-[16px] text-[#33261F]">
                            {pay.name}
                          </div>
                          <div className="font-lora text-xs sm:text-[13.5px] text-[#6B5A4C]">
                            {pay.note}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bank Instructions Banner if Bank or mBoB is chosen */}
                {formData.paymentMethod === 'bank' && (
                  <div className="p-4 bg-[#F4F0E7] border border-[#CDBEA8] rounded-[10px] text-xs space-y-1">
                    <div className="font-bold text-[#33261F] text-sm mb-1">Official Bank Account Information</div>
                    <div><span className="font-semibold text-[#6B5A4C]">Bank:</span> {membershipSettings.bankName}</div>
                    <div><span className="font-semibold text-[#6B5A4C]">Account Title:</span> {membershipSettings.accountTitle}</div>
                    <div><span className="font-semibold text-[#6B5A4C]">Account No:</span> <span className="font-mono font-bold text-[#8B2E24]">{membershipSettings.accountNumber}</span></div>
                    <div className="text-[11px] text-[#6B5A4C] pt-2 border-t border-[#E4DDD1]">
                      Please deposit the dues amount and retain your deposit slip or transaction reference.
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-[#E4DDD1]">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="font-figtree font-semibold text-[14.5px] border border-[#33261F] text-[#33261F] px-6 py-3 rounded-[7px] hover:bg-[#33261F] hover:text-white transition-colors cursor-pointer"
                  >
                    ← Back to details
                  </button>
                </div>
              </div>

              {/* Order Summary Panel (Ink) */}
              <div className="bg-[#33261F] text-[#F1ECE2] rounded-[12px] p-5 sm:p-8">
                <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[#C9A46A] mb-4">
                  Summary
                </div>
                <div className="divide-y divide-[#4E3D2E] text-sm sm:text-[14.5px] font-lora mb-6">
                  <div className="py-3 flex justify-between">
                    <span className="text-[#D2C2AE]">Membership</span>
                    <span className="text-white font-figtree">{currentPlan.name}</span>
                  </div>
                  <div className="py-3 flex justify-between">
                    <span className="text-[#D2C2AE]">Craft category</span>
                    <span className="text-white font-figtree capitalize">{formData.craftKey}</span>
                  </div>
                  <div className="py-3 flex justify-between">
                    <span className="text-[#D2C2AE]">Dzongkhag</span>
                    <span className="text-white font-figtree">{formData.dzongkhag}</span>
                  </div>
                  <div className="pt-4 pb-2 flex justify-between items-baseline font-figtree">
                    <span className="text-[#D2C2AE]">Due today</span>
                    <span className="text-xl sm:text-[22px] font-bold text-white">{currentPlan.price}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleNext}
                  className="w-full font-figtree font-semibold text-[15.5px] bg-[#8B2E24] text-white py-3.5 sm:py-4 rounded-[8px] hover:bg-[#6E241C] transition-colors cursor-pointer text-center disabled:opacity-50"
                >
                  {submitting ? 'Submitting Application...' : 'Submit application'}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Step 4: Confirmation Screen */
        <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] p-6 sm:p-16 text-center max-w-[680px] mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#EFF0E4] text-[#4C6B41] text-[28px] font-bold flex items-center justify-center mx-auto mb-6">
            ✓
          </div>
          <h2 className="font-marcellus text-[32px] font-normal text-[#33261F] mb-4">
            Application received
          </h2>
          <p className="font-lora text-[16.5px] leading-[1.62] text-[#4A3C33] mb-4">
            Thank you for applying to join the Handicrafts Association of Bhutan. Your application reference is{' '}
            <strong className="font-mono text-[#8B2E24]">{appRefNumber}</strong>.
          </p>
          <p className="font-lora text-[15px] leading-[1.6] text-[#6B5A4C] mb-8">
            The secretariat will verify your citizenship credentials and craft background within five working days. You will receive an official confirmation and consignment intake packet by email.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="font-figtree font-semibold text-[14.5px] bg-[#33261F] text-[#F4F0E7] px-6 py-3.5 rounded-[7px] hover:bg-[#8B2E24] transition-colors"
            >
              Go to member area
            </Link>
            <Link
              href="/"
              className="font-figtree font-semibold text-[14.5px] border border-[#CDBEA8] text-[#33261F] px-6 py-3.5 rounded-[7px] hover:border-[#33261F] transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

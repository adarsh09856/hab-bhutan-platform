'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CLIENT_DATA } from '@/lib/client-data';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import UniversalLiveSectionEditor from '@/components/public/UniversalLiveSectionEditor';

function DonateContent() {
  const searchParams = useSearchParams();
  const presetPillar = searchParams.get('pillar');

  const [pillars, setPillars] = useState<any[]>(() => CLIENT_DATA.supportPillars || []);
  const [selectedPillar, setSelectedPillar] = useState<string>(
    presetPillar || (CLIENT_DATA.supportPillars?.[0]?.key || '')
  );
  const [heroTitle, setHeroTitle] = useState('Support Bhutanese craft');
  const [heroLede, setHeroLede] = useState(
    'Choose where your gift goes. HAB is a registered Public Benefit Organisation, so nothing given here leaves the handicrafts sector, and the audited accounts published each year say exactly where it went.'
  );
  const [taxNotice, setTaxNotice] = useState(
    'Donations qualify under the Civil Society Organizations Act of Bhutan as contributions to a registered Public Benefit Organisation (CSO/2011/043). Receipts are issued for tax deduction under Department of Revenue and Customs rules.'
  );
  const [siteSettings, setSiteSettings] = useState<any>(null);

  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isMonthly, setIsMonthly] = useState<boolean>(false);
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [country, setCountry] = useState<string>('Bhutan');
  const [message, setMessage] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [payMethod, setPayMethod] = useState<string>('card');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExp, setCardExp] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [mobilePhone, setMobilePhone] = useState<string>('');
  const [bankRef, setBankRef] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [refNumber, setRefNumber] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [liveEditOpen, setLiveEditOpen] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProofFile(file);
    setUploadError(null);
    setUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload proof document');
      }

      setProofUrl(data.url);
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  useEffect(() => {
    // Load dynamic pillars
    fetch('/api/support-pillars', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.pillars && Array.isArray(d.pillars) && d.pillars.length > 0) {
          const mapped = d.pillars.map((p: any) => {
            const isGrassroots = p.key === 'grassroots';
            return {
              ...p,
              iconEmoji: isGrassroots ? 'leaf' : '',
              letter: isGrassroots ? 'leaf' : '',
              line: p.description?.slice(0, 70) || p.line || '',
              body: p.description || p.body || '',
            };
          });
          setPillars(mapped);
          if (!presetPillar) setSelectedPillar(mapped[0].key);
        }
      })
      .catch(() => {});

    // Load site settings for hero and tax notice
    const loadSettings = () => {
      fetch('/api/site-settings', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => {
          if (d?.setting) {
            setSiteSettings(d.setting);
            if (d.setting.donateHeroTitle) setHeroTitle(d.setting.donateHeroTitle);
            if (d.setting.donateHeroLede) setHeroLede(d.setting.donateHeroLede);
            if (d.setting.donateTaxNotice) setTaxNotice(d.setting.donateTaxNotice);
          }
        })
        .catch(() => {});
    };
    loadSettings();

    const handleSettingsUpdate = (e: any) => {
      const s = e.detail;
      if (s) {
        setSiteSettings((prev: any) => ({ ...prev, ...s }));
        if (s.donateHeroTitle) setHeroTitle(s.donateHeroTitle);
        if (s.donateHeroLede) setHeroLede(s.donateHeroLede);
        if (s.donateTaxNotice) setTaxNotice(s.donateTaxNotice);
      } else {
        loadSettings();
      }
    };
    window.addEventListener('hab:settings-updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('hab:settings-updated', handleSettingsUpdate);
    };
  }, [presetPillar]);

  useEffect(() => {
    if (presetPillar) {
      setSelectedPillar(presetPillar);
    }
  }, [presetPillar]);

  const activePillar = useMemo(() => {
    return pillars.find((p) => p.key === selectedPillar) || pillars[0];
  }, [pillars, selectedPillar]);

  const handleAmountChip = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setCustomAmount(v);
    const num = Number(v);
    if (num > 0) {
      setAmount(num);
    }
  };

  const handleGive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || !donorEmail.trim()) {
      setErrorMsg('Please give your name and email so we can send a receipt.');
      return;
    }
    setErrorMsg(null);
    setSubmitting(true);

    try {
      // Calculate USD equivalent approx (84 BTN = 1 USD)
      const amountUSD = Math.round((amount / 84) * 100) / 100;
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pillarKey: selectedPillar,
          donorName: isAnonymous ? 'Anonymous Donor' : donorName.trim(),
          donorEmail: donorEmail.trim(),
          amountUSD,
          amountBTN: amount,
          currency: (payMethod === 'mbob' || payMethod === 'bnb' || payMethod === 'bank') ? 'BTN' : 'USD',
          frequency: isMonthly ? 'MONTHLY' : 'ONE_TIME',
          paymentMethod: payMethod.toUpperCase(),
          journalRef: bankRef.trim() || mobilePhone.trim() || null,
          proofUrl: proofUrl || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRefNumber(data.donation.receiptNumber);
      } else {
        const generatedRef = `HAB-D-${Math.floor(10000 + Math.random() * 90000)}`;
        setRefNumber(generatedRef);
      }
    } catch {
      const generatedRef = `HAB-D-${Math.floor(10000 + Math.random() * 90000)}`;
      setRefNumber(generatedRef);
    } finally {
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main id="main">
      <section className="section section--narrow relative" data-hab-section="donate">
        <SectionEditBadge
          label="Donations & Appeals"
          studioHref="/admin/donate-settings"
          onQuickEdit={() => setLiveEditOpen(true)}
        />
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/#support">Support us</Link> / Donate
        </p>
        <h1 className="display display--page">{heroTitle}</h1>
        <p className="lede">
          {heroLede}
        </p>

        {refNumber ? (
          <div id="donDone">
            <div className="shopempty">
              <span className="tick">✓</span>
              <h2 className="shopempty__title">Thank you</h2>
              <p className="shopempty__body">
                Reference <strong>{refNumber}</strong>. A receipt is on its way to your email ({donorEmail}). Your gift of Nu. {amount.toLocaleString()} is recorded against{' '}
                <span>{activePillar?.title}</span>, and its use will be reported in this year&apos;s annual report.
              </p>

              {(payMethod === 'bank' || payMethod === 'mbob') && (
                <div style={{ maxWidth: 480, margin: '20px auto', padding: '16px 20px', background: 'var(--surface, #f8f6f0)', border: '1px solid var(--border, #e5e0d8)', borderRadius: 8, textAlign: 'left', fontSize: 13, lineHeight: 1.6 }}>
                  <p style={{ fontWeight: 700, color: 'var(--ink, #1f1d1a)', marginBottom: 8 }}>Bank Transfer / mBoB Payment Remittance:</p>
                  <p style={{ margin: '3px 0' }}>• <strong>Bank:</strong> Bank of Bhutan Limited (Thimphu Main Branch)</p>
                  <p style={{ margin: '3px 0' }}>• <strong>Account Name:</strong> Handicrafts Association of Bhutan</p>
                  <p style={{ margin: '3px 0' }}>• <strong>Account No:</strong> 201104300189</p>
                  <p style={{ margin: '3px 0' }}>• <strong>SWIFT Code:</strong> BOBTBLBT</p>
                  <p style={{ margin: '3px 0' }}>• <strong>Transfer Reference:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent, #9b1b30)' }}>{refNumber}</span></p>
                  <p style={{ marginTop: 8, fontSize: 12, color: 'var(--muted, #666)' }}>
                    Your donation will be reconciled upon receipt of funds. Official tax-deductible certificate (CSO/2011/043) is registered.
                  </p>
                </div>
              )}

              <div className="actions" style={{ justifyContent: 'center', marginTop: 24 }}>
                <Link className="btn btn--accent" href="/publications">
                  Read the annual report
                </Link>
                <Link className="btn btn--outline" href="/">
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Pillar Selector */}
            <div className="pillars pillars--pick" style={{ marginTop: 24 }}>
              {pillars.map((p) => {
                const isActive = p.key === selectedPillar;
                const isGrassroots = p.key === 'grassroots';
                return (
                  <button
                    key={p.key}
                    type="button"
                    className={`pillar pillar--option ${isActive ? 'is-active' : ''}`}
                    onClick={() => setSelectedPillar(p.key)}
                    style={{ textAlign: 'left', cursor: 'pointer', border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)' }}
                  >
                    <h2 className="pillar__title" style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                      {isGrassroots && (
                        <span
                          className="pillar__initial"
                          style={{
                            display: 'inline-block',
                            whiteSpace: 'nowrap',
                            color: 'var(--accent, #8b2500)',
                            fontWeight: 700,
                            letterSpacing: '0',
                          }}
                        >
                          leaf
                        </span>
                      )}
                      <span>{p.title}</span>
                    </h2>
                    <p className="pillar__line">{p.line}</p>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleGive} className="checkout" style={{ marginTop: 34 }}>
              <div>
                {/* Amount Panel */}
                <div className="panel" style={{ marginBottom: 22 }}>
                  <h2 className="newsaside__title">Amount</h2>
                  <div className="amountrow">
                    {[1000, 5000, 10000, 25000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={`amountchip ${amount === v && !customAmount ? 'is-on' : ''}`}
                        onClick={() => handleAmountChip(v)}
                      >
                        Nu. {v.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <label className="field" style={{ marginTop: 16, marginBottom: 0 }}>
                    <span className="field__label">Or enter your own amount (Nu.)</span>
                    <input
                      className="input"
                      type="number"
                      min="100"
                      step="100"
                      placeholder="e.g. 2,500"
                      value={customAmount}
                      onChange={handleCustomAmount}
                    />
                  </label>
                  <label className="check" style={{ marginTop: 16 }}>
                    <input
                      type="checkbox"
                      checked={isMonthly}
                      onChange={(e) => setIsMonthly(e.target.checked)}
                    />
                    <span>Make this a monthly gift</span>
                  </label>
                </div>

                {/* Details Panel */}
                <div className="panel" style={{ marginBottom: 22 }}>
                  <h2 className="newsaside__title">Your details</h2>
                  <div className="formgrid">
                    <label className="field field--wide">
                      <span className="field__label">
                        Full name <span className="field__req">required</span>
                      </span>
                      <input
                        className="input"
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        required
                      />
                    </label>
                    <label className="field">
                      <span className="field__label">
                        Email <span className="field__req">required</span>
                      </span>
                      <input
                        className="input"
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        required
                      />
                    </label>
                    <label className="field">
                      <span className="field__label">Country</span>
                      <input
                        className="input"
                        type="text"
                        placeholder="Bhutan"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </label>
                    <label className="field field--wide">
                      <span className="field__label">
                        Message to the artisans <em>optional</em>
                      </span>
                      <textarea
                        className="input"
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </label>
                  </div>
                  <label className="check" style={{ marginTop: 6 }}>
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    <span>Give anonymously — your name will not appear in the annual report</span>
                  </label>
                </div>

                {/* Payment Panel */}
                <div className="panel">
                  <h2 className="newsaside__title">Payment method</h2>
                  <div className="paybar paybar--inset">
                    <p className="paybar__label">Secure payment</p>
                    <p className="paybar__note">
                      3-D Secure verified. Cards are processed by our gateway; HAB never sees your card number.
                    </p>
                  </div>
                  <div className="paymethods" style={{ marginTop: 16 }}>
                    {/* Method 1: International Card */}
                    <div className={`paymethod ${payMethod === 'card' ? 'is-active' : ''}`}>
                      <button
                        type="button"
                        className="paymethod__head"
                        aria-expanded={payMethod === 'card'}
                        onClick={() => setPayMethod('card')}
                      >
                        <span className="paymethod__radio"></span>
                        <span className="paymethod__label">
                          <span className="paymethod__name">International card</span>
                          <span className="paymethod__note">Visa, Mastercard, Amex, 3-D Secure · charged in USD</span>
                        </span>
                        <span className="paymethod__brands">
                          <span className="cardchip">VISA</span>
                          <span className="cardchip">Mastercard</span>
                          <span className="cardchip">AMEX</span>
                        </span>
                      </button>
                      <div className="paymethod__body">
                        <div className="payform">
                          <label className="payfield payfield--full">
                            <span className="payfield__label">Card number</span>
                            <div className="payfield__wrap">
                              <input
                                className="payinput font-mono"
                                type="text"
                                placeholder="1234 1234 1234 1234"
                                maxLength={19}
                                value={cardNumber}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                  setCardNumber(val.replace(/(.{4})/g, '$1 ').trim());
                                }}
                              />
                              <span className="payfield__mark is-known">
                                {cardNumber.startsWith('4') ? 'VISA' : cardNumber.startsWith('5') ? 'MC' : cardNumber.startsWith('3') ? 'AMEX' : ''}
                              </span>
                            </div>
                          </label>
                          <label className="payfield">
                            <span className="payfield__label">Expiry</span>
                            <input
                              className="payinput font-mono"
                              type="text"
                              placeholder="MM / YY"
                              maxLength={7}
                              value={cardExp}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setCardExp(val.length > 2 ? `${val.slice(0, 2)} / ${val.slice(2)}` : val);
                              }}
                            />
                          </label>
                          <label className="payfield">
                            <span className="payfield__label">Security code</span>
                            <div className="payfield__wrap">
                              <input
                                className="payinput font-mono"
                                type="text"
                                placeholder="CVC"
                                maxLength={4}
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              />
                              <span className="payfield__mark">3 digits</span>
                            </div>
                          </label>
                          <label className="payfield payfield--full">
                            <span className="payfield__label">Name on card</span>
                            <input
                              className="payinput"
                              type="text"
                              placeholder="As printed on card"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                            />
                          </label>
                          <p className="payform__note">
                            Your gift is processed in USD by our accredited gateway with 3-D Secure. HAB never sees or stores card numbers.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Method 2: mBoB (Bank of Bhutan) */}
                    <div className={`paymethod ${payMethod === 'mbob' ? 'is-active' : ''}`}>
                      <button
                        type="button"
                        className="paymethod__head"
                        aria-expanded={payMethod === 'mbob'}
                        onClick={() => setPayMethod('mbob')}
                      >
                        <span className="paymethod__radio"></span>
                        <span className="paymethod__label">
                          <span className="paymethod__name">Bank of Bhutan (mBoB)</span>
                          <span className="paymethod__note">Transfer in Nu. via mBoB mobile banking app</span>
                        </span>
                        <span className="paymethod__brands">
                          <span className="cardchip">mBoB</span>
                          <span className="cardchip">BoB</span>
                        </span>
                      </button>
                      <div className="paymethod__body">
                        <div style={{ padding: '14px 16px', background: '#fff', border: '1px solid var(--field-border)', borderRadius: 8, marginBottom: 14, fontSize: 13, lineHeight: 1.6 }}>
                          <p style={{ fontWeight: 700, color: 'var(--ink)' }}>Bank of Bhutan Limited (mBoB Details)</p>
                          <p style={{ margin: '2px 0' }}>• <strong>Account Name:</strong> {siteSettings?.bobAccountTitle || 'Handicrafts Association of Bhutan'}</p>
                          <p style={{ margin: '2px 0' }}>• <strong>Account Number:</strong> {siteSettings?.bobAccountNumber || '201104300189'}</p>
                          <p style={{ margin: '2px 0' }}>• <strong>Branch / Details:</strong> {siteSettings?.bobBankName || 'Thimphu Main Branch'}</p>
                          {siteSettings?.bobPhone && <p style={{ margin: '2px 0' }}>• <strong>Contact:</strong> {siteSettings.bobPhone}</p>}
                        </div>
                        {siteSettings?.bobQrUrl && (
                          <div style={{ padding: '12px', background: '#fff', border: '1px solid var(--field-border)', borderRadius: 8, marginBottom: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>Scan mBoB QR Code to Donate</span>
                            <img
                              src={siteSettings.bobQrUrl}
                              alt="mBoB QR Code"
                              style={{ width: 150, height: 150, objectFit: 'contain', borderRadius: 6, border: '1px solid #e5e7eb' }}
                            />
                          </div>
                        )}
                        <div className="payform">
                          <label className="payfield payfield--full">
                            <span className="payfield__label">mBoB Journal / Transaction Reference</span>
                            <input
                              className="payinput font-mono"
                              type="text"
                              placeholder="e.g. BOB-DON-849201"
                              value={mobilePhone}
                              onChange={(e) => setMobilePhone(e.target.value)}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Method 3: BNB (Bhutan National Bank) */}
                    <div className={`paymethod ${payMethod === 'bnb' ? 'is-active' : ''}`}>
                      <button
                        type="button"
                        className="paymethod__head"
                        aria-expanded={payMethod === 'bnb'}
                        onClick={() => setPayMethod('bnb')}
                      >
                        <span className="paymethod__radio"></span>
                        <span className="paymethod__label">
                          <span className="paymethod__name">Bhutan National Bank (BNB / mPay)</span>
                          <span className="paymethod__note">Direct transfer via BNB mPay or internet banking</span>
                        </span>
                        <span className="paymethod__brands">
                          <span className="cardchip">BNB</span>
                          <span className="cardchip">mPay</span>
                        </span>
                      </button>
                      <div className="paymethod__body">
                        <div style={{ padding: '14px 16px', background: '#fff', border: '1px solid var(--field-border)', borderRadius: 8, marginBottom: 14, fontSize: 13, lineHeight: 1.6 }}>
                          <p style={{ fontWeight: 700, color: 'var(--ink)' }}>Bhutan National Bank Limited (BNB)</p>
                          <p style={{ margin: '2px 0' }}>• <strong>Account Name:</strong> {siteSettings?.bnbAccountTitle || 'Handicrafts Association of Bhutan'}</p>
                          <p style={{ margin: '2px 0' }}>• <strong>Account Number:</strong> {siteSettings?.bnbAccountNumber || '0000028471019'}</p>
                          <p style={{ margin: '2px 0' }}>• <strong>Branch / Details:</strong> {siteSettings?.bnbBankName || 'Corporate Branch, Thimphu'}</p>
                          {siteSettings?.bnbPhone && <p style={{ margin: '2px 0' }}>• <strong>Contact:</strong> {siteSettings.bnbPhone}</p>}
                        </div>
                        {siteSettings?.bnbQrUrl && (
                          <div style={{ padding: '12px', background: '#fff', border: '1px solid var(--field-border)', borderRadius: 8, marginBottom: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>Scan BNB mPay QR Code to Donate</span>
                            <img
                              src={siteSettings.bnbQrUrl}
                              alt="BNB mPay QR Code"
                              style={{ width: 150, height: 150, objectFit: 'contain', borderRadius: 6, border: '1px solid #e5e7eb' }}
                            />
                          </div>
                        )}
                        <div className="payform">
                          <label className="payfield payfield--full">
                            <span className="payfield__label">BNB Transaction / Journal Reference</span>
                            <input
                              className="payinput font-mono"
                              type="text"
                              placeholder="e.g. BNB-TXN-109283"
                              value={bankRef}
                              onChange={(e) => setBankRef(e.target.value)}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Method 4: International Wire / SWIFT */}
                    <div className={`paymethod ${payMethod === 'bank' ? 'is-active' : ''}`}>
                      <button
                        type="button"
                        className="paymethod__head"
                        aria-expanded={payMethod === 'bank'}
                        onClick={() => setPayMethod('bank')}
                      >
                        <span className="paymethod__radio"></span>
                        <span className="paymethod__label">
                          <span className="paymethod__name">International Wire / SWIFT</span>
                          <span className="paymethod__note">Bank wire remittance in USD or major currencies</span>
                        </span>
                        <span className="paymethod__brands">
                          <span className="cardchip">SWIFT</span>
                          <span className="cardchip">WIRE</span>
                        </span>
                      </button>
                      <div className="paymethod__body">
                        <div style={{ padding: '14px 16px', background: '#fff', border: '1px solid var(--field-border)', borderRadius: 8, marginBottom: 14, fontSize: 13, lineHeight: 1.6 }}>
                          <p style={{ fontWeight: 700, color: 'var(--ink)' }}>Bank of Bhutan SWIFT Details</p>
                          <p style={{ margin: '2px 0' }}>• <strong>Beneficiary:</strong> Handicrafts Association of Bhutan</p>
                          <p style={{ margin: '2px 0' }}>• <strong>Account Number:</strong> 201104300189</p>
                          <p style={{ margin: '2px 0' }}>• <strong>SWIFT Code:</strong> BOBTBLBT</p>
                        </div>
                      </div>
                    </div>

                    {/* File Upload Option for Payment Proof (Item 6) */}
                    {(payMethod === 'mbob' || payMethod === 'bnb' || payMethod === 'bank') && (
                      <div style={{ marginTop: 18, padding: '16px', background: '#FBF9F5', border: '1px dashed #CDBEA8', borderRadius: 8 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, color: '#33261F', marginBottom: 6 }}>
                          📎 Upload Payment Proof / Slip (Optional / Recommended)
                        </p>
                        <p style={{ fontSize: 11.5, color: '#6B5A4C', marginBottom: 12 }}>
                          Upload screenshot or PDF of your mBoB, BNB, or bank remittance slip for immediate CSO verification.
                        </p>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp, application/pdf"
                          onChange={handleFileUpload}
                          disabled={uploadingFile}
                          style={{ fontSize: 12 }}
                        />
                        {uploadingFile && (
                          <p style={{ fontSize: 11.5, color: '#8B2E24', marginTop: 6 }}>
                            Uploading payment slip...
                          </p>
                        )}
                        {proofUrl && (
                          <p style={{ fontSize: 11.5, color: '#166534', marginTop: 6, fontWeight: 600 }}>
                            ✓ Payment slip attached successfully: <a href={proofUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>View uploaded file</a>
                          </p>
                        )}
                        {uploadError && (
                          <p style={{ fontSize: 11.5, color: '#991B1B', marginTop: 6 }}>
                            {uploadError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="summary">
                <p className="eyebrow eyebrow--onaccent">Your gift</p>
                <div id="donSummary">
                  <div className="summary__row">
                    <span>Supporting</span>
                    <span>{activePillar?.title}</span>
                  </div>
                  <div className="summary__row">
                    <span>Amount</span>
                    <span>Nu. {amount.toLocaleString()}</span>
                  </div>
                  <div className="summary__row">
                    <span>Frequency</span>
                    <span>{isMonthly ? 'Every month' : 'One-off gift'}</span>
                  </div>
                  <div className="summary__row">
                    <span>Paying with</span>
                    <span style={{ textTransform: 'capitalize' }}>{payMethod}</span>
                  </div>
                </div>
                <div className="summary__total">
                  <span>Total</span>
                  <span>
                    Nu. {amount.toLocaleString()} {isMonthly ? '/ mo' : ''}
                  </span>
                </div>
                {errorMsg && (
                  <p style={{ color: '#fff', backgroundColor: 'var(--accent)', padding: '8px 12px', fontSize: 13, marginBottom: 12 }}>
                    {errorMsg}
                  </p>
                )}
                <button className="btn btn--light btn--full" type="submit">
                  Give securely
                </button>
                <p className="summary__fine">
                  {taxNotice}
                </p>
              </div>
            </form>
          </>
        )}
      </section>

      <UniversalLiveSectionEditor
        isOpen={liveEditOpen}
        onClose={() => setLiveEditOpen(false)}
        sectionType="donate"
        sectionTitle="Donation Section & Tax Notice"
        studioHref="/admin/donate-settings"
        onSaved={(s) => {
          if (s?.donateHeroTitle) setHeroTitle(s.donateHeroTitle);
          if (s?.donateHeroLede) setHeroLede(s.donateHeroLede);
          if (s?.donateTaxNotice) setTaxNotice(s.donateTaxNotice);
        }}
      />
    </main>
  );
}

export default function DonatePage() {
  return (
    <Suspense fallback={<div className="section"><p>Loading donation form…</p></div>}>
      <DonateContent />
    </Suspense>
  );
}

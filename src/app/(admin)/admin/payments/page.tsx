'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Banknote, 
  QrCode, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);

  const [config, setConfig] = useState({
    card: {
      enabled: true,
      mode: 'TEST',
      provider: 'STRIPE',
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
    },
    cod: {
      enabled: true,
      bhutanOnly: true,
      maxOrderAmountBTN: 50000,
      instructions: 'Pay in cash or via mBoB directly to the delivery courier upon receiving your parcel.',
    },
    mbob: {
      enabled: true,
      accountTitle: 'Handicrafts Association of Bhutan',
      accountNumber: '200847291 - Bank of Bhutan',
      phone: '+975 17462636',
      qrImageUrl: '',
      requireJournalRef: true,
      instructions: 'Transfer via mBoB / B-Wallet or scan QR. Enter your Bank Journal / Reference Number during checkout.',
    },
    bank: {
      enabled: true,
      bankName: 'Bank of Bhutan Ltd',
      accountTitle: 'Handicrafts Association of Bhutan',
      accountNumber: '1009234810293',
      swiftCode: 'BOBBBT22',
      branch: 'Corporate Branch, Norzin Lam, Thimphu, Bhutan',
      instructions: 'Transfer order amount in USD or BTN to our official CSO account. Reference your order number on the wire advice.',
    },
  });

  const loadSettings = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/payments', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.gateways) {
          setConfig(data.gateways);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || `Failed to load payment settings (${res.status}).`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error fetching payment configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('✓ Payment gateway configurations saved successfully. Checkout options updated.');
        setTimeout(() => setSuccessMsg(''), 4000);
        await loadSettings();
      } else {
        setErrorMsg(data.error || 'Failed to save payment settings.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs font-mono flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span>Loading payment gateway configurations...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-amber-400" />
            Payment Gateways &amp; Methods Control Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure live payment gateways, Cash on Delivery (COD), Bhutan mBoB QR details, and international Bank Wire settlement instructions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadSettings}
            className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 admin-button-primary text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50 transition"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save All Settings'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-400/25 text-emerald-200 text-xs font-medium rounded-lg flex justify-between items-center shadow-lg">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {successMsg}
          </span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-300 font-bold ml-2">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-500/15 border border-rose-400/25 text-rose-200 text-xs font-medium rounded-lg flex justify-between items-center shadow-lg">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            {errorMsg}
          </span>
          <button onClick={() => setErrorMsg('')} className="text-rose-300 font-bold ml-2">✕</button>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gateway 1: Credit & Debit Card Online Gateway */}
        <div className="admin-card bg-slate-900/80 border border-white/10 rounded-xl p-5 shadow-xl flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-400/20">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Credit / Debit Card Online</h3>
                  <p className="text-xs text-slate-400">Stripe &amp; 3D-Secure International Gateway</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.card.enabled}
                  onChange={(e) => setConfig({ ...config, card: { ...config.card, enabled: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-white/10 text-xs">
              <span className="text-slate-300 font-medium">Gateway Environment Mode:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, card: { ...config.card, mode: 'TEST' } })}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    config.card.mode === 'TEST'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Sandbox / Test Mode
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, card: { ...config.card, mode: 'LIVE' } })}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    config.card.mode === 'LIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔒 Live Production
                </button>
              </div>
            </div>

            {config.card.mode === 'TEST' ? (
              <div className="p-3 bg-amber-500/10 border border-amber-400/20 rounded-lg text-xs text-amber-200/90 leading-relaxed">
                <strong>Sandbox Active:</strong> Checkouts will be simulated. Customers can test card payments, and orders will be marked with a test tag so staff can distinguish demo orders from real bank settlements.
              </div>
            ) : (
              <div className="p-3 bg-emerald-500/10 border border-emerald-400/20 rounded-lg text-xs text-emerald-200/90 leading-relaxed">
                <strong>Live Mode Active:</strong> Authentic 3D-Secure card charges will be authorized and settled to your merchant account.
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Publishable Key</label>
                <input
                  type="text"
                  placeholder="pk_test_... or pk_live_..."
                  value={config.card.publishableKey}
                  onChange={(e) => setConfig({ ...config, card: { ...config.card, publishableKey: e.target.value } })}
                  className="w-full admin-input bg-slate-950/60 text-white border border-white/15 rounded-lg px-3 py-2 font-mono text-xs outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 font-medium">Secret Key (Encrypted)</label>
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {showSecretKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showSecretKey ? 'Hide' : 'Reveal'}
                  </button>
                </div>
                <input
                  type={showSecretKey ? 'text' : 'password'}
                  placeholder="sk_test_... or sk_live_..."
                  value={config.card.secretKey}
                  onChange={(e) => setConfig({ ...config, card: { ...config.card, secretKey: e.target.value } })}
                  className="w-full admin-input bg-slate-950/60 text-white border border-white/15 rounded-lg px-3 py-2 font-mono text-xs outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Webhook Secret (Optional)</label>
                <input
                  type="password"
                  placeholder="whsec_..."
                  value={config.card.webhookSecret}
                  onChange={(e) => setConfig({ ...config, card: { ...config.card, webhookSecret: e.target.value } })}
                  className="w-full admin-input bg-slate-950/60 text-white border border-white/15 rounded-lg px-3 py-2 font-mono text-xs outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Status:</span>
            <span className={`font-semibold ${config.card.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
              {config.card.enabled ? (config.card.mode === 'LIVE' ? '● Live Online' : '● Sandbox Active') : '○ Disabled'}
            </span>
          </div>
        </div>

        {/* Gateway 2: Cash on Delivery (COD) */}
        <div className="admin-card bg-slate-900/80 border border-white/10 rounded-xl p-5 shadow-xl flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-400/20">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Cash on Delivery (COD)</h3>
                  <p className="text-xs text-slate-400">Pay upon parcel arrival via Cash or mBoB</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.cod.enabled}
                  onChange={(e) => setConfig({ ...config, cod: { ...config.cod, enabled: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="p-3 bg-slate-950/60 border border-white/10 rounded-lg text-xs space-y-2">
              <label className="flex items-center gap-2.5 text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.cod.bhutanOnly}
                  onChange={(e) => setConfig({ ...config, cod: { ...config.cod, bhutanOnly: e.target.checked } })}
                  className="rounded border-white/20 bg-slate-900 text-amber-400 focus:ring-0"
                />
                <span className="font-medium">Restrict COD to deliveries within Bhutan only</span>
              </label>
              <p className="text-[11px] text-slate-400 pl-6">
                Recommended: International shipments through EMS or DHL require advance payment before export dispatch.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Maximum Order Cap (Nu. BTN)</label>
                <input
                  type="number"
                  value={config.cod.maxOrderAmountBTN}
                  onChange={(e) => setConfig({ ...config, cod: { ...config.cod, maxOrderAmountBTN: parseInt(e.target.value, 10) || 50000 } })}
                  className="w-full admin-input bg-slate-950/60 text-white border border-white/15 rounded-lg px-3 py-2 font-mono text-xs outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">Orders above this threshold require advance payment.</p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Customer Delivery Instructions</label>
                <textarea
                  rows={3}
                  value={config.cod.instructions}
                  onChange={(e) => setConfig({ ...config, cod: { ...config.cod, instructions: e.target.value } })}
                  placeholder="Instructions displayed to customer at checkout..."
                  className="w-full admin-input bg-slate-950/60 text-white border border-white/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Status:</span>
            <span className={`font-semibold ${config.cod.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
              {config.cod.enabled ? '● Active in Checkout' : '○ Disabled'}
            </span>
          </div>
        </div>

        {/* Gateway 3: mBoB Mobile Banking (QR & P2P) */}
        <div className="admin-card bg-slate-900/80 border border-white/10 rounded-xl p-5 shadow-xl flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-teal-500/15 text-teal-400 border border-teal-400/20">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">mBoB / Bhutan Mobile Banking</h3>
                  <p className="text-xs text-slate-400">Bank of Bhutan QR code &amp; P2P app transfer</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mbob.enabled}
                  onChange={(e) => setConfig({ ...config, mbob: { ...config.mbob, enabled: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Account Title</label>
                <input
                  type="text"
                  value={config.mbob.accountTitle}
                  onChange={(e) => setConfig({ ...config, mbob: { ...config.mbob, accountTitle: e.target.value } })}
                  className="w-full admin-input bg-slate-950/60 text-white border border-white/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Account Number &amp; Bank</label>
                <input
                  type="text"
                  value={config.mbob.accountNumber}
                  onChange={(e) => setConfig({ ...config, mbob: { ...config.mbob, accountNumber: e.target.value } })}
                  className="w-full admin-input bg-slate-950/60 text-white border border-white/15 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">mBoB Notification Mobile #</label>
                <input
                  type="text"
                  value={config.mbob.phone}
                  onChange={(e) => setConfig({ ...config, mbob: { ...config.mbob, phone: e.target.value } })}
                  className="w-full admin-input bg-slate-950/60 text-white border border-white/15 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">QR Code Image URL</label>
                <input
                  type="text"
                  placeholder="/images/mbob-qr.png"
                  value={config.mbob.qrImageUrl}
                  onChange={(e) => setConfig({ ...config, mbob: { ...config.mbob, qrImageUrl: e.target.value } })}
                  className="w-full admin-input bg-slate-950/60 text-white border border-white/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-white/10 rounded-lg text-xs space-y-2">
              <label className="flex items-center gap-2.5 text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mbob.requireJournalRef}
                  onChange={(e) => setConfig({ ...config, mbob: { ...config.mbob, requireJournalRef: e.target.checked } })}
                  className="rounded border-white/20 bg-slate-900 text-amber-400 focus:ring-0"
                />
                <span className="font-medium">Require customer to enter Journal / Reference Number</span>
              </label>
              <p className="text-[11px] text-slate-400 pl-6">
                Prevents unverified orders by prompting the customer to input the 6-12 digit reference from their banking app.
              </p>
            </div>

            <div className="text-xs">
              <label className="block text-slate-300 font-medium mb-1">Customer Guidance Notes</label>
              <textarea
                rows={2}
                value={config.mbob.instructions}
                onChange={(e) => setConfig({ ...config, mbob: { ...config.mbob, instructions: e.target.value } })}
                className="w-full admin-input bg-slate-950/60 text-white border border-white/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Status:</span>
            <span className={`font-semibold ${config.mbob.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
              {config.mbob.enabled ? '● Active in Checkout' : '○ Disabled'}
            </span>
          </div>
        </div>

        {/* Gateway 4: Bank Wire Transfer (Direct Deposit) */}
        <div className="admin-card bg-slate-900/80 border border-white/10 rounded-xl p-5 shadow-xl flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-400/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Bank Wire Transfer</h3>
                  <p className="text-xs text-slate-400">Direct institutional &amp; export bank deposits</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.bank.enabled}
                  onChange={(e) => setConfig({ ...config, bank: { ...config.bank, enabled: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Bank Name</label>
                <input
                  type="text"
                  value={config.bank.bankName}
                  onChange={(e) => setConfig({ ...config, bank: { ...config.bank, bankName: e.target.value } })}
                  className="w-full admin-input bg-slate-950/60 text-white border border-white/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Account Title</label>
                <input
                  type="text"
                  value={config.bank.accountTitle}
                  onChange={(e) => setConfig({ ...config, bank: { ...config.bank, accountTitle: e.target.value } })}
                  className="w-full admin-input bg-slate-950/60 text-white border border-white/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Account Number</label>
                <input
                  type="text"
                  value={config.bank.accountNumber}
                  onChange={(e) => setConfig({ ...config, bank: { ...config.bank, accountNumber: e.target.value } })}
                  className="w-full admin-input bg-slate-950/60 text-white border border-white/15 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">SWIFT / BIC Code</label>
                <input
                  type="text"
                  value={config.bank.swiftCode}
                  onChange={(e) => setConfig({ ...config, bank: { ...config.bank, swiftCode: e.target.value } })}
                  className="w-full admin-input bg-slate-950/60 text-white border border-white/15 rounded-lg px-3 py-2 text-xs font-mono uppercase outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-300 font-medium mb-1">Branch Address</label>
              <input
                type="text"
                value={config.bank.branch}
                onChange={(e) => setConfig({ ...config, bank: { ...config.bank, branch: e.target.value } })}
                className="w-full admin-input bg-slate-950/60 text-white border border-white/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400"
              />
            </div>

            <div className="text-xs">
              <label className="block text-slate-300 font-medium mb-1">Customer Wire Instructions</label>
              <textarea
                rows={2}
                value={config.bank.instructions}
                onChange={(e) => setConfig({ ...config, bank: { ...config.bank, instructions: e.target.value } })}
                className="w-full admin-input bg-slate-950/60 text-white border border-white/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Status:</span>
            <span className={`font-semibold ${config.bank.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
              {config.bank.enabled ? '● Active in Checkout' : '○ Disabled'}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

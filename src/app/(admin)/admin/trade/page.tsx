'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BadgePercent, 
  ShoppingBag, 
  Users, 
  FileText, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Edit3, 
  Save, 
  ExternalLink,
  DollarSign,
  Package,
  Layers,
  Building2,
  Mail,
  Phone,
  Globe
} from 'lucide-react';
import { 
  GlassCard, 
  GlassStatWidget, 
  GlassBadge, 
  GlassButton, 
  GlassDrawer, 
  GlassInput, 
  GlassSelect 
} from '@/components/admin/GlassUI';

export default function AdminTradePage() {
  const [activeTab, setActiveTab] = useState<'pricing' | 'quotes' | 'buyers'>('pricing');
  const [products, setProducts] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Pricing Drawer state
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [termsForm, setTermsForm] = useState({
    moq: 5,
    lead_time: '4–6 weeks',
    q1: 5, p1: 0,
    q2: 15, p2: 0,
    q3: 40, p3: 0,
    q4: 100, p4: 0,
    customisation: 'Available on request',
    is_active: true,
  });

  // Quote Drawer state
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [quoteStatus, setQuoteStatus] = useState('new');
  const [quoteNotes, setQuoteNotes] = useState('');

  // Buyer Drawer state
  const [selectedBuyer, setSelectedBuyer] = useState<any | null>(null);

  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/trade');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProducts(data.products || []);
          setQuotes(data.quotes || []);
          setBuyers(data.buyers || []);
        }
      }
    } catch (err) {
      console.error('Failed to load trade data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle open terms drawer
  const handleOpenTermsDrawer = (p: any) => {
    setEditingProduct(p);
    const t = p.terms || {};
    const tiers = Array.isArray(t.tiers) ? t.tiers : [];
    setTermsForm({
      moq: t.moq || 5,
      lead_time: t.lead_time || '4–6 weeks',
      q1: tiers[0]?.[0] || 5,
      p1: tiers[0]?.[1] || Math.round((p.retailPrice || 100) * 0.9),
      q2: tiers[1]?.[0] || 15,
      p2: tiers[1]?.[1] || Math.round((p.retailPrice || 100) * 0.82),
      q3: tiers[2]?.[0] || 40,
      p3: tiers[2]?.[1] || Math.round((p.retailPrice || 100) * 0.75),
      q4: tiers[3]?.[0] || 100,
      p4: tiers[3]?.[1] || Math.round((p.retailPrice || 100) * 0.68),
      customisation: t.customisation || 'Available on request',
      is_active: t.is_active !== false,
    });
  };

  const handleSaveTerms = async () => {
    if (!editingProduct) return;
    setSaving(true);
    try {
      const payload = {
        productCode: editingProduct.code,
        terms: {
          moq: Number(termsForm.moq) || 1,
          lead_time: termsForm.lead_time,
          tiers: [
            [Number(termsForm.q1), Number(termsForm.p1)],
            [Number(termsForm.q2), Number(termsForm.p2)],
            [Number(termsForm.q3), Number(termsForm.p3)],
            [Number(termsForm.q4), Number(termsForm.p4)],
          ].sort((a, b) => a[0] - b[0]),
          customisation: termsForm.customisation,
          is_active: termsForm.is_active,
        },
      };

      const res = await fetch('/api/admin/trade', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_terms', payload }),
      });

      if (res.ok) {
        showToast(`Wholesale terms saved for SKU ${editingProduct.code}`);
        setEditingProduct(null);
        loadData();
      } else {
        showToast('Error saving terms');
      }
    } catch {
      showToast('Network error saving terms');
    } finally {
      setSaving(false);
    }
  };

  // Handle quote save
  const handleSaveQuote = async () => {
    if (!selectedQuote) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/trade', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_quote_status',
          payload: {
            id: selectedQuote.id,
            status: quoteStatus,
            adminNotes: quoteNotes,
          },
        }),
      });

      if (res.ok) {
        showToast(`Quotation ${selectedQuote.reference} updated`);
        setSelectedQuote(null);
        loadData();
      }
    } catch {
      showToast('Error updating quote');
    } finally {
      setSaving(false);
    }
  };

  // Handle buyer status
  const handleUpdateBuyerStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/trade', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_buyer_status',
          payload: { id, status },
        }),
      });

      if (res.ok) {
        showToast(`Buyer status updated to ${status}`);
        loadData();
      }
    } catch {
      showToast('Error updating buyer status');
    }
  };

  // Filtered lists
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.craftName.toLowerCase().includes(q);
  });

  const filteredQuotes = quotes.filter((q) => {
    const s = searchQuery.toLowerCase().trim();
    return !s || q.reference.toLowerCase().includes(s) || q.buyerName.toLowerCase().includes(s) || q.email.toLowerCase().includes(s);
  });

  const filteredBuyers = buyers.filter((b) => {
    const s = searchQuery.toLowerCase().trim();
    return !s || b.businessName.toLowerCase().includes(s) || b.contactName.toLowerCase().includes(s) || b.email.toLowerCase().includes(s);
  });

  const activeSkuCount = products.filter((p) => p.terms?.is_active !== false).length;
  const pendingQuotesCount = quotes.filter((q) => q.status === 'new').length;
  const verifiedBuyersCount = buyers.filter((b) => b.status === 'verified').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-medium px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <BadgePercent className="w-8 h-8 text-amber-400" />
              Wholesale &amp; B2B Trade Portal
            </h1>
            <GlassBadge variant="amber">Tier-Based Pricing</GlassBadge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage volume pricing tiers, quote requests from the wholesale cart, and trade buyer account verifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/wholesale-shop"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            Live B2B Catalogue
          </Link>
          <GlassButton variant="secondary" onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </GlassButton>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassStatWidget
          title="Active Trade SKUs"
          value={activeSkuCount}
          subtitle={`Out of ${products.length} catalog items`}
          icon={ShoppingBag}
          glow="amber"
        />
        <GlassStatWidget
          title="Pending Quotes"
          value={pendingQuotesCount}
          subtitle={`${quotes.length} total RFQ enquiries`}
          icon={FileText}
          glow="rose"
        />
        <GlassStatWidget
          title="Verified Trade Buyers"
          value={verifiedBuyersCount}
          subtitle={`${buyers.length} registered trade accounts`}
          icon={Users}
          glow="emerald"
        />
        <GlassStatWidget
          title="B2B MOQ Baseline"
          value="5 units"
          subtitle="Typical lead time 4–6 weeks"
          icon={Package}
          glow="indigo"
        />
      </div>

      {/* Tab Controls & Search Bar */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-950/40 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'pricing'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Trade Pricing Tiers ({products.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab('quotes')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'quotes'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Quote Requests ({quotes.length})
                {pendingQuotesCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/40">
                    {pendingQuotesCount}
                  </span>
                )}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('buyers')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'buyers'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Trade Buyers ({buyers.length})
              </span>
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      </GlassCard>

      {/* TAB 1: TRADE PRICING TIERS */}
      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const t = p.terms || {};
              const tiers = Array.isArray(t.tiers) ? t.tiers : [];
              return (
                <GlassCard key={p.code} className="p-5 flex flex-col justify-between" glow="amber">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {p.code}
                          </span>
                          <span className="text-xs text-slate-400">{p.craftName}</span>
                        </div>
                        <h3 className="font-semibold text-white mt-1 text-base leading-snug">{p.name}</h3>
                      </div>
                      <GlassBadge variant={t.is_active !== false ? 'emerald' : 'secondary'}>
                        {t.is_active !== false ? 'Active' : 'Disabled'}
                      </GlassBadge>
                    </div>

                    <div className="flex items-center gap-3 py-2 px-3 bg-white/5 rounded-xl border border-white/5 mb-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Retail (B2C)</span>
                        <span className="text-white font-semibold">${p.retailPrice} USD</span>
                      </div>
                      <div className="h-6 w-px bg-white/10" />
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase tracking-wider">B2B MOQ</span>
                        <span className="text-amber-300 font-semibold">{t.moq || 5} units</span>
                      </div>
                      <div className="h-6 w-px bg-white/10" />
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Lead Time</span>
                        <span className="text-slate-300 font-medium">{t.lead_time || '4–6 wks'}</span>
                      </div>
                    </div>

                    {/* Quantity Tiers Preview */}
                    <div className="space-y-1 mb-4">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                        Volume Pricing Breaks
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {tiers.map((tier: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center justify-between"
                          >
                            <span className="text-slate-400">{tier[0]}+ pcs</span>
                            <span className="text-emerald-400 font-medium">${tier[1]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-400 italic truncate max-w-[180px]">
                      {t.customisation || 'Standard production'}
                    </span>
                    <GlassButton size="sm" variant="secondary" onClick={() => handleOpenTermsDrawer(p)}>
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                      Edit Terms
                    </GlassButton>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: QUOTE REQUESTS */}
      {activeTab === 'quotes' && (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/40 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Quote Ref</th>
                  <th className="py-3.5 px-4">Buyer Organisation</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Scope &amp; Destination</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-amber-300">
                      {q.reference}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {q.buyerName}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{q.email}</div>
                      <div className="text-[11px] text-slate-500">{q.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                      {q.subject}
                    </td>
                    <td className="py-3 px-4">
                      <GlassBadge
                        variant={
                          q.status === 'quoted'
                            ? 'amber'
                            : q.status === 'fulfilled' || q.status === 'ordered'
                            ? 'emerald'
                            : q.status === 'declined'
                            ? 'rose'
                            : 'indigo'
                        }
                      >
                        {q.status.toUpperCase()}
                      </GlassBadge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <GlassButton
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedQuote(q);
                          setQuoteStatus(q.status);
                          setQuoteNotes(q.adminNotes || '');
                        }}
                      >
                        Manage RFQ
                      </GlassButton>
                    </td>
                  </tr>
                ))}
                {filteredQuotes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 italic">
                      No quotation requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* TAB 3: TRADE BUYERS */}
      {activeTab === 'buyers' && (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/40 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Business Name</th>
                  <th className="py-3.5 px-4">Contact Person</th>
                  <th className="py-3.5 px-4">Details / Reg ID</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBuyers.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-white">{b.businessName}</p>
                          <p className="text-[11px] text-slate-400">{b.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{b.contactName}</div>
                      <div className="text-[11px] text-slate-500">{b.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-sm">
                      <p className="text-[11px] text-slate-400 line-clamp-2">{b.details}</p>
                    </td>
                    <td className="py-3 px-4">
                      <GlassBadge
                        variant={
                          b.status === 'verified'
                            ? 'emerald'
                            : b.status === 'rejected'
                            ? 'rose'
                            : 'amber'
                        }
                      >
                        {b.status.toUpperCase()}
                      </GlassBadge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status !== 'verified' && (
                          <button
                            onClick={() => handleUpdateBuyerStatus(b.id, 'verified')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium"
                          >
                            Verify
                          </button>
                        )}
                        {b.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateBuyerStatus(b.id, 'rejected')}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-medium"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBuyers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500 italic">
                      No trade buyers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* DRAWER: EDIT PRODUCT WHOLESALE TERMS */}
      <GlassDrawer
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title={`Edit Wholesale Terms: ${editingProduct?.code}`}
        subtitle={editingProduct?.name}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200">
            Retail price is <span className="font-bold">${editingProduct?.retailPrice} USD</span>. Trade prices must be lower and tier-discounted based on ascending volume.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Minimum Order Qty (MOQ)</label>
              <input
                type="number"
                value={termsForm.moq}
                onChange={(e) => setTermsForm({ ...termsForm, moq: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Production Lead Time</label>
              <input
                type="text"
                value={termsForm.lead_time}
                onChange={(e) => setTermsForm({ ...termsForm, lead_time: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-2 font-semibold uppercase tracking-wider text-[11px]">
              Tier 1 (Starting wholesale break)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min Qty"
                value={termsForm.q1}
                onChange={(e) => setTermsForm({ ...termsForm, q1: Number(e.target.value) })}
                className="px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
              />
              <input
                type="number"
                placeholder="Unit Price USD"
                value={termsForm.p1}
                onChange={(e) => setTermsForm({ ...termsForm, p1: Number(e.target.value) })}
                className="px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-2 font-semibold uppercase tracking-wider text-[11px]">
              Tier 2 (Mid-volume break)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min Qty"
                value={termsForm.q2}
                onChange={(e) => setTermsForm({ ...termsForm, q2: Number(e.target.value) })}
                className="px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
              />
              <input
                type="number"
                placeholder="Unit Price USD"
                value={termsForm.p2}
                onChange={(e) => setTermsForm({ ...termsForm, p2: Number(e.target.value) })}
                className="px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-2 font-semibold uppercase tracking-wider text-[11px]">
              Tier 3 (High-volume break)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min Qty"
                value={termsForm.q3}
                onChange={(e) => setTermsForm({ ...termsForm, q3: Number(e.target.value) })}
                className="px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
              />
              <input
                type="number"
                placeholder="Unit Price USD"
                value={termsForm.p3}
                onChange={(e) => setTermsForm({ ...termsForm, p3: Number(e.target.value) })}
                className="px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-2 font-semibold uppercase tracking-wider text-[11px]">
              Tier 4 (Container / bulk break)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min Qty"
                value={termsForm.q4}
                onChange={(e) => setTermsForm({ ...termsForm, q4: Number(e.target.value) })}
                className="px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
              />
              <input
                type="number"
                placeholder="Unit Price USD"
                value={termsForm.p4}
                onChange={(e) => setTermsForm({ ...termsForm, p4: Number(e.target.value) })}
                className="px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Customisation &amp; Made-to-Order Notes</label>
            <textarea
              rows={3}
              value={termsForm.customisation}
              onChange={(e) => setTermsForm({ ...termsForm, customisation: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeWholesaleCheck"
              checked={termsForm.is_active}
              onChange={(e) => setTermsForm({ ...termsForm, is_active: e.target.checked })}
              className="rounded bg-slate-950 border-white/20 text-amber-500"
            />
            <label htmlFor="activeWholesaleCheck" className="text-slate-300">
              Enable in Wholesale (B2B) Catalog
            </label>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
            <GlassButton variant="ghost" onClick={() => setEditingProduct(null)}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" onClick={handleSaveTerms} disabled={saving}>
              <Save className="w-4 h-4 mr-1.5" />
              {saving ? 'Saving...' : 'Save Wholesale Terms'}
            </GlassButton>
          </div>
        </div>
      </GlassDrawer>

      {/* DRAWER: MANAGE RFQ QUOTE */}
      <GlassDrawer
        isOpen={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
        title={`Quotation Details: ${selectedQuote?.reference}`}
        subtitle={selectedQuote?.buyerName}
      >
        <div className="space-y-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Subject</span>
            <p className="p-2.5 bg-slate-950 rounded-xl border border-white/10 text-white font-medium">
              {selectedQuote?.subject}
            </p>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Quotation Scope &amp; Line Items</span>
            <pre className="p-3 bg-slate-950 rounded-xl border border-white/10 text-slate-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {selectedQuote?.details}
            </pre>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Quote Status</label>
            <select
              value={quoteStatus}
              onChange={(e) => setQuoteStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="new">NEW (Under Secretariat Review)</option>
              <option value="quoted">QUOTED (Pro-Forma Invoice Issued)</option>
              <option value="ordered">ORDERED (FOB Payment Confirmed)</option>
              <option value="fulfilled">FULFILLED (Dispatched via EMS)</option>
              <option value="declined">DECLINED (Out of Capacity)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Internal Secretariat Notes</label>
            <textarea
              rows={3}
              value={quoteNotes}
              onChange={(e) => setQuoteNotes(e.target.value)}
              placeholder="e.g. Quoted shipping via DHL at $340 USD; cluster confirmed delivery by 20 Nov."
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
            <GlassButton variant="ghost" onClick={() => setSelectedQuote(null)}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" onClick={handleSaveQuote} disabled={saving}>
              <Save className="w-4 h-4 mr-1.5" />
              {saving ? 'Saving...' : 'Update RFQ Status'}
            </GlassButton>
          </div>
        </div>
      </GlassDrawer>
    </div>
  );
}

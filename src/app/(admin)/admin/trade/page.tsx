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
import FileUploadInput from '@/components/admin/FileUploadInput';

export default function AdminTradePage() {
  const [activeTab, setActiveTab] = useState<'pricing' | 'quotes' | 'buyers' | 'catalog' | 'content'>('pricing');
  const [products, setProducts] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [catalogPdfUrl, setCatalogPdfUrl] = useState('');
  const [lookbookCoverUrl, setLookbookCoverUrl] = useState('');
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Wholesale Page Content & Assurances state
  const [contentForm, setContentForm] = useState({
    wholesaleHeroTitle: 'Wholesale & Bulk Orders',
    wholesaleHeroLede: 'HAB supplies Bhutanese handicraft at trade terms to retailers, hotels, designers, institutions and distributors.',
    wholesaleMoq: 10,
    wholesaleLeadTime: '2 to 4 weeks depending on batch size',
    assurance1Title: 'Traceable supply chain',
    assurance1Body: 'Materials, makers and shipping are fully documented from source cluster to port of export.',
    assurance2Title: 'Phytosanitary & export documentation',
    assurance2Body: 'We prepare export documentation, non-commercial invoices and all customs clearances.',
    assurance3Title: 'Pre-dispatch quality assurance',
    assurance3Body: 'Every order is inspected against master reference pieces by our quality inspectors in Thimphu.',
    assurance4Title: 'Flexible customization',
    assurance4Body: 'Custom sizes, weave densities, debossed branding and bespoke packaging available.',
    assurance5Title: 'Fair compensation guarantee',
    assurance5Body: 'Artisans receive fair wholesale rates at dispatch, ensuring sustained community livelihoods.',
    flow1Title: 'Browse',
    flow1Desc: 'Category, then product. The catalogue is the same one the retail shop uses.',
    flow2Title: 'Quantity',
    flow2Desc: 'Set quantities against the MOQ. Tier pricing applies automatically.',
    flow3Title: 'Quote basket',
    flow3Desc: 'Collect several products into one basket rather than checking out.',
    flow4Title: 'HAB review',
    flow4Desc: 'The trade desk confirms availability with the producing members.',
    flow5Title: 'Quotation',
    flow5Desc: 'Formal quote with freight, lead time and payment terms.',
    flow6Title: 'Order & tracking',
    flow6Desc: 'Production, quality control in Thimphu, then shipment with tracking.',
  });
  const [savingContent, setSavingContent] = useState(false);

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
      const res = await fetch('/api/admin/trade', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProducts(data.products || []);
          setQuotes(data.quotes || []);
          setBuyers(data.buyers || []);
          if (data.catalogPdfUrl !== undefined) setCatalogPdfUrl(data.catalogPdfUrl || '');
          if (data.lookbookCoverUrl !== undefined) setLookbookCoverUrl(data.lookbookCoverUrl || '');
        }
      }

      // Also load site settings for wholesale page text & assurances
      const resSettings = await fetch('/api/admin/site-settings', { cache: 'no-store' });
      if (resSettings.ok) {
        const sData = await resSettings.json();
        const s = sData.setting || {};
        const assurances = s.wholesaleAssurances || [];
        const flowSteps = s.wholesaleTerms?.flowSteps || [];
        setContentForm({
          wholesaleHeroTitle: s.wholesaleHeroTitle || 'Wholesale & Bulk Orders',
          wholesaleHeroLede: s.wholesaleHeroLede || 'HAB supplies Bhutanese handicraft at trade terms to retailers, hotels, designers, institutions and distributors.',
          wholesaleMoq: s.wholesaleMoq || 10,
          wholesaleLeadTime: s.wholesaleLeadTime || '2 to 4 weeks depending on batch size',
          assurance1Title: assurances[0]?.title || 'Traceable supply chain',
          assurance1Body: assurances[0]?.body || 'Materials, makers and shipping are fully documented from source cluster to port of export.',
          assurance2Title: assurances[1]?.title || 'Phytosanitary & export documentation',
          assurance2Body: assurances[1]?.body || 'We prepare export documentation, non-commercial invoices and all customs clearances.',
          assurance3Title: assurances[2]?.title || 'Pre-dispatch quality assurance',
          assurance3Body: assurances[2]?.body || 'Every order is inspected against master reference pieces by our quality inspectors in Thimphu.',
          assurance4Title: assurances[3]?.title || 'Flexible customization',
          assurance4Body: assurances[3]?.body || 'Custom sizes, weave densities, debossed branding and bespoke packaging available.',
          assurance5Title: assurances[4]?.title || 'Fair compensation guarantee',
          assurance5Body: assurances[4]?.body || 'Artisans receive fair wholesale rates at dispatch, ensuring sustained community livelihoods.',
          flow1Title: flowSteps[0]?.title || 'Browse',
          flow1Desc: flowSteps[0]?.desc || 'Category, then product. The catalogue is the same one the retail shop uses.',
          flow2Title: flowSteps[1]?.title || 'Quantity',
          flow2Desc: flowSteps[1]?.desc || 'Set quantities against the MOQ. Tier pricing applies automatically.',
          flow3Title: flowSteps[2]?.title || 'Quote basket',
          flow3Desc: flowSteps[2]?.desc || 'Collect several products into one basket rather than checking out.',
          flow4Title: flowSteps[3]?.title || 'HAB review',
          flow4Desc: flowSteps[3]?.desc || 'The trade desk confirms availability with the producing members.',
          flow5Title: flowSteps[4]?.title || 'Quotation',
          flow5Desc: flowSteps[4]?.desc || 'Formal quote with freight, lead time and payment terms.',
          flow6Title: flowSteps[5]?.title || 'Order & tracking',
          flow6Desc: flowSteps[5]?.desc || 'Production, quality control in Thimphu, then shipment with tracking.',
        });
      }
    } catch (err) {
      console.error('Failed to load trade data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWholesaleContent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingContent(true);
    try {
      const payload = {
        wholesaleHeroTitle: contentForm.wholesaleHeroTitle,
        wholesaleHeroLede: contentForm.wholesaleHeroLede,
        wholesaleMoq: Number(contentForm.wholesaleMoq) || 5,
        wholesaleLeadTime: contentForm.wholesaleLeadTime,
        wholesaleAssurances: [
          { title: contentForm.assurance1Title, body: contentForm.assurance1Body },
          { title: contentForm.assurance2Title, body: contentForm.assurance2Body },
          { title: contentForm.assurance3Title, body: contentForm.assurance3Body },
          { title: contentForm.assurance4Title, body: contentForm.assurance4Body },
          { title: contentForm.assurance5Title, body: contentForm.assurance5Body },
        ].filter((a) => a.title),
        wholesaleTerms: {
          flowSteps: [
            { title: contentForm.flow1Title, desc: contentForm.flow1Desc },
            { title: contentForm.flow2Title, desc: contentForm.flow2Desc },
            { title: contentForm.flow3Title, desc: contentForm.flow3Desc },
            { title: contentForm.flow4Title, desc: contentForm.flow4Desc },
            { title: contentForm.flow5Title, desc: contentForm.flow5Desc },
            { title: contentForm.flow6Title, desc: contentForm.flow6Desc },
          ].filter((s) => s.title),
        },
      };
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast('Wholesale page content, assurances & flow steps updated successfully!');
      } else {
        showToast('Failed to save wholesale content.');
      }
    } catch {
      showToast('Error saving wholesale content.');
    } finally {
      setSavingContent(false);
    }
  };

  const handleSaveCatalog = async () => {
    setSavingCatalog(true);
    try {
      const res = await fetch('/api/admin/trade', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_catalog',
          payload: { catalogPdfUrl, lookbookCoverUrl },
        }),
      });
      if (res.status === 401) {
        showToast('Your session has expired. Please open /admin/login to re-authenticate.');
        return;
      }
      if (res.ok) {
        showToast('Wholesale catalog and lookbook media saved!');
      }
    } catch {
      showToast('Error saving wholesale media');
    } finally {
      setSavingCatalog(false);
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
          <p className="text-sm text-slate-600 mt-1">
            Manage volume pricing tiers, quote requests from the wholesale cart, and trade buyer account verifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/wholesale-shop"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
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
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Trade Pricing Tiers ({products.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab('quotes')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'quotes'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Quote Requests ({quotes.length})
                {pendingQuotesCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 border border-rose-300 font-bold">
                    {pendingQuotesCount}
                  </span>
                )}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('buyers')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'buyers'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Trade Buyers ({buyers.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                B2B Catalog &amp; Media
              </span>
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                Page Content &amp; Assurances
              </span>
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8b2e24] shadow-sm"
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
                          <span className="font-mono text-xs text-[#8b2e24] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                            {p.code}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">{p.craftName}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 mt-1 text-base leading-snug">{p.name}</h3>
                      </div>
                      <GlassBadge variant={t.is_active !== false ? 'emerald' : 'secondary'}>
                        {t.is_active !== false ? 'Active' : 'Disabled'}
                      </GlassBadge>
                    </div>

                    <div className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-medium">Retail (B2C)</span>
                        <span className="text-slate-900 font-bold">${p.retailPrice} USD</span>
                      </div>
                      <div className="h-6 w-px bg-slate-200" />
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-medium">B2B MOQ</span>
                        <span className="text-slate-800 font-bold">{t.moq || 5} units</span>
                      </div>
                      <div className="h-6 w-px bg-slate-200" />
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-medium">Lead Time</span>
                        <span className="text-slate-700 font-semibold">{t.lead_time || '4–6 wks'}</span>
                      </div>
                    </div>

                    {/* Quantity Tiers Preview */}
                    <div className="space-y-1 mb-4">
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 block font-semibold">
                        Volume Pricing Breaks
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {tiers.map((tier: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between"
                          >
                            <span className="text-slate-600 font-medium">{tier[0]}+ pcs</span>
                            <span className="text-emerald-700 font-bold">${tier[1]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 italic truncate max-w-[180px]">
                      {t.customisation || 'Standard production'}
                    </span>
                    <GlassButton size="sm" variant="secondary" onClick={() => handleOpenTermsDrawer(p)}>
                      <Edit3 className="w-3.5 h-3.5 mr-1.5 text-[#8b2e24]" />
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
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3.5 px-4">Quote Ref</th>
                  <th className="py-3.5 px-4">Buyer Organisation</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Scope &amp; Destination</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#8b2e24]">
                      {q.reference}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {q.buyerName}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{q.email}</div>
                      <div className="text-[11px] text-slate-500">{q.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
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
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3.5 px-4">Business Name</th>
                  <th className="py-3.5 px-4">Contact Person</th>
                  <th className="py-3.5 px-4">Details / Reg ID</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBuyers.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#8b2e24] flex-shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{b.businessName}</p>
                          <p className="text-[11px] text-slate-500">{b.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
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

      {/* Tab 4: B2B Catalog & Media Upload */}
      {activeTab === 'catalog' && (
        <GlassCard className="p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-slate-900">B2B Wholesale Catalog &amp; Lookbook</h2>
            <p className="text-xs text-slate-500 mt-1">
              Upload the official wholesale export catalog PDF and promotional lookbook cover images for institutional buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#8B2E24]" />
                Official Wholesale Catalog (PDF)
              </h3>
              <p className="text-xs text-slate-500">
                Full export catalog containing export pricing, dimensions, packaging specifications, and customs classifications.
              </p>
              <FileUploadInput
                value={catalogPdfUrl}
                onChange={setCatalogPdfUrl}
                label="Wholesale Catalog PDF Document"
                accept="application/pdf"
                hint="Supports PDF documents up to 50MB"
              />
            </div>

            <div className="space-y-4 p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                B2B Lookbook Cover Photo
              </h3>
              <p className="text-xs text-slate-500">
                Hero visual showcasing curated artisanal handicraft lines for international distributors and boutique hotel buyers.
              </p>
              <FileUploadInput
                value={lookbookCoverUrl}
                onChange={setLookbookCoverUrl}
                label="Lookbook Hero Artwork / Photo"
                accept="image/*"
                hint="Supports JPG, PNG, WebP up to 20MB"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleSaveCatalog}
              disabled={savingCatalog}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#8B2E24] hover:bg-[#72241c] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingCatalog ? 'Saving media...' : 'Save B2B Catalog Materials'}</span>
            </button>
          </div>
        </GlassCard>
      )}

      {/* TAB 5: WHOLESALE PAGE CONTENT & ASSURANCES */}
      {activeTab === 'content' && (
        <form onSubmit={handleSaveWholesaleContent} className="space-y-6">
          <GlassCard className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#8b2e24]" />
                  Wholesale Hero & Base Terms
                </h2>
                <p className="text-xs text-slate-500">
                  Manage the public headline, mandate lede, default minimum order quantity (MOQ) and lead time displayed on /wholesale.
                </p>
              </div>
              <button
                type="submit"
                disabled={savingContent}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8b2e24] hover:bg-[#72241c] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingContent ? 'Saving...' : 'Save Wholesale Content'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-700">Hero Section Headline</label>
                <input
                  type="text"
                  value={contentForm.wholesaleHeroTitle}
                  onChange={(e) => setContentForm((prev) => ({ ...prev, wholesaleHeroTitle: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#8b2e24]"
                  placeholder="Wholesale & Bulk Orders"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-700">Hero Mandate Lede</label>
                <textarea
                  rows={2}
                  value={contentForm.wholesaleHeroLede}
                  onChange={(e) => setContentForm((prev) => ({ ...prev, wholesaleHeroLede: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#8b2e24]"
                  placeholder="HAB supplies Bhutanese handicraft at trade terms..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Default MOQ (Pieces)</label>
                <input
                  type="number"
                  value={contentForm.wholesaleMoq}
                  onChange={(e) => setContentForm((prev) => ({ ...prev, wholesaleMoq: Number(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#8b2e24]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Standard Lead Time Notice</label>
                <input
                  type="text"
                  value={contentForm.wholesaleLeadTime}
                  onChange={(e) => setContentForm((prev) => ({ ...prev, wholesaleLeadTime: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#8b2e24]"
                  placeholder="2 to 4 weeks depending on batch size"
                />
              </div>
            </div>
          </GlassCard>

          {/* 5 TRADE ASSURANCES */}
          <GlassCard className="p-6 space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                The 5 Trade Assurances
              </h2>
              <p className="text-xs text-slate-500">
                Institutional guarantees displayed in the Trade Assurances grid on the wholesale portal.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { num: 1, titleKey: 'assurance1Title', bodyKey: 'assurance1Body', defaultTitle: 'Traceable supply chain' },
                { num: 2, titleKey: 'assurance2Title', bodyKey: 'assurance2Body', defaultTitle: 'Phytosanitary & export documentation' },
                { num: 3, titleKey: 'assurance3Title', bodyKey: 'assurance3Body', defaultTitle: 'Pre-dispatch quality assurance' },
                { num: 4, titleKey: 'assurance4Title', bodyKey: 'assurance4Body', defaultTitle: 'Flexible customization' },
                { num: 5, titleKey: 'assurance5Title', bodyKey: 'assurance5Body', defaultTitle: 'Fair compensation guarantee' },
              ].map(({ num, titleKey, bodyKey, defaultTitle }) => (
                <div key={num} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#8b2e24] text-white text-[10px] font-bold flex items-center justify-center">
                      {num}
                    </span>
                    <label className="text-xs font-bold text-slate-700">Assurance #{num}</label>
                  </div>
                  <input
                    type="text"
                    value={(contentForm as any)[titleKey]}
                    onChange={(e) => setContentForm((prev) => ({ ...prev, [titleKey]: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:outline-none focus:border-[#8b2e24]"
                    placeholder={defaultTitle}
                  />
                  <textarea
                    rows={2}
                    value={(contentForm as any)[bodyKey]}
                    onChange={(e) => setContentForm((prev) => ({ ...prev, [bodyKey]: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-lg focus:outline-none focus:border-[#8b2e24]"
                  />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 6 ORDER FLOW STEPS */}
          <GlassCard className="p-6 space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                6-Step Wholesale Order Flow
              </h2>
              <p className="text-xs text-slate-500">
                Step-by-step buyer procurement guide shown on the wholesale page.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { num: 1, titleKey: 'flow1Title', descKey: 'flow1Desc', defaultTitle: 'Browse' },
                { num: 2, titleKey: 'flow2Title', descKey: 'flow2Desc', defaultTitle: 'Quantity' },
                { num: 3, titleKey: 'flow3Title', descKey: 'flow3Desc', defaultTitle: 'Quote basket' },
                { num: 4, titleKey: 'flow4Title', descKey: 'flow4Desc', defaultTitle: 'HAB review' },
                { num: 5, titleKey: 'flow5Title', descKey: 'flow5Desc', defaultTitle: 'Quotation' },
                { num: 6, titleKey: 'flow6Title', descKey: 'flow6Desc', defaultTitle: 'Order & tracking' },
              ].map(({ num, titleKey, descKey, defaultTitle }) => (
                <div key={num} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-700 text-white text-[10px] font-bold flex items-center justify-center">
                      {num}
                    </span>
                    <label className="text-xs font-bold text-slate-700">Step {num}: Title</label>
                  </div>
                  <input
                    type="text"
                    value={(contentForm as any)[titleKey]}
                    onChange={(e) => setContentForm((prev) => ({ ...prev, [titleKey]: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:outline-none focus:border-[#8b2e24]"
                    placeholder={defaultTitle}
                  />
                  <textarea
                    rows={2}
                    value={(contentForm as any)[descKey]}
                    onChange={(e) => setContentForm((prev) => ({ ...prev, [descKey]: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-lg focus:outline-none focus:border-[#8b2e24]"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={savingContent}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#8b2e24] hover:bg-[#72241c] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingContent ? 'Saving...' : 'Save Wholesale Content'}</span>
              </button>
            </div>
          </GlassCard>
        </form>
      )}

      {/* DRAWER: EDIT PRODUCT WHOLESALE TERMS */}
      <GlassDrawer
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title={`Edit Wholesale Terms: ${editingProduct?.code}`}
        subtitle={editingProduct?.name}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-900 font-medium">
            Retail price is <span className="font-bold text-[#8b2e24]">${editingProduct?.retailPrice} USD</span>. Trade prices must be lower and tier-discounted based on ascending volume.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Minimum Order Qty (MOQ)</label>
              <input
                type="number"
                value={termsForm.moq}
                onChange={(e) => setTermsForm({ ...termsForm, moq: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#8b2e24] shadow-sm"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Production Lead Time</label>
              <input
                type="text"
                value={termsForm.lead_time}
                onChange={(e) => setTermsForm({ ...termsForm, lead_time: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#8b2e24] shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-2 font-semibold uppercase tracking-wider text-[11px]">
              Tier 1 (Starting wholesale break)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min Qty"
                value={termsForm.q1}
                onChange={(e) => setTermsForm({ ...termsForm, q1: Number(e.target.value) })}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 shadow-sm"
              />
              <input
                type="number"
                placeholder="Unit Price USD"
                value={termsForm.p1}
                onChange={(e) => setTermsForm({ ...termsForm, p1: Number(e.target.value) })}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-2 font-semibold uppercase tracking-wider text-[11px]">
              Tier 2 (Mid-volume break)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min Qty"
                value={termsForm.q2}
                onChange={(e) => setTermsForm({ ...termsForm, q2: Number(e.target.value) })}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 shadow-sm"
              />
              <input
                type="number"
                placeholder="Unit Price USD"
                value={termsForm.p2}
                onChange={(e) => setTermsForm({ ...termsForm, p2: Number(e.target.value) })}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-2 font-semibold uppercase tracking-wider text-[11px]">
              Tier 3 (High-volume break)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min Qty"
                value={termsForm.q3}
                onChange={(e) => setTermsForm({ ...termsForm, q3: Number(e.target.value) })}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 shadow-sm"
              />
              <input
                type="number"
                placeholder="Unit Price USD"
                value={termsForm.p3}
                onChange={(e) => setTermsForm({ ...termsForm, p3: Number(e.target.value) })}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-2 font-semibold uppercase tracking-wider text-[11px]">
              Tier 4 (Container / bulk break)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min Qty"
                value={termsForm.q4}
                onChange={(e) => setTermsForm({ ...termsForm, q4: Number(e.target.value) })}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 shadow-sm"
              />
              <input
                type="number"
                placeholder="Unit Price USD"
                value={termsForm.p4}
                onChange={(e) => setTermsForm({ ...termsForm, p4: Number(e.target.value) })}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-semibold">Customisation &amp; Made-to-Order Notes</label>
            <textarea
              rows={3}
              value={termsForm.customisation}
              onChange={(e) => setTermsForm({ ...termsForm, customisation: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#8b2e24] shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeWholesaleCheck"
              checked={termsForm.is_active}
              onChange={(e) => setTermsForm({ ...termsForm, is_active: e.target.checked })}
              className="rounded border-slate-300 text-[#8b2e24] focus:ring-0"
            />
            <label htmlFor="activeWholesaleCheck" className="text-slate-700 font-medium">
              Enable in Wholesale (B2B) Catalog
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
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
            <span className="text-slate-700 block mb-1 font-semibold">Subject</span>
            <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-medium">
              {selectedQuote?.subject}
            </p>
          </div>

          <div>
            <span className="text-slate-700 block mb-1 font-semibold">Quotation Scope &amp; Line Items</span>
            <pre className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {selectedQuote?.details}
            </pre>
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-semibold">Quote Status</label>
            <select
              value={quoteStatus}
              onChange={(e) => setQuoteStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#8b2e24] shadow-sm cursor-pointer"
            >
              <option value="new">NEW (Under Secretariat Review)</option>
              <option value="quoted">QUOTED (Pro-Forma Invoice Issued)</option>
              <option value="ordered">ORDERED (FOB Payment Confirmed)</option>
              <option value="fulfilled">FULFILLED (Dispatched via EMS)</option>
              <option value="declined">DECLINED (Out of Capacity)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-semibold">Internal Secretariat Notes</label>
            <textarea
              rows={3}
              value={quoteNotes}
              onChange={(e) => setQuoteNotes(e.target.value)}
              placeholder="e.g. Quoted shipping via DHL at $340 USD; cluster confirmed delivery by 20 Nov."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#8b2e24] shadow-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
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

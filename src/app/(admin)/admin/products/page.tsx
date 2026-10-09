'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { CRAFTS } from '@/lib/data';
import { 
  Package, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  CheckCircle, 
  Edit, 
  Trash2, 
  ExternalLink,
  Archive,
  Image as ImageIcon,
  X,
  AlertTriangle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { AdminBadge, AdminModal, AdminEmptyState, AdminSkeleton, AdminPagination } from '@/components/admin/AdminUI';
import RichTextEditor from '@/components/admin/RichTextEditor';
import FileUploadInput from '@/components/admin/FileUploadInput';

const generateProductSKU = (craftKey: string = 'thagzo') => {
  const CRAFT_PREFIX: Record<string, string> = {
    thagzo: 'THA',
    shagzo: 'SHA',
    troezo: 'TRO',
    tshazo: 'TSA',
    lhazo: 'LHA',
    parzo: 'PAR',
    jinzo: 'JIN',
    dezo: 'DEZ',
    tshemzo: 'TSH',
    garzo: 'GAR',
    dozo: 'DOZ',
    chuzo: 'CHU',
    lugzo: 'LUG',
  };
  const prefix = CRAFT_PREFIX[craftKey] || craftKey.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
  const year = new Date().getFullYear().toString().slice(-2);
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `HAB-${prefix}-${year}-${randNum}`;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [craftFilter, setCraftFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'CRITICAL_LOW' | 'OUT_OF_STOCK'>('ALL');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  
  // Forms
  const [editForm, setEditForm] = useState<any>({});
  const [addForm, setAddForm] = useState<any>({
    code: generateProductSKU('thagzo'),
    name: '',
    priceUSD: '',
    craftKey: CRAFTS[0].key,
    region: 'Thimphu',
    makerMemberId: '',
    stock: 10,
    status: 'PUBLISHED',
    description: '',
    size: '',
    weight: '',
    materials: '',
    care: '',
    lead: '',
    imageUrl: '',
    additionalImages: [] as string[],
    images: [] as { url: string; role: string }[],
    wholesaleEnabled: false,
  });

  const [importCsvText, setImportCsvText] = useState('');
  const [importError, setImportError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = async () => {
    setLoading(true);
    setActionError('');
    try {
      const [prodRes, memRes] = await Promise.all([
        fetch('/api/admin/products', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/admin/members', { credentials: 'include', cache: 'no-store' }).catch(() => null),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      } else {
        const errData = await prodRes.json();
        setActionError(errData.error || 'Failed to load catalog products.');
      }

      if (memRes && memRes.ok) {
        const memData = await memRes.json();
        setMembers(memData.members || []);
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error fetching catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const finalImages = [
        ...(addForm.imageUrl ? [{ url: addForm.imageUrl, role: 'primary' }] : []),
        ...(addForm.additionalImages || [])
          .filter(Boolean)
          .map((url: string, idx: number) => ({ url, role: `angle${idx + 2}` })),
      ];
      const payload = {
        ...addForm,
        images: finalImages,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setActionError('Your session has expired. Please open /admin/login in a new tab to log in, then click Add Product again.');
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        const openWholesale = Boolean(addForm.wholesaleEnabled);
        setActionSuccess(`Product "${data.product.name}" (${data.product.code}) successfully added to catalog.`);
        setProducts((prev) => [data.product, ...prev]);
        setShowAddModal(false);
        setAddForm({
          code: generateProductSKU(CRAFTS[0].key),
          name: '',
          priceUSD: '',
          craftKey: CRAFTS[0].key,
          region: 'Thimphu',
          makerMemberId: '',
          stock: 10,
          status: 'PUBLISHED',
          description: '',
          size: '', weight: '', materials: '', care: '', lead: '',
          imageUrl: '',
          additionalImages: [],
          images: [],
          wholesaleEnabled: false,
        });
        await loadData();
        if (openWholesale) window.location.assign(`/admin/trade?product=${encodeURIComponent(data.product.code)}`);
      } else {
        setActionError(data.error || 'Failed to create product.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStock = async (code: string, newQty: number) => {
    const qty = Math.max(0, newQty);
    setProducts((prev) =>
      prev.map((p) => (p.code === code ? { ...p, stock: qty } : p))
    );

    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, stock: qty }),
      });
    } catch (err) {
      console.error('Failed to sync stock change to database:', err);
    }
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    const existingImages = Array.isArray(p.images) ? p.images : [];
    const primaryImg = existingImages[0]?.url || p.images?.url || p.imageUrl || p.image_path || (p.code ? `/assets/photos/product-${p.code.toLowerCase()}.jpg` : '');
    const extraImages = existingImages.slice(1).map((im: any) => typeof im === 'string' ? im : im?.url).filter(Boolean);
    setEditForm({
      id: p.id,
      code: p.code,
      name: p.name,
      priceUSD: p.priceUSD,
      craftKey: p.craftKey,
      region: p.region,
      makerMemberId: p.makerMemberId || '',
      stock: p.stock ?? 0,
      status: p.status,
      description: p.description || '',
      size: p.size || '',
      weight: p.weight || '',
      materials: p.materials || '',
      care: p.care || '',
      lead: p.lead || '',
      imageUrl: primaryImg,
      additionalImages: extraImages,
      images: existingImages,
      wholesaleEnabled: Boolean(p.wholesaleEnabled),
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const finalImages = [
        ...(editForm.imageUrl ? [{ url: editForm.imageUrl, role: 'primary' }] : []),
        ...(editForm.additionalImages || [])
          .filter(Boolean)
          .map((url: string, idx: number) => ({ url, role: `angle${idx + 2}` })),
      ];
      const payload = {
        ...editForm,
        images: finalImages,
      };

      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setActionError('Your session has expired. Please open /admin/login in a new tab to log in, then click Save again.');
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        const openWholesale = Boolean(data.requiresWholesaleTerms);
        setActionSuccess(`Product "${data.product.name}" (${data.product.code}) updated successfully.`);
        setProducts((prev) => prev.map((p) => (p.id === data.product.id ? { ...p, ...data.product } : p)));
        setEditingProduct(null);
        await loadData();
        if (openWholesale) window.location.assign(`/admin/trade?product=${encodeURIComponent(data.product.code)}`);
      } else {
        setActionError(data.error || 'Failed to update product.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveInstead = async (product: any) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, status: 'ARCHIVED' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`Product "${product.name}" (${product.code}) safely archived.`);
        setDeletingProduct(null);
        await loadData();
      } else {
        setActionError(data.error || 'Failed to archive product.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch(`/api/admin/products?id=${deletingProduct.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(data.message || `Product ${deletingProduct.name} deleted.`);
        setDeletingProduct(null);
        await loadData();
      } else {
        setActionError(data.error || 'Failed to delete product.');
        // If referential integrity violation, prompt user
        if (data.code === 'REFERENTIAL_INTEGRITY_VIOLATION') {
          // Keep modal open so they can click "Archive Instead"
        } else {
          setDeletingProduct(null);
        }
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
      setDeletingProduct(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importCsvText.trim()) return;
    setSubmitting(true);
    setImportError('');

    try {
      const res = await fetch('/api/admin/products/csv', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: importCsvText }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(data.message);
        setShowImportModal(false);
        setImportCsvText('');
        await loadData();
      } else {
        setImportError(data.error || 'Failed to process import.');
      }
    } catch (err: any) {
      setImportError(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase()) ||
      p.maker?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCraft = craftFilter === 'ALL' || p.craftKey === craftFilter;
    const stockVal = p.stock ?? 0;
    const matchesStock =
      stockFilter === 'ALL'
        ? true
        : stockFilter === 'IN_STOCK'
        ? stockVal > 5
        : stockFilter === 'LOW_STOCK'
        ? stockVal > 0 && stockVal <= 5
        : stockFilter === 'CRITICAL_LOW'
        ? stockVal > 0 && stockVal < 3
        : stockVal === 0;
    return matchesSearch && matchesCraft && matchesStock;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedProducts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b admin-border pb-5">
        <div>
          <h1 className="text-xl font-bold admin-title flex items-center gap-2">
            <Package className="w-5 h-5 text-[#8B2E24]" />
            Products &amp; Catalog Management
          </h1>
          <p className="text-xs sm:text-sm admin-muted mt-0.5">
            Manage authenticated artisan inventory, canonical USD retail prices, and craft categories.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export */}
          <a
            href="/api/admin/products/csv"
            download
            className="px-3 py-2 admin-button-secondary border text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>

          {/* CSV Import */}
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-2 admin-button-secondary border text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          {/* Add Product */}
          <button
            onClick={() => {
              setAddForm((prev: any) => ({
                ...prev,
                code: prev.code || generateProductSKU(prev.craftKey || CRAFTS[0].key),
                additionalImages: prev.additionalImages || [],
              }));
              setShowAddModal(true);
            }}
            className="px-3 py-2 admin-button-primary text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-400/25 text-emerald-200 text-xs font-medium rounded-lg flex justify-between items-center">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-300 font-bold ml-2">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-500/15 border border-rose-400/25 text-rose-200 text-xs font-medium rounded-lg flex justify-between items-center">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-rose-300 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="admin-card p-4 rounded-xl border admin-border shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 admin-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search title, SKU code, artisan maker..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="admin-input w-full pl-9 pr-3 py-2 text-xs border rounded-lg outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={craftFilter}
            onChange={(e) => {
              setCraftFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="admin-input px-3 py-2 text-xs border rounded-lg outline-none"
          >
            <option value="ALL">All Crafts</option>
            {CRAFTS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name} ({c.english})
              </option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="admin-input px-3 py-2 text-xs border rounded-lg outline-none"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN_STOCK">In Stock (&gt;5)</option>
            <option value="LOW_STOCK">Low Stock (1–5)</option>
            <option value="CRITICAL_LOW">⚠️ Critical Low Stock (&lt;3)</option>
            <option value="OUT_OF_STOCK">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-card rounded-xl border admin-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <AdminSkeleton rows={6} cols={6} />
          </div>
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            title="No products found"
            description="No items match your selected filters. Adjust your search or add a new product."
            icon={Package}
            actionLabel="Add First Product"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="admin-panel border-b admin-border admin-text font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Item &amp; Code</th>
                  <th className="py-3 px-4">Craft Tradition</th>
                  <th className="py-3 px-4">Artisan Maker</th>
                  <th className="py-3 px-4">USD Retail</th>
                  <th className="py-3 px-4">Origin Region</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y admin-divider">
                {paginatedProducts.map((p) => {
                  const stockVal = p.stock ?? 0;
                  const primaryImg = Array.isArray(p.images) && p.images[0]?.url ? p.images[0].url : null;

                  return (
                    <tr key={p.id || p.code} className="admin-hover transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg admin-panel border admin-border flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {primaryImg ? (
                              <img src={primaryImg} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="admin-muted font-mono text-[9px]">NO IMG</span>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/product/${p.code}`}
                              target="_blank"
                              className="font-medium admin-title hover:text-amber-200 flex items-center gap-1"
                            >
                              {p.name}
                              <ExternalLink className="w-3 h-3 admin-muted" />
                            </Link>
                            <span className="font-mono text-[11px] admin-muted">{p.code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block font-mono text-[11px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-200 border border-amber-400/25">
                          {p.craft?.name || p.craftKey}
                        </span>
                      </td>
                      <td className="py-3 px-4 admin-text font-medium">
                        {p.maker?.name || 'HAB Secretariat Guild'}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold admin-title">
                        ${Number(p.priceUSD).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 admin-text">{p.region}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={stockVal}
                            onChange={(e) => handleUpdateStock(p.code, parseInt(e.target.value) || 0)}
                            className="admin-input w-16 px-2 py-1 border rounded font-mono text-center text-xs outline-none"
                          />
                          {stockVal > 5 ? (
                            <AdminBadge variant="success" size="sm" dot>In Stock</AdminBadge>
                          ) : stockVal >= 3 ? (
                            <AdminBadge variant="warning" size="sm" dot>Low ({stockVal})</AdminBadge>
                          ) : stockVal > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                              Critical ({stockVal})
                            </span>
                          ) : (
                            <AdminBadge variant="danger" size="sm" dot>Out</AdminBadge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <AdminBadge
                          variant={
                            p.status === 'PUBLISHED'
                              ? 'success'
                              : p.status === 'ARCHIVED'
                              ? 'slate'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {p.status}
                        </AdminBadge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-2 py-1 admin-button-secondary border rounded font-medium inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="px-2 py-1 text-rose-300 hover:text-rose-200 border border-rose-400/25 hover:bg-rose-500/15 rounded font-medium inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Product Modal */}
      <AdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Handcrafted Product"
        subtitle="Catalog additions will immediately reflect on the public online shop."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
          {actionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Unable to create product</p>
                <p className="mt-0.5">{actionError}</p>
                {(actionError.toLowerCase().includes('session') || actionError.toLowerCase().includes('unauthorized') || actionError.includes('401')) && (
                  <a href="/admin/login" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 underline font-bold text-rose-800">
                    Open /admin/login in a new tab to log in &rarr;
                  </a>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium admin-text">Product Code (SKU) *</label>
                <button
                  type="button"
                  onClick={() => setAddForm((prev: any) => ({ ...prev, code: generateProductSKU(prev.craftKey || CRAFTS[0].key) }))}
                  className="text-[11px] text-amber-600 hover:text-amber-700 dark:text-amber-400 font-semibold inline-flex items-center gap-1 hover:underline"
                  title="Generate a new unique SKU"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" /> Auto-Generate
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. HAB-THA-26-8492"
                value={addForm.code}
                onChange={(e) => setAddForm({ ...addForm, code: e.target.value.toUpperCase() })}
                className="w-full admin-input border rounded-lg px-3 py-2 font-mono uppercase outline-none"
              />
              <span className="text-[10.5px] text-slate-500 block mt-1">Unique tracking code for inventory (auto-generated, editable).</span>
            </div>
            <div>
              <label className="block font-medium admin-text mb-1">USD Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="120.00"
                value={addForm.priceUSD}
                onChange={(e) => setAddForm({ ...addForm, priceUSD: e.target.value })}
                className="w-full admin-input border rounded-lg px-3 py-2 font-mono outline-none"
              />
              <span className="text-[10.5px] text-slate-500 block mt-1">Price in USD (auto-converted to Nu. on website).</span>
            </div>
          </div>

          <div>
            <label className="block font-medium admin-text mb-1">Product Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Hand-Carved Wrathful Mahakala Mask"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              className="w-full admin-input border rounded-lg px-3 py-2 outline-none"
            />
            <span className="text-[10.5px] text-slate-500 block mt-1">Full descriptive title shown on public store and receipts.</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium admin-text mb-1">Craft Tradition *</label>
              <select
                value={addForm.craftKey}
                onChange={(e) => {
                  const newCraft = e.target.value;
                  const currentCode = addForm.code;
                  // If code is empty or looks auto-generated, refresh SKU prefix
                  const shouldRegen = !currentCode || currentCode.startsWith('HAB-');
                  setAddForm({
                    ...addForm,
                    craftKey: newCraft,
                    code: shouldRegen ? generateProductSKU(newCraft) : currentCode,
                  });
                }}
                className="w-full admin-input border rounded-lg px-3 py-2 cursor-pointer"
              >
                {CRAFTS.map((c) => (
                  <option key={c.key} value={c.key}>{c.name} ({c.english})</option>
                ))}
              </select>
              <span className="text-[10.5px] text-slate-500 block mt-1">One of the 13 Bhutanese Arts (Zorig Chusum).</span>
            </div>
            <div>
              <label className="block font-medium admin-text mb-1">Origin Dzongkhag</label>
              <input
                type="text"
                placeholder="e.g. Paro or Punakha"
                value={addForm.region}
                onChange={(e) => setAddForm({ ...addForm, region: e.target.value })}
                className="w-full admin-input border rounded-lg px-3 py-2"
              />
              <span className="text-[10.5px] text-slate-500 block mt-1">District where the item was handcrafted.</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium admin-text mb-1">Maker / Accredited Member</label>
              <select
                value={addForm.makerMemberId}
                onChange={(e) => setAddForm({ ...addForm, makerMemberId: e.target.value })}
                className="w-full admin-input border rounded-lg px-3 py-2 cursor-pointer"
              >
                <option value="">HAB Guild Artisans (General)</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.dzongkhag})
                  </option>
                ))}
              </select>
              <span className="text-[10.5px] text-slate-500 block mt-1">Credit registered master artisan or weaving cluster.</span>
            </div>
            <div>
              <label className="block font-medium admin-text mb-1">Initial Stock Count</label>
              <input
                type="number"
                min="0"
                value={addForm.stock}
                onChange={(e) => setAddForm({ ...addForm, stock: parseInt(e.target.value) || 0 })}
                className="w-full admin-input border rounded-lg px-3 py-2 font-mono"
              />
              <span className="text-[10.5px] text-slate-500 block mt-1">Number of physical items currently available in inventory.</span>
            </div>
          </div>

          {/* Photo Uploader Component & Multi-Photo Gallery */}
          <div className="p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border admin-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold admin-text text-xs flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Product Photography &amp; Auto-Crop Gallery
              </label>
              <span className="text-[10.5px] text-slate-500">Auto-crops smoothly to maintain uniform square catalog layout</span>
            </div>

            <FileUploadInput
              value={addForm.imageUrl}
              onChange={(url) => setAddForm({ ...addForm, imageUrl: url })}
              label="Primary Product Photograph (Hero Display)"
              accept="image/*"
              hint="Primary photograph displayed on catalog listings. Supports JPG, PNG, WEBP."
            />

            {/* Additional angles and gallery photos */}
            {addForm.additionalImages && addForm.additionalImages.length > 0 && (
              <div className="space-y-2 pt-2 border-t admin-border">
                <span className="block font-medium admin-text text-[11px]">
                  Additional Angle / Detail Photographs ({addForm.additionalImages.length})
                </span>
                <div className="space-y-2">
                  {addForm.additionalImages.map((imgUrl: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-lg border admin-border">
                      <div className="flex-1">
                        <FileUploadInput
                          value={imgUrl}
                          onChange={(url) => {
                            const updated = [...(addForm.additionalImages || [])];
                            updated[idx] = url;
                            setAddForm({ ...addForm, additionalImages: updated });
                          }}
                          label={`Angle / Detail Photograph ${idx + 2}`}
                          accept="image/*"
                          hint="Close-up detail, backside, or artisanal texture."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (addForm.additionalImages || []).filter((_: any, i: number) => i !== idx);
                          setAddForm({ ...addForm, additionalImages: updated });
                        }}
                        className="mt-6 p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800 transition"
                        title="Remove photograph"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setAddForm({
                  ...addForm,
                  additionalImages: [...(addForm.additionalImages || []), ''],
                });
              }}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 inline-flex items-center gap-1.5 pt-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add Another Photograph (Angle, Dimension, Texture)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['size', 'weight', 'lead'] as const).map((key) => <label key={key} className="block text-xs font-semibold admin-text">
              {key === 'size' ? 'Dimensions / size' : key === 'weight' ? 'Weight' : 'Lead time'}
              <input className="admin-input mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={addForm[key] || ''} onChange={(event) => setAddForm({ ...addForm, [key]: event.target.value })} />
            </label>)}
            {(['materials', 'care'] as const).map((key) => <label key={key} className="block text-xs font-semibold admin-text sm:col-span-3">
              {key === 'materials' ? 'Materials' : 'Care instructions'}
              <textarea rows={2} className="admin-input mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={addForm[key] || ''} onChange={(event) => setAddForm({ ...addForm, [key]: event.target.value })} />
            </label>)}
          </div>

          <div>
            <RichTextEditor
              label="Curatorial Provenance, Materials & Cultural Context"
              value={addForm.description}
              onChange={(html) => setAddForm({ ...addForm, description: html })}
              hint="Story, materials used, techniques, and cultural symbolism."
            />
          </div>

          <label className="flex items-center gap-2 rounded-lg border admin-border p-3">
            <input type="checkbox" checked={Boolean(addForm.wholesaleEnabled)} onChange={(e) => setAddForm({ ...addForm, wholesaleEnabled: e.target.checked })} />
            <span>Enable wholesale <span className="font-normal opacity-70">— set prices and terms in Wholesale Trade Desk after creating.</span></span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t admin-border">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 admin-button-secondary border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 admin-button-primary rounded-lg font-semibold disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Create Product'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Edit Product Modal */}
      {editingProduct && (
        <AdminModal
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          title={`Edit Product: ${editingProduct.name}`}
          subtitle={`SKU: ${editingProduct.code}`}
          maxWidth="xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Unable to save changes</p>
                  <p className="mt-0.5">{actionError}</p>
                  {(actionError.toLowerCase().includes('session') || actionError.toLowerCase().includes('unauthorized') || actionError.includes('401')) && (
                    <a href="/admin/login" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 underline font-bold text-rose-800">
                      Open /admin/login in a new tab to log in &rarr;
                    </a>
                  )}
                </div>
              </div>
            )}
            <div>
              <label className="block font-medium admin-text mb-1">Product Title</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full admin-input border rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium admin-text mb-1">USD Retail Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editForm.priceUSD}
                  onChange={(e) => setEditForm({ ...editForm, priceUSD: e.target.value })}
                  className="w-full admin-input border rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium admin-text mb-1">Catalog Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full admin-input border rounded-lg px-3 py-2"
                >
                  <option value="PUBLISHED">Published (Visible in Shop)</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived (Safe for past orders)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium admin-text mb-1">Craft Tradition</label>
                <select
                  value={editForm.craftKey}
                  onChange={(e) => setEditForm({ ...editForm, craftKey: e.target.value })}
                  className="w-full admin-input border rounded-lg px-3 py-2"
                >
                  {CRAFTS.map((c) => (
                    <option key={c.key} value={c.key}>{c.name} ({c.english})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium admin-text mb-1">Stock Count</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })}
                  className="w-full admin-input border rounded-lg px-3 py-2 font-mono"
                />
              </div>
            </div>

            {/* Photo Uploader Component & Multi-Photo Gallery */}
            <div className="p-3 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border admin-border space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-semibold admin-text text-xs flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Product Photography &amp; Auto-Crop Gallery
                </label>
                <span className="text-[10.5px] text-slate-500">Auto-crops smoothly for catalog and detail presentation</span>
              </div>

              <FileUploadInput
                value={editForm.imageUrl}
                onChange={(url) => setEditForm({ ...editForm, imageUrl: url })}
                label="Primary Product Photograph (Hero Display)"
                accept="image/*"
                hint="Main photograph displayed on catalog listings. Supports JPG, PNG, WEBP."
              />

              {/* Additional angles and gallery photos */}
              {editForm.additionalImages && editForm.additionalImages.length > 0 && (
                <div className="space-y-2 pt-2 border-t admin-border">
                  <span className="block font-medium admin-text text-[11px]">
                    Additional Angle / Detail Photographs ({editForm.additionalImages.length})
                  </span>
                  <div className="space-y-2">
                    {editForm.additionalImages.map((imgUrl: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-lg border admin-border">
                        <div className="flex-1">
                          <FileUploadInput
                            value={imgUrl}
                            onChange={(url) => {
                              const updated = [...(editForm.additionalImages || [])];
                              updated[idx] = url;
                              setEditForm({ ...editForm, additionalImages: updated });
                            }}
                            label={`Angle / Detail Photograph ${idx + 2}`}
                            accept="image/*"
                            hint="Secondary angle, dimension, or craftsmanship detail."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editForm.additionalImages || []).filter((_: any, i: number) => i !== idx);
                            setEditForm({ ...editForm, additionalImages: updated });
                          }}
                          className="mt-6 p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800 transition"
                          title="Remove photograph"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setEditForm({
                    ...editForm,
                    additionalImages: [...(editForm.additionalImages || []), ''],
                  });
                }}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 inline-flex items-center gap-1.5 pt-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Photograph (Angle, Dimension, Texture)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['size', 'weight', 'lead'] as const).map((key) => <label key={key} className="block text-xs font-semibold admin-text">
                {key === 'size' ? 'Dimensions / size' : key === 'weight' ? 'Weight' : 'Lead time'}
                <input className="admin-input mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={editForm[key] || ''} onChange={(event) => setEditForm({ ...editForm, [key]: event.target.value })} />
              </label>)}
              {(['materials', 'care'] as const).map((key) => <label key={key} className="block text-xs font-semibold admin-text sm:col-span-3">
                {key === 'materials' ? 'Materials' : 'Care instructions'}
                <textarea rows={2} className="admin-input mt-1 w-full rounded-lg border px-3 py-2 text-xs" value={editForm[key] || ''} onChange={(event) => setEditForm({ ...editForm, [key]: event.target.value })} />
              </label>)}
            </div>

            <div>
              <RichTextEditor
                label="Description & Cultural Context"
                value={editForm.description}
                onChange={(html) => setEditForm({ ...editForm, description: html })}
                hint="Story, materials used, techniques, and cultural symbolism."
              />
            </div>

            <label className="flex items-center gap-2 rounded-lg border admin-border p-3">
              <input type="checkbox" checked={Boolean(editForm.wholesaleEnabled)} onChange={(e) => setEditForm({ ...editForm, wholesaleEnabled: e.target.checked })} />
              <span>Enable wholesale <span className="font-normal opacity-70">— prices and terms are managed in Wholesale Trade Desk.</span></span>
            </label>

            <div className="flex justify-end gap-2 border-t admin-border pt-3">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-xs admin-button-secondary rounded-lg border"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold admin-button-primary rounded-lg shadow-xs disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Updates'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Delete Confirmation Modal with "Archive Instead" Option */}
      {deletingProduct && (
        <AdminModal
          isOpen={true}
          onClose={() => setDeletingProduct(null)}
          title="Delete Product from Catalog"
          subtitle={`SKU: ${deletingProduct.code}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <p className="admin-text leading-relaxed">
              Are you sure you want to permanently delete <strong className="admin-title">{deletingProduct.name}</strong>?
            </p>

            <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-slate-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Referential Integrity Safeguard
              </div>
              <p className="leading-normal text-slate-800">
                If this product is linked to existing customer orders, permanent deletion is prevented to maintain legal and financial audit logs. In that case, you should <strong>Archive</strong> it instead.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t admin-border">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-3 py-2 admin-button-secondary border rounded-lg order-3 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchiveInstead(deletingProduct)}
                disabled={submitting}
                className="px-3 py-2 admin-button-secondary rounded-lg font-semibold flex items-center justify-center gap-1.5 order-2"
              >
                <Archive className="w-3.5 h-3.5 admin-text" />
                <span>Archive Instead</span>
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={submitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold disabled:opacity-50 order-1 sm:order-3"
              >
                {submitting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* CSV Bulk Import Modal */}
      <AdminModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Bulk Import Products via CSV"
        subtitle="Paste or upload CSV data with headers: Code, Name, PriceUSD, CraftKey, Stock, Region, Description"
        maxWidth="xl"
      >
        <form onSubmit={handleBulkImport} className="space-y-4 text-xs">
          {importError && (
            <div className="p-3 bg-rose-500/15 border border-rose-400/25 text-rose-200 rounded-lg">
              {importError}
            </div>
          )}

          <div>
            <label className="block font-medium admin-text mb-1">CSV Content</label>
            <textarea
              rows={8}
              required
              placeholder={`Code,Name,PriceUSD,CraftKey,Stock,Region\nMAS05,Himalayan Mahakala Mask,145.00,parzo,8,Punakha\nTHA07,Yathra Wool Runner,95.00,thagzo,12,Bumthang`}
              value={importCsvText}
              onChange={(e) => setImportCsvText(e.target.value)}
              className="w-full admin-input border rounded-lg p-3 font-mono text-[11px] leading-relaxed outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t admin-border">
            <button
              type="button"
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 admin-button-secondary border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !importCsvText.trim()}
              className="px-4 py-2 admin-button-primary rounded-lg font-semibold disabled:opacity-50"
            >
              {submitting ? 'Importing...' : 'Run Bulk Import'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

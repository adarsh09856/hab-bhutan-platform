'use client';

import React, { useState, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { AdminBadge, AdminModal, AdminEmptyState, AdminSkeleton, AdminPagination } from '@/components/admin/AdminUI';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [craftFilter, setCraftFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  
  // Forms
  const [editForm, setEditForm] = useState<any>({});
  const [addForm, setAddForm] = useState<any>({
    code: '',
    name: '',
    priceUSD: '',
    craftKey: CRAFTS[0].key,
    region: 'Thimphu',
    makerMemberId: '',
    stock: 10,
    status: 'PUBLISHED',
    description: '',
    imageUrl: '',
    images: [] as { url: string; role: string }[],
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
        fetch('/api/admin/products', { credentials: 'include' }),
        fetch('/api/admin/members', { credentials: 'include' }).catch(() => null),
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
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`Product "${data.product.name}" (${data.product.code}) successfully added to catalog.`);
        setShowAddModal(false);
        setAddForm({
          code: '',
          name: '',
          priceUSD: '',
          craftKey: CRAFTS[0].key,
          region: 'Thimphu',
          makerMemberId: '',
          stock: 10,
          status: 'PUBLISHED',
          description: '',
          imageUrl: '',
          images: [],
        });
        await loadData();
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
    const primaryImg = existingImages[0]?.url || p.images?.url || '';
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
      imageUrl: primaryImg,
      images: existingImages,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`Product "${data.product.name}" (${data.product.code}) updated successfully.`);
        setEditingProduct(null);
        await loadData();
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
        : stockVal === 0;
    return matchesSearch && matchesCraft && matchesStock;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedProducts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#8B2E24]" />
            Products &amp; Catalog Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage authenticated artisan inventory, canonical USD retail prices, and craft categories.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export */}
          <a
            href="/api/admin/products/csv"
            download
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>

          {/* CSV Import */}
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          {/* Add Product */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 bg-[#8B2E24] hover:bg-[#72251D] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex justify-between items-center">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-600 font-bold ml-2">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-lg flex justify-between items-center">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-rose-600 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search title, SKU code, artisan maker..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24] outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={craftFilter}
            onChange={(e) => {
              setCraftFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 outline-none"
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
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 outline-none"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN_STOCK">In Stock (&gt;5)</option>
            <option value="LOW_STOCK">Low Stock (1–5)</option>
            <option value="OUT_OF_STOCK">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
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
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
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
              <tbody className="divide-y divide-slate-100">
                {paginatedProducts.map((p) => {
                  const stockVal = p.stock ?? 0;
                  const primaryImg = Array.isArray(p.images) && p.images[0]?.url ? p.images[0].url : null;

                  return (
                    <tr key={p.id || p.code} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {primaryImg ? (
                              <img src={primaryImg} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-slate-400 font-mono text-[9px]">NO IMG</span>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/product/${p.code}`}
                              target="_blank"
                              className="font-medium text-slate-900 hover:text-[#8B2E24] flex items-center gap-1"
                            >
                              {p.name}
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </Link>
                            <span className="font-mono text-[11px] text-slate-500">{p.code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block font-mono text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {p.craft?.name || p.craftKey}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {p.maker?.name || 'HAB Secretariat Guild'}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        ${Number(p.priceUSD).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.region}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={stockVal}
                            onChange={(e) => handleUpdateStock(p.code, parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-slate-200 rounded font-mono text-center text-xs outline-none focus:border-[#8B2E24]"
                          />
                          {stockVal > 5 ? (
                            <AdminBadge variant="success" size="sm" dot>In Stock</AdminBadge>
                          ) : stockVal > 0 ? (
                            <AdminBadge variant="warning" size="sm" dot>Low</AdminBadge>
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
                          className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 rounded font-medium inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="px-2 py-1 text-rose-600 hover:text-rose-800 border border-rose-200 hover:bg-rose-50 rounded font-medium inline-flex items-center gap-1"
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Product Code (SKU) *</label>
              <input
                type="text"
                required
                placeholder="e.g. MAS02, THA03"
                value={addForm.code}
                onChange={(e) => setAddForm({ ...addForm, code: e.target.value.toUpperCase() })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono uppercase outline-none focus:border-[#8B2E24]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">USD Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="120.00"
                value={addForm.priceUSD}
                onChange={(e) => setAddForm({ ...addForm, priceUSD: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono outline-none focus:border-[#8B2E24]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Product Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Hand-Carved Wrathful Mahakala Mask"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#8B2E24]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Craft Tradition *</label>
              <select
                value={addForm.craftKey}
                onChange={(e) => setAddForm({ ...addForm, craftKey: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
              >
                {CRAFTS.map((c) => (
                  <option key={c.key} value={c.key}>{c.name} ({c.english})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Origin Dzongkhag</label>
              <input
                type="text"
                placeholder="e.g. Paro or Punakha"
                value={addForm.region}
                onChange={(e) => setAddForm({ ...addForm, region: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Maker / Accredited Member</label>
              <select
                value={addForm.makerMemberId}
                onChange={(e) => setAddForm({ ...addForm, makerMemberId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="">HAB Guild Artisans (General)</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.dzongkhag})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Initial Stock Count</label>
              <input
                type="number"
                min="0"
                value={addForm.stock}
                onChange={(e) => setAddForm({ ...addForm, stock: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Primary Image URL</label>
            <input
              type="text"
              placeholder="/images/crafts/parzo.jpg"
              value={addForm.imageUrl}
              onChange={(e) => setAddForm({ ...addForm, imageUrl: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Curatorial Provenance &amp; Materials</label>
            <textarea
              rows={3}
              placeholder="Carved from Himalayan pine wood, cured in natural oil pigments according to Zorig Chusum canons..."
              value={addForm.description}
              onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#8B2E24] hover:bg-[#72251D] text-white rounded-lg font-semibold disabled:opacity-50"
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
            <div>
              <label className="block font-medium text-slate-700 mb-1">Product Title</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">USD Retail Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editForm.priceUSD}
                  onChange={(e) => setEditForm({ ...editForm, priceUSD: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Catalog Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="PUBLISHED">Published (Visible in Shop)</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived (Safe for past orders)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Craft Tradition</label>
                <select
                  value={editForm.craftKey}
                  onChange={(e) => setEditForm({ ...editForm, craftKey: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  {CRAFTS.map((c) => (
                    <option key={c.key} value={c.key}>{c.name} ({c.english})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Stock Count</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Primary Image URL</label>
              <input
                type="text"
                value={editForm.imageUrl}
                onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Description &amp; Cultural Context</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#8B2E24] hover:bg-[#72251D] rounded-lg shadow-xs disabled:opacity-50"
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
            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900">{deletingProduct.name}</strong>?
            </p>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Referential Integrity Safeguard
              </div>
              <p className="leading-normal">
                If this product is linked to existing customer orders, permanent deletion is prevented to maintain legal and financial audit logs. In that case, you should <strong>Archive</strong> it instead.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 order-3 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchiveInstead(deletingProduct)}
                disabled={submitting}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center justify-center gap-1.5 order-2"
              >
                <Archive className="w-3.5 h-3.5 text-slate-600" />
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
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
              {importError}
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">CSV Content</label>
            <textarea
              rows={8}
              required
              placeholder={`Code,Name,PriceUSD,CraftKey,Stock,Region\nMAS05,Himalayan Mahakala Mask,145.00,parzo,8,Punakha\nTHA07,Yathra Wool Runner,95.00,thagzo,12,Bumthang`}
              value={importCsvText}
              onChange={(e) => setImportCsvText(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-3 font-mono text-[11px] leading-relaxed outline-none focus:border-[#8B2E24]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !importCsvText.trim()}
              className="px-4 py-2 bg-[#8B2E24] hover:bg-[#72251D] text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {submitting ? 'Importing...' : 'Run Bulk Import'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { CRAFTS } from '@/lib/data';
import { Package, Plus, Search, Filter, CheckCircle, Edit, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [craftFilter, setCraftFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  
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
  });

  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
        setActionError(errData.error || 'Failed to load catalog products from PostgreSQL.');
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
        setActionSuccess(`✓ Product "${data.product.name}" (${data.product.code}) successfully added to catalog.`);
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
      console.error('Failed to persist stock update:', err);
    }
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setEditForm({
      name: p.name,
      priceUSD: p.priceUSD,
      stock: p.stock,
      status: p.status,
      craftKey: p.craftKey,
      region: p.region,
      makerMemberId: p.makerMemberId || '',
      description: p.description,
      imageUrl: Array.isArray(p.images) && p.images[0]?.url ? p.images[0].url : '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          code: editingProduct.code,
          ...editForm,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`✓ Updated ${editingProduct.code} in PostgreSQL catalog.`);
        setEditingProduct(null);
        await loadData();
        setTimeout(() => setActionSuccess(''), 4000);
      } else {
        setActionError(data.error || 'Failed to update product.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error saving product edits.');
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
        setActionSuccess(data.message || `✓ Product deleted.`);
        setDeletingProduct(null);
        await loadData();
      } else {
        setActionError(data.error || 'Failed to delete product.');
        setDeletingProduct(null);
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
      setDeletingProduct(null);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            Product Catalog &amp; Consignments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage authenticated artisan inventory, USD retail list prices, and craft lineage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-md flex justify-between items-center">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-600 font-bold ml-2">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-md flex justify-between items-center">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-rose-600 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search title, SKU code, artisan maker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={craftFilter}
            onChange={(e) => setCraftFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-700 outline-none"
          >
            <option value="ALL">All Zorig Chusum Crafts</option>
            {CRAFTS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name} ({c.english})
              </option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-700 outline-none"
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="IN_STOCK">In Stock (&gt;5)</option>
            <option value="LOW_STOCK">Low Stock (1–5)</option>
            <option value="OUT_OF_STOCK">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            Loading products from PostgreSQL...
          </div>
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
                {filtered.map((p) => {
                  const stockVal = p.stock ?? 0;
                  const primaryImg = Array.isArray(p.images) && p.images[0]?.url ? p.images[0].url : null;

                  return (
                    <tr key={p.id || p.code} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
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
                              className="font-medium text-slate-900 hover:text-indigo-600 flex items-center gap-1"
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
                            className="w-16 px-2 py-1 border border-slate-300 rounded font-mono text-center text-xs outline-none focus:border-indigo-500"
                          />
                          {stockVal > 5 && (
                            <span className="inline-flex items-center text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                              Available
                            </span>
                          )}
                          {stockVal > 0 && stockVal <= 5 && (
                            <span className="inline-flex items-center text-[10px] text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                              Low Stock
                            </span>
                          )}
                          {stockVal === 0 && (
                            <span className="inline-flex items-center text-[10px] text-rose-700 font-medium bg-rose-50 px-1.5 py-0.5 rounded">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'ARCHIVED'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No products found in PostgreSQL catalog matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add New Handcrafted Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Product Code (SKU) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAS02, THA03"
                    value={addForm.code}
                    onChange={(e) => setAddForm({ ...addForm, code: e.target.value.toUpperCase() })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono uppercase outline-none focus:border-slate-500"
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
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono outline-none focus:border-slate-500"
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
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:border-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Craft Tradition *</label>
                  <select
                    value={addForm.craftKey}
                    onChange={(e) => setAddForm({ ...addForm, craftKey: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
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
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Maker / Accredited Member</label>
                  <select
                    value={addForm.makerMemberId}
                    onChange={(e) => setAddForm({ ...addForm, makerMemberId: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
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
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
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
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Curatorial Provenance &amp; Materials</label>
                <textarea
                  rows={3}
                  placeholder="Carved from Himalayan pine wood, cured in natural oil pigments according to Zorig Chusum canons..."
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Edit Catalog Item: {editingProduct.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{editingProduct.code}</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">USD Retail Price</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editForm.priceUSD}
                      onChange={(e) => setEditForm({ ...editForm, priceUSD: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-slate-300 rounded pl-6 pr-2.5 py-1.5 outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="PUBLISHED">Published (Catalog Active)</option>
                    <option value="DRAFT">Draft / Under Review</option>
                    <option value="ARCHIVED">Archived (Delisted)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Origin Dzongkhag</label>
                  <input
                    type="text"
                    value={editForm.region}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Craft Tradition</label>
                  <select
                    value={editForm.craftKey}
                    onChange={(e) => setEditForm({ ...editForm, craftKey: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    {CRAFTS.map((c) => (
                      <option key={c.key} value={c.key}>{c.name} ({c.english})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Maker / Accredited Member</label>
                  <select
                    value={editForm.makerMemberId}
                    onChange={(e) => setEditForm({ ...editForm, makerMemberId: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="">HAB Guild Artisans (General)</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.dzongkhag})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Curatorial Provenance Note</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Updates to PostgreSQL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Permanently Delete Product?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900">{deletingProduct.name}</strong> (<span className="font-mono">{deletingProduct.code}</span>)?
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <span>⚠️</span> Referential Integrity Guard
              </div>
              <p>
                Products referenced by historical customer orders cannot be deleted because foreign-key constraints protect order line items. If this product was ever purchased, change its status to <strong>ARCHIVED</strong> instead.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={submitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

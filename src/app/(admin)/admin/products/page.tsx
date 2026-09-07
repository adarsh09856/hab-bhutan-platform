'use client';

import React, { useState, useEffect } from 'react';
import { PRODUCTS, CRAFTS } from '@/lib/data';
import { Package, Plus, Search, Filter, CheckCircle, Edit, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [craftFilter, setCraftFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        const res = await fetch('/api/admin/products', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.products && data.products.length > 0) {
            setProducts(
              data.products.map((p: any) => ({
                code: p.code,
                name: p.name,
                priceUsd: p.priceUSD,
                craftId: p.craftKey,
                craftName: p.craft?.name || p.craftKey,
                region: p.region,
                maker: p.maker?.name || p.makerMember?.name || 'Artisan Workshop',
                description: p.description,
                materials: p.materials || 'Traditional materials',
                dimensions: p.dimensions || 'Standard',
                inventoryCount: p.stock ?? p.inventoryCount ?? 10,
                inStock: (p.stock ?? p.inventoryCount ?? 10) > 0,
              }))
            );
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load products from API:', err);
      }

      if (isMounted) {
        setProducts(PRODUCTS);
        setLoading(false);
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.maker.toLowerCase().includes(search.toLowerCase());
    const matchesCraft = craftFilter === 'ALL' || p.craftId === craftFilter || p.craftId.replace('-', '') === craftFilter.replace('-', '');
    const matchesStock =
      stockFilter === 'ALL'
        ? true
        : stockFilter === 'IN_STOCK'
        ? p.inventoryCount > 5
        : stockFilter === 'LOW_STOCK'
        ? p.inventoryCount > 0 && p.inventoryCount <= 5
        : p.inventoryCount === 0;
    return matchesSearch && matchesCraft && matchesStock;
  });

  const handleUpdateStock = async (code: string, newQty: number) => {
    const qty = Math.max(0, newQty);
    setProducts((prev) =>
      prev.map((p) => (p.code === code ? { ...p, inventoryCount: qty, inStock: qty > 0 } : p))
    );

    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, inventoryCount: qty }),
      });
    } catch (err) {
      console.error('Failed to persist stock update:', err);
    }
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setEditForm({
      name: p.name,
      priceUsd: p.priceUsd,
      inventoryCount: p.inventoryCount,
      dimensions: p.dimensions,
      materials: p.materials,
      description: p.description,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editingProduct.code,
          name: editForm.name,
          priceUSD: editForm.priceUsd,
          inventoryCount: editForm.inventoryCount,
          dimensions: editForm.dimensions,
          materials: editForm.materials,
          description: editForm.description,
        }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.code === editingProduct.code
              ? { ...p, ...editForm, priceUsd: Number(editForm.priceUsd) }
              : p
          )
        );
        setSaveSuccess(`✓ Updated ${editingProduct.code} in PostgreSQL catalog.`);
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Error saving product edits:', err);
    }

    setEditingProduct(null);
  };

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
        {loading && (
          <span className="text-xs text-slate-400 font-mono">Syncing catalog...</span>
        )}
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-md">
          {saveSuccess}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search title, SKU code, artisan..."
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
              <option key={c.id || c.key} value={c.id || c.key}>
                {c.name} ({c.dzongkha})
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Item &amp; Code</th>
                <th className="py-3 px-4">Craft Tradition</th>
                <th className="py-3 px-4">Artisan / Member</th>
                <th className="py-3 px-4">USD Retail</th>
                <th className="py-3 px-4">Origin Dzongkhag</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.code} className="hover:bg-slate-50/75 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center text-slate-400 font-mono text-[10px]">
                        1:1
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
                      {p.craftName}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{p.maker}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    ${Number(p.priceUsd).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{p.region}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={p.inventoryCount}
                        onChange={(e) => handleUpdateStock(p.code, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-slate-300 rounded font-mono text-center text-xs outline-none focus:border-indigo-500"
                      />
                      {p.inventoryCount > 5 && (
                        <span className="inline-flex items-center text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                          Available
                        </span>
                      )}
                      {p.inventoryCount > 0 && p.inventoryCount <= 5 && (
                        <span className="inline-flex items-center text-[10px] text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                          Low Stock
                        </span>
                      )}
                      {p.inventoryCount === 0 && (
                        <span className="inline-flex items-center text-[10px] text-rose-700 font-medium bg-rose-50 px-1.5 py-0.5 rounded">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 rounded font-medium inline-flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No products found matching active search and craft filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Drawer / Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Edit Product Curation &amp; Spec</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{editingProduct.code}</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
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
                      value={editForm.priceUsd}
                      onChange={(e) => setEditForm({ ...editForm, priceUsd: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-slate-300 rounded pl-6 pr-2.5 py-1.5 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={editForm.inventoryCount}
                    onChange={(e) => setEditForm({ ...editForm, inventoryCount: parseInt(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Dimensions &amp; Material</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Dimensions"
                    value={editForm.dimensions}
                    onChange={(e) => setEditForm({ ...editForm, dimensions: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Materials"
                    value={editForm.materials}
                    onChange={(e) => setEditForm({ ...editForm, materials: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Curatorial Provenance Note</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded border border-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm"
              >
                Save Updates to PostgreSQL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

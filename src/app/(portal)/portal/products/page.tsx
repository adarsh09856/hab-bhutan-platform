'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';

const CRAFT_OPTIONS = [
  { key: 'thag-zo', name: 'Thag-zo (Weaving)' },
  { key: 'tsharo-zo', name: 'Tsharo-zo (Cane & Bamboo)' },
  { key: 'shing-zo', name: 'Shing-zo (Carpentry & Woodwork)' },
  { key: 'par-zo', name: 'Par-zo (Woodcarving & Relief)' },
  { key: 'lha-zo', name: 'Lha-zo (Painting & Thangka)' },
  { key: 'jim-zo', name: 'Jim-zo (Sculpture & Clay)' },
  { key: 'lug-zo', name: 'Lug-zo (Bronze & Metal Casting)' },
  { key: 'shag-zo', name: 'Shag-zo (Woodturning)' },
  { key: 'gar-zo', name: 'Gar-zo (Blacksmithing & Blades)' },
  { key: 'troe-zo', name: 'Troe-zo (Silver & Gold Filigree)' },
  { key: 'tshe-zo', name: 'Tshe-zo (Tailoring & Embroidery)' },
  { key: 'do-zo', name: 'Do-zo (Traditional Masonry)' },
  { key: 'de-zo', name: 'De-zo (Papermaking / Desho)' },
];

export default function MyProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    name: '',
    craftKey: 'thag-zo',
    priceUSD: '',
    stock: '1',
    description: '',
    imageUrl: '',
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/member/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/member/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', text: 'Craft product submitted for accreditation review!' });
        setShowModal(false);
        setForm({
          name: '',
          craftKey: 'thag-zo',
          priceUSD: '',
          stock: '1',
          description: '',
          imageUrl: '',
        });
        loadProducts();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to submit product.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Network error submitting product.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-[#8B2E24] uppercase tracking-wider mb-1">
            Artisan Catalog
          </div>
          <h1 className="font-marcellus text-2xl sm:text-3xl text-[#2E221B]">
            My Crafts &amp; Products
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5A4C] mt-1">
            View your accredited items in the catalog and submit new handcrafted creations for provenance review.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#8B2E24] hover:bg-[#A3382D] text-white px-4 sm:px-5 py-2.5 rounded-[8px] text-xs sm:text-sm font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          + Submit New Craft
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-[8px] text-xs sm:text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center space-y-2 text-sm text-[#6B5A4C]">
            <div className="inline-block w-6 h-6 border-2 border-[#8B2E24] border-t-transparent rounded-full animate-spin"></div>
            <div>Loading catalog items...</div>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-[#E5DDD0] rounded-[14px] p-10 text-center space-y-3">
          <div className="text-3xl">🎨</div>
          <div className="font-bold text-[#2E221B] text-base">No craft products listed yet</div>
          <p className="text-xs text-[#6B5A4C] max-w-[400px] mx-auto">
            Submit your first handcrafted piece to begin selling through the HAB e-shop and Punakha Authentic Craft Market.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#2E221B] text-white px-5 py-2 rounded-[8px] text-xs font-semibold hover:bg-[#8B2E24] transition-colors"
          >
            Submit Craft for Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => {
            const primaryImg =
              Array.isArray(product.images) && product.images.length > 0
                ? product.images[0].url
                : '/images/products/placeholder.jpg';

            return (
              <div
                key={product.id}
                className="bg-white border border-[#E5DDD0] rounded-[12px] overflow-hidden shadow-sm flex flex-col justify-between hover:border-[#8B2E24] transition-colors"
              >
                <div>
                  <div className="aspect-[4/3] bg-[#EAE2D5] relative overflow-hidden">
                    <img
                      src={primaryImg}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span
                      className={`absolute top-2 right-2 font-mono text-[9.5px] px-2 py-0.5 rounded font-bold uppercase ${
                        product.status === 'PUBLISHED'
                          ? 'bg-emerald-600 text-white'
                          : product.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      {product.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#8C7A6B]">
                      <span>{product.code}</span>
                      <span>{product.craft?.name || product.craftKey}</span>
                    </div>

                    <h3 className="font-figtree font-bold text-sm text-[#2E221B] line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="text-xs text-[#6B5A4C] line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-[#F0EAE1] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#8C7A6B] block text-[10px]">Price</span>
                    <span className="font-bold text-[#2E221B] text-sm">${product.priceUSD.toFixed(2)}</span>
                    <span className="text-[10px] text-[#8C7A6B] ml-1">
                      (~Nu. {(product.priceUSD * 84).toFixed(0)})
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[#8C7A6B] block text-[10px]">Stock</span>
                    <span className="font-mono font-bold text-[#2E221B]">{product.stock} units</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] max-w-xl w-full p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5DDD0] pb-3">
              <div>
                <h2 className="font-marcellus text-xl text-[#2E221B]">
                  Submit Craft for Provenance Review
                </h2>
                <div className="text-xs text-[#6B5A4C]">
                  Secretariat review takes 24–48 hours before catalog listing.
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#6B5A4C] hover:text-[#2E221B] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2E221B] mb-1">
                  Product / Craft Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Handwoven Kushuthara Silk Kira Panel"
                  className="w-full px-3.5 py-2 rounded-[8px] border border-[#D5CBBF] text-xs sm:text-sm focus:outline-none focus:border-[#8B2E24]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2E221B] mb-1">
                    Craft Tradition (Zorig Chusum) *
                  </label>
                  <select
                    value={form.craftKey}
                    onChange={(e) => setForm({ ...form, craftKey: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-[8px] border border-[#D5CBBF] text-xs sm:text-sm focus:outline-none focus:border-[#8B2E24] bg-white"
                  >
                    {CRAFT_OPTIONS.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2E221B] mb-1">
                    Price (USD $) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={form.priceUSD}
                    onChange={(e) => setForm({ ...form, priceUSD: e.target.value })}
                    placeholder="e.g. 185.00"
                    className="w-full px-3.5 py-2 rounded-[8px] border border-[#D5CBBF] text-xs sm:text-sm focus:outline-none focus:border-[#8B2E24]"
                  />
                  {form.priceUSD && (
                    <span className="text-[10.5px] text-[#8C7A6B] block mt-1 font-mono">
                      ≈ Nu. {(Number(form.priceUSD) * 84).toLocaleString()} BTN
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2E221B] mb-1">
                    Initial Stock Available *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-[8px] border border-[#D5CBBF] text-xs sm:text-sm focus:outline-none focus:border-[#8B2E24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2E221B] mb-1">
                    Photograph URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://example.com/craft-photo.jpg"
                    className="w-full px-3.5 py-2 rounded-[8px] border border-[#D5CBBF] text-xs sm:text-sm focus:outline-none focus:border-[#8B2E24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2E221B] mb-1">
                  Craft Description, Materials &amp; Provenance *
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detail natural dyes used, indigenous materials, days of handwork, and cultural significance..."
                  className="w-full px-3.5 py-2 rounded-[8px] border border-[#D5CBBF] text-xs sm:text-sm focus:outline-none focus:border-[#8B2E24]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5DDD0] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-[8px] border border-[#D5CBBF] text-xs font-medium text-[#6B5A4C] hover:bg-[#F5F0E6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#8B2E24] hover:bg-[#A3382D] text-white px-5 py-2 rounded-[8px] text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Craft for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

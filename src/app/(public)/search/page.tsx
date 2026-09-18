'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Package, Palette, Users, Newspaper, Calendar, Award, ArrowRight, Loader2, FileText, ChevronRight } from 'lucide-react';
import SectionEditBadge from '@/components/public/SectionEditBadge';

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  url: string;
  imageUrl?: string;
  category: string;
  badge?: string;
}

interface SearchResponse {
  query: string;
  total: number;
  results: {
    products: SearchItem[];
    crafts: SearchItem[];
    members: SearchItem[];
    news: SearchItem[];
    events: SearchItem[];
    programmes: SearchItem[];
    projects: SearchItem[];
    publications: SearchItem[];
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PRODUCTS' | 'CRAFTS' | 'MEMBERS' | 'NEWS' | 'PROGRAMMES'>('ALL');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResponse | null>(null);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (q.trim()) {
      fetchResults(q.trim());
    } else {
      setData(null);
    }
  }, [searchParams]);

  const fetchResults = async (term: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch search results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const results = data?.results;
  const products = results?.products || [];
  const crafts = results?.crafts || [];
  const members = results?.members || [];
  const news = [...(results?.news || []), ...(results?.publications || [])];
  const programmes = [...(results?.programmes || []), ...(results?.projects || []), ...(results?.events || [])];

  const allItems = [
    ...products,
    ...crafts,
    ...members,
    ...news,
    ...programmes,
  ];

  const getFilteredItems = () => {
    switch (activeTab) {
      case 'PRODUCTS':
        return products;
      case 'CRAFTS':
        return crafts;
      case 'MEMBERS':
        return members;
      case 'NEWS':
        return news;
      case 'PROGRAMMES':
        return programmes;
      default:
        return allItems;
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 font-mono">
          <Link href="/" className="hover:text-[#8B2E24]">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-800 font-semibold">Global Search</span>
        </nav>

        {/* Search Header */}
        <div className="relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
          <SectionEditBadge
            label="Catalog &amp; Studios"
            studioHref="/admin/products"
            className="top-4 right-4 z-20"
          />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Search Bhutan Handicrafts Association
          </h1>
          <p className="text-sm text-slate-600 mt-1 mb-6">
            Explore authentic products, 13 Zorig Chusum craft traditions, certified artisans, news articles, and national programmes.
          </p>

          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, master weavers, Thagzo, Punakha, annual reports..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#8B2E24] focus:bg-white focus:ring-1 focus:ring-[#8B2E24] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3.5 bg-[#8B2E24] hover:bg-[#72241c] text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {data && (
            <p className="text-xs text-slate-500 mt-3 font-mono">
              Found <strong className="text-slate-900">{data.total}</strong> results for &ldquo;{data.query}&rdquo;
            </p>
          )}
        </div>

        {/* Filter Tabs */}
        {data && data.total > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-[#8B2E24] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Results ({allItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PRODUCTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'PRODUCTS'
                  ? 'bg-[#8B2E24] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Products ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('CRAFTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'CRAFTS'
                  ? 'bg-[#8B2E24] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              13 Crafts ({crafts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('MEMBERS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'MEMBERS'
                  ? 'bg-[#8B2E24] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Artisans ({members.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('NEWS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'NEWS'
                  ? 'bg-[#8B2E24] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              News &amp; Reports ({news.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PROGRAMMES')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'PROGRAMMES'
                  ? 'bg-[#8B2E24] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Programmes &amp; Projects ({programmes.length})
            </button>
          </div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#8B2E24] animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-700">Searching nationwide craft database...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <Link
                key={`${item.category}-${item.id}`}
                href={item.url}
                className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#8B2E24]/50 hover:shadow-lg transition-all"
              >
                {item.imageUrl && (
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/photos/product-hhb01.jpg';
                      }}
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
                        {item.category}
                      </span>
                      {item.badge && (
                        <span className="px-2 py-1 bg-amber-500/90 text-amber-950 text-[10px] font-bold rounded-md">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {!item.imageUrl && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded">
                          {item.category}
                        </span>
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-semibold rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-[#8B2E24] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#8B2E24] font-medium mt-1">
                      {item.subtitle}
                    </p>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                        {item.description.replace(/<[^>]*>?/gm, '')}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#8B2E24]">
                    <span>View details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : query.trim() ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">No matches found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
              We couldn&rsquo;t find anything matching &ldquo;{query}&rdquo;. Try checking the spelling or browse our main categories below:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/shop" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold">
                Browse Shop Catalog &rarr;
              </Link>
              <Link href="/crafts" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold">
                The 13 Traditional Crafts &rarr;
              </Link>
              <Link href="/members" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold">
                Artisan Directory &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <h3 className="font-bold text-slate-800 text-base">Type a search term above</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Search for products, traditional craft disciplines, registered artisans, news, and reports.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-xs font-mono text-slate-500">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}

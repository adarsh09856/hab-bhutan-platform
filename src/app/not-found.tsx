'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import UtilityBar from '@/components/public/UtilityBar';
import AdminLiveBar from '@/components/public/AdminLiveBar';
import AskHabAssistant from '@/components/public/AskHabAssistant';
import {
  Compass,
  Search,
  Home,
  ArrowRight,
  BookOpen,
  Sparkles,
  ShoppingBag,
  Users,
  Mail,
  AlertCircle,
} from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const POPULAR_DESTINATIONS = [
    {
      title: 'About the Association',
      description: 'Our mission, royal patron history, Board of Trustees, and mandate for Bhutanese crafts.',
      href: '/about',
      icon: BookOpen,
      badge: 'Charter & Mandate',
    },
    {
      title: 'Programmes & Pillars',
      description: 'Explore the 11 national support pillars from raw materials to export facilitation.',
      href: '/programmes',
      icon: Sparkles,
      badge: '11 Pillars',
    },
    {
      title: 'The 13 Traditional Crafts',
      description: 'Explore Zorig Chusum: weaving, wood carving, bronze casting, paper-making, and more.',
      href: '/crafts',
      icon: Compass,
      badge: 'Zorig Chusum',
    },
    {
      title: 'Certified E-Shop',
      description: 'Authentic Bhutanese textiles, woodcraft, prayer wheels, and certified handcrafted goods.',
      href: '/shop',
      icon: ShoppingBag,
      badge: 'Validated Crafts',
    },
    {
      title: 'Master Artisans & Members',
      description: 'Directory of registered individual artisans, craft clusters, and Living Masters across all 20 dzongkhags.',
      href: '/members',
      icon: Users,
      badge: 'Artisan Directory',
    },
    {
      title: 'Contact Secretariat',
      description: 'Reach our secretariat team in Thimphu for inquiries, visits, tenders, or memberships.',
      href: '/contact',
      icon: Mail,
      badge: 'Thimphu Office',
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F4F0E7] text-[#33261F] overflow-x-clip">
      <AdminLiveBar />
      <UtilityBar />
      <Header />

      <main className="hab-public-shell flex-1 w-full py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow & Status */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8B2E24]/10 border border-[#8B2E24]/20 text-[#8B2E24] text-xs font-mono font-bold uppercase tracking-widest mb-6">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Error 404 · Page Not Found</span>
          </div>

          <h1 className="font-marcellus text-4xl sm:text-5xl lg:text-6xl text-[#33261F] tracking-tight mb-4">
            The Path You Sought Does Not Exist
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed mb-8">
            The requested page may have been moved, renamed, or is temporarily retired.
            Search our platform or discover authentic Bhutanese craftsmanship through the direct routes below.
          </p>

          {/* Interactive Search Bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-xl mx-auto mb-12 relative flex items-center bg-white rounded-2xl border border-[#E4DDD1] shadow-md p-1.5 focus-within:border-[#8B2E24] focus-within:ring-2 focus-within:ring-[#8B2E24]/20 transition-all"
          >
            <Search className="w-5 h-5 text-stone-400 ml-3 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search crafts, programmes, artisans, or publications..."
              className="w-full px-3 py-2 text-sm text-[#33261F] bg-transparent focus:outline-hidden placeholder:text-stone-400 font-sans"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-bold transition-colors cursor-pointer flex-shrink-0"
            >
              Search
            </button>
          </form>

          {/* Return Home & Help Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-sm font-semibold shadow-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Return to Homepage</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-stone-50 border border-[#E4DDD1] text-[#33261F] text-sm font-semibold shadow-xs transition-colors"
            >
              <Mail className="w-4 h-4 text-[#8B2E24]" />
              <span>Inquire with Secretariat</span>
            </Link>
          </div>

          {/* Core Destinations Grid */}
          <div className="text-left">
            <div className="border-t border-[#E4DDD1] pt-10 pb-6">
              <h2 className="font-marcellus text-2xl text-[#33261F] text-center mb-2">
                Explore Core Association Portals
              </h2>
              <p className="text-xs text-stone-500 text-center font-mono uppercase tracking-wider mb-8">
                Canonical National Routes
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {POPULAR_DESTINATIONS.map((dest) => {
                  const Icon = dest.icon;
                  return (
                    <Link
                      key={dest.href}
                      href={dest.href}
                      className="group bg-white rounded-2xl p-5 border border-[#E4DDD1] hover:border-[#8B2E24]/60 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] border border-[#E4DDD1] text-[#8B2E24] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#8B2E24] group-hover:text-white transition-all">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-mono uppercase font-bold text-stone-400 group-hover:text-[#8B2E24] transition-colors">
                            {dest.badge}
                          </span>
                        </div>
                        <h3 className="font-marcellus text-base text-[#33261F] group-hover:text-[#8B2E24] transition-colors mb-1.5">
                          {dest.title}
                        </h3>
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {dest.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#8B2E24] group-hover:translate-x-0.5 transition-transform">
                        <span>Visit page</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <AskHabAssistant />
    </div>
  );
}

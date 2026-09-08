'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardData {
  user: {
    name: string;
    email: string;
  };
  member: {
    id: string;
    name: string;
    regNumber: string;
    tier: string;
    status: string;
    dzongkhag: string;
    cidNumber: string;
    businessLicense?: string;
    duesExpiryDate: string;
    craft?: {
      name: string;
      english: string;
    };
  } | null;
}

export default function ArtisanDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [profileRes, prodRes, orderRes] = await Promise.all([
          fetch('/api/member/profile'),
          fetch('/api/member/products'),
          fetch('/api/member/orders'),
        ]);

        if (profileRes.ok) {
          const pData = await profileRes.json();
          setData(pData);
        }

        if (prodRes.ok) {
          const prData = await prodRes.json();
          setProducts(prData.products || []);
        }

        if (orderRes.ok) {
          const oData = await orderRes.json();
          setOrders(oData.consignments || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-[#8B2E24] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sm font-medium text-[#6B5A4C]">Loading Artisan Workspace...</div>
        </div>
      </div>
    );
  }

  const member = data?.member;
  const publishedProducts = products.filter((p) => p.status === 'PUBLISHED').length;
  const pendingProducts = products.filter((p) => p.status === 'PENDING_APPROVAL' || p.status === 'DRAFT').length;

  const totalEarnings = orders.reduce((sum, item) => {
    return sum + (item.product?.priceUSD || 0) * (item.quantity || 1);
  }, 0);

  const duesDate = member?.duesExpiryDate ? new Date(member.duesExpiryDate) : null;
  const isDuesValid = duesDate ? duesDate > new Date() : true;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#2E221B] to-[#4A392F] text-white p-6 sm:p-8 rounded-[14px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="font-mono text-xs text-[#C9A46A] uppercase tracking-wider mb-2">
            Kingdom of Bhutan · Artisan Guild
          </div>
          <h1 className="font-marcellus text-2xl sm:text-3xl text-white">
            Kuzuzangpola, {member?.name || data?.user?.name || 'Master Craftsperson'}
          </h1>
          <p className="text-sm text-[#D4C4B5] mt-1.5 max-w-[600px] leading-relaxed">
            Welcome to your official association portal. Here you can submit authentic Bhutanese crafts for certification, monitor store consignments, and manage your guild accreditation.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/portal/products"
            className="bg-[#8B2E24] hover:bg-[#A3382D] text-white px-5 py-2.5 rounded-[8px] text-xs font-semibold shadow-sm transition-colors"
          >
            + Submit New Craft
          </Link>
          <Link
            href="/portal/profile"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors"
          >
            Edit Workshop Profile
          </Link>
        </div>
      </div>

      {/* Dues Status Alert */}
      <div className={`p-5 rounded-[12px] border ${isDuesValid ? 'bg-[#F4F9F4] border-[#C2E2C2]' : 'bg-[#FFF6F5] border-[#F5C2BC]'} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-start gap-3.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-none ${isDuesValid ? 'bg-emerald-600 text-white' : 'bg-[#8B2E24] text-white'}`}>
            {isDuesValid ? '✓' : '!'}
          </div>
          <div>
            <div className="font-bold text-sm text-[#2E221B]">
              Membership Status:{' '}
              <span className={isDuesValid ? 'text-emerald-700' : 'text-[#8B2E24]'}>
                {member?.tier?.replace(/_/g, ' ') || 'ACTIVE SECTOR MEMBER'}
              </span>
            </div>
            <div className="text-xs text-[#6B5A4C] mt-0.5">
              {duesDate ? (
                <>Annual dues valid through <strong className="text-[#2E221B]">{duesDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></>
              ) : (
                'Annual dues in good standing with the Association Secretariat.'
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-[#524135] bg-white/70 p-3 rounded-[8px] border border-[#E5DDD0] md:max-w-[380px]">
          <span className="font-semibold text-[#2E221B]">Dues Renewal: </span>
          Bank of Bhutan Account: <strong className="font-mono text-[#8B2E24]">100889210</strong> (HAB Thimphu). Send deposit slip to <span className="font-mono text-[#2E221B]">finance@handicraftsbhutan.org</span>.
        </div>
      </div>

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-[12px] border border-[#E5DDD0] shadow-sm">
          <div className="text-xs font-medium text-[#6B5A4C]">Listed Products</div>
          <div className="font-figtree font-bold text-2xl sm:text-3xl text-[#2E221B] mt-1">
            {publishedProducts}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Live in catalog & e-shop</div>
        </div>

        <div className="bg-white p-5 rounded-[12px] border border-[#E5DDD0] shadow-sm">
          <div className="text-xs font-medium text-[#6B5A4C]">Pending Approval</div>
          <div className="font-figtree font-bold text-2xl sm:text-3xl text-[#8B2E24] mt-1">
            {pendingProducts}
          </div>
          <div className="text-[11px] text-[#6B5A4C] mt-1">Under curator review</div>
        </div>

        <div className="bg-white p-5 rounded-[12px] border border-[#E5DDD0] shadow-sm">
          <div className="text-xs font-medium text-[#6B5A4C]">Consignment Orders</div>
          <div className="font-figtree font-bold text-2xl sm:text-3xl text-[#2E221B] mt-1">
            {orders.length}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Domestic & International</div>
        </div>

        <div className="bg-white p-5 rounded-[12px] border border-[#E5DDD0] shadow-sm">
          <div className="text-xs font-medium text-[#6B5A4C]">Consignment Volume</div>
          <div className="font-figtree font-bold text-2xl sm:text-3xl text-[#2E221B] mt-1">
            ${totalEarnings.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#6B5A4C] mt-1 font-mono">
            ~Nu. {(totalEarnings * 84).toLocaleString()} BTN
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Accreditation ID Card & Recent Consignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accreditation ID Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[14px] border border-[#E5DDD0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
            <div className="font-marcellus text-base text-[#2E221B]">Artisan Credentials</div>
            <span className="font-mono text-[10px] text-[#8B2E24] bg-[#F7EFEA] px-2 py-0.5 rounded font-semibold">
              HAB-AUTH
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#8C7A6B] block">Registration Number</span>
              <span className="font-mono font-bold text-sm text-[#2E221B]">{member?.regNumber || 'HAB-PENDING'}</span>
            </div>

            <div>
              <span className="text-[#8C7A6B] block">Craft Tradition (Zorig Chusum)</span>
              <span className="font-medium text-[#2E221B]">{member?.craft?.name || 'Traditional Bhutanese Craft'}</span>
            </div>

            <div>
              <span className="text-[#8C7A6B] block">Home Dzongkhag</span>
              <span className="font-medium text-[#2E221B]">{member?.dzongkhag || 'Kingdom of Bhutan'}</span>
            </div>

            <div>
              <span className="text-[#8C7A6B] block">Citizenship ID (CID)</span>
              <span className="font-mono text-[#2E221B]">{member?.cidNumber || 'On file with HAB'}</span>
            </div>

            {member?.businessLicense && (
              <div>
                <span className="text-[#8C7A6B] block">Trade License</span>
                <span className="font-mono text-[#2E221B]">{member.businessLicense}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#F0EAE1]">
            <Link
              href="/portal/profile"
              className="text-xs text-[#8B2E24] font-semibold hover:underline block text-center"
            >
              Update Information & Workshop Story →
            </Link>
          </div>
        </div>

        {/* Recent Consignment Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[14px] border border-[#E5DDD0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
            <div>
              <div className="font-marcellus text-base text-[#2E221B]">Recent Consignments</div>
              <div className="text-xs text-[#6B5A4C]">Orders containing your accredited pieces</div>
            </div>
            <Link
              href="/portal/orders"
              className="text-xs font-semibold text-[#8B2E24] hover:underline"
            >
              View All Orders →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-10 text-center space-y-2 text-xs text-[#6B5A4C]">
              <div className="text-2xl">📦</div>
              <p>No consignment orders recorded yet.</p>
              <p>When buyers order your listed products from the e-shop or Punakha Market, they will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0EAE1]">
              {orders.slice(0, 4).map((item, idx) => (
                <div key={item.id || idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-mono font-bold text-[#2E221B]">
                      {item.order?.orderNumber || `HAB-ORD-${idx + 1}`}
                    </div>
                    <div className="text-[#6B5A4C] mt-0.5">
                      {item.product?.name || 'Handicraft Item'} · Qty: {item.quantity || 1}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-[#2E221B]">
                      ${((item.product?.priceUSD || 0) * (item.quantity || 1)).toFixed(2)}
                    </div>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {item.order?.orderStatus || 'PROCESSING'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

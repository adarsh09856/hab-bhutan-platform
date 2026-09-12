'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw,
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';
  const initialContact = searchParams.get('email') || searchParams.get('phone') || '';

  const [orderQuery, setOrderQuery] = useState(initialOrder);
  const [emailQuery, setEmailQuery] = useState(initialContact);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderData, setOrderData] = useState<any | null>(null);

  const performSearch = async (orderId: string, contact?: string) => {
    if (!orderId.trim()) {
      setErrorMsg('Please enter a valid HAB order number (e.g. HAB-S-12345).');
      return;
    }

    if (!contact?.trim()) {
      setErrorMsg('To protect customer privacy, please enter the email address or phone number used at checkout.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const isEmail = contact.includes('@');
      const paramKey = isEmail ? 'email' : 'phone';
      const url = `/api/orders/track?order=${encodeURIComponent(orderId.trim())}&${paramKey}=${encodeURIComponent(contact.trim())}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No matching order found.');
      }

      setOrderData(data.order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error looking up order status.');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder && initialContact) {
      performSearch(initialOrder, initialContact);
    }
  }, [initialOrder, initialContact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(orderQuery, emailQuery);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'DISPATCHED':
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PROCESSING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <main className="w-full max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-16 sm:pb-24 font-figtree">
      {/* Breadcrumbs */}
      <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-6">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        <Link href="/shop" className="hover:underline">Shop</Link> /{' '}
        <span className="text-[#33261F]">Live Order Tracking</span>
      </div>

      {/* Header */}
      <div className="max-w-2xl mb-8">
        <span className="text-xs font-mono tracking-widest uppercase text-[#8B2E24] font-semibold">
          Authenticity &amp; Dispatch Tracking
        </span>
        <h1 className="font-marcellus text-2xl sm:text-3xl lg:text-[38px] text-[#33261F] leading-tight mt-1 mb-3">
          Track Your Bhutanese Craft Parcel
        </h1>
        <p className="text-slate-600 text-sm sm:text-[15px] font-lora leading-relaxed">
          Every parcel dispatched by the Handicrafts Association of Bhutan includes an official seal of origin certified under the 13 Traditional Arts &amp; Crafts (Zorig Chusum). Check real-time inspection, packing, and courier transit below.
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-2xl p-6 shadow-sm mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="Enter HAB Order # (e.g. HAB-S-10492 or HAB-POS-59321)"
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#CDBEA8] rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B2E24] focus:border-transparent transition-all"
            />
            <Package className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              value={emailQuery}
              onChange={(e) => setEmailQuery(e.target.value)}
              placeholder="Email address or phone number (Required)"
              className="w-full px-4 py-3 bg-white border border-[#CDBEA8] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B2E24] focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#8B2E24] hover:bg-[#72241C] disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 flex-none"
          >
            {loading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Tracking...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Track Order</span>
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-none" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Tracking Results */}
      {orderData && (
        <div className="space-y-6 animate-fadeIn">
          {/* Status Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-lg text-slate-900">
                  {orderData.orderNumber}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(
                    orderData.orderStatus
                  )}`}
                >
                  {orderData.orderStatus.replace('_', ' ')}
                </span>
                {orderData.isPosSale && (
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                    Showroom POS Sale
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Placed {new Date(orderData.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Destination: {orderData.shippingDestination?.city}, {orderData.shippingDestination?.country}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500">Total Order Value</div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {orderData.currencyUsed === 'BTN'
                  ? `Nu. ${(orderData.totalPaidCurrency || 0).toLocaleString()}`
                  : `$${(orderData.totalUSD || 0).toFixed(2)}`}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                Payment {orderData.paymentStatus} ({orderData.paymentMethod})
              </div>
            </div>
          </div>

          {/* Progression Milestone Stepper */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">
              Fulfillment Journey &amp; Milestones
            </h3>

            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                {orderData.milestones.map((ms: any, index: number) => {
                  return (
                    <div
                      key={ms.step}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                        ms.completed
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                          : ms.active
                          ? 'bg-amber-50/50 border-amber-300 text-slate-900 ring-2 ring-amber-300/50'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                            Step 0{ms.step}
                          </span>
                          {ms.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : ms.active ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                          )}
                        </div>
                        <h4 className="font-bold text-xs leading-snug mb-1 text-slate-900">
                          {ms.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-lora">
                          {ms.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Itemized Order Line Items */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Certified Craft Line Items ({orderData.items?.length || 0})
            </h3>

            <div className="divide-y divide-slate-100">
              {orderData.items.map((item: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-none border border-slate-200 font-mono text-[10px] text-slate-500">
                      {item.code || 'CRAFT'}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900">
                        {item.name || 'Bhutanese Handicraft'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        SKU: {item.code} · Qty: {item.quantity}
                      </div>
                    </div>
                  </div>

                  <div className="font-mono font-bold text-xs text-slate-900 text-right">
                    ${(Number(item.priceUSD || 0) * Number(item.quantity || 1)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Authenticity Guarantee Card */}
            <div className="mt-6 p-4 rounded-xl bg-[#FBF9F5] border border-[#E8E1D4] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#8B2E24] flex-none mt-0.5" />
              <div className="text-xs text-[#59483B] leading-relaxed">
                <strong className="text-[#33261F] font-semibold block mb-0.5">
                  Official Seal of Origin &amp; CSO Authentication
                </strong>
                This consignment has been verified by the Secretariat of the Handicrafts Association of Bhutan (Registration CSO/2011/043). 100% of purchase proceeds directly support indigenous craft communities and rural master artisans across Bhutan&apos;s 20 Dzongkhags.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Info Footer */}
      <div className="mt-12 p-6 rounded-2xl bg-[#EDE5D6]/40 border border-[#E4DDD1] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-marcellus text-lg text-[#33261F]">Need Help With Your Dispatch?</h4>
          <p className="text-xs font-lora text-[#6B5A4C] mt-0.5">
            Our Thimphu Secretariat desk is available Monday through Friday (09:00 - 17:00 BST).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/about#support"
            className="px-4 py-2 border border-[#33261F] rounded-lg text-xs font-semibold text-[#33261F] hover:bg-[#33261F] hover:text-[#F4F0E7] transition-colors"
          >
            Customs &amp; Returns Guide
          </Link>
          <a
            href="mailto:officehab@gmail.com"
            className="px-4 py-2 bg-[#8B2E24] rounded-lg text-xs font-semibold text-white hover:bg-[#72241C] transition-colors"
          >
            Contact Secretariat Desk
          </a>
        </div>
      </div>
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-10 pt-20 pb-24 text-center font-figtree">
          <div className="w-8 h-8 border-2 border-[#8B2E24] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-600">Loading order tracking interface...</p>
        </main>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}

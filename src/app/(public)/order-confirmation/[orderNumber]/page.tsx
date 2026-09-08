'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Truck, 
  Printer, 
  Package, 
  ArrowRight, 
  Building2, 
  QrCode, 
  ShieldCheck,
  Mail,
  Phone
} from 'lucide-react';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) return;

    fetch(`/api/orders/track?order=${encodeURIComponent(orderNumber)}`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.success && data.order) {
          setOrder(data.order);
        }
      })
      .catch((err) => console.error('Failed to load order:', err))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  return (
    <main className="min-h-[85vh] bg-[#FBF9F5] py-10 px-4 sm:px-6 lg:px-10 font-figtree">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Success Banner */}
        <div className="bg-white rounded-2xl border border-[#E4DDD1] p-8 text-center shadow-xs space-y-4 print:shadow-none print:border-none">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#8B2E24] font-bold">
              Order Confirmed &amp; Certified
            </span>
            <h1 className="font-marcellus text-2xl sm:text-3xl text-[#33261F] mt-1">
              Thank You for Your Order
            </h1>
            <p className="text-xs sm:text-sm text-[#6B5A4C] mt-1 max-w-md mx-auto">
              Your patronage directly sustains rural artisan households and cultural heritage across Bhutan.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F8F5EF] border border-[#E4DDD1] font-mono text-sm font-bold text-[#33261F]">
            <span>Order Number:</span>
            <span className="text-[#8B2E24]">{orderNumber}</span>
          </div>

          {/* Quick Actions (Print, Track, Shop) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 print:hidden">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl border border-[#E4DDD1] hover:bg-[#EDE5D6]/50 text-xs font-semibold text-[#33261F] flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Receipt</span>
            </button>

            <Link
              href={`/track-order?order=${encodeURIComponent(orderNumber)}`}
              className="px-4 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#72251D] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Truck className="w-4 h-4" />
              <span>Track Shipment</span>
            </Link>

            <Link
              href="/shop"
              className="px-4 py-2 rounded-xl bg-[#EDE5D6]/60 hover:bg-[#EDE5D6] text-xs font-semibold text-[#33261F] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Official Receipt Card */}
        <div className="bg-white rounded-2xl border border-[#E4DDD1] p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Organization Seal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#E4DDD1] gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-bold text-sm">
                HAB
              </div>
              <div>
                <div className="font-bold text-sm text-[#33261F]">Handicrafts Association of Bhutan</div>
                <div className="text-[10px] text-[#6B5A4C] font-mono">Reg. CSO/2011/043 · Thimphu, Bhutan</div>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <div className="font-mono text-[#6B5A4C]">
                Date: {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
              </div>
              <div className="font-semibold text-emerald-700 flex items-center sm:justify-end gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CSO Authenticity Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#33261F]">
            <div>
              <h3 className="font-semibold uppercase tracking-wider text-[#6B5A4C] text-[10.5px] mb-1.5">
                Delivery Address
              </h3>
              <div className="space-y-0.5 font-medium">
                <div>{order?.customerName || 'Valued Collector'}</div>
                <div className="text-[#6B5A4C]">{order?.shippingAddress?.street || 'Central Delivery Route'}</div>
                <div className="text-[#6B5A4C]">
                  {order?.shippingAddress?.city || 'Thimphu'}, {order?.shippingAddress?.country || 'Bhutan'}
                </div>
                {order?.customerEmail && (
                  <div className="text-[#6B5A4C] pt-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{order.customerEmail}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold uppercase tracking-wider text-[#6B5A4C] text-[10.5px] mb-1.5">
                Logistics &amp; Payment
              </h3>
              <div className="space-y-1">
                <div>
                  <span className="text-[#6B5A4C]">Carrier: </span>
                  <span className="font-semibold">{order?.shippingMethod || 'Bhutan Post EMS'}</span>
                </div>
                <div>
                  <span className="text-[#6B5A4C]">Payment Mode: </span>
                  <span className="font-semibold capitalize">{order?.paymentMethod || 'Credit Card'}</span>
                </div>
                <div>
                  <span className="text-[#6B5A4C]">Fulfillment Status: </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                    {order?.orderStatus || 'PENDING_PAYMENT'}
                  </span>
                </div>
                {order?.trackingNumber && (
                  <div>
                    <span className="text-[#6B5A4C]">Tracking #: </span>
                    <span className="font-mono font-bold text-sky-700">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="pt-2">
            <h3 className="font-semibold uppercase tracking-wider text-[#6B5A4C] text-[10.5px] mb-3">
              Package Manifest
            </h3>
            <div className="divide-y divide-[#E4DDD1] border-y border-[#E4DDD1]">
              {order?.items && Array.isArray(order.items) ? (
                order.items.map((item: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-[#8B2E24]">{item.quantity}×</span>
                      <div>
                        <span className="font-medium text-[#33261F]">{item.name}</span>
                        <span className="text-[#A39281] ml-2 font-mono text-[10px]">({item.code})</span>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-[#33261F]">
                      ${(item.priceUSD * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-3 text-xs text-[#6B5A4C]">
                  Authentic artisan handcrafted item(s) included.
                </div>
              )}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="pt-2 space-y-2 text-xs">
            <div className="flex justify-between text-[#6B5A4C]">
              <span>Shipping Fee ({order?.shippingMethod || 'EMS'})</span>
              <span className="font-mono font-semibold text-[#33261F]">
                {order?.shippingFeeUSD ? `$${order.shippingFeeUSD.toFixed(2)}` : 'FREE'}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-[#E4DDD1]">
              <span className="font-bold text-sm text-[#33261F]">Total Amount</span>
              <div className="text-right">
                <span className="font-mono font-extrabold text-base text-[#8B2E24]">
                  {order?.totalUSD ? `$${order.totalUSD.toFixed(2)} USD` : 'Calculating...'}
                </span>
                {order?.totalPaidCurrency && (
                  <div className="font-mono text-[11px] text-[#6B5A4C]">
                    Nu. {order.totalPaidCurrency.toLocaleString()} BTN
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statutory Export Notice */}
          <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E4DDD1] text-[11px] text-[#6B5A4C] leading-relaxed">
            <strong>Customs &amp; Export Verification:</strong> Certified under Article 3 of the Articles of Association (2026 Edition) and Civil Society Organizations Act 2007. Parcel contains authentic contemporary handicraft work not subject to antique export restrictions.
          </div>
        </div>
      </div>
    </main>
  );
}

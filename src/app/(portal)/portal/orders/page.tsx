'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';

export default function MyOrdersPage() {
  const [consignments, setConsignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/member/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data?.consignments) {
          setConsignments(data.consignments);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalValueUSD = consignments.reduce(
    (sum, item) => sum + (item.product?.priceUSD || item.priceUSD || 0) * (item.quantity || 1),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-xs text-[#8B2E24] uppercase tracking-wider mb-1">
          Store &amp; Export Consignments
        </div>
        <h1 className="font-marcellus text-2xl sm:text-3xl text-[#2E221B]">
          Orders &amp; Consignments
        </h1>
        <p className="text-xs sm:text-sm text-[#6B5A4C] mt-1">
          Track customer purchases of your accredited craft items fulfilled through HAB central retail and Bhutan Post EMS.
        </p>
      </div>

      {/* Payout Policy Callout */}
      <div className="bg-[#F5F0E6] border border-[#E5DDD0] rounded-[12px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-bold text-sm text-[#2E221B]">
            Consignment Payout Schedule
          </div>
          <p className="text-xs text-[#6B5A4C] mt-0.5">
            Consignment earnings are remitted to member bank accounts on the 1st of every month via Bank of Bhutan / mBoB.
          </p>
        </div>

        <div className="text-left sm:text-right flex-none">
          <span className="text-xs text-[#8C7A6B] block">Total Order Volume</span>
          <span className="font-bold text-xl text-[#2E221B]">${totalValueUSD.toFixed(2)}</span>
          <span className="font-mono text-xs text-[#8B2E24] block">
            ~Nu. {(totalValueUSD * 84).toLocaleString()} BTN
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center space-y-2 text-sm text-[#6B5A4C]">
            <div className="inline-block w-6 h-6 border-2 border-[#8B2E24] border-t-transparent rounded-full animate-spin"></div>
            <div>Loading consignment orders...</div>
          </div>
        </div>
      ) : consignments.length === 0 ? (
        <div className="bg-white border border-[#E5DDD0] rounded-[14px] p-10 text-center space-y-3">
          <div className="text-3xl">📦</div>
          <div className="font-bold text-[#2E221B] text-base">No orders recorded yet</div>
          <p className="text-xs text-[#6B5A4C] max-w-[420px] mx-auto">
            Once international or domestic customers purchase items from your workshop on the e-shop, their tracking and fulfillment records will be displayed here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5DDD0] rounded-[14px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F9F6F0] border-b border-[#E5DDD0] text-[#8C7A6B] font-mono text-[10.5px] uppercase">
                  <th className="p-4">Order Ref</th>
                  <th className="p-4">Order Date</th>
                  <th className="p-4">Craft Piece</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4">Value (USD)</th>
                  <th className="p-4">EMS Tracking</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE1]">
                {consignments.map((item, idx) => {
                  const orderDate = item.order?.createdAt ? new Date(item.order.createdAt) : null;
                  const itemPrice = item.product?.priceUSD || item.priceUSD || 0;

                  return (
                    <tr key={item.id || idx} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="p-4 font-mono font-bold text-[#2E221B]">
                        {item.order?.orderNumber || `HAB-ORD-${idx + 1}`}
                      </td>
                      <td className="p-4 text-[#6B5A4C]">
                        {orderDate ? orderDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                      </td>
                      <td className="p-4 font-medium text-[#2E221B]">
                        {item.product?.name || item.name || 'Artisan Craft'}
                      </td>
                      <td className="p-4 font-mono text-[#2E221B]">
                        {item.quantity || 1}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[#2E221B]">
                          ${(itemPrice * (item.quantity || 1)).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-[#8C7A6B] font-mono">
                          Nu. {(itemPrice * (item.quantity || 1) * 84).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4 font-mono">
                        {item.order?.trackingNumber ? (
                          <span className="text-[#8B2E24] font-semibold bg-[#FAF2EF] px-2 py-0.5 rounded">
                            {item.order.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-[#8C7A6B]">Processing dispatch</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-[10px] font-semibold uppercase ${
                            item.order?.orderStatus === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.order?.orderStatus === 'SHIPPED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.order?.orderStatus || 'PROCESSING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

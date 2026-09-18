'use client';

import React, { useRef, useState } from 'react';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  Download, 
  FileText, 
  Building2, 
  CheckCircle2, 
  Calendar, 
  Truck, 
  Mail, 
  Phone, 
  Globe 
} from 'lucide-react';

export interface OrderInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    orderNumber: string;
    createdAt?: string | Date;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerType?: string;
    shippingAddress?: any;
    shippingMethod?: string;
    shippingFeeUSD?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    orderStatus?: string;
    trackingNumber?: string;
    notes?: string;
    totalUSD: number;
    totalPaidCurrency?: number;
    currencyUsed?: string;
    items?: Array<{
      id?: string;
      code: string;
      name: string;
      priceUSD: number;
      priceBTN?: number;
      quantity: number;
      makerName?: string;
      craftName?: string;
    }>;
  } | null;
  siteSettings?: {
    csoNumber?: string;
    contactEmail?: string;
    contactPhone?: string;
    headOfficeAddress?: string;
    officialWebsite?: string;
    presidentSignatory?: string;
  };
}

export default function OrderInvoiceModal({
  isOpen,
  onClose,
  order,
  siteSettings,
}: OrderInvoiceModalProps) {
  const [format, setFormat] = useState<'A4_TAX_INVOICE' | 'POS_80MM'>('A4_TAX_INVOICE');
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  // Formatting helpers
  const fxRate = 84.0;
  const csoReg = siteSettings?.csoNumber || 'CSO/2011/043';
  const orgEmail = siteSettings?.contactEmail || 'officehab@gmail.com';
  const orgPhone = siteSettings?.contactPhone || '+975-2-338089';
  const orgAddress = siteSettings?.headOfficeAddress || 'P.O. Box 1129, Metog Lam, Kawajangsa, Thimphu, Kingdom of Bhutan';

  // Parse shipping address
  let addressText = 'Walk-in / Showroom Counter Collection';
  let addrCity = 'Thimphu';
  let addrCountry = 'Kingdom of Bhutan';

  if (order.shippingAddress) {
    if (typeof order.shippingAddress === 'string') {
      try {
        const parsed = JSON.parse(order.shippingAddress);
        addressText = [parsed.street, parsed.city, parsed.dzongkhag, parsed.country, parsed.postalCode].filter(Boolean).join(', ');
        addrCity = parsed.city || addrCity;
        addrCountry = parsed.country || addrCountry;
      } catch {
        addressText = order.shippingAddress;
      }
    } else if (typeof order.shippingAddress === 'object') {
      const p = order.shippingAddress;
      addressText = [p.street, p.city, p.dzongkhag, p.country, p.postalCode].filter(Boolean).join(', ');
      addrCity = p.city || addrCity;
      addrCountry = p.country || addrCountry;
    }
  }

  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) : new Date().toLocaleDateString('en-GB');

  const totalUSD = Number(order.totalUSD) || 0;
  const totalBTN = order.totalPaidCurrency ?? Math.round(totalUSD * fxRate);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Container Dialog */}
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col border border-stone-200 print:max-w-none print:max-h-none print:border-none print:shadow-none print:m-0">
        
        {/* Controls Bar (Hidden during printing) */}
        <div className="p-4 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <span className="font-bold text-sm">Official Tax Invoice &amp; Receipt</span>
              <span className="font-mono text-xs text-stone-400 ml-2">#{order.orderNumber}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Switcher */}
            <div className="bg-stone-800 p-1 rounded-lg flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setFormat('A4_TAX_INVOICE')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  format === 'A4_TAX_INVOICE'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                A4 Official Invoice
              </button>
              <button
                type="button"
                onClick={() => setFormat('POS_80MM')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  format === 'POS_80MM'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                80mm POS Thermal Slip
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F4EFE6] print:p-0 print:bg-white print:overflow-visible">
          
          {/* ======================================================== */}
          {/* FORMAT 1: A4 OFFICIAL TAX INVOICE & CUSTOMS DECLARATION */}
          {/* ======================================================== */}
          {format === 'A4_TAX_INVOICE' && (
            <div
              ref={printAreaRef}
              className="max-w-[760px] mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-stone-200 text-stone-900 font-serif leading-normal print:shadow-none print:border-none print:p-0 print:max-w-none"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {/* Header Letterhead */}
              <div className="border-b-2 border-stone-900 pb-5 mb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-bold text-2xl tracking-widest shadow-md shrink-0 print:border print:border-stone-900">
                      HAB
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight uppercase text-stone-900">
                        HANDICRAFTS ASSOCIATION OF BHUTAN
                      </h1>
                      <div className="text-[11px] font-sans text-stone-600 font-semibold uppercase tracking-wider">
                        Apex Civil Society Organization · Registration: {csoReg}
                      </div>
                      <div className="text-[10.5px] font-sans text-stone-500 mt-0.5">
                        {orgAddress}
                      </div>
                      <div className="text-[10px] font-mono text-stone-500">
                        Tel: {orgPhone} · Email: {orgEmail} · Web: www.hab.org.bt
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="inline-block px-3 py-1 bg-stone-100 border border-stone-300 text-stone-900 font-sans font-extrabold text-xs uppercase tracking-widest rounded">
                      TAX INVOICE &amp; CERTIFICATE
                    </span>
                    <div className="font-mono text-xs font-bold text-[#8B2E24] mt-2">
                      INV-{order.orderNumber}
                    </div>
                    <div className="text-[11px] font-sans text-stone-600">
                      Issued: {orderDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Billed To / Shipped To Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans pb-6 border-b border-stone-200">
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-stone-500 text-[10px] mb-1">
                    Billed &amp; Consigned To:
                  </h3>
                  <div className="font-bold text-sm text-stone-900">
                    {order.customerName || 'Valued Collector'}
                  </div>
                  <div className="text-stone-600 mt-1 whitespace-pre-line leading-relaxed">
                    {addressText}
                  </div>
                  {order.customerEmail && (
                    <div className="text-stone-500 font-mono text-[11px] mt-1">
                      Email: {order.customerEmail}
                    </div>
                  )}
                  {order.customerPhone && (
                    <div className="text-stone-500 font-mono text-[11px]">
                      Phone: {order.customerPhone}
                    </div>
                  )}
                </div>

                <div className="space-y-1 sm:text-right">
                  <h3 className="font-bold uppercase tracking-wider text-stone-500 text-[10px] mb-1 sm:text-right">
                    Dispatch &amp; Payment Ledger:
                  </h3>
                  <div>
                    <span className="text-stone-500">Carrier / Routing: </span>
                    <span className="font-semibold text-stone-800">{order.shippingMethod || 'Bhutan Post EMS (Airmail)'}</span>
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <span className="text-stone-500">Consignment Waybill: </span>
                      <span className="font-mono font-bold text-stone-900">{order.trackingNumber}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-stone-500">Payment Gateway / Mode: </span>
                    <span className="font-semibold text-stone-800 uppercase">{order.paymentMethod || 'Credit Card'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Fiscal Status: </span>
                    <span className="inline-block font-mono font-bold px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {order.paymentStatus === 'PAID' ? 'PAID & SETTLED' : order.paymentStatus || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Itemized Line Items Table */}
              <div className="py-6">
                <table className="w-full text-left text-xs font-sans border-collapse">
                  <thead>
                    <tr className="border-b-2 border-stone-800 text-[11px] uppercase tracking-wider font-bold text-stone-700">
                      <th className="py-2.5 px-2">#</th>
                      <th className="py-2.5 px-2">Item Description &amp; SKU</th>
                      <th className="py-2.5 px-2">Zorig Tradition</th>
                      <th className="py-2.5 px-2 text-right">Qty</th>
                      <th className="py-2.5 px-2 text-right">Unit Price (USD)</th>
                      <th className="py-2.5 px-2 text-right">Total (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => {
                        const rowTotal = item.priceUSD * item.quantity;
                        return (
                          <tr key={idx} className="hover:bg-stone-50/50">
                            <td className="py-3 px-2 font-mono text-stone-500">{idx + 1}</td>
                            <td className="py-3 px-2">
                              <div className="font-bold text-stone-900">{item.name}</div>
                              <div className="font-mono text-[10.5px] text-stone-500">SKU: {item.code}</div>
                              {item.makerName && (
                                <div className="text-[10px] text-stone-600 italic">Maker: {item.makerName}</div>
                              )}
                            </td>
                            <td className="py-3 px-2 text-stone-600 font-serif">
                              {item.craftName || 'Authentic Bhutanese Craft'}
                            </td>
                            <td className="py-3 px-2 text-right font-mono font-bold">{item.quantity}</td>
                            <td className="py-3 px-2 text-right font-mono">${item.priceUSD.toFixed(2)}</td>
                            <td className="py-3 px-2 text-right font-mono font-bold text-stone-900">
                              ${rowTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-stone-500 italic">
                          Authentic Himalayan artisan handicraft collection item(s).
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="border-t-2 border-stone-800 pt-4 flex justify-end font-sans text-xs">
                <div className="w-full sm:w-72 space-y-1.5">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold">${totalUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Shipping &amp; Insurance:</span>
                    <span className="font-mono font-semibold">
                      {order.shippingFeeUSD ? `$${order.shippingFeeUSD.toFixed(2)}` : 'INCLUDED / FREE'}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>CSO Sales Tax (Non-profit Exempt):</span>
                    <span className="font-mono font-semibold">$0.00</span>
                  </div>
                  <div className="border-t border-stone-300 pt-2 flex justify-between items-baseline">
                    <span className="font-bold text-stone-900 text-sm">TOTAL AMOUNT:</span>
                    <div className="text-right">
                      <div className="font-mono font-extrabold text-lg text-[#8B2E24]">
                        ${totalUSD.toFixed(2)} USD
                      </div>
                      <div className="font-mono text-xs font-semibold text-stone-600">
                        Nu. {totalBTN.toLocaleString()} BTN
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authenticity Certificate & Customs Declaration */}
              <div className="mt-8 pt-6 border-t border-dashed border-stone-300 text-[11px] font-sans space-y-3">
                <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="flex items-center gap-2 font-bold text-stone-900 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Kingdom of Bhutan · CSO Export &amp; Authenticity Declaration</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    This certifies that the articles itemized above have been handcrafted in the Kingdom of Bhutan by certified master artisans in accordance with the 13 Traditional Arts &amp; Crafts (Zorig Chusum). Handicrafts Association of Bhutan is an apex non-profit registered under the Civil Society Organizations Act of Bhutan 2007 (Reg. CSO/2011/043). These items are contemporary cultural handicrafts and do not fall under the Department of Culture antique restriction embargo.
                  </p>
                </div>

                {/* Signature and Seal Row */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-stone-800 text-center sm:text-left">
                  <div className="space-y-1">
                    <div className="w-40 border-b border-stone-400 pb-8 text-center">
                      <span className="font-serif italic text-stone-400 text-xs">Authentic Seal</span>
                    </div>
                    <div className="font-bold text-[11px] uppercase">HAB Secretariat Seal</div>
                    <div className="text-[10px] text-stone-500">Norzin Lam, Thimphu</div>
                  </div>

                  <div className="space-y-1 sm:text-right">
                    <div className="w-48 border-b border-stone-400 pb-8 text-center sm:text-right sm:ml-auto">
                      <span className="font-serif italic text-stone-700 text-xs font-semibold">Sonam Dorji / Secretariat</span>
                    </div>
                    <div className="font-bold text-[11px] uppercase">Authorized Signatory</div>
                    <div className="text-[10px] text-stone-500">Handicrafts Association of Bhutan</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* FORMAT 2: 80MM POS THERMAL TAPE SLIP                      */}
          {/* ======================================================== */}
          {format === 'POS_80MM' && (
            <div
              ref={printAreaRef}
              className="max-w-[320px] mx-auto bg-white p-5 rounded-lg shadow-lg border border-stone-300 font-mono text-[11.5px] leading-tight text-stone-950 space-y-3 print:shadow-none print:border-none print:p-0 print:max-w-none print:w-[76mm]"
            >
              {/* Thermal Header */}
              <div className="text-center space-y-1 border-b border-dashed border-stone-400 pb-3">
                <div className="font-extrabold text-sm uppercase tracking-wider">
                  HANDICRAFTS ASSOCIATION OF BHUTAN
                </div>
                <div className="text-[10px] text-stone-600">CSO Reg: {csoReg}</div>
                <div className="text-[10px] text-stone-600">Central Showroom, Thimphu</div>
                <div className="text-[10px] text-stone-600">Tel: {orgPhone}</div>
              </div>

              {/* Transaction Metadata */}
              <div className="space-y-0.5 border-b border-dashed border-stone-400 pb-2 text-[11px]">
                <div className="flex justify-between">
                  <span>RECEIPT NO:</span>
                  <span className="font-bold">#{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{orderDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span className="truncate max-w-[150px]">{order.customerName || 'Walk-in'}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAY METHOD:</span>
                  <span className="font-bold uppercase">{order.paymentMethod || 'Cash'}</span>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-1.5 border-b border-dashed border-stone-400 pb-3">
                <div className="flex justify-between font-bold text-[10px] uppercase border-b border-stone-200 pb-1">
                  <span>ITEM / QTY</span>
                  <span>TOTAL (BTN)</span>
                </div>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => {
                    const priceBtn = item.priceBTN ?? Math.round(item.priceUSD * fxRate);
                    return (
                      <div key={idx} className="flex justify-between items-start text-[11px]">
                        <div className="pr-2">
                          <div className="font-bold">{item.name}</div>
                          <div className="text-[10px] text-stone-600">
                            {item.quantity} × Nu. {priceBtn.toLocaleString()}
                          </div>
                        </div>
                        <span className="font-bold whitespace-nowrap">
                          Nu. {(priceBtn * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-2 italic text-stone-500">Handicraft items</div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-1 border-b border-dashed border-stone-400 pb-2.5">
                <div className="flex justify-between font-bold text-xs pt-1">
                  <span>TOTAL AMOUNT:</span>
                  <span>Nu. {totalBTN.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10.5px] text-stone-600">
                  <span>USD EQUIVALENT:</span>
                  <span>${totalUSD.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>CSO TAX (EXEMPT):</span>
                  <span>Nu. 0</span>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center text-[10px] text-stone-600 space-y-1 pt-1">
                <div className="font-bold text-stone-900">KADRINCHHE LA / TASHI DELEK!</div>
                <div>100% of proceeds support rural Bhutanese artisan households.</div>
                <div>Goods once sold can be exchanged within 7 days with this slip.</div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

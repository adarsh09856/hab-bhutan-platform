'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Mail, 
  Copy, 
  Printer, 
  Eye, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Building2, 
  ShieldCheck,
  Search,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';
import OrderInvoiceModal from '@/components/public/OrderInvoiceModal';

function parseShippingAddress(addr: any) {
  if (!addr) {
    return { fullName: '', street: '', city: '', dzongkhag: '', country: '', postalCode: '', phone: '', email: '', formatted: 'Counter / Walk-in Pickup', isEmpty: true };
  }
  let obj = addr;
  if (typeof addr === 'string') {
    try {
      obj = JSON.parse(addr);
    } catch {
      return { fullName: '', street: addr, city: '', dzongkhag: '', country: '', postalCode: '', phone: '', email: '', formatted: addr, isEmpty: false };
    }
  }
  if (!obj || typeof obj !== 'object') {
    return { fullName: '', street: '', city: '', dzongkhag: '', country: '', postalCode: '', phone: '', email: '', formatted: 'Counter / Walk-in Pickup', isEmpty: true };
  }

  const fullName = obj.fullName || obj.name || '';
  const street = obj.street || obj.addressLine1 || obj.address || '';
  const city = obj.city || obj.town || '';
  const dzongkhag = obj.dzongkhag || obj.state || obj.province || '';
  const country = obj.country || 'Bhutan';
  const postalCode = obj.postalCode || obj.zip || '';
  const phone = obj.phone || '';
  const email = obj.email || '';

  const parts = [street, city, dzongkhag, country, postalCode].filter(Boolean);
  const formatted = parts.length > 0 ? parts.join(', ') : 'Counter / Walk-in Pickup';
  const isEmpty = parts.length === 0;

  return { fullName, street, city, dzongkhag, country, postalCode, phone, email, formatted, isEmpty };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [inspectingOrder, setInspectingOrder] = useState<any | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);
  const [fulfillingOrder, setFulfillingOrder] = useState<any | null>(null);
  const [showDeleteAttemptModal, setShowDeleteAttemptModal] = useState<any | null>(null);

  // Forms & Feedbacks
  const [trackingInput, setTrackingInput] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<{ [key: string]: boolean }>({});

  // Manual order form state
  const [orderForm, setOrderForm] = useState({
    customerType: 'GUEST',
    customerMemberId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: {
      street: '',
      city: 'Thimphu',
      dzongkhag: 'Thimphu',
      country: 'Bhutan',
      postalCode: '',
    },
    shippingMethod: 'EMS',
    paymentMethod: 'CARD',
    paymentStatus: 'PAID',
    orderStatus: 'PROCESSING',
    currencyUsed: 'USD',
    internalNotes: '',
    selectedItems: [] as Array<{ code: string; name: string; priceUSD: number; quantity: number }>,
  });

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    try {
      const [ordRes, prodRes, memRes] = await Promise.all([
        fetch('/api/admin/orders', { credentials: 'include', signal: controller.signal, cache: 'no-store' }),
        fetch('/api/admin/products', { credentials: 'include', signal: controller.signal, cache: 'no-store' }).catch(() => null),
        fetch('/api/admin/members', { credentials: 'include', signal: controller.signal, cache: 'no-store' }).catch(() => null),
      ]);

      if (ordRes.ok) {
        try {
          const ordData = await ordRes.json();
          setOrders(Array.isArray(ordData.orders) ? ordData.orders : []);
        } catch {
          setOrders([]);
          setErrorMsg('Received malformed response from orders API.');
        }
      } else {
        let errText = `Orders service responded with status ${ordRes.status}.`;
        try {
          const err = await ordRes.json();
          if (err?.error) errText = err.error;
        } catch {}
        setErrorMsg(errText);
      }

      if (prodRes && prodRes.ok) {
        try {
          const prodData = await prodRes.json();
          setProducts(Array.isArray(prodData.products) ? prodData.products : []);
        } catch {}
      }

      if (memRes && memRes.ok) {
        try {
          const memData = await memRes.json();
          setMembers(Array.isArray(memData.members) ? memData.members : []);
        } catch {}
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setErrorMsg('Orders request timed out. Please refresh or verify server status.');
      } else {
        setErrorMsg(err.message || 'Network error fetching data.');
      }
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyAddress = (orderId: string, addressText: string) => {
    navigator.clipboard.writeText(addressText);
    setCopyFeedback((prev) => ({ ...prev, [orderId]: true }));
    setTimeout(() => {
      setCopyFeedback((prev) => ({ ...prev, [orderId]: false }));
    }, 2500);
  };

  const handleMarkAsPaid = async (orderId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          paymentStatus: 'PAID',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('✓ Payment status verified and marked as PAID.');
        if (inspectingOrder && inspectingOrder.id === orderId) {
          setInspectingOrder((prev: any) => ({ ...prev, paymentStatus: 'PAID' }));
        }
        await loadData();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to update payment status.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTracking = async (orderId: string, trackingNum: string, markShipped = false) => {
    setSubmitting(true);
    try {
      const payload: any = { id: orderId, trackingNumber: trackingNum };
      if (markShipped) payload.orderStatus = 'SHIPPED';

      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`✓ Order tracking saved (${trackingNum || 'Cleared'})${markShipped ? ' and status changed to SHIPPED' : ''}.`);
        if (inspectingOrder && inspectingOrder.id === orderId) {
          setInspectingOrder((prev: any) => ({ 
            ...prev, 
            trackingNumber: trackingNum,
            ...(markShipped ? { orderStatus: 'SHIPPED' } : {}) 
          }));
        }
        await loadData();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to update tracking.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating tracking.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddItemToOrder = (productCode: string) => {
    const prod = products.find((p) => p.code === productCode);
    if (!prod) return;

    setOrderForm((prev) => {
      const existing = prev.selectedItems.find((i) => i.code === productCode);
      if (existing) {
        return {
          ...prev,
          selectedItems: prev.selectedItems.map((i) =>
            i.code === productCode ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        ...prev,
        selectedItems: [
          ...prev.selectedItems,
          { code: prod.code, name: prod.name, priceUSD: prod.priceUSD, quantity: 1 },
        ],
      };
    });
  };

  const handleRemoveItemFromOrder = (code: string) => {
    setOrderForm((prev) => ({
      ...prev,
      selectedItems: prev.selectedItems.filter((i) => i.code !== code),
    }));
  };

  const handleItemQtyChange = (code: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItemFromOrder(code);
      return;
    }
    setOrderForm((prev) => ({
      ...prev,
      selectedItems: prev.selectedItems.map((i) =>
        i.code === code ? { ...i, quantity: qty } : i
      ),
    }));
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderForm.selectedItems.length === 0) {
      setErrorMsg('Please add at least one craft item to the order.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderForm,
          items: orderForm.selectedItems,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`✓ Manual Order ${data.order.orderNumber} successfully registered and inventory decremented.`);
        setShowCreateModal(false);
        setOrderForm({
          customerType: 'GUEST',
          customerMemberId: '',
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          shippingAddress: { street: '', city: 'Thimphu', dzongkhag: 'Thimphu', country: 'Bhutan', postalCode: '' },
          shippingMethod: 'EMS',
          paymentMethod: 'CARD',
          paymentStatus: 'PAID',
          orderStatus: 'PROCESSING',
          currencyUsed: 'USD',
          internalNotes: '',
          selectedItems: [],
        });
        await loadData();
      } else {
        setErrorMsg(data.error || 'Failed to create order.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmShipment = async () => {
    if (!fulfillingOrder) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: fulfillingOrder.id,
          orderStatus: 'SHIPPED',
          trackingNumber: trackingInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`✓ Order ${fulfillingOrder.orderNumber} marked SHIPPED with tracking #${trackingInput || 'N/A'}.`);
        setFulfillingOrder(null);
        await loadData();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to update order fulfillment.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    if (!cancellationReason.trim()) {
      setErrorMsg('Please specify a statutory reason for cancelling this order.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cancellingOrder.id,
          orderStatus: 'CANCELLED',
          cancellationReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`✓ Order ${cancellingOrder.orderNumber} cancelled. Inventory returned to catalog.`);
        setCancellingOrder(null);
        setCancellationReason('');
        await loadData();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to cancel order.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingOrder.id,
          orderStatus: editingOrder.orderStatus,
          paymentStatus: editingOrder.paymentStatus,
          trackingNumber: editingOrder.trackingNumber,
          customerName: editingOrder.customerName,
          customerEmail: editingOrder.customerEmail,
          customerPhone: editingOrder.customerPhone,
          shippingAddress: editingOrder.shippingAddress,
          internalNotes: editingOrder.internalNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`✓ Order ${editingOrder.orderNumber} details updated.`);
        setEditingOrder(null);
        await loadData();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to update order.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const addr = parseShippingAddress(o.shippingAddress);
    const searchLower = search.toLowerCase();
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(searchLower) ||
      o.customerName?.toLowerCase().includes(searchLower) ||
      o.customerEmail?.toLowerCase().includes(searchLower) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(searchLower)) ||
      addr.formatted.toLowerCase().includes(searchLower) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchLower)) ||
      (o.mBOBTransactionRef && o.mBOBTransactionRef.toLowerCase().includes(searchLower));
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-slate-800" />
            Orders &amp; Consignment Dispatch
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-world fulfillment tracking, recipient delivery address inspection, carrier synchronization, and packing slips.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 admin-button-primary text-xs font-semibold rounded-lg shadow-sm transition"
          >
            + Create Manual Order
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-md flex justify-between items-center print:hidden">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 font-bold ml-2">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-md flex justify-between items-center print:hidden">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            {errorMsg}
          </span>
          <button onClick={() => setErrorMsg('')} className="text-rose-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex gap-4 items-center bg-white p-4 border border-slate-200 rounded-xl shadow-xs flex-wrap print:hidden">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by order #, recipient name, street address, phone, email, tracking, mBoB ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg pl-9 pr-3.5 py-2.5 outline-none focus:border-amber-800 font-sans transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-white text-slate-900 border border-slate-300 rounded-lg px-3.5 py-2.5 outline-none focus:border-amber-800 transition-colors font-medium"
        >
          <option value="ALL">All Order Statuses</option>
          <option value="PROCESSING">Processing</option>
          <option value="PAID">Paid (Awaiting Dispatch)</option>
          <option value="SHIPPED">Shipped / Dispatched</option>
          <option value="DELIVERED">Delivered</option>
          <option value="PENDING_PAYMENT">Pending Payment</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden print:hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs font-mono flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-amber-800 border-t-transparent rounded-full animate-spin" />
            <span>Loading order book and delivery registry from PostgreSQL...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order # &amp; Date</th>
                  <th className="py-3.5 px-4">Customer &amp; Contact</th>
                  <th className="py-3.5 px-4">Delivery Destination</th>
                  <th className="py-3.5 px-4">Total &amp; Payment</th>
                  <th className="py-3.5 px-4">Carrier Dispatch</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => {
                  const addr = parseShippingAddress(o.shippingAddress);
                  const itemsList = Array.isArray(o.items) ? o.items : [];
                  const itemsSummary = itemsList.map((i: any) => `${i.code || i.name} (x${i.quantity || 1})`).join(', ') || 'Craft item';
                  const effectivePhone = o.customerPhone || addr.phone;
                  const courierCopyText = `${addr.fullName || o.customerName}\n${addr.street}\n${addr.city}, ${addr.country}${addr.postalCode ? ` ${addr.postalCode}` : ''}\nTel: ${effectivePhone || 'N/A'}`;

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Order Number & Date */}
                      <td className="py-3.5 px-4 font-mono font-medium whitespace-nowrap">
                        <div className="text-slate-900 font-bold text-sm">{o.orderNumber}</div>
                        <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                          {new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono border border-slate-200 font-semibold">
                          {o.customerType}
                        </span>
                      </td>

                      {/* 2. Customer & Contact */}
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="font-bold text-slate-900">{o.customerName}</div>
                        <div className="text-[11px] text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{o.customerEmail}</span>
                        </div>
                        {effectivePhone && (
                          <div className="text-[11px] text-emerald-700 font-mono flex items-center gap-1 mt-0.5 font-medium">
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{effectivePhone}</span>
                          </div>
                        )}
                        {o.customerMember && (
                          <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                            MEMBER: {o.customerMember.name}
                          </span>
                        )}
                      </td>

                      {/* 3. Delivery Destination */}
                      <td className="py-3.5 px-4 min-w-[240px]">
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-900 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {addr.street || (addr.isEmpty ? 'Counter Pickup' : 'No street recorded')}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 pl-4 font-medium">
                              {[addr.city, addr.dzongkhag, addr.country].filter(Boolean).join(', ')}
                              {addr.postalCode && ` (${addr.postalCode})`}
                            </div>
                            <div className="text-[10px] text-slate-500 pl-4 italic truncate max-w-[200px]" title={itemsSummary}>
                              📦 {itemsSummary}
                            </div>
                          </div>
                          {!addr.isEmpty && (
                            <button
                              type="button"
                              onClick={() => handleCopyAddress(o.id, courierCopyText)}
                              className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 shrink-0 transition flex items-center gap-1 shadow-xs"
                              title="Copy delivery address for courier software"
                            >
                              <Copy className="w-3 h-3 text-slate-600" />
                              <span>{copyFeedback[o.id] ? 'Copied!' : 'Copy'}</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 4. Total & Payment */}
                      <td className="py-3.5 px-4 font-mono font-semibold whitespace-nowrap">
                        <div className="text-slate-900 font-bold text-sm">${Number(o.totalUSD).toFixed(2)}</div>
                        {o.currencyUsed === 'BTN' && (
                          <div className="text-[11px] text-slate-600 font-sans font-medium">Nu. {o.totalPaidCurrency}</div>
                        )}
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-slate-900 border border-slate-300'
                          }`}>
                            {o.paymentStatus}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                            {o.paymentMethod}
                          </span>
                        </div>
                        {o.mBOBTransactionRef && (
                          <div className="text-[10px] text-teal-800 font-mono mt-0.5 truncate max-w-[130px] font-semibold" title={`mBoB Journal: ${o.mBOBTransactionRef}`}>
                            Ref: {o.mBOBTransactionRef}
                          </div>
                        )}
                        {o.paymentMethod === 'COD' && o.paymentStatus !== 'PAID' && (
                          <div className="text-[10px] text-slate-800 font-sans mt-0.5 font-medium">
                            Collect upon delivery
                          </div>
                        )}
                      </td>

                      {/* 5. Dispatch & Tracking */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {o.shippingMethod}
                        </span>
                        {o.trackingNumber ? (
                          <div className="font-mono text-[11px] text-indigo-700 font-bold mt-1 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-indigo-600" />
                            <span>{o.trackingNumber}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 mt-0.5 italic">No tracking assigned</div>
                        )}
                      </td>

                      {/* 6. Order Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                            o.orderStatus === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : o.orderStatus === 'SHIPPED'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : o.orderStatus === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : o.orderStatus === 'REFUNDED'
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : 'bg-amber-100 text-slate-900 border-slate-300'
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </td>

                      {/* 7. Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setInspectingOrder(o)}
                          className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg transition shadow-xs"
                        >
                          🔍 Inspect / Pack
                        </button>
                        <button
                          onClick={() => setInvoiceModalOrder(o)}
                          className="px-2.5 py-1 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg transition shadow-xs inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Invoice</span>
                        </button>
                        {o.orderStatus !== 'CANCELLED' && o.orderStatus !== 'DELIVERED' && (
                          <button
                            onClick={() => {
                              setFulfillingOrder(o);
                              setTrackingInput(o.trackingNumber || '');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold admin-button-primary rounded-lg transition"
                          >
                            Dispatch
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const parsed = parseShippingAddress(o.shippingAddress);
                            setEditingOrder({
                              ...o,
                              customerName: o.customerName || '',
                              customerEmail: o.customerEmail || '',
                              customerPhone: o.customerPhone || parsed.phone || '',
                              shippingAddress: {
                                street: parsed.street,
                                city: parsed.city,
                                dzongkhag: parsed.dzongkhag,
                                country: parsed.country,
                                postalCode: parsed.postalCode,
                              },
                            });
                          }}
                          className="px-2 py-1 admin-button-secondary border rounded text-xs font-medium transition"
                        >
                          Edit
                        </button>
                        {o.orderStatus !== 'CANCELLED' && (
                          <button
                            onClick={() => {
                              setCancellingOrder(o);
                              setCancellationReason('');
                            }}
                            className="px-2 py-1 text-rose-300 hover:text-rose-200 border border-rose-400/25 hover:bg-rose-500/15 rounded text-xs font-medium transition"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => setShowDeleteAttemptModal(o)}
                          className="px-1.5 py-1 text-slate-500 hover:text-slate-300 text-xs"
                          title="Delete (Protected)"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-slate-400">
                      No orders found matching search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ORDER INSPECTOR & PACKING SLIP MODAL */}
      {/* ========================================================================= */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="admin-modal bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto print:max-w-none print:max-h-none print:border-none print:p-0 print:text-black">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4 print:hidden">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Order #{inspectingOrder.orderNumber}</h2>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    inspectingOrder.orderStatus === 'DELIVERED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : inspectingOrder.orderStatus === 'SHIPPED'
                      ? 'bg-blue-100 text-blue-800'
                      : inspectingOrder.orderStatus === 'CANCELLED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-slate-800'
                  }`}>
                    {inspectingOrder.orderStatus}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    inspectingOrder.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-slate-800'
                  }`}>
                    {inspectingOrder.paymentStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Placed on {new Date(inspectingOrder.createdAt).toLocaleString()} · Collector Type: {inspectingOrder.customerType}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInvoiceModalOrder(inspectingOrder)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg flex items-center gap-1.5 transition shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Tax Invoice &amp; Thermal Slip
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Packing Slip
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Official Slip Header (Only visible on print) */}
            <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold uppercase tracking-wide">HANDICRAFTS ASSOCIATION OF BHUTAN</h1>
                  <p className="text-xs text-gray-700">Apex Civil Society Organization · Registration: CSO/2011/043</p>
                  <p className="text-xs text-gray-700">P.O. Box 1129, Metog Lam, Kawajangsa, Thimphu, Kingdom of Bhutan</p>
                  <p className="text-xs text-gray-700">Tel: +975-2-338089 · Email: officehab@gmail.com · Web: www.hab.org.bt</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-bold">COMMERCIAL PACKING SLIP</h2>
                  <p className="text-xs font-mono">Invoice #: {inspectingOrder.orderNumber}</p>
                  <p className="text-xs">Date: {new Date(inspectingOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Two-Column Detail Cards: Destination & Payment */}
            {(() => {
              const addr = parseShippingAddress(inspectingOrder.shippingAddress);
              const effectivePhone = inspectingOrder.customerPhone || addr.phone;
              const courierFormattedText = `${addr.fullName || inspectingOrder.customerName}\n${addr.street}\n${addr.city}, ${addr.country}${addr.postalCode ? ` ${addr.postalCode}` : ''}\nTel: ${effectivePhone || 'N/A'}`;

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Card 1: Delivery Destination */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 print:border-gray-300 print:bg-white print:text-black">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2 print:border-gray-200">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 print:text-black">
                        <MapPin className="w-4 h-4 text-amber-600 print:text-black" />
                        <span>Delivery Destination (Consignee)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyAddress(inspectingOrder.id, courierFormattedText)}
                        className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 rounded flex items-center gap-1 transition print:hidden"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copyFeedback[inspectingOrder.id] ? '✓ Copied' : 'Copy for Courier'}</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-sm font-bold text-slate-900 print:text-black">
                        {addr.fullName || inspectingOrder.customerName}
                      </div>
                      <div className="text-slate-700 font-medium print:text-black">
                        {addr.street || 'No street specified'}
                      </div>
                      <div className="text-slate-500 print:text-gray-700">
                        {[addr.city, addr.dzongkhag, addr.country].filter(Boolean).join(', ')}
                        {addr.postalCode && ` · Postal: ${addr.postalCode}`}
                      </div>
                      <div className="pt-2 flex flex-col gap-1 text-[11px]">
                        <div className="flex items-center gap-2 text-emerald-700 font-mono print:text-black">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{effectivePhone || 'No phone recorded'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 font-mono print:text-black">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{inspectingOrder.customerEmail}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Payment Verification & Reconciliation */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 print:border-gray-300 print:bg-white print:text-black">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2 print:border-gray-200">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 print:text-black">
                        <CreditCard className="w-4 h-4 text-indigo-600 print:text-black" />
                        <span>Payment &amp; Financial Settlement</span>
                      </div>
                      <span className="font-mono text-slate-900 text-sm font-bold print:text-black">
                        ${Number(inspectingOrder.totalUSD).toFixed(2)} USD
                        {inspectingOrder.currencyUsed === 'BTN' && (
                          <span className="text-xs text-slate-500 font-sans font-normal ml-1">
                            (Nu. {inspectingOrder.totalPaidCurrency})
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 print:text-gray-700">Payment Method:</span>
                        <span className="font-semibold text-slate-900 font-mono print:text-black">{inspectingOrder.paymentMethod}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 print:text-gray-700">Payment Status:</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            inspectingOrder.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-slate-800'
                          }`}>
                            {inspectingOrder.paymentStatus}
                          </span>
                          {inspectingOrder.paymentStatus !== 'PAID' && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsPaid(inspectingOrder.id)}
                              disabled={submitting}
                              className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition print:hidden"
                            >
                              ✓ Mark as PAID
                            </button>
                          )}
                        </div>
                      </div>

                      {/* mBoB Journal Display */}
                      {inspectingOrder.paymentMethod === 'MBOB' && (
                        <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-[11px] space-y-1">
                          <div className="text-teal-900 font-semibold flex items-center gap-1">
                            <QrCode className="w-3.5 h-3.5 text-teal-700" />
                            <span>Customer mBoB Transaction Journal:</span>
                          </div>
                          <div className="font-mono font-bold text-teal-950 text-xs pl-5">
                            {inspectingOrder.mBOBTransactionRef || 'No reference entered yet'}
                          </div>
                        </div>
                      )}

                      {/* COD Notice */}
                      {inspectingOrder.paymentMethod === 'COD' && (
                        <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] space-y-0.5 text-slate-900">
                          <div className="font-semibold flex items-center gap-1">
                            <Banknote className="w-3.5 h-3.5 text-amber-600" />
                            <span>Cash on Delivery (COD)</span>
                          </div>
                          <p className="text-[10px] text-slate-800">
                            Courier must collect Nu. {inspectingOrder.totalPaidCurrency || Math.round(inspectingOrder.totalUSD * 84)} upon parcel handover.
                          </p>
                        </div>
                      )}

                      {inspectingOrder.internalNotes && (
                        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                          <span className="text-slate-600 font-semibold">Note: </span>
                          <span>{inspectingOrder.internalNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Pack Manifest (Line Items Checklist) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden print:border-gray-300">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-900 flex justify-between items-center print:bg-gray-100 print:text-black">
                <span>Items to Pack (Warehouse Manifest)</span>
                <span className="text-slate-500 text-[11px] font-normal print:text-gray-600">
                  Carrier: {inspectingOrder.shippingMethod} · Rate: Nu. {inspectingOrder.fxRateAtPurchase || 84}/$
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] print:bg-white print:text-black print:border-gray-300">
                      <th className="py-2.5 px-3">Item Code</th>
                      <th className="py-2.5 px-3">Craft Name &amp; Description</th>
                      <th className="py-2.5 px-3 text-center">Qty to Pack</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 print:divide-gray-200">
                    {inspectingOrder.items && Array.isArray(inspectingOrder.items) && inspectingOrder.items.length > 0 ? (
                      inspectingOrder.items.map((it: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 print:text-black">
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-700 print:text-black">{it.code}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900 print:text-black">{it.name}</div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-900 print:text-black">
                            <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200 print:border-none">
                              {it.quantity}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600 print:text-black">
                            ${Number(it.priceUSD || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 print:text-black">
                            ${(Number(it.priceUSD || 0) * Number(it.quantity || 1)).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400">
                          No line items recorded in order snapshot.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 font-medium text-slate-700 text-xs print:border-gray-300 print:text-black">
                      <td colSpan={3} className="py-2 px-3 text-slate-500 italic">
                        Shipping Fee: ${Number(inspectingOrder.shippingFeeUSD || 0).toFixed(2)} USD
                      </td>
                      <td className="py-2 px-3 text-right font-bold">Total Order Value:</td>
                      <td className="py-2 px-3 text-right font-bold font-mono text-slate-900 text-sm print:text-black">
                        ${Number(inspectingOrder.totalUSD).toFixed(2)} USD
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Carrier Dispatch & Tracking Section (Admin Controls) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 print:hidden">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Carrier Dispatch &amp; Tracking Synchronization</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter tracking code (e.g. BP-EMS-98124 or DHL-8821948)"
                  defaultValue={inspectingOrder.trackingNumber || ''}
                  id="inspectTrackingInput"
                  className="flex-1 admin-input bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('inspectTrackingInput') as HTMLInputElement;
                    handleUpdateTracking(inspectingOrder.id, el?.value || '', false);
                  }}
                  disabled={submitting}
                  className="px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition"
                >
                  Save Tracking
                </button>
                {inspectingOrder.orderStatus !== 'SHIPPED' && inspectingOrder.orderStatus !== 'DELIVERED' && (
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('inspectTrackingInput') as HTMLInputElement;
                      handleUpdateTracking(inspectingOrder.id, el?.value || '', true);
                    }}
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold admin-button-primary rounded-lg shadow-sm transition"
                  >
                    Save &amp; Mark SHIPPED
                  </button>
                )}
              </div>
            </div>

            {/* Cultural Export & Zorig Chusum Statutory Customs Statement (Printable) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed print:bg-white print:border-gray-400 print:text-black print:mt-4">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 print:text-black">
                <ShieldCheck className="w-4 h-4 text-emerald-600 print:text-black" />
                <span>Statutory Heritage Certification &amp; Customs Export Declaration</span>
              </div>
              <p>
                I hereby declare that this consignment consists exclusively of authentic contemporary Bhutanese handicrafts, hand-loomed textiles, and cultural art objects created by certified artisan members of the Handicrafts Association of Bhutan under the 13 Traditional Arts &amp; Crafts of Bhutan (Zorig Chusum). This consignment is compliant with the Civil Society Organizations Act of Bhutan 2007 (CSO Registration: CSO/2011/043). Not subject to antique restrictions.
              </p>
              <div className="hidden print:grid grid-cols-2 gap-8 pt-8 text-xs text-black">
                <div className="border-t border-black pt-1">
                  <div>Authorized Signature: ___________________________</div>
                  <div className="text-[10px] text-gray-600">Handicrafts Association of Bhutan Dispatch Officer</div>
                </div>
                <div className="border-t border-black pt-1 text-right">
                  <div>Official CSO Stamp / Seal</div>
                  <div className="text-[10px] text-gray-600">Thimphu, Kingdom of Bhutan</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => {
                  const o = inspectingOrder;
                  const parsed = parseShippingAddress(o.shippingAddress);
                  setEditingOrder({
                    ...o,
                    customerName: o.customerName || '',
                    customerEmail: o.customerEmail || '',
                    customerPhone: o.customerPhone || parsed.phone || '',
                    shippingAddress: {
                      street: parsed.street,
                      city: parsed.city,
                      dzongkhag: parsed.dzongkhag,
                      country: parsed.country,
                      postalCode: parsed.postalCode,
                    },
                  });
                  setInspectingOrder(null);
                }}
                className="px-3 py-1.5 admin-button-secondary border rounded text-xs"
              >
                ✏️ Edit Order &amp; Delivery Details
              </button>
              <button
                type="button"
                onClick={() => setInspectingOrder(null)}
                className="px-4 py-1.5 admin-button-primary rounded text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DISPATCH MODAL */}
      {/* ========================================================================= */}
      {fulfillingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="admin-modal rounded-xl max-w-md w-full p-6 shadow-2xl border admin-border space-y-4">
            <h3 className="font-bold admin-title text-base">Fulfill &amp; Dispatch Order</h3>
            <p className="text-xs admin-text">
              Record carrier tracking and transition order <strong className="admin-title">{fulfillingOrder.orderNumber}</strong> to SHIPPED.
            </p>

            {/* Destination Preview */}
            {(() => {
              const addr = parseShippingAddress(fulfillingOrder.shippingAddress);
              return (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="font-semibold text-slate-900">Deliver to: {addr.fullName || fulfillingOrder.customerName}</div>
                  <div className="text-slate-700">📍 {addr.formatted}</div>
                  <div className="text-slate-600 font-mono">📞 {fulfillingOrder.customerPhone || addr.phone || 'No phone recorded'}</div>
                </div>
              );
            })()}

            <div>
              <label className="block font-medium admin-text text-xs mb-1">Carrier Tracking Number</label>
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="e.g. BP-88214-BT or DHL-992817"
                className="w-full admin-input border rounded px-3 py-2 text-xs font-mono outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setFulfillingOrder(null)}
                className="px-3 py-1.5 admin-button-secondary border rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmShipment}
                disabled={submitting}
                className="px-4 py-1.5 admin-button-primary rounded text-xs font-semibold disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Confirm Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT ORDER MODAL */}
      {/* ========================================================================= */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="admin-modal rounded-xl max-w-xl w-full p-6 shadow-2xl border admin-border space-y-4 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b admin-border pb-3">
              <h3 className="font-bold admin-title text-base">Edit Order: {editingOrder.orderNumber}</h3>
              <button onClick={() => setEditingOrder(null)} className="admin-muted hover:admin-text font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium admin-text mb-1">Order Status</label>
                  <select
                    value={editingOrder.orderStatus}
                    onChange={(e) => setEditingOrder({ ...editingOrder, orderStatus: e.target.value })}
                    className="w-full admin-input border rounded px-2.5 py-1.5"
                  >
                    <option value="PROCESSING">Processing</option>
                    <option value="PAID">Paid</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="PENDING_PAYMENT">Pending Payment</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium admin-text mb-1">Payment Status</label>
                  <select
                    value={editingOrder.paymentStatus}
                    onChange={(e) => setEditingOrder({ ...editingOrder, paymentStatus: e.target.value })}
                    className="w-full admin-input border rounded px-2.5 py-1.5"
                  >
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                <span className="font-semibold text-slate-900 block text-[11px]">Customer &amp; Contact Details</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={editingOrder.customerName || ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                      className="w-full admin-input border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Customer Email</label>
                    <input
                      type="email"
                      value={editingOrder.customerEmail || ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, customerEmail: e.target.value })}
                      className="w-full admin-input border rounded px-2 py-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Customer Phone</label>
                    <input
                      type="text"
                      value={editingOrder.customerPhone || ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, customerPhone: e.target.value })}
                      className="w-full admin-input border rounded px-2 py-1 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Editable Delivery Destination */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                <span className="font-semibold text-slate-900 block text-[11px]">Delivery Address (Consignee)</span>
                <div>
                  <label className="block text-slate-600 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={editingOrder.shippingAddress?.street || ''}
                    onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      shippingAddress: { ...editingOrder.shippingAddress, street: e.target.value }
                    })}
                    placeholder="e.g. Changzamtog Road, Norzin Lam"
                    className="w-full admin-input border rounded px-2.5 py-1.5"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">City / Town</label>
                    <input
                      type="text"
                      value={editingOrder.shippingAddress?.city || ''}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        shippingAddress: { ...editingOrder.shippingAddress, city: e.target.value }
                      })}
                      className="w-full admin-input border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Dzongkhag / State</label>
                    <input
                      type="text"
                      value={editingOrder.shippingAddress?.dzongkhag || ''}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        shippingAddress: { ...editingOrder.shippingAddress, dzongkhag: e.target.value }
                      })}
                      className="w-full admin-input border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Country</label>
                    <input
                      type="text"
                      value={editingOrder.shippingAddress?.country || 'Bhutan'}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        shippingAddress: { ...editingOrder.shippingAddress, country: e.target.value }
                      })}
                      className="w-full admin-input border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={editingOrder.shippingAddress?.postalCode || ''}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        shippingAddress: { ...editingOrder.shippingAddress, postalCode: e.target.value }
                      })}
                      className="w-full admin-input border rounded px-2 py-1 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium admin-text mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={editingOrder.trackingNumber || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, trackingNumber: e.target.value })}
                  placeholder="e.g. BP-88214-BT"
                  className="w-full admin-input border rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium admin-text mb-1">Staff Internal Notes</label>
                <textarea
                  rows={2}
                  value={editingOrder.internalNotes || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, internalNotes: e.target.value })}
                  placeholder="Notes for secretariat staff (customs declaration, special packaging notes)..."
                  className="w-full admin-input border rounded px-2.5 py-1.5 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-3 py-1.5 admin-button-secondary border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 admin-button-primary rounded font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE MANUAL ORDER MODAL */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="admin-modal rounded-xl max-w-2xl w-full p-6 shadow-2xl border admin-border space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b admin-border pb-3">
              <div>
                <h3 className="font-bold admin-title text-base">Create Manual / In-Person Order</h3>
                <p className="text-xs admin-muted">Atomic inventory decrement and OrderItem referential record creation.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="admin-muted hover:admin-text font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium admin-text mb-1">Customer Type</label>
                  <select
                    value={orderForm.customerType}
                    onChange={(e) => setOrderForm({ ...orderForm, customerType: e.target.value })}
                    className="w-full admin-input border rounded px-2.5 py-1.5"
                  >
                    <option value="GUEST">Guest Customer</option>
                    <option value="MEMBER">Registered Artisan Member</option>
                  </select>
                </div>
                {orderForm.customerType === 'MEMBER' && (
                  <div>
                    <label className="block font-medium admin-text mb-1">Select Member</label>
                    <select
                      value={orderForm.customerMemberId}
                      onChange={(e) => {
                        const m = members.find((mem) => mem.id === e.target.value);
                        setOrderForm({
                          ...orderForm,
                          customerMemberId: e.target.value,
                          customerName: m?.name || orderForm.customerName,
                          customerEmail: m?.email || orderForm.customerEmail,
                        });
                      }}
                      className="w-full admin-input border rounded px-2.5 py-1.5"
                    >
                      <option value="">Select Member...</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.regNumber})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium admin-text mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                    className="w-full admin-input border rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-medium admin-text mb-1">Customer Email *</label>
                  <input
                    type="email"
                    required
                    value={orderForm.customerEmail}
                    onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                    className="w-full admin-input border rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-medium admin-text mb-1">Customer Phone</label>
                  <input
                    type="text"
                    value={orderForm.customerPhone}
                    onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                    className="w-full admin-input border rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              {/* Delivery Address Fields for Manual Order */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                <span className="font-semibold text-slate-900 block text-[11px]">Delivery Destination</span>
                <div>
                  <label className="block text-slate-600 mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Changzamtog Road, Norzin Lam"
                    value={orderForm.shippingAddress.street}
                    onChange={(e) => setOrderForm({
                      ...orderForm,
                      shippingAddress: { ...orderForm.shippingAddress, street: e.target.value }
                    })}
                    className="w-full admin-input border rounded px-2.5 py-1.5"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">City</label>
                    <input
                      type="text"
                      value={orderForm.shippingAddress.city}
                      onChange={(e) => setOrderForm({
                        ...orderForm,
                        shippingAddress: { ...orderForm.shippingAddress, city: e.target.value }
                      })}
                      className="w-full admin-input border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Dzongkhag</label>
                    <input
                      type="text"
                      value={orderForm.shippingAddress.dzongkhag}
                      onChange={(e) => setOrderForm({
                        ...orderForm,
                        shippingAddress: { ...orderForm.shippingAddress, dzongkhag: e.target.value }
                      })}
                      className="w-full admin-input border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Country</label>
                    <input
                      type="text"
                      value={orderForm.shippingAddress.country}
                      onChange={(e) => setOrderForm({
                        ...orderForm,
                        shippingAddress: { ...orderForm.shippingAddress, country: e.target.value }
                      })}
                      className="w-full admin-input border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={orderForm.shippingAddress.postalCode}
                      onChange={(e) => setOrderForm({
                        ...orderForm,
                        shippingAddress: { ...orderForm.shippingAddress, postalCode: e.target.value }
                      })}
                      className="w-full admin-input border rounded px-2 py-1 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Product Selection Matrix */}
              <div className="border admin-border rounded-lg p-3 admin-panel space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold admin-title">Add Line Items from Catalog</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddItemToOrder(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="admin-input border rounded px-2 py-1 text-xs"
                  >
                    <option value="">+ Add Product...</option>
                    {products.map((p) => (
                      <option key={p.code} value={p.code} disabled={p.stock <= 0}>
                        {p.name} ({p.code}) — ${p.priceUSD} ({p.stock} in stock)
                      </option>
                    ))}
                  </select>
                </div>

                {orderForm.selectedItems.length === 0 ? (
                  <p className="admin-muted italic text-[11px] py-2">No items selected yet. Choose a product above.</p>
                ) : (
                  <div className="space-y-2">
                    {orderForm.selectedItems.map((item) => (
                      <div key={item.code} className="flex justify-between items-center admin-card p-2 rounded border admin-border">
                        <div>
                          <span className="font-semibold admin-title">{item.name}</span>
                          <span className="font-mono text-[10px] admin-muted ml-2">({item.code})</span>
                          <span className="admin-text ml-2">${item.priceUSD} ea.</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemQtyChange(item.code, parseInt(e.target.value, 10) || 1)}
                            className="w-14 admin-input border rounded px-2 py-0.5 font-mono text-center"
                          />
                          <span className="font-mono font-bold admin-title">
                            ${(item.priceUSD * item.quantity).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromOrder(item.code)}
                            className="text-rose-600 hover:text-rose-700 font-bold px-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium admin-text mb-1">Shipping Method</label>
                  <select
                    value={orderForm.shippingMethod}
                    onChange={(e) => setOrderForm({ ...orderForm, shippingMethod: e.target.value })}
                    className="w-full admin-input border rounded px-2.5 py-1.5"
                  >
                    <option value="EMS">Bhutan Post / EMS</option>
                    <option value="EXPRESS">Express Courier ($62)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium admin-text mb-1">Payment Method</label>
                  <select
                    value={orderForm.paymentMethod}
                    onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value })}
                    className="w-full admin-input border rounded px-2.5 py-1.5"
                  >
                    <option value="CARD">International Card</option>
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="MBOB">mBOB / QR</option>
                    <option value="BANK">Bank Wire Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium admin-text mb-1">Initial Order Status</label>
                  <select
                    value={orderForm.orderStatus}
                    onChange={(e) => setOrderForm({ ...orderForm, orderStatus: e.target.value })}
                    className="w-full admin-input border rounded px-2.5 py-1.5"
                  >
                    <option value="PROCESSING">Processing</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING_PAYMENT">Pending Payment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium admin-text mb-1">Staff Internal Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={orderForm.internalNotes}
                  onChange={(e) => setOrderForm({ ...orderForm, internalNotes: e.target.value })}
                  placeholder="Internal notes for this order..."
                  className="w-full admin-input border rounded px-2.5 py-1.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 admin-button-secondary border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 admin-button-primary rounded font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Creating Order...' : 'Create Order & Decrement Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CANCEL ORDER MODAL */}
      {/* ========================================================================= */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="admin-modal rounded-xl max-w-md w-full p-6 shadow-2xl border admin-border space-y-4">
            <h3 className="font-bold admin-title text-base">Cancel Order &amp; Restore Inventory</h3>

            {['SHIPPED', 'DELIVERED'].includes(cancellingOrder.orderStatus) ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5 text-rose-900">
                    <span>⛔</span> Cannot Cancel Shipped / Delivered Order
                  </p>
                  <p className="leading-relaxed">
                    Order <strong>{cancellingOrder.orderNumber}</strong> has already been marked as <strong>{cancellingOrder.orderStatus}</strong>. Physical items have left the secretariat facility and cannot automatically be restored into catalog inventory without corrupting stock counts.
                  </p>
                  <p className="font-medium pt-1 text-rose-900">
                    To handle customer returns or refunds, please use the <strong>Edit</strong> action and update the order status to <strong>REFUNDED</strong>.
                  </p>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setCancellingOrder(null)}
                    className="px-4 py-1.5 admin-button-primary rounded text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs admin-text">
                  Cancelling order <strong className="admin-title">{cancellingOrder.orderNumber}</strong> will atomically return all line-item quantities back into active catalog stock.
                </p>

                <div>
                  <label className="block font-medium admin-text text-xs mb-1">Cancellation Reason *</label>
                  <textarea
                    rows={3}
                    required
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="e.g. Customer requested cancellation prior to international shipping."
                    className="w-full admin-input border rounded px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setCancellingOrder(null)}
                    className="px-3 py-1.5 admin-button-secondary border rounded text-xs"
                  >
                    Keep Order
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={submitting}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold disabled:opacity-50"
                  >
                    {submitting ? 'Processing...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE ATTEMPT WARNING DIALOG */}
      {/* ========================================================================= */}
      {showDeleteAttemptModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="admin-modal rounded-xl max-w-md w-full p-6 shadow-2xl border admin-border space-y-4">
            <h3 className="font-bold admin-title text-base flex items-center gap-2 text-rose-600">
              <span>⚠️</span> Order Deletion Prohibited
            </h3>
            <p className="text-xs admin-text leading-relaxed">
              Under Bhutanese commerce regulations and financial accounting standards, orders cannot be permanently deleted once generated.
            </p>
            <div className="p-3 admin-panel border admin-border rounded text-[11px] admin-text space-y-1">
              <p>
                To reverse this order, select <strong>Cancel Order</strong> instead. That will return all line items to active inventory and flag the order as CANCELLED in the immutable audit log.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDeleteAttemptModal(null)}
                className="px-4 py-1.5 admin-button-primary rounded text-xs font-semibold"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official CSO Tax Invoice & POS Slip Modal */}
      {invoiceModalOrder && (
        <OrderInvoiceModal
          isOpen={!!invoiceModalOrder}
          onClose={() => setInvoiceModalOrder(null)}
          order={{
            orderNumber: invoiceModalOrder.orderNumber,
            createdAt: invoiceModalOrder.createdAt,
            customerName: invoiceModalOrder.customerName,
            customerEmail: invoiceModalOrder.customerEmail,
            customerPhone: invoiceModalOrder.customerPhone,
            customerType: invoiceModalOrder.customerType,
            shippingAddress: invoiceModalOrder.shippingAddress,
            shippingMethod: invoiceModalOrder.shippingMethod,
            paymentMethod: invoiceModalOrder.paymentMethod,
            paymentStatus: invoiceModalOrder.paymentStatus,
            orderStatus: invoiceModalOrder.orderStatus,
            trackingNumber: invoiceModalOrder.trackingNumber,
            totalUSD: invoiceModalOrder.totalUSD,
            totalPaidCurrency: invoiceModalOrder.totalPaidCurrency,
            currencyUsed: invoiceModalOrder.currencyUsed,
            items: invoiceModalOrder.orderItems || invoiceModalOrder.items,
          }}
        />
      )}
    </div>
  );
}

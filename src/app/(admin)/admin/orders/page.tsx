'use client';

import React, { useState, useEffect } from 'react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);
  const [fulfillingOrder, setFulfillingOrder] = useState<any | null>(null);
  const [showDeleteAttemptModal, setShowDeleteAttemptModal] = useState<any | null>(null);

  // Forms
  const [trackingInput, setTrackingInput] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Manual order form state
  const [orderForm, setOrderForm] = useState({
    customerType: 'GUEST',
    customerMemberId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: {
      street: '',
      dzongkhag: 'Thimphu',
      country: 'Bhutan',
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
    try {
      const [ordRes, prodRes, memRes] = await Promise.all([
        fetch('/api/admin/orders', { credentials: 'include' }),
        fetch('/api/admin/products', { credentials: 'include' }).catch(() => null),
        fetch('/api/admin/members', { credentials: 'include' }).catch(() => null),
      ]);

      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData.orders || []);
      } else {
        const err = await ordRes.json();
        setErrorMsg(err.error || 'Failed to fetch orders from PostgreSQL.');
      }

      if (prodRes && prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }

      if (memRes && memRes.ok) {
        const memData = await memRes.json();
        setMembers(memData.members || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error fetching data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
          {
            code: prod.code,
            name: prod.name,
            priceUSD: prod.priceUSD,
            quantity: 1,
          },
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
          shippingAddress: { street: '', dzongkhag: 'Thimphu', country: 'Bhutan' },
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
      setErrorMsg('A cancellation reason is required.');
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
          customerPhone: editingOrder.customerPhone,
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
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      o.trackingNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders &amp; Consignment Dispatch</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time fulfillment tracking, carrier tracking synchronization, and manual counter order entry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            + Create Manual Order
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-md flex justify-between items-center">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 font-bold ml-2">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-md flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex gap-4 items-center bg-white p-4 border border-slate-200 rounded-lg shadow-sm flex-wrap">
        <input
          type="text"
          placeholder="Search order #, customer name, email, tracking..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[240px] text-xs border border-slate-300 rounded px-3 py-2 outline-none focus:border-slate-500 font-sans"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border border-slate-300 rounded px-3 py-2 outline-none focus:border-slate-500 bg-white"
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
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            Loading order book from PostgreSQL...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Collector / Customer</th>
                  <th className="py-3 px-4">Craft Line-Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Dispatch &amp; Tracking</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => {
                  const itemsList = Array.isArray(o.items) ? o.items : [];
                  const itemsSummary = itemsList.map((i: any) => `${i.code || i.name} (x${i.quantity || 1})`).join(', ') || 'Craft item';

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        <div>{o.orderNumber}</div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          {new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{o.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{o.customerEmail}</div>
                        {o.customerMember && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-semibold">
                            MEMBER: {o.customerMember.name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={itemsSummary}>
                        {itemsSummary}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        ${Number(o.totalUSD).toFixed(2)}
                        {o.currencyUsed === 'BTN' && (
                          <div className="text-[10px] text-slate-400 font-sans">Nu. {o.totalPaidCurrency}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {o.shippingMethod}
                        </span>
                        {o.trackingNumber ? (
                          <div className="font-mono text-[11px] text-indigo-600 font-medium mt-1">
                            {o.trackingNumber}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 mt-0.5">No tracking assigned</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.orderStatus === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.orderStatus === 'SHIPPED'
                              ? 'bg-blue-100 text-blue-800'
                              : o.orderStatus === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800'
                              : o.orderStatus === 'REFUNDED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {o.orderStatus !== 'CANCELLED' && o.orderStatus !== 'DELIVERED' && (
                          <button
                            onClick={() => {
                              setFulfillingOrder(o);
                              setTrackingInput(o.trackingNumber || '');
                            }}
                            className="px-2 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded"
                          >
                            Dispatch
                          </button>
                        )}
                        <button
                          onClick={() => setEditingOrder({ ...o })}
                          className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 rounded text-xs font-medium"
                        >
                          Edit
                        </button>
                        {o.orderStatus !== 'CANCELLED' && (
                          <button
                            onClick={() => {
                              setCancellingOrder(o);
                              setCancellationReason('');
                            }}
                            className="px-2 py-1 text-rose-600 hover:text-rose-800 border border-rose-200 hover:bg-rose-50 rounded text-xs font-medium"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => setShowDeleteAttemptModal(o)}
                          className="px-1.5 py-1 text-slate-400 hover:text-slate-600 text-xs"
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
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No orders found matching search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Manual Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Create Manual / In-Person Order</h3>
                <p className="text-xs text-slate-500">Atomic inventory decrement and OrderItem referential record creation.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Customer Type</label>
                  <select
                    value={orderForm.customerType}
                    onChange={(e) => setOrderForm({ ...orderForm, customerType: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="GUEST">Guest Customer</option>
                    <option value="MEMBER">Registered Artisan Member</option>
                  </select>
                </div>
                {orderForm.customerType === 'MEMBER' && (
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Select Member</label>
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
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
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
                  <label className="block font-medium text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Customer Email *</label>
                  <input
                    type="email"
                    required
                    value={orderForm.customerEmail}
                    onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Customer Phone</label>
                  <input
                    type="text"
                    value={orderForm.customerPhone}
                    onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              {/* Product Selection Matrix */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Add Line Items from Catalog</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddItemToOrder(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="border border-slate-300 rounded px-2 py-1 bg-white text-xs"
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
                  <p className="text-slate-400 italic text-[11px] py-2">No items selected yet. Choose a product above.</p>
                ) : (
                  <div className="space-y-2">
                    {orderForm.selectedItems.map((item) => (
                      <div key={item.code} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                        <div>
                          <span className="font-semibold text-slate-800">{item.name}</span>
                          <span className="font-mono text-[10px] text-slate-500 ml-2">({item.code})</span>
                          <span className="text-slate-600 ml-2">${item.priceUSD} ea.</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemQtyChange(item.code, parseInt(e.target.value, 10) || 1)}
                            className="w-14 border border-slate-300 rounded px-2 py-0.5 font-mono text-center"
                          />
                          <span className="font-mono font-bold text-slate-800">
                            ${(item.priceUSD * item.quantity).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromOrder(item.code)}
                            className="text-rose-600 hover:text-rose-800 font-bold px-1"
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
                  <label className="block font-medium text-slate-700 mb-1">Shipping Method</label>
                  <select
                    value={orderForm.shippingMethod}
                    onChange={(e) => setOrderForm({ ...orderForm, shippingMethod: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="EMS">Bhutan Post / EMS</option>
                    <option value="EXPRESS">Express Courier ($62)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={orderForm.paymentMethod}
                    onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="CARD">International Card</option>
                    <option value="MBOB">mBOB / QR</option>
                    <option value="BANK">Bank Wire Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Initial Order Status</label>
                  <select
                    value={orderForm.orderStatus}
                    onChange={(e) => setOrderForm({ ...orderForm, orderStatus: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="PROCESSING">Processing</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING_PAYMENT">Pending Payment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Staff Internal Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={orderForm.internalNotes}
                  onChange={(e) => setOrderForm({ ...orderForm, internalNotes: e.target.value })}
                  placeholder="Internal notes for this order..."
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Creating Order...' : 'Create Order & Decrement Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {fulfillingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Fulfill &amp; Dispatch Order</h3>
            <p className="text-xs text-slate-600">
              Record carrier tracking and transition order <strong className="text-slate-900">{fulfillingOrder.orderNumber}</strong> to SHIPPED.
            </p>

            <div>
              <label className="block font-medium text-slate-700 text-xs mb-1">Carrier Tracking Number</label>
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="e.g. BP-88214-BT or DHL-992817"
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono outline-none focus:border-slate-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setFulfillingOrder(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmShipment}
                disabled={submitting}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Confirm Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Cancel Order &amp; Restore Inventory</h3>

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
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-600">
                  Cancelling order <strong className="text-slate-900">{cancellingOrder.orderNumber}</strong> will atomically return all line-item quantities back into active catalog stock.
                </p>

                <div>
                  <label className="block font-medium text-slate-700 text-xs mb-1">Cancellation Reason *</label>
                  <textarea
                    rows={3}
                    required
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="e.g. Customer requested cancellation prior to international shipping."
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs outline-none focus:border-slate-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setCancellingOrder(null)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50"
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

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit Order: {editingOrder.orderNumber}</h3>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Order Status</label>
                <select
                  value={editingOrder.orderStatus}
                  onChange={(e) => setEditingOrder({ ...editingOrder, orderStatus: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
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
                <label className="block font-medium text-slate-700 mb-1">Payment Status</label>
                <select
                  value={editingOrder.paymentStatus}
                  onChange={(e) => setEditingOrder({ ...editingOrder, paymentStatus: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                >
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={editingOrder.trackingNumber || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, trackingNumber: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Customer Phone</label>
                <input
                  type="text"
                  value={editingOrder.customerPhone || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, customerPhone: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Staff Internal Notes</label>
                <textarea
                  rows={3}
                  value={editingOrder.internalNotes || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, internalNotes: e.target.value })}
                  placeholder="Notes for secretariat staff (e.g. buyer customs declaration, special packaging notes)..."
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:border-slate-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Attempt Warning Dialog */}
      {showDeleteAttemptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 text-rose-700">
              <span>⚠️</span> Order Deletion Prohibited
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Under Bhutanese commerce regulations and financial accounting standards, orders cannot be permanently deleted once generated.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 space-y-1">
              <p>
                To reverse this order, select <strong>Cancel Order</strong> instead. That will return all line items to active inventory and flag the order as CANCELLED in the immutable audit log.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDeleteAttemptModal(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

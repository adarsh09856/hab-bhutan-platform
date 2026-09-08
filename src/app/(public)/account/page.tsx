'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  MapPin, 
  Shield, 
  LogOut, 
  ExternalLink, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  User,
  Phone,
  FileText,
  Printer
} from 'lucide-react';

interface OrderItemData {
  id: string;
  code: string;
  name: string;
  priceUSD: number;
  quantity: number;
  product?: {
    images?: any;
    craftKey?: string;
  };
}

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: any;
  shippingMethod: string;
  shippingFeeUSD: number;
  trackingNumber: string | null;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  totalUSD: number;
  totalPaidCurrency: number;
  currencyUsed: string;
  createdAt: string;
  items: any;
  orderItems: OrderItemData[];
}

export default function AccountPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'orders' | 'address' | 'security'>('orders');
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  // Address form
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Thimphu',
    country: 'Bhutan',
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMsg, setAddressMsg] = useState('');

  // Password form
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const loadAccountData = async () => {
    try {
      setLoading(true);
      const [profileRes, ordersRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/orders'),
      ]);

      if (profileRes.status === 401) {
        router.push('/login');
        return;
      }

      if (profileRes.ok) {
        const pData = await profileRes.json();
        if (pData.success && pData.profile) {
          setProfile(pData.profile);
          setAddressForm({
            name: pData.profile.name || '',
            phone: pData.profile.phone || '',
            address: pData.profile.address || '',
            city: pData.profile.city || 'Thimphu',
            country: pData.profile.country || 'Bhutan',
          });
        }
      }

      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        if (oData.success) {
          setOrders(oData.orders || []);
        }
      }
    } catch (err) {
      console.error('Failed to load customer account:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccountData();
  }, []);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressMsg('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddressMsg('Delivery details saved successfully.');
        setProfile(data.profile);
      } else {
        setAddressMsg(data.error || 'Failed to save address.');
      }
    } catch {
      setAddressMsg('Connection error saving details.');
    } finally {
      setAddressSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (pwdForm.newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters long.');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setPwdSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPwdSuccess('Your password has been changed securely.');
        setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPwdError(data.error || 'Failed to change password.');
      }
    } catch {
      setPwdError('Connection error updating credentials.');
    } finally {
      setPwdSaving(false);
    }
  };

  const handleSignOut = () => {
    document.cookie = 'hab_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center font-figtree">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#8B2E24] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#6B5A4C]">Loading your account...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[85vh] bg-[#FBF9F5] py-8 sm:py-12 px-4 sm:px-6 lg:px-10 font-figtree">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* User Account Header Banner */}
        <div className="bg-white rounded-2xl border border-[#E4DDD1] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-bold text-xl shadow-md">
              {profile?.name ? profile.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-marcellus text-xl sm:text-2xl text-[#33261F]">
                  {profile?.name || 'Customer Account'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#EDE5D6] text-[#6B5A4C]">
                  {profile?.role?.name || 'Customer'}
                </span>
              </div>
              <p className="text-xs text-[#6B5A4C] mt-0.5">{profile?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="px-4 py-2 rounded-xl bg-[#EDE5D6]/60 hover:bg-[#EDE5D6] text-xs font-semibold text-[#33261F] transition-colors"
            >
              Browse Shop
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl border border-[#E4DDD1] hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold text-[#6B5A4C] transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E4DDD1] pb-px">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-[#8B2E24] text-[#8B2E24] bg-white'
                : 'border-transparent text-[#6B5A4C] hover:text-[#33261F]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('address')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'address'
                ? 'border-[#8B2E24] text-[#8B2E24] bg-white'
                : 'border-transparent text-[#6B5A4C] hover:text-[#33261F]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-[#8B2E24] text-[#8B2E24] bg-white'
                : 'border-transparent text-[#6B5A4C] hover:text-[#33261F]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security &amp; Password</span>
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E4DDD1] p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#EDE5D6]/60 flex items-center justify-center mx-auto text-[#8B2E24]">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="font-marcellus text-lg text-[#33261F]">No Orders Placed Yet</h3>
                <p className="text-xs text-[#6B5A4C] max-w-md mx-auto">
                  Explore our curated collections of authentic Bhutanese textiles, woodcarvings, metalwork, and botanical paper.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#72251D] text-white text-xs font-semibold shadow-xs"
                  >
                    <span>Start Shopping</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-[#E4DDD1] p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E4DDD1] gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-sm text-[#33261F]">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${
                            ord.orderStatus === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.orderStatus === 'SHIPPED'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6B5A4C] mt-1 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Placed on {new Date(ord.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {ord.trackingNumber && (
                        <Link
                          href={`/track-order?order=${encodeURIComponent(ord.orderNumber)}&email=${encodeURIComponent(ord.customerEmail)}`}
                          className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track: {ord.trackingNumber}</span>
                        </Link>
                      )}
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#8B2E24] font-mono">
                          ${ord.totalUSD.toFixed(2)} USD
                        </div>
                        {ord.totalPaidCurrency && (
                          <div className="text-[10.5px] text-[#6B5A4C] font-mono">
                            Nu. {ord.totalPaidCurrency.toLocaleString()} BTN
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {Array.isArray(ord.orderItems) && ord.orderItems.length > 0 ? (
                      ord.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs py-1.5"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-md bg-[#EDE5D6]/60 text-[#33261F] flex items-center justify-center font-bold text-[11px]">
                              {item.quantity}×
                            </span>
                            <div>
                              <span className="font-semibold text-[#33261F]">{item.name}</span>
                              <span className="text-[#A39281] ml-2 font-mono">({item.code})</span>
                            </div>
                          </div>
                          <span className="font-mono text-[#33261F]">${(item.priceUSD * item.quantity).toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#6B5A4C]">Order package contents verified.</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Delivery Address */}
        {activeTab === 'address' && (
          <div className="bg-white rounded-2xl border border-[#E4DDD1] p-6 sm:p-8 shadow-xs max-w-2xl">
            <h2 className="font-marcellus text-xl text-[#33261F] mb-1">
              Saved Delivery Address
            </h2>
            <p className="text-xs text-[#6B5A4C] mb-6">
              This address will automatically autofill during checkout so you can complete purchases with ease.
            </p>

            {addressMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-none" />
                <span>{addressMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                  Recipient Full Name
                </label>
                <input
                  type="text"
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                  Phone Number for Delivery Updates
                </label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="+975 1712 3456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                  Street Address &amp; House / Building
                </label>
                <input
                  type="text"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  placeholder="Norzin Lam, Building 4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                    City / Dzongkhag
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={addressSaving}
                className="py-2.5 px-5 rounded-xl bg-[#8B2E24] hover:bg-[#72251D] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {addressSaving ? 'Saving...' : 'Save Delivery Details'}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Security */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl border border-[#E4DDD1] p-6 sm:p-8 shadow-xs max-w-2xl">
            <h2 className="font-marcellus text-xl text-[#33261F] mb-1">
              Account Security &amp; Credentials
            </h2>
            <p className="text-xs text-[#6B5A4C] mb-6">
              Ensure your password is secure and at least 8 characters long.
            </p>

            {pwdError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-none" />
                <span>{pwdError}</span>
              </div>
            )}

            {pwdSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-none" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                  New Password (8+ Characters)
                </label>
                <input
                  type="password"
                  required
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DDD1] bg-[#FFFCF8] text-sm text-[#33261F] focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>

              <button
                type="submit"
                disabled={pwdSaving}
                className="py-2.5 px-5 rounded-xl bg-[#8B2E24] hover:bg-[#72251D] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {pwdSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

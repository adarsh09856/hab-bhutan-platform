'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PosDecommissionedPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/admin/orders');
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <div className="w-16 h-16 bg-amber-500/15 text-amber-300 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingBag className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold admin-title tracking-tight mb-3">
        In-Store POS Terminal Decommissioned
      </h1>
      <p className="admin-text text-sm leading-relaxed mb-6">
        Per Secretariat operational direction, the Handicrafts Association of Bhutan platform is scoped strictly for{' '}
        <strong>online e-commerce</strong> and centralized fulfillment. In-store retail cashiering is not supported.
        All customer purchases, fulfillment workflows, and Bhutan Post EMS dispatches are managed under Online Orders.
      </p>

      <div className="p-4 admin-panel border admin-border rounded-lg text-xs admin-muted font-mono mb-8 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-300" />
        Redirecting to Online Orders &amp; Fulfillment console...
      </div>

      <Link
        href="/admin/orders"
        className="admin-button-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-md shadow transition-colors"
      >
        Go to Online Orders &amp; Fulfillment
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

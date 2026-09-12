import React from 'react';
import '@/styles/globals.css';
import '@/styles/admin.css';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="hab-admin min-h-screen bg-[#020617] text-slate-100 antialiased">
      {children}
    </div>
  );
}
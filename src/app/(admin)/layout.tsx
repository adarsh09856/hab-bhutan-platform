import React from 'react';
import '@/styles/globals.css';
import '@/styles/admin.css';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="hab-admin min-h-screen bg-[#020617] text-slate-100 antialiased"
      style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc' }}
    >
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.style.backgroundColor='#020617';document.body.style.backgroundColor='#020617';document.body.classList.add('hab-admin-body');`,
        }}
      />
      {children}
    </div>
  );
}

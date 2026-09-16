import React from 'react';
import '@/styles/globals.css';
import '@/styles/admin.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="hab-admin min-h-screen bg-slate-50 text-slate-900 antialiased"
      style={{ backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a', paddingTop: 0, marginTop: 0 }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `html, body { padding-top: 0px !important; margin-top: 0px !important; background-color: #f8fafc !important; }`,
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.style.backgroundColor='#f8fafc';document.body.style.backgroundColor='#f8fafc';document.body.classList.add('hab-admin-body');document.body.classList.remove('has-admin-live-bar');document.body.style.paddingTop='0px';document.body.style.marginTop='0px';`,
        }}
      />
      {children}
    </div>
  );
}

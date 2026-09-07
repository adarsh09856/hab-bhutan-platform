import React from 'react';
import UtilityBar from '@/components/public/UtilityBar';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen min-w-[1200px] flex flex-col bg-[#F4F0E7] text-[#33261F]">
      <UtilityBar />
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

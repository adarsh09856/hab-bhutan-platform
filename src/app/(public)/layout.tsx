import React from 'react';
import '@/styles/client-hab.css';
import AdminLiveBar from '@/components/public/AdminLiveBar';
import UtilityBar from '@/components/public/UtilityBar';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import AdminDrawer from '@/components/public/AdminDrawer';
import AskHabAssistant from '@/components/public/AskHabAssistant';
import DesignTweaks from '@/components/public/DesignTweaks';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-[#F4F0E7] text-[#33261F]">
      <AdminLiveBar />
      <UtilityBar />
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
      <AdminDrawer />
      <AskHabAssistant />
      <DesignTweaks />
    </div>
  );
}


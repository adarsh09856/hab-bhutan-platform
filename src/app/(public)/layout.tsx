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
    <div className="min-h-screen w-full flex flex-col bg-[#F4F0E7] text-[#33261F] overflow-x-clip">
      <AdminLiveBar />
      <UtilityBar />
      <Header />
      <div className="hab-public-shell flex-1 w-full overflow-x-clip">{children}</div>
      <Footer />
      <AdminDrawer />
      <AskHabAssistant />
      <DesignTweaks />
    </div>
  );
}


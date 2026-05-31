// src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function MainLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] font-sans antialiased text-slate-800">
      {/* Sidebar - Menu Navigasi Samping */}
      <Sidebar />
      
      {/* Konten Kanan Utama */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Header - Bar Pencarian & Notifikasi */}
        <Header />
        
        {/* Viewport Konten Halaman */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 animate-fade-in">
          <Outlet />
        </main>
        
        {/* Footer Hak Cipta */}
        <Footer />
      </div>
    </div>
  );
}

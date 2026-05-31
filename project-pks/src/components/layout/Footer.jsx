// src/components/layout/Footer.jsx
export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="h-14 bg-white border-t border-slate-100 px-6 sm:px-8 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest flex-shrink-0">
      <div>
        © {currentYear} PKS Management System - Direktorat Operasional Jasa Raharja.
      </div>
      <div className="hidden sm:block text-right">
        Secure Administrative Portal
      </div>
    </footer>
  );
}

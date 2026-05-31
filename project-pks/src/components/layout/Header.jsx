// src/components/layout/Header.jsx
import { Search, Bell, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification';

export default function Header() {
  const navigate = useNavigate();
  const { getUnreadCount } = useNotification();
  const unreadCount = getUnreadCount();

  return (
    <header className="h-18 bg-white border-b border-slate-100 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 flex-shrink-0">
      {/* Global Search Bar */}
      <div className="flex-1 max-w-md relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003b87] transition-colors">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Cari data PKS, Perusahaan, atau Dokumen..."
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-[#003b87] transition-all"
        />
      </div>

      {/* Utilities (Notification Bell, Profile Info) */}
      <div className="flex items-center gap-4">
        {/* Help Circle */}
        <button className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer hidden sm:block">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notifications Icon with Badge */}
        <button
          onClick={() => navigate('/notifikasi')}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 block w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          )}
        </button>

        {/* Vertical Separator */}
        <div className="h-6 w-[1px] bg-slate-100 hidden sm:block"></div>

        {/* Date Display */}
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HARI INI</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </header>
  );
}

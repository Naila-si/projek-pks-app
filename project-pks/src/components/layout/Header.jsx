// src/components/layout/Header.jsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Bell} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification';

export default function Header() {
  const navigate = useNavigate();
  const { getUnreadCount, notifications } = useNotification();
  const unreadCount = getUnreadCount();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter and limit to top 3 relevant notifications (Segera Berakhir / Berakhir)
  const latestNotifications = useMemo(() => {
    const filtered = notifications.filter(notif => 
      notif.status_pks === 'Segera Berakhir' || notif.status_pks === 'Berakhir'
    );
    return filtered.slice(0, 3);
  }, [notifications]);

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
        {/* Notifications Icon with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer relative focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 block w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            )}
          </button>

          {isOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl bg-white border border-slate-100 z-50 animate-fade-in flex flex-col overflow-hidden">
              {/* Header Dropdown */}
              <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Notifikasi Baru</span>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0">
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* List of latest notifications */}
              <div className="divide-y divide-slate-50 max-h-60 overflow-y-auto">
                {latestNotifications.length > 0 ? (
                  latestNotifications.map((notif, index) => {
                    const isSoon = notif.status_pks === 'Segera Berakhir';
                    const dotColor = isSoon ? 'bg-amber-500' : 'bg-rose-500';
                    return (
                      <div 
                        key={index} 
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/notifikasi');
                        }}
                        className="px-4 py-3 hover:bg-slate-50/50 transition-colors cursor-pointer text-left space-y-1 block w-full"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`}></span>
                          <span className="font-bold text-slate-800 text-xs truncate max-w-[160px] flex-1">{notif.nama_perusahaan}</span>
                          <span className={`text-[8px] font-black px-1 py-0.2 rounded uppercase flex-shrink-0 ${
                            isSoon ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {isSoon ? 'Segera Berakhir' : 'Berakhir'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono truncate">No. {notif.nomor_pks}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-6 text-center text-slate-400 font-semibold text-xs leading-relaxed">
                    Tidak ada notifikasi baru.
                  </div>
                )}
              </div>

              {/* Bottom Link */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifikasi');
                }}
                className="w-full text-center py-2.5 bg-slate-50 hover:bg-slate-100 text-[#003b87] hover:text-[#002d69] font-bold text-xs rounded-b-2xl border-t border-slate-100 transition-colors cursor-pointer focus:outline-none"
              >
                Lihat Semua Notifikasi
              </button>
            </div>
          )}
        </div>

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

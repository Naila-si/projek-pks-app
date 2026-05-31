// src/components/layout/Sidebar.jsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileSignature, 
  Building2, 
  Bell, 
  Calendar, 
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useNotification } from '../../hooks/useNotification';

export default function Sidebar() {
  const navigate = useNavigate();
  const { getUnreadCount } = useNotification();
  const unreadCount = getUnreadCount();
  const [isHovered, setIsHovered] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Konfigurasi Mode Hover:
  // - false (Rekomendasi/Standar UX): Sidebar menciut (collapsed) secara default, dan melebar saat kursor mengarah ke sidebar.
  // - true: Sidebar lebar secara default, dan menciut (collapsed) saat kursor mengarah ke sidebar.
  const COLLAPSE_ON_HOVER = false;

  const isCollapsed = COLLAPSE_ON_HOVER ? isHovered : !isHovered;

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Data PKS',
      path: '/pks',
      icon: FileSignature
    },
    {
      name: 'Data Perusahaan',
      path: '/perusahaan',
      icon: Building2
    },
    {
      name: 'Notifikasi',
      path: '/notifikasi',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null
    },
  ];

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 flex-shrink-0 z-30 transition-[width] duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo & Title */}
      <div className={`border-b border-slate-50 flex flex-col gap-1 transition-[padding] duration-300 ease-in-out ${isCollapsed ? 'p-4' : 'p-6'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-xl bg-[#e8f1fc] flex items-center justify-center text-[#003b87] border border-blue-100 shadow-inner flex-shrink-0">
            <span className="font-extrabold text-lg tracking-wider">JR</span>
          </div>
          <div className={`transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-36 opacity-100 ml-3'}`}>
            <h1 className="font-extrabold text-[#003b87] text-base tracking-tight leading-none">Manajemen</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">PKS</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className={`flex-1 py-6 space-y-1.5 overflow-y-auto transition-[padding] duration-300 ease-in-out ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {menuItems.map((item, index) => {
          const isPlaceholder = item.path === '#';
          
          const linkClass = ({ isActive }) => {
            const baseClass = "flex items-center transition-[width,padding,margin] duration-300 group overflow-hidden text-sm font-semibold";
            const stateClass = isCollapsed
              ? (isActive ? "bg-[#e8f1fc] text-[#003b87] border border-blue-200/60 w-12 h-12 justify-center mx-auto rounded-full" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 w-12 h-12 justify-center mx-auto rounded-full")
              : (isActive ? "bg-[#e8f1fc] text-[#003b87] border-l-4 border-[#003b87] pl-3 pr-4 py-3 justify-between rounded-xl" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 px-4 py-3 justify-between rounded-xl");
            return `${baseClass} ${stateClass}`;
          };

          const placeholderClass = isCollapsed
            ? "flex items-center justify-center w-12 h-12 text-sm font-semibold rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 cursor-not-allowed group overflow-hidden mx-auto"
            : "flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 cursor-not-allowed group overflow-hidden";

          return (
            <div key={index} className="w-full">
              {isPlaceholder ? (
                <div className={placeholderClass} title={isCollapsed ? `${item.name} (Segera)` : undefined}>
                  {isCollapsed ? (
                    <div className="relative flex items-center justify-center w-full h-full">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center flex-1 min-w-0">
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className={`transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap text-left ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-32 opacity-100 ml-3'}`}>
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0">Segera</span>
                    </>
                  )}
                </div>
              ) : (
                <NavLink to={item.path} className={linkClass} title={isCollapsed ? item.name : undefined}>
                  {isCollapsed ? (
                    <div className="relative flex items-center justify-center w-full h-full">
                      <div className="relative w-5 h-5">
                        <item.icon className="w-5 h-5 group-hover:scale-105 transition-transform" />
                        {/* Tanda notifikasi berupa dot merah berdenyut nempel pas di dekat ikon bel */}
                        {item.name === 'Notifikasi' && item.badge && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 border border-white rounded-full flex items-center justify-center text-[7.5px] text-white font-extrabold shadow-sm animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <item.icon className="w-5 h-5 group-hover:scale-105 transition-transform" />
                        </div>
                        <span className={`transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap text-left ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-32 opacity-100 ml-3'}`}>
                          {item.name}
                        </span>
                      </div>
                      {item.badge && (
                        <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full min-w-5 text-center shadow-sm flex-shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>

      {/* Admin Profile & Logout Section at Bottom */}
      <div className={`border-t border-slate-50 bg-slate-50/50 transition-[padding] duration-300 ease-in-out ${isCollapsed ? 'p-3' : 'p-4'}`}>
        <div className={`flex items-center py-2 mb-3 ${isCollapsed ? 'justify-center px-0' : 'px-2 gap-3 justify-start'}`}>
          <div className="w-8 h-8 rounded-full bg-[#003b87] flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
            AD
          </div>
          <div className={`transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap text-left ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-40 opacity-100 ml-3'}`}>
            <div className="flex items-center gap-1">
              <h4 className="text-xs font-bold text-slate-800 leading-none truncate">
                Administrator
              </h4>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            </div>
            <p className="text-[9px] font-medium text-slate-400 mt-1 truncate">
              adminpks@jasaraharja.co.id
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className={`flex items-center font-bold text-rose-600 hover:bg-rose-50 transition-all duration-300 cursor-pointer ${
            isCollapsed 
              ? 'w-12 h-12 justify-center mx-auto text-sm rounded-full' 
              : 'w-full px-4 py-2.5 text-xs gap-3 justify-start rounded-xl'
          }`}
          title={isCollapsed ? "Keluar Sistem" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className={`transition-[width,opacity,margin] duration-300 ease-in-out overflow-hidden whitespace-nowrap text-left ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-32 opacity-100 ml-3'}`}>
            Keluar Sistem
          </span>
        </button>
      </div>
      
      {/* Logout Confirmation Modal Portal */}
      {showLogoutModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 animate-scale-in text-center">
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto mb-4 shadow-sm shadow-rose-500/10">
              <LogOut className="w-6 h-6" />
            </div>
            
            {/* Title & Desc */}
            <h3 className="font-extrabold text-slate-800 text-lg mb-2">Konfirmasi Keluar</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">
              Apakah Anda yakin ingin keluar dari sistem <span className="text-[#003b87] font-bold">PKS Management</span>?
            </p>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer transition-colors focus:outline-none"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-lg shadow-rose-600/10 focus:outline-none"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
}

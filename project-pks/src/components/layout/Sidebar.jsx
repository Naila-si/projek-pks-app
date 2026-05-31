// src/components/layout/Sidebar.jsx
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

  const handleLogout = () => {
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
    {
      name: 'Kalender',
      path: '#', // Placeholder sesuai gambar
      icon: Calendar
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 flex-shrink-0 z-30">
      {/* Brand Logo & Title */}
      <div className="p-6 border-b border-slate-50 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e8f1fc] flex items-center justify-center text-[#003b87] border border-blue-100 shadow-inner">
            <span className="font-extrabold text-lg tracking-wider">JR</span>
          </div>
          <div>
            <h1 className="font-extrabold text-[#003b87] text-base tracking-tight leading-none">PKS</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isPlaceholder = item.path === '#';
          
          const linkClass = ({ isActive }) => {
            const baseClass = "flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group";
            if (isPlaceholder) {
              return `${baseClass} text-slate-400 hover:bg-slate-50 hover:text-slate-600 cursor-not-allowed`;
            }
            return isActive 
              ? `${baseClass} bg-[#e8f1fc] text-[#003b87] border-l-4 border-[#003b87] pl-3`
              : `${baseClass} text-slate-500 hover:bg-slate-50 hover:text-slate-800`;
          };

          return (
            <div key={index}>
              {isPlaceholder ? (
                <div className="flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 cursor-not-allowed group">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Soon</span>
                </div>
              ) : (
                <NavLink to={item.path} className={linkClass}>
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 flex-shrink-0 group-hover:scale-105 transition-transform" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full min-w-5 text-center shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>

      {/* Admin Profile & Logout Section at Bottom */}
      <div className="p-4 border-t border-slate-50 bg-slate-50/50">
        <div className="flex items-center gap-3 px-2 py-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#003b87] flex items-center justify-center text-white text-xs font-bold shadow-sm">
            AD
          </div>
         <div className="overflow-hidden">
          <div className="flex items-center gap-1">
            <h4 className="text-xs font-bold text-slate-800 leading-none truncate">
              Administrator
            </h4>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          </div>

          <p className="text-[9px] font-medium text-slate-400 mt-1 truncate">
            adminpks@jasaraharja.co.id
          </p>
        </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
  );
}

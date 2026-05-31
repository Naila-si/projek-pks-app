// src/pages/NotifikasiPage.jsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  AlertTriangle, 
  XCircle, 
  ArrowRight,
  CheckCircle,
  Check
} from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import { usePKS } from '../hooks/usePKS';
import { formatDate } from '../utils/formatDate';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import DetailPKSModal from '../components/pks/DetailPKSModal';

export default function NotifikasiPage() {
  const navigate = useNavigate();
  const { notifications, markAsRead } = useNotification();
  const { pksList } = usePKS();

  // State Modal Detail PKS (untuk tombol Tinjau Data)
  const [isPKSDetailOpen, setIsPKSDetailOpen] = useState(false);
  const [selectedPKSId, setSelectedPKSId] = useState(null);

  // 1. Hitung Statistik Ringkasan PKS untuk Kartu
  const stats = useMemo(() => {
    let active = 0;
    let soon = 0;
    let expired = 0;

    pksList.forEach(p => {
      const status = p.status_pks;
      if (status === 'Aktif') active++;
      else if (status === 'Segera Berakhir') soon++;
      else if (status === 'Berakhir') expired++;
    });

    return { active, soon, expired };
  }, [pksList]);

  // 2. Filter notifikasi agar HANYA MENAMPILKAN status: "Segera Berakhir" dan "Berakhir"
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => 
      notif.status_pks === 'Segera Berakhir' || notif.status_pks === 'Berakhir'
    );
  }, [notifications]);

  const handleActionClick = (notif) => {
    // Tandai dibaca saat diklik aksinya
    markAsRead(notif.id_notifikasi);
    
    if (notif.aksi_tipe === 'perusahaan') {
      // Perpanjang -> Arahkan ke Detail Perusahaan
      navigate(`/perusahaan/${notif.aksi_id}`);
    } else {
      // Tinjau Data -> Tampilkan Detail PKS Modal
      setSelectedPKSId(notif.aksi_id);
      setIsPKSDetailOpen(true);
    }
  };

  const handleMarkAllRead = () => {
    notifications.forEach(n => {
      if (!n.status_baca) markAsRead(n.id_notifikasi);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-none">
            Notifikasi Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-2">
            Masa berlaku perjanjian kerja sama dipantau secara otomatis oleh server setiap hari.
          </p>
        </div>

        {filteredNotifications.some(n => !n.status_baca) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Tandai Semua Dibaca</span>
          </button>
        )}
      </div>

      {/* Grid Kartu Ringkasan Notifikasi */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* PKS AKTIF */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider block">TOTAL PKS AKTIF</span>
            <span className="text-2xl font-extrabold text-slate-800 block">{stats.active}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-transparent">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* PKS SEGERA BERAKHIR */}
        <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider block">PKS SEGERA BERAKHIR</span>
            <span className="text-2xl font-extrabold text-slate-800 block">{stats.soon}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-transparent">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* PKS BERAKHIR */}
        <div className="bg-white border border-rose-100 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider block">PKS BERAKHIR</span>
            <span className="text-2xl font-extrabold text-slate-800 block">{stats.expired}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-transparent">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* List Notifikasi */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif, index) => {
            const isSoon = notif.status_pks === 'Segera Berakhir';
            
            const cardBg = notif.status_baca ? 'bg-white/80 opacity-75' : 'bg-white shadow-md shadow-slate-100/40 ring-1 ring-blue-50/50';
            const borderStyles = isSoon 
              ? 'border-l-4 border-l-amber-500 border border-slate-100' 
              : 'border-l-4 border-l-rose-500 border border-slate-100';

            const iconBg = isSoon ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600';
            const Icon = isSoon ? AlertTriangle : XCircle;

            return (
              <div 
                key={index}
                className={`${cardBg} ${borderStyles} rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5`}
              >
                {/* Info Notifikasi */}
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-slate-800 text-sm">{notif.nama_perusahaan}</h4>
                      <StatusBadge status={notif.status_pks} />
                      {!notif.status_baca && (
                        <span className="bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          Baru
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Nomor Surat: <span className="font-mono font-bold text-slate-700">{notif.nomor_pks}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Tanggal Berakhir: {formatDate(notif.tanggal_berakhir)}
                    </p>
                  </div>
                </div>

                {/* Tombol Aksi Berdasarkan Status */}
                <div className="flex-shrink-0 flex items-center gap-3">
                  <button
                    onClick={() => handleActionClick(notif)}
                    className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                      isSoon
                        ? 'bg-[#003b87] hover:bg-[#002d69] text-white shadow-md shadow-blue-900/10 hover:shadow-lg'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white'
                    }`}
                  >
                    <span>{isSoon ? 'Perpanjang PKS' : 'Tinjau Data PKS'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="Tidak Ada Notifikasi Baru"
            description="Luar biasa! Seluruh dokumen kerja sama (PKS) aktif saat ini dalam masa berlaku yang aman."
            icon={Bell}
          />
        )}
      </div>

      {/* Modal Detail PKS */}
      {isPKSDetailOpen && (
        <DetailPKSModal
          pksId={selectedPKSId}
          onClose={() => setIsPKSDetailOpen(false)}
        />
      )}

    </div>
  );
}

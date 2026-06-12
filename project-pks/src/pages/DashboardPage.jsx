// src/pages/DashboardPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Building2, 
  AlertTriangle, 
  XCircle, 
  Plus, 
  ArrowRight,
  Edit2
} from 'lucide-react';
import { usePKS } from '../hooks/usePKS';
import { useCompany } from '../hooks/useCompany';
import { formatDate } from '../utils/formatDate';
import StatusBadge from '../components/common/StatusBadge';
import PKSBarChart from '../components/dashboard/PKSBarChart';
import PKSPieChart from '../components/dashboard/PKSPieChart';
import AddPKSModal from '../components/pks/AddPKSModal';
import EditPKSModal from '../components/pks/EditPKSModal';
import { api } from '../services/api';
import { toast } from '../utils/toast';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { pksList, addPKS, editPKS } = usePKS();
  const { companies, refreshCompanies } = useCompany();
  
  const [stats, setStats] = useState({
    total_pks: 0,
    total_perusahaan: 0,
    total_pks_segera_berakhir: 0,
    total_pks_berakhir: 0,
    total_pks_aktif: 0,
    data_grafik_bidang_pks: [
      { bidang: 'IW', jumlah: 0 },
      { bidang: 'SW', jumlah: 0 },
      { bidang: 'pelayanan', jumlah: 0 },
      { bidang: 'umum', jumlah: 0 },
      { bidang: 'HC', jumlah: 0 },
      { bidang: 'keuangan', jumlah: 0 },
      { bidang: 'tjsl', jumlah: 0 }
    ],
    data_grafik_status_pks: [
      { status: 'Aktif', jumlah: 0 },
      { status: 'Segera Berakhir', jumlah: 0 },
      { status: 'Berakhir', jumlah: 0 }
    ],
    daftar_pks_segera_berakhir: []
  });
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPKSId, setSelectedPKSId] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard');
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Perbarui statistik saat ada perubahan data PKS atau perusahaan
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchDashboardData();
    });
  }, [fetchDashboardData, pksList, companies]);

  // Mengambil data PKS yang mendekati berakhir
  const expiringPKS = useMemo(() => {
    return (stats.daftar_pks_segera_berakhir || []).map(p => ({
      ...p,
      id: p.id_pks,
      nama_perusahaan: p.perusahaan?.nama_perusahaan || '-',
      alamat_perusahaan: p.perusahaan?.alamat || '',
      status: p.status_pks
    }));
  }, [stats.daftar_pks_segera_berakhir]);

  const handleAddPKSSubmit = (pksData, companyData) => {
    // Tutup modal secara instan & tampilkan notifikasi sukses
    setIsAddModalOpen(false);
    toast.success('Data PKS baru berhasil ditambahkan.', 'Berhasil');
    
    // Kirim data ke backend di background
    addPKS(pksData, companyData).then(() => {
      refreshCompanies();
    }).catch(err => {
      toast.error(err.message || 'Gagal menyimpan PKS baru.');
    });
  };

  const handleEditClick = (id) => {
    setSelectedPKSId(id);
    setIsEditModalOpen(true);
  };

  const handleEditPKSSubmit = (updatedPKS) => {
    // Tutup modal secara instan & tampilkan notifikasi sukses
    setIsEditModalOpen(false);
    toast.success('Perubahan data PKS berhasil disimpan.', 'Berhasil');
    
    // Kirim data ke backend di background
    editPKS(selectedPKSId, updatedPKS).catch(err => {
      toast.error(err.message || 'Gagal memperbarui data PKS.');
    });
  };

  const cardsInfo = [
    {
      title: 'TOTAL PKS',
      value: stats.total_pks,
      icon: FileText,
      iconColor: 'text-[#003b87]',
      bgColor: 'bg-[#e8f1fc]',
      borderColor: 'border-blue-100'
    },
    {
      title: 'TOTAL PERUSAHAAN',
      value: stats.total_perusahaan,
      icon: Building2,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100'
    },
    {
      title: 'PKS SEGERA BERAKHIR',
      value: stats.total_pks_segera_berakhir,
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    },
    {
      title: 'PKS BERAKHIR',
      value: stats.total_pks_berakhir,
      icon: XCircle,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100'
    }
  ];

  // Resolve counts for the charts
  const bidangData = stats.data_grafik_bidang_pks || [];
  
  const aktifCount = stats.data_grafik_status_pks.find(item => item.status === 'Aktif')?.jumlah || 0;
  const segeraBerakhirCount = stats.data_grafik_status_pks.find(item => item.status === 'Segera Berakhir')?.jumlah || 0;
  const berakhirCount = stats.data_grafik_status_pks.find(item => item.status === 'Berakhir')?.jumlah || 0;

  if (loading && stats.total_pks === 0) {
    return (
      <div className="p-12 text-center text-slate-400 font-semibold flex flex-col items-center justify-center gap-3 min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#003b87] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs">Memuat dashboard analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Message & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Selamat Pagi, Administrator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1.5">
            Berikut adalah ringkasan pengelolaan Perjanjian Kerja Sama (PKS) hari ini.
          </p>
        </div>
        
        {/* Tombol Aksi Dashboard */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003b87] hover:bg-[#002d69] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/10 hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah PKS Baru</span>
          </button>
          
          <button
            onClick={() => navigate('/perusahaan')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Data Perusahaan</span>
          </button>
        </div>
      </div>

      {/* Grid Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardsInfo.map((card, index) => (
          <div 
            key={index} 
            className={`bg-white border ${card.borderColor} rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center justify-between transition-all duration-300 hover:shadow-[0_10px_35px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 group`}
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider block">
                {card.title}
              </span>
              <span className="text-3xl font-extrabold text-slate-800 block tracking-tight">
                {card.value.toLocaleString('id-ID')}
              </span>
            </div>
            
            <div className={`w-12 h-12 rounded-xl ${card.bgColor} ${card.iconColor} flex items-center justify-center border border-transparent group-hover:scale-105 transition-transform duration-300`}>
              <card.icon className="w-6 h-6" strokeWidth={2} />
            </div>
          </div>
        ))}
      </div>

      {/* Grid Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PKSBarChart 
          bidangData={bidangData} 
        />
        <PKSPieChart 
          aktifCount={aktifCount} 
          segeraBerakhirCount={segeraBerakhirCount} 
          berakhirCount={berakhirCount} 
        />
      </div>

      {/* Tabel PKS Segera Berakhir */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-bold text-slate-800 text-base">PKS Yang Akan Segera Berakhir</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Segera lakukan perpanjangan untuk menjaga kelancaran operasional mitra.</p>
          </div>
          
          <button
            onClick={() => navigate('/pks')}
            className="text-xs font-bold text-[#003b87] hover:text-[#002d69] flex items-center gap-1 group cursor-pointer"
          >
            <span>Lihat Semua Data</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100">
                <th className="py-4.5 px-6">Nama Perusahaan</th>
                <th className="py-4.5 px-6">Nomor PKS</th>
                <th className="py-4.5 px-6">Tanggal Berakhir</th>
                <th className="py-4.5 px-6">Status</th>
                <th className="py-4.5 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {expiringPKS.length > 0 ? (
                expiringPKS.map((pks, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-bold text-slate-800">{pks.nama_perusahaan}</div>
                        {pks.alamat_perusahaan && (
                          <div className="text-[10px] text-slate-400 font-light mt-0.5">{pks.alamat_perusahaan}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500 font-semibold">{pks.nomor_pks}</td>
                    <td className="py-4 px-6 font-semibold text-slate-600">{formatDate(pks.tanggal_berakhir)}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={pks.status} />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleEditClick(pks.id)}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 hover:bg-[#e8f1fc] hover:text-[#003b87] text-slate-400 transition-colors cursor-pointer"
                        title="Edit PKS"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 px-6 text-center text-slate-400 font-semibold">
                    Tidak ada PKS yang segera berakhir atau kedaluwarsa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah PKS */}
      {isAddModalOpen && (
        <AddPKSModal
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddPKSSubmit}
        />
      )}

      {/* Modal Edit PKS */}
      {isEditModalOpen && (
        <EditPKSModal
          pksId={selectedPKSId}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditPKSSubmit}
        />
      )}

    </div>
  );
}

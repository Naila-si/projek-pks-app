// src/pages/DetailPerusahaanPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  FileText, 
  Eye
} from 'lucide-react';
import { useCompany } from '../hooks/useCompany';
import { formatDate } from '../utils/formatDate';
import StatusBadge from '../components/common/StatusBadge';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import DetailPKSModal from '../components/pks/DetailPKSModal';

export default function DetailPerusahaanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCompanyById } = useCompany();
  
  const [company, setCompany] = useState(null);
  const [companyPKS, setCompanyPKS] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Modal Detail PKS
  const [isPKSDetailOpen, setIsPKSDetailOpen] = useState(false);
  const [selectedPKSId, setSelectedPKSId] = useState(null);

  useEffect(() => {
    if (id) {
      Promise.resolve().then(() => {
        setLoading(true);
      });
      getCompanyById(id).then(data => {
        if (data) {
          setCompany(data);
          const mappedPks = (data.data_pks || []).map(p => ({
            ...p,
            id: p.id_pks
          }));
          setCompanyPKS(mappedPks);
        }
      }).catch(err => {
        console.error('Failed to load company details:', err);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [id, getCompanyById]);

  // Kalkulasi status akumulatif PKS milik perusahaan ini
  const overallStatus = useMemo(() => {
    if (companyPKS.length === 0) return 'Tidak Aktif';
    
    const statuses = companyPKS.map(p => p.status_pks);
    if (statuses.includes('Berakhir')) return 'Berakhir';
    if (statuses.includes('Segera Berakhir')) return 'Segera Berakhir';
    return 'Aktif';
  }, [companyPKS]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-semibold flex flex-col items-center justify-center gap-3 min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#003b87] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs">Memuat detail profil perusahaan...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/perusahaan')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Data Perusahaan</span>
        </button>
        <div className="bg-white border border-slate-100 p-12 rounded-2xl text-center">
          <p className="text-slate-400 font-semibold">Data perusahaan tidak ditemukan atau ID tidak terdaftar.</p>
        </div>
      </div>
    );
  }

  const handlePKSRowClick = (pksId) => {
    setSelectedPKSId(pksId);
    setIsPKSDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Tombol Back & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => navigate('/perusahaan')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Data Perusahaan</span>
        </button>
        
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-xs font-semibold text-slate-600">
          <span>Status Akumulatif:</span>
          <StatusBadge status={overallStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL KIRI: PROFIL INFORMASI PERUSAHAAN */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-full">
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-50">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-[#003b87] flex items-center justify-center font-black text-xl shadow-inner mb-4">
                {company.nama_perusahaan ? company.nama_perusahaan.slice(0, 2).toUpperCase() : 'CO'}
              </div>
              <h3 className="font-extrabold text-slate-800 text-base leading-snug">{company.nama_perusahaan}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Mitra Resmi Jasa Raharja</p>
            </div>

            {/* Kontak Detail */}
            <div className="py-6 space-y-4 text-xs font-semibold text-slate-600">
              {/* Nama Pengelola */}
              <div>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1">Nama Pengelola</span>
                <div className="flex items-center gap-2.5 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{company.nama_pengelola || 'Belum Diisi'}</span>
                </div>
              </div>

              {/* Nomor HP */}
              <div>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1">Nomor Telepon</span>
                <div className="flex items-center gap-2.5 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{company.nomor_telepon || company.telepon || 'Belum Diisi'}</span>
                </div>
              </div>

              {/* Email */}
              <div>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1">Email Perusahaan</span>
                <div className="flex items-center gap-2.5 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{company.email || 'Belum Diisi'}</span>
                </div>
              </div>

              {/* Alamat */}
              <div>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1">Alamat Kantor</span>
                <div className="flex items-start gap-2.5 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{company.alamat || 'Belum Diisi'}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* PANEL KANAN: TABEL RIWAYAT PKS PERUSAHAAN */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden h-full flex flex-col justify-between">
            <div>
              <div className="px-6 py-5 border-b border-slate-50">
                <h3 className="font-bold text-slate-800 text-base">Riwayat PKS Perusahaan</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Daftar historis seluruh kontrak perjanjian kerja sama</p>
              </div>

              {companyPKS.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100">
                        <th className="py-4 px-6">Nomor PKS</th>
                        <th className="py-4 px-6 text-center">Jenis PKS</th>
                        <th className="py-4 px-6">Mulai Berlaku</th>
                        <th className="py-4 px-6">Berakhir Berlaku</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-center w-20">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {companyPKS.map((pks, index) => {
                        const status = pks.status_pks;
                        return (
                          <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                            <td className="py-4 px-6 font-mono text-slate-800 font-bold">{pks.nomor_pks}</td>
                            <td className="py-4 px-6 text-center">
                              <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                                {pks.jenis_pks}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-500">{formatDate(pks.tanggal_mulai)}</td>
                            <td className="py-4 px-6 text-slate-600 font-bold">{formatDate(pks.tanggal_berakhir)}</td>
                            <td className="py-4 px-6">
                              <StatusBadge status={status} />
                            </td>
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => handlePKSRowClick(pks.id)}
                                className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-[#e8f1fc] hover:text-[#003b87] text-slate-400 transition-colors cursor-pointer"
                                title="Detail PKS Lengkap"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8">
                  <EmptyState
                    title="Belum Ada Dokumen PKS"
                    description="Mitra perusahaan ini belum terdaftar di dokumen PKS aktif manapun."
                    icon={FileText}
                  />
                </div>
              )}
            </div>

            {/* Total Indicator */}
            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/20 text-[10px] font-bold text-slate-400 tracking-wider uppercase flex justify-between items-center">
              <span>Total Peringatan: {companyPKS.length} Kontrak</span>
              <span>Sinkron</span>
            </div>
          </div>
        </div>

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

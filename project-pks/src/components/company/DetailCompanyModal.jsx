// src/components/company/DetailCompanyModal.jsx
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Eye 
} from 'lucide-react';
import { useCompany } from '../../hooks/useCompany';
import { formatDate } from '../../utils/formatDate';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import DetailPKSModal from '../pks/DetailPKSModal';
import EmptyState from '../common/EmptyState';
import { toast } from '../../utils/toast';

export default function DetailCompanyModal({ companyId, onClose }) {
  const { getCompanyById } = useCompany();
  const [company, setCompany] = useState(null);
  const [companyPKS, setCompanyPKS] = useState([]);
  
  // State Modal Detail PKS
  const [isPKSDetailOpen, setIsPKSDetailOpen] = useState(false);
  const [selectedPKSId, setSelectedPKSId] = useState(null);

  useEffect(() => {
    if (companyId) {
      getCompanyById(companyId).then(data => {
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
        toast.error('Gagal memuat detail perusahaan.');
      });
    }
  }, [companyId, getCompanyById]);

  // Kalkulasi status akumulatif PKS milik perusahaan ini
  const overallStatus = useMemo(() => {
    if (companyPKS.length === 0) return 'Tidak Aktif';
    
    const statuses = companyPKS.map(p => p.status_pks);
    if (statuses.includes('Berakhir')) return 'Berakhir';
    if (statuses.includes('Segera Berakhir')) return 'Segera Berakhir';
    return 'Aktif';
  }, [companyPKS]);

  if (!company) return null;

  const handlePKSRowClick = (pksId) => {
    setSelectedPKSId(pksId);
    setIsPKSDetailOpen(true);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto glass-overlay flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003b87] flex items-center justify-center border border-blue-100">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">Detail Profil Perusahaan Mitra</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 font-sans">Informasi lengkap profil mitra dan riwayat kerja sama</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Scrollable Grid) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          
          {/* Header Status & Nama Perusahaan */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Organisasi / Perusahaan</span>
              <span className="text-base sm:text-lg font-bold text-[#003b87] block">
                {company.nama_perusahaan}
              </span>
            </div>
            <div>
              <StatusBadge status={overallStatus} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* KOLOM KIRI: PROFIL INFORMASI PERUSAHAAN */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-[#003b87] border-b border-blue-50 pb-2">
                <Building2 className="w-4.5 h-4.5" />
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider">I. Profil Perusahaan</h4>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                {/* Penanggung Jawab */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Penanggung Jawab (Pengelola)</span>
                  <p className="text-slate-800 text-sm font-bold leading-relaxed">{company.nama_pengelola || '-'}</p>
                </div>

                {/* Kontak & Email */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{company.nomor_telepon || company.telepon || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{company.email || '-'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-600 leading-relaxed">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{company.alamat || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: TABEL RIWAYAT PKS PERUSAHAAN */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-[#003b87] border-b border-blue-50 pb-2">
                <FileText className="w-4.5 h-4.5" />
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider">II. Riwayat Kontrak PKS</h4>
              </div>

              {companyPKS.length > 0 ? (
                <div className="space-y-3.5 max-h-[40vh] overflow-y-auto pr-1">
                  {companyPKS.map((pks, index) => {
                    const status = pks.status_pks;
                    return (
                      <div key={index} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-slate-200 transition-colors">
                        <div className="space-y-1 min-w-0">
                          <span className="font-mono text-xs font-bold text-slate-800 block truncate">{pks.nomor_pks}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            {pks.bidang} • S/D {formatDate(pks.tanggal_berakhir)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <StatusBadge status={status} />
                          <button
                            onClick={() => handlePKSRowClick(pks.id)}
                            className="p-1.5 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-[#003b87] hover:bg-blue-50 transition-all cursor-pointer"
                            title="Detail PKS Lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="Belum Ada Dokumen PKS"
                  description="Mitra perusahaan ini belum terdaftar di dokumen PKS aktif manapun."
                  icon={FileText}
                />
              )}
            </div>

          </div>

        </div>

        {/* Footer Modal Buttons */}
        <div className="px-6 py-4.5 border-t border-slate-100 flex items-center justify-end bg-slate-50/30 flex-shrink-0">
          <Button variant="primary" onClick={onClose}>
            Tutup Detail
          </Button>
        </div>

      </div>

      {/* Modal Detail PKS (di dalam modal detail perusahaan) */}
      {isPKSDetailOpen && (
        <DetailPKSModal
          pksId={selectedPKSId}
          onClose={() => setIsPKSDetailOpen(false)}
        />
      )}

    </div>,
    document.body
  );
}

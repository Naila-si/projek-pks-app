// src/components/pks/DetailAddendumModal.jsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Download, Eye, Calendar, ArrowRight } from 'lucide-react';
import { useAddendum } from '../../hooks/useAddendum';
import { formatDate, formatDateFull } from '../../utils/formatDate';
import { toast } from '../../utils/toast';
import Button from '../common/Button';

export default function DetailAddendumModal({ addendumId, onClose }) {
  const { getAddendumById } = useAddendum();
  const [addendum, setAddendum] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (addendumId) {
      getAddendumById(addendumId).then(data => {
        if (data) {
          setAddendum(data);
        }
      }).catch(err => {
        console.error('Failed to load addendum details:', err);
        toast.error('Gagal memuat detail addendum.');
      });
    }
  }, [addendumId, getAddendumById]);

  const handleDownload = async () => {
    if (!addendum || !addendum.id_addendum) {
      toast.error('Data Addendum tidak lengkap.');
      return;
    }

    try {
      setIsDownloading(true);
      const token = localStorage.getItem('pks_auth_token');
      
      const response = await fetch(`http://127.0.0.1:8000/api/addendum/${addendum.id_addendum}/download`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Berkas PDF addendum tidak ditemukan di server.');
        } else {
          throw new Error('Gagal mengunduh berkas addendum dari server.');
        }
      }

      const blob = await response.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      
      // Open preview in new tab
      window.open(downloadUrl, '_blank');
      toast.success('Berkas PDF Addendum berhasil dimuat.');
    } catch (err) {
      console.error('Download addendum error:', err);
      toast.error(err.message || 'Gagal memuat berkas addendum.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!addendum) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] overflow-y-auto glass-overlay flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-fade-in flex flex-col">
        
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003b87] flex items-center justify-center border border-blue-100">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Detail Dokumen Addendum</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 font-sans">Spesifikasi amandemen PKS</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs font-semibold text-slate-700 flex-1 overflow-y-auto">
          {/* Header Info */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Addendum</span>
            <span className="text-sm font-mono font-bold text-slate-800 block">{addendum.nomor_addendum}</span>
          </div>

          {/* Judul Addendum */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Judul Addendum</span>
            <p className="text-slate-800 text-sm font-extrabold leading-relaxed">{addendum.judul_addendum}</p>
          </div>

          {/* Masa Berlaku */}
          <div className="bg-[#e8f1fc] p-4 rounded-xl border border-blue-100 space-y-2">
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
              <span>Mulai Addendum</span>
              <span>Berakhir Addendum</span>
            </div>
            <div className="flex justify-between items-center text-xs font-extrabold text-[#003b87]">
              <span>{formatDate(addendum.tanggal_mulai)}</span>
              <ArrowRight className="w-4 h-4" />
              <span>{formatDate(addendum.tanggal_berakhir)}</span>
            </div>
          </div>

          {/* Tanggal Ditambahkan */}
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>Terdaftar Pada: {formatDateFull(addendum.created_at)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleDownload}
            icon={Download}
            disabled={isDownloading}
          >
            {isDownloading ? 'Memuat PDF...' : 'Unduh Berkas (.pdf)'}
          </Button>
          <Button variant="primary" onClick={onClose}>
            Tutup
          </Button>
        </div>

      </div>
    </div>,
    document.body
  );
}

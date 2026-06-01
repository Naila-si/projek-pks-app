// src/components/pks/DetailPKSModal.jsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Building2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Eye,
  ArrowRight,
  Download,
} from "lucide-react";
import { usePKS } from "../../hooks/usePKS";
import { toast } from "../../utils/toast";
import { formatDate, formatDateFull } from "../../utils/formatDate";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";

export default function DetailPKSModal({ pksId, onClose }) {
  const { getPKSById } = usePKS();
  const [pks, setPks] = useState(null);
  const [company, setCompany] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (pksId) {
      getPKSById(pksId).then(data => {
        if (data) {
          setPks(data);
          setCompany(data.perusahaan);
        }
      }).catch(err => {
        console.error('Failed to load PKS details:', err);
        toast.error('Gagal memuat detail PKS dari server.');
      });
    }
  }, [pksId, getPKSById]);

  if (!pks || !company) return null;

  const status = pks.status_pks;

  const handleDownload = async () => {
    const pksIdValue = pks?.id_pks || pks?.id;
    if (!pks || !pksIdValue) {
      toast.error('Data PKS tidak lengkap.');
      return;
    }

    try {
      setIsDownloading(true);
      const token = localStorage.getItem('pks_auth_token');
      
      const response = await fetch(`http://127.0.0.1:8000/api/pks/${pksIdValue}/download`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Berkas PDF tidak ditemukan di server.');
        } else if (response.status === 403) {
          throw new Error('Anda tidak memiliki akses untuk berkas ini.');
        } else {
          throw new Error('Gagal mengunduh berkas dari server.');
        }
      }

      const blob = await response.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      
      // Open in a new tab for previewing and downloading
      window.open(downloadUrl, '_blank');
      
      toast.success('Berkas PDF berhasil dimuat.');
    } catch (err) {
      console.error('Download error:', err);
      toast.error(err.message || 'Gagal memuat berkas PKS dari server.');
    } finally {
      setIsDownloading(false);
    }
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
              <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
                Detail Perjanjian Kerja Sama
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Informasi lengkap perjanjian dan data mitra
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isi Informasi (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Header Status & Nomor */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Nomor Registrasi PKS
              </span>
              <span className="text-base sm:text-lg font-mono font-bold text-slate-800 block">
                {pks.nomor_pks}
              </span>
            </div>
            <div>
              <StatusBadge status={status} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* KOLOM KIRI: DETAIL PKS */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-[#003b87] border-b border-blue-50 pb-2">
                <FileText className="w-4.5 h-4.5" />
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                  I. Spesifikasi Perjanjian
                </h4>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                {/* Judul PKS */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Judul Perjanjian
                  </span>
                  <p className="text-slate-800 text-sm leading-relaxed font-bold">
                    {pks.judul_pks}
                  </p>
                </div>

                {/* Jenis PKS & Objek */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Kategori PKS
                    </span>
                    <p className="text-slate-800 font-extrabold text-sm">
                      {pks.jenis_pks}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Jenis Objek
                    </span>
                    <p className="text-slate-800 font-extrabold text-sm">
                      {pks.jenis_objek}
                    </p>
                  </div>
                </div>

                {/* Periode Berlaku */}
                <div className="bg-[#e8f1fc] p-4 rounded-xl border border-blue-100 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                    <span>Mulai</span>
                    <span>Berakhir</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-extrabold text-[#003b87]">
                    <span>{formatDate(pks.tanggal_mulai)}</span>
                    <ArrowRight className="w-4 h-4" />
                    <span>{formatDate(pks.tanggal_berakhir)}</span>
                  </div>
                </div>

                {/* Tanggal Addendum */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Tanggal Addendum
                  </span>
                  <p className="text-slate-800 text-xs font-bold bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 inline-block font-mono">
                    {pks.tanggal_addendum
                      ? formatDateFull(pks.tanggal_addendum)
                      : "Belum Pernah Melakukan Addendum"}
                  </p>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: DETAIL PERUSAHAAN */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-[#003b87] border-b border-blue-50 pb-2">
                <Building2 className="w-4.5 h-4.5" />
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                  II. Profil Perusahaan Mitra
                </h4>
              </div>

              <div className="space-y-4.5 text-xs font-semibold text-slate-700">
                {/* Nama Perusahaan */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Nama Organisasi / Perusahaan
                  </span>
                  <p className="text-slate-800 text-sm font-extrabold">
                    {company.nama_perusahaan}
                  </p>
                </div>

                {/* Pengelola */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Penanggung Jawab (Pengelola)
                  </span>
                  <p className="text-slate-800 font-extrabold text-sm">
                    {company.nama_pengelola || "-"}
                  </p>
                </div>

                {/* Kontak & Email */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{company.nomor_telepon || company.telepon || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{company.email || "-"}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-600 leading-relaxed">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{company.alamat || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal Buttons */}
        <div className="px-6 py-4.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 flex-shrink-0">
          {/* Tombol Unduh Dokumen */}
          <Button
            variant="outline"
            onClick={handleDownload}
            icon={Download}
            disabled={isDownloading}
          >
            {isDownloading ? 'Memuat PDF...' : 'Unduh Berkas PKS (.pdf)'}
          </Button>

          <Button variant="primary" onClick={onClose}>
            Tutup Detail
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

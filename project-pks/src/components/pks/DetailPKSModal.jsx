// src/components/pks/DetailPKSModal.jsx
import { useState, useEffect, useCallback } from "react";
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
  Edit,
  Plus,
  Trash2,
} from "lucide-react";
import { usePKS } from "../../hooks/usePKS";
import { useAddendum } from "../../hooks/useAddendum";
import { toast } from "../../utils/toast";
import { formatDate, formatDateFull } from "../../utils/formatDate";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import EditPKSModal from "./EditPKSModal";
import AddAddendumModal from "./AddAddendumModal";
import EditAddendumModal from "./EditAddendumModal";
import DetailAddendumModal from "./DetailAddendumModal";

export default function DetailPKSModal({ pksId, onClose }) {
  const { getPKSById, editPKS, refreshPKS } = usePKS();
  const { addAddendum, editAddendum, deleteAddendum } = useAddendum();
  const [pks, setPks] = useState(null);
  const [company, setCompany] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // States for Addendum sub-modals
  const [isAddAddendumOpen, setIsAddAddendumOpen] = useState(false);
  const [isEditAddendumOpen, setIsEditAddendumOpen] = useState(false);
  const [isDetailAddendumOpen, setIsDetailAddendumOpen] = useState(false);
  const [selectedAddendumId, setSelectedAddendumId] = useState(null);

  const fetchDetails = useCallback(() => {
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

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleEditSubmit = (updatedPKS) => {
    const pksIdValue = pks?.id_pks || pks?.id;
    editPKS(pksIdValue, updatedPKS)
      .then(response => {
        if (response.success && response.data) {
          toast.success('Data PKS berhasil diperbarui.');
          setPks(response.data);
          if (response.data.perusahaan) {
            setCompany(response.data.perusahaan);
          }
          setIsEditOpen(false);
        }
      })
      .catch(err => {
        console.error('Failed to update PKS:', err);
        toast.error(err.message || 'Gagal memperbarui data PKS.');
      });
  };

  const handleAddendumSubmit = (addendumData) => {
    addAddendum(addendumData)
      .then(response => {
        if (response.success) {
          toast.success('Dokumen Addendum berhasil ditambahkan.');
          setIsAddAddendumOpen(false);
          fetchDetails();
          refreshPKS(); // Keep the main table synchronized
        }
      })
      .catch(err => {
        console.error('Failed to add addendum:', err);
        toast.error(err.message || 'Gagal menyimpan addendum baru.');
      });
  };

  const handleEditAddendumSubmit = (updatedAddendum) => {
    if (!selectedAddendumId) return;
    editAddendum(selectedAddendumId, updatedAddendum)
      .then(response => {
        if (response.success) {
          toast.success('Dokumen Addendum berhasil diperbarui.');
          setIsEditAddendumOpen(false);
          setSelectedAddendumId(null);
          fetchDetails();
          refreshPKS(); // Keep the main table synchronized
        }
      })
      .catch(err => {
        console.error('Failed to update addendum:', err);
        toast.error(err.message || 'Gagal memperbarui addendum.');
      });
  };

  const handleDeleteAddendumClick = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus dokumen addendum ini?")) {
      deleteAddendum(id)
        .then(() => {
          toast.success("Dokumen Addendum berhasil dihapus.");
          fetchDetails();
          refreshPKS(); // Keep the main table synchronized
        })
        .catch((err) => {
          console.error("Failed to delete addendum:", err);
          toast.error(err.message || "Gagal menghapus addendum.");
        });
    }
  };

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

                {/* Bidang */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Bidang PKS
                  </span>
                  <p className="text-slate-800 font-extrabold text-sm">
                    {pks.bidang}
                  </p>
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

          {/* SEKTOR III: RIWAYAT ADDENDUM PKS */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#003b87]">
                <FileText className="w-4.5 h-4.5" />
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                  III. Riwayat Addendum PKS
                </h4>
              </div>
              <Button
                variant="outline"
                icon={Plus}
                size="sm"
                className="border-[#003b87] text-[#003b87] hover:bg-blue-50/50 text-[11px]"
                onClick={() => setIsAddAddendumOpen(true)}
              >
                Buat Addendum PKS
              </Button>
            </div>

            {/* List/Table of Addenda */}
            {!pks.addenda || pks.addenda.length === 0 ? (
              <div className="bg-slate-50 rounded-xl p-6 border border-dashed border-slate-200 text-center text-slate-400 text-xs font-semibold">
                Belum ada dokumen addendum untuk PKS ini.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                      <th className="py-3 px-4">Nomor Addendum</th>
                      <th className="py-3 px-4">Judul Addendum</th>
                      <th className="py-3 px-4">Masa Berlaku</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {pks.addenda.map((addendum) => (
                      <tr key={addendum.id_addendum} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {addendum.nomor_addendum}
                        </td>
                        <td className="py-3 px-4 max-w-[200px] truncate text-slate-800">
                          {addendum.judul_addendum}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-[11px]">
                          {formatDate(addendum.tanggal_mulai)} - {formatDate(addendum.tanggal_berakhir)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedAddendumId(addendum.id_addendum);
                                setIsDetailAddendumOpen(true);
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-[#003b87] hover:bg-blue-50 transition-colors cursor-pointer"
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAddendumId(addendum.id_addendum);
                                setIsEditAddendumOpen(true);
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Ubah Addendum"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddendumClick(addendum.id_addendum)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Addendum"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              icon={Edit}
              className="border-blue-200 text-[#003b87] hover:bg-blue-50/50"
              onClick={() => setIsEditOpen(true)}
            >
              Perbarui Data PKS
            </Button>
            <Button variant="primary" onClick={onClose}>
              Tutup Detail
            </Button>
          </div>
        </div>
      </div>
      {isEditOpen && (
        <EditPKSModal
          pksId={pks?.id_pks || pks?.id}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleEditSubmit}
        />
      )}
      {isAddAddendumOpen && (
        <AddAddendumModal
          pks={pks}
          onClose={() => setIsAddAddendumOpen(false)}
          onSubmit={handleAddendumSubmit}
        />
      )}
      {isEditAddendumOpen && (
        <EditAddendumModal
          addendumId={selectedAddendumId}
          onClose={() => {
            setIsEditAddendumOpen(false);
            setSelectedAddendumId(null);
          }}
          onSubmit={handleEditAddendumSubmit}
        />
      )}
      {isDetailAddendumOpen && (
        <DetailAddendumModal
          addendumId={selectedAddendumId}
          onClose={() => {
            setIsDetailAddendumOpen(false);
            setSelectedAddendumId(null);
          }}
        />
      )}
    </div>,
    document.body,
  );
}

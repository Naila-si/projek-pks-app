// src/pages/DataPKSPage.jsx
import { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit2, 
  Trash2,
  FileSignature, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { usePKS } from '../hooks/usePKS';
import { useCompany } from '../hooks/useCompany';
import { formatDate } from '../utils/formatDate';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import ExportButton from '../components/common/ExportButton';
import AddPKSModal from '../components/pks/AddPKSModal';
import EditPKSModal from '../components/pks/EditPKSModal';
import DetailPKSModal from '../components/pks/DetailPKSModal';
import { api } from '../services/api';
import { createPortal } from 'react-dom';
import logoJasaRaharja from '../assets/logo_jasa_raharja.png';
import { toast } from '../utils/toast';

export default function DataPKSPage() {
  const { pksList, loading: loadingPks, refreshPKS, addPKS, editPKS, deletePKS } = usePKS();
  const { refreshCompanies } = useCompany();

  // State Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPKSId, setSelectedPKSId] = useState(null);
  const [deletingPKSId, setDeletingPKSId] = useState(null);

  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [jenisPKSFilter, setJenisPKSFilter] = useState('Semua');
  const [jenisObjekFilter, setJenisObjekFilter] = useState('Semua');

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Gabungkan PKS dengan informasi Perusahaan & kalkulasi status terkini
  const enrichedPKSList = useMemo(() => {
    return pksList.map(p => ({
      ...p,
      id: p.id_pks, // map backend id_pks to id for standard modal controls
      nama_perusahaan: p.perusahaan?.nama_perusahaan || '-',
      alamat_perusahaan: p.perusahaan?.alamat || '',
      status: p.status_pks || '-'
    }));
  }, [pksList]);

  // Lakukan pencarian & pemfilteran di server
  const filteredPKSList = useMemo(() => {
    return enrichedPKSList;
  }, [enrichedPKSList]);

  // Trigger server-side filtering when search or filter choices change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      refreshPKS({
        search: searchQuery,
        status: statusFilter,
        jenis_pks: jenisPKSFilter,
        jenis_objek: jenisObjekFilter
      });
    }, 300); // 300ms debounce for typing search

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter, jenisPKSFilter, jenisObjekFilter, refreshPKS]);

  // Reset halaman aktif jika filter berubah
  useEffect(() => {
    Promise.resolve().then(() => {
      setCurrentPage(1);
    });
  }, [searchQuery, statusFilter, jenisPKSFilter, jenisObjekFilter]);

  // Hitung data halaman aktif
  const totalPages = Math.ceil(filteredPKSList.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = useMemo(() => {
    return filteredPKSList.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPKSList, startIndex]);

  // Penanganan Modal Tambah PKS
  const handleAddPKSSubmit = async (pksData, companyData) => {
    try {
      await addPKS(pksData, companyData);
      refreshCompanies();
      setIsAddOpen(false);
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan PKS baru.');
    }
  };

  // Penanganan Modal Edit PKS
  const handleEditClick = (id) => {
    setSelectedPKSId(id);
    setIsEditOpen(true);
  };

  const handleEditPKSSubmit = async (updatedPKS) => {
    try {
      await editPKS(selectedPKSId, updatedPKS);
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui data PKS.');
    }
  };

  // Penanganan Modal Detail PKS
  const handleDetailClick = (id) => {
    setSelectedPKSId(id);
    setIsDetailOpen(true);
  };

  // Penanganan Hapus PKS
  const handleDeleteClick = (id) => {
    setDeletingPKSId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    // 1. Tutup modal secara instan
    setIsDeleteOpen(false);
    
    // 2. Picu proses hapus di background (mengubah local state seketika)
    deletePKS(deletingPKSId).then(() => {
      // Segarkan daftar perusahaan senyap di background untuk mensinkronisasi data perusahaan yang ikut terhapus
      refreshCompanies();
    }).catch(err => {
      toast.error(err.message || 'Gagal menghapus data PKS.');
    });
    
    // 3. Kosongkan ID hapus secara instan
    setDeletingPKSId(null);
    
    // 4. Tampilkan notifikasi sukses kustom secara instan seketika itu juga!
    toast.success('Data PKS berhasil dihapus.', 'Berhasil');
  };

  // Penanganan Ekspor Excel (.xlsx) & PDF (.pdf) Premium
  const handleExport = (exportType) => {
    if (exportType === 'excel') {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (statusFilter && statusFilter !== 'Semua') queryParams.append('status', statusFilter);
      if (jenisPKSFilter && jenisPKSFilter !== 'Semua') queryParams.append('jenis_pks', jenisPKSFilter);
      if (jenisObjekFilter && jenisObjekFilter !== 'Semua') queryParams.append('jenis_objek', jenisObjekFilter);
      queryParams.append('format', 'xlsx');

      const filename = `Data_PKS_JasaRaharja_${new Date().toISOString().slice(0, 10)}.xlsx`;
      
      // Unduh langsung berkas Excel (.xlsx) dari backend
      api.download(`/export/pks?${queryParams.toString()}`, filename);
    } else if (exportType === 'pdf') {
      // Buka jendela baru untuk Cetak Laporan PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.warning('Gagal membuka jendela cetak. Mohon izinkan pop-up pada browser Anda.', 'Cetak Terblokir');
        return;
      }

      // Baris tabel data PKS
      const pksRows = filteredPKSList.map((pks, index) => {
        const statusColor = pks.status === 'Aktif' 
          ? 'color: #059669; background-color: #ecfdf5; border-color: #10b981;' 
          : pks.status === 'Segera Berakhir'
            ? 'color: #d97706; background-color: #fffbeb; border-color: #f59e0b;'
            : 'color: #dc2626; background-color: #fef2f2; border-color: #ef4444;';
            
        return `
          <tr>
            <td style="text-align: center; font-family: monospace;">${index + 1}</td>
            <td>
              <div style="font-weight: 800; color: #1e293b; font-size: 11px;">${pks.nama_perusahaan}</div>
              ${pks.alamat_perusahaan ? `<div style="font-size: 9px; color: #64748b; margin-top: 2px; font-weight: normal;">${pks.alamat_perusahaan}</div>` : ''}
            </td>
            <td style="font-family: monospace; font-weight: bold; color: #475569; font-size: 10px;">${pks.nomor_pks}</td>
            <td style="text-align: center;">
              <span style="background-color: #f1f5f9; color: #334155; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                ${pks.jenis_pks}
              </span>
            </td>
            <td style="text-align: center; color: #475569; font-size: 10px;">${pks.jenis_objek}</td>
            <td style="color: #475569; font-size: 10px;">${formatDate(pks.tanggal_mulai)}</td>
            <td style="font-weight: bold; color: #334155; font-size: 10px;">${formatDate(pks.tanggal_berakhir)}</td>
            <td style="text-align: center;">
              <span style="font-size: 9px; font-weight: bold; padding: 3px 8px; border-radius: 6px; border: 1px solid; ${statusColor}">
                ${pks.status}
              </span>
            </td>
          </tr>
        `;
      }).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Laporan Data PKS - Jasa Raharja</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            
            @page {
              size: landscape;
              margin: 15mm;
            }
            
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 0;
              background-color: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px double #cbd5e1;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            
            .logo-section {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            
            .logo-bumn {
              font-size: 11px;
              font-weight: 700;
              color: #00829B;
              letter-spacing: 1px;
              border-left: 2px solid #cbd5e1;
              padding-left: 12px;
              height: 20px;
              display: flex;
              align-items: center;
            }
            
            .title-section {
              text-align: right;
            }
            
            .doc-title {
              font-size: 18px;
              font-weight: 800;
              color: #003b87;
              margin: 0 0 4px 0;
              letter-spacing: -0.3px;
            }
            
            .doc-subtitle {
              font-size: 11px;
              color: #64748b;
              font-weight: 500;
              margin: 0;
            }
            
            .meta-grid {
              display: grid;
              grid-template-cols: repeat(4, 1fr);
              gap: 15px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 12px 18px;
              margin-bottom: 25px;
              font-size: 11px;
            }
            
            .meta-item {
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
            
            .meta-label {
              font-weight: 700;
              color: #94a3b8;
              text-transform: uppercase;
              font-size: 9px;
              letter-spacing: 0.5px;
            }
            
            .meta-value {
              font-weight: 600;
              color: #334155;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              font-size: 11px;
            }
            
            th {
              background-color: #003b87;
              color: #ffffff;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 9px;
              letter-spacing: 0.5px;
              padding: 10px 12px;
              border: 1px solid #003b87;
              text-align: left;
            }
            
            th.text-center {
              text-align: center;
            }
            
            td {
              padding: 10px 12px;
              border-bottom: 1px solid #e2e8f0;
              border-left: 1px solid #f1f5f9;
              border-right: 1px solid #f1f5f9;
              vertical-align: middle;
            }
            
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            
            tr {
              break-inside: avoid;
            }
            
            .mengetahui-title {
              text-align: center;
              font-size: 11px;
              font-weight: 600;
              margin-top: 50px;
              margin-bottom: 10px;
              color: #64748b;
              break-inside: avoid;
            }
            
            .footer-signature {
              display: flex;
              justify-content: space-between;
              margin-top: 10px;
              font-size: 11px;
              break-inside: avoid;
              padding: 0 40px;
            }
            
            .signature-box {
              text-align: center;
              width: 280px;
            }
            
            .signature-role {
              color: #475569;
              font-weight: 600;
              min-height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .signature-space {
              height: 55px;
            }
            
            .signature-name {
              font-weight: 700;
              color: #1e293b;
              border-bottom: 1.5px solid #1e293b;
              padding-bottom: 2px;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="logo-section">
              <img src="${logoJasaRaharja}" alt="Jasa Raharja Logo" style="height: 42px; width: auto;" />
              <div class="logo-bumn">BUMN UNTUK INDONESIA</div>
            </div>
            <div class="title-section">
              <h1 class="doc-title">LAPORAN DATA PERJANJIAN KERJA SAMA (PKS)</h1>
              <p class="doc-subtitle">PT Jasa Raharja - Kantor Wilayah Riau</p>
            </div>
          </div>
          
          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Tanggal Cetak</span>
              <span class="meta-value">${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Kategori PKS / Objek</span>
              <span class="meta-value">PKS: ${jenisPKSFilter} | Objek: ${jenisObjekFilter}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Filter Status</span>
              <span class="meta-value">${statusFilter}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Total Laporan</span>
              <span class="meta-value">${filteredPKSList.length} Kontrak Terdaftar</span>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 5%;" class="text-center">No</th>
                <th style="width: 25%;">Nama Perusahaan Mitra</th>
                <th style="width: 20%;">Nomor Kontrak PKS</th>
                <th style="width: 10%;" class="text-center">Jenis PKS</th>
                <th style="width: 10%;" class="text-center">Jenis Objek</th>
                <th style="width: 10%;">Tanggal Mulai</th>
                <th style="width: 10%;">Masa Berakhir</th>
                <th style="width: 10%;" class="text-center">Status PKS</th>
              </tr>
            </thead>
            <tbody>
              ${pksRows}
            </tbody>
          </table>
          
          <div class="mengetahui-title">Mengetahui,</div>
          <div class="footer-signature">
            <div class="signature-box">
              <div class="signature-role">Kepala Sub Bagian Iuran Wajib</div>
              <div class="signature-space"></div>
              <div class="signature-name">Esga Putra Pradana, S.E.</div>
            </div>
            
            <div class="signature-box">
              <div class="signature-role">Kepala Kantor Wilayah Jasa Raharja Riau</div>
              <div class="signature-space"></div>
              <div class="signature-name">Muhammad Hidayat, SE.</div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-none">
            Data Perjanjian Kerja Sama (PKS)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-2">
            Kelola dan pantau seluruh data Perjanjian Kerja Sama dalam satu platform terpusat.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003b87] hover:bg-[#002d69] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/10 hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah PKS</span>
        </button>
      </div>

      {/* Panel Pencarian, Filter & Ekspor */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Pencarian */}
          <div className="space-y-1.5 lg:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Pencarian</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003b87] transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Cari nomor PKS atau nama perusahaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
              />
            </div>
          </div>

          {/* Filter Status PKS */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Status PKS</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Segera Berakhir">Segera Berakhir</option>
              <option value="Berakhir">Berakhir</option>
            </select>
          </div>

          {/* Filter Jenis PKS */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Jenis PKS</label>
            <select
              value={jenisPKSFilter}
              onChange={(e) => setJenisPKSFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="IWKBU">IWKBU</option>
              <option value="IWKL">IWKL</option>
            </select>
          </div>

          {/* Filter Jenis Objek */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Jenis Objek</label>
            <select
              value={jenisObjekFilter}
              onChange={(e) => setJenisObjekFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
            >
              <option value="Semua">Semua Objek</option>
              <option value="Kendaraan">Kendaraan</option>
              <option value="Kapal">Kapal</option>
            </select>
          </div>

        </div>

        {/* Baris Bawah: Tombol Export */}
        <div className="flex justify-end pt-2">
          <ExportButton onExport={handleExport} dataName="PKS" />
        </div>
      </div>

      {/* Tabel Data Utama */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {loadingPks ? (
          <div className="p-12 text-center text-slate-400 font-semibold flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#003b87] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs">Memuat data dari server...</p>
          </div>
        ) : filteredPKSList.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100">
                    <th className="py-4 px-6 text-center w-12">No</th>
                    <th className="py-4 px-6">Nama Perusahaan</th>
                    <th className="py-4 px-6">Nomor PKS</th>
                    <th className="py-4 px-6 text-center">Jenis PKS</th>
                    <th className="py-4 px-6 text-center">Jenis Objek</th>
                    <th className="py-4 px-6">Tanggal Mulai</th>
                    <th className="py-4 px-6">Tanggal Berakhir</th>
                    <th className="py-4 px-6">Status PKS</th>
                    <th className="py-4 px-6 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {paginatedData.map((pks, index) => (
                    <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6 text-center text-slate-400 font-mono">
                        {startIndex + index + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-extrabold text-slate-800">{pks.nama_perusahaan}</div>
                          {pks.alamat_perusahaan && (
                            <div className="text-[10px] text-slate-400 font-light mt-0.5">{pks.alamat_perusahaan}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-500 font-bold">{pks.nomor_pks}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                          {pks.jenis_pks}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-slate-600">
                        {pks.jenis_objek}
                      </td>
                      <td className="py-4 px-6 text-slate-500">{formatDate(pks.tanggal_mulai)}</td>
                      <td className="py-4 px-6 text-slate-600 font-bold">{formatDate(pks.tanggal_berakhir)}</td>
                      <td className="py-4 px-6">
                        <StatusBadge status={pks.status} />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDetailClick(pks.id)}
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-[#e8f1fc] hover:text-[#003b87] text-slate-400 transition-colors cursor-pointer"
                            title="Lihat Detail PKS"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditClick(pks.id)}
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Edit Data PKS"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(pks.id)}
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors cursor-pointer"
                            title="Hapus Data PKS"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4.5 border-t border-slate-50 flex items-center justify-between flex-wrap gap-4 text-xs font-semibold text-slate-500 bg-slate-50/30">
              <span>
                Menampilkan <strong className="text-slate-700">{startIndex + 1}</strong> - <strong className="text-slate-700">{Math.min(startIndex + itemsPerPage, filteredPKSList.length)}</strong> dari <strong className="text-slate-700">{filteredPKSList.length}</strong> data PKS
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 bg-white disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === num
                        ? 'bg-[#003b87] text-white shadow-sm shadow-blue-900/10'
                        : 'border border-slate-200 hover:bg-slate-50 bg-white text-slate-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 bg-white disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8">
            <EmptyState 
              title="Perjanjian Kerja Sama Tidak Ditemukan"
              description="Tidak ada kontrak PKS terdaftar yang cocok dengan kriteria pencarian dan pemfilteran saat ini."
              icon={FileSignature}
              actionButton={
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#003b87] text-white font-bold text-xs rounded-xl hover:bg-[#002d69] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Daftarkan Kontrak Baru</span>
                </button>
              }
            />
          </div>
        )}

      </div>

      {/* Modal Form Tambah PKS */}
      {isAddOpen && (
        <AddPKSModal
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleAddPKSSubmit}
        />
      )}

      {/* Modal Form Edit PKS */}
      {isEditOpen && (
        <EditPKSModal
          pksId={selectedPKSId}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleEditPKSSubmit}
        />
      )}

      {/* Modal Detail PKS */}
      {isDetailOpen && (
        <DetailPKSModal
          pksId={selectedPKSId}
          onClose={() => setIsDetailOpen(false)}
        />
      )}

      {/* Modal Portal Konfirmasi Hapus PKS (Premium Glassmorphic Style) */}
      {isDeleteOpen && createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto glass-overlay flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden animate-fade-in p-6 text-center space-y-4">
            
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 animate-pulse">
              <Trash2 className="w-5.5 h-5.5" />
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-800 text-lg">Hapus Kontrak PKS?</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Berkas PDF kontrak fisik terkait di server juga akan dihapus permanen. Apakah Anda yakin?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeletingPKSId(null);
                }}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Batalkan
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-grow flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-900/10 transition-all cursor-pointer"
              >
                Ya, Hapus Data
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

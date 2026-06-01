// src/pages/DataPerusahaanPage.jsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Eye, 
  Edit2, 
  AlertTriangle, 
  XCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Phone
} from 'lucide-react';
import { useCompany } from '../hooks/useCompany';
import { usePKS } from '../hooks/usePKS';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import ExportButton from '../components/common/ExportButton';
import EditCompanyModal from '../components/company/EditCompanyModal';
import DetailCompanyModal from '../components/company/DetailCompanyModal';
import { api } from '../services/api';
import logoJasaRaharja from '../assets/logo_jasa_raharja.png';
import { toast } from '../utils/toast';

export default function DataPerusahaanPage() {
  const navigate = useNavigate();
  const { companies, refreshCompanies, editCompany } = useCompany();
  const { pksList } = usePKS();

  // State Modal Perusahaan
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('Terbaru'); // 'Terbaru' | 'Terlama'

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 1. Tentukan Status PKS terintegrasi untuk masing-masing perusahaan
  const enrichedCompanies = useMemo(() => {
    return companies.map(company => {
      const id = company.id_perusahaan;
      // Ambil seluruh PKS milik perusahaan ini
      const companyPKS = pksList.filter(p => p.id_perusahaan === id);
      
      let overallStatus = 'Tidak Aktif';
      
      if (companyPKS.length > 0) {
        const statuses = companyPKS.map(p => p.status_pks);
        if (statuses.includes('Berakhir')) {
          overallStatus = 'Berakhir';
        } else if (statuses.includes('Segera Berakhir')) {
          overallStatus = 'Segera Berakhir';
        } else if (statuses.includes('Aktif')) {
          overallStatus = 'Aktif';
        }
      }

      return {
        ...company,
        id: id, // map id_perusahaan to id for view/edit routes
        pksCount: companyPKS.length,
        statusPKS: overallStatus,
        telepon: company.nomor_telepon // map nomor_telepon to telepon for table rendering
      };
    });
  }, [companies, pksList]);

  // 2. Hitung statistik kartu ringkasan
  const stats = useMemo(() => {
    let totalPKSActive = 0;
    let totalPKSSoonExp = 0;
    let totalPKSExpired = 0;

    pksList.forEach(pks => {
      const status = pks.status_pks;
      if (status === 'Aktif') totalPKSActive++;
      else if (status === 'Segera Berakhir') totalPKSSoonExp++;
      else if (status === 'Berakhir') totalPKSExpired++;
    });

    return {
      totalCompanies: companies.length,
      totalPKSActive,
      totalPKSSoonExp,
      totalPKSExpired
    };
  }, [companies, pksList]);

  // 3. Pencarian & Pengurutan dilakukan di backend
  const filteredCompanies = useMemo(() => {
    return enrichedCompanies;
  }, [enrichedCompanies]);

  // Trigger server-side filtering/sorting when fields change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      refreshCompanies({
        search: searchQuery,
        sort: sortOrder === 'Terbaru' ? 'latest' : 'oldest'
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, sortOrder, refreshCompanies]);

  // Reset halaman saat filter berubah
  useEffect(() => {
    Promise.resolve().then(() => {
      setCurrentPage(1);
    });
  }, [searchQuery, sortOrder]);

  // Hitung data halaman aktif
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = useMemo(() => {
    return filteredCompanies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCompanies, startIndex]);

  // Helper mendapatkan inisial nama perusahaan
  const getInitials = (name) => {
    if (!name) return 'CO';
    const cleanName = name.replace(/^(PT|CV|UD|PO)\.?\s+/i, '').trim();
    const words = cleanName.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  };

  const handleDetailClick = (id) => {
    setSelectedCompanyId(id);
    setIsDetailOpen(true);
  };

  const handleEditClick = (id) => {
    setSelectedCompanyId(id);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (updatedCompany) => {
    try {
      await editCompany(selectedCompanyId, updatedCompany);
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui data perusahaan.');
    }
  };

  // Penanganan Ekspor Excel (.xlsx) & PDF (.pdf) Premium
  const handleExport = (exportType) => {
    if (exportType === 'excel') {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      queryParams.append('sort', sortOrder === 'Terbaru' ? 'latest' : 'oldest');
      queryParams.append('format', 'xlsx');

      const filename = `Data_Perusahaan_JR_${new Date().toISOString().slice(0, 10)}.xlsx`;
      
      // Unduh langsung Excel dari backend
      api.download(`/export/perusahaan?${queryParams.toString()}`, filename);
    } else if (exportType === 'pdf') {
      // Buka jendela baru untuk Cetak Laporan PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.warning('Gagal membuka jendela cetak. Mohon izinkan pop-up pada browser Anda.', 'Cetak Terblokir');
        return;
      }

      // Baris tabel data perusahaan mitra
      const companyRows = filteredCompanies.map((company, index) => {
        const statusColor = company.statusPKS === 'Aktif' 
          ? 'color: #059669; background-color: #ecfdf5; border-color: #10b981;' 
          : company.statusPKS === 'Segera Berakhir'
            ? 'color: #d97706; background-color: #fffbeb; border-color: #f59e0b;'
            : company.statusPKS === 'Berakhir'
              ? 'color: #dc2626; background-color: #fef2f2; border-color: #ef4444;'
              : 'color: #64748b; background-color: #f8fafc; border-color: #cbd5e1;';
              
        const createdDate = company.created_at 
          ? new Date(company.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })
          : '-';

        return `
          <tr>
            <td style="text-align: center; font-family: monospace;">${index + 1}</td>
            <td style="font-weight: 800; color: #1e293b; font-size: 11px;">${company.nama_perusahaan}</td>
            <td style="color: #334155; font-size: 10.5px;">${company.nama_pengelola || '-'}</td>
            <td style="color: #64748b; font-size: 10px;">${company.alamat || '-'}</td>
            <td style="color: #475569; font-size: 10px; font-family: monospace;">${company.email || '-'}</td>
            <td style="color: #475569; font-size: 10px; font-family: monospace;">${company.telepon || company.nomor_telepon || '-'}</td>
            <td style="text-align: center;">
              <span style="font-size: 9px; font-weight: bold; padding: 3px 8px; border-radius: 6px; border: 1px solid; ${statusColor}">
                ${company.statusPKS}
              </span>
            </td>
            <td style="text-align: center; color: #64748b; font-size: 10px; font-family: monospace;">${createdDate}</td>
          </tr>
        `;
      }).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Laporan Data Perusahaan Mitra - Jasa Raharja</title>
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
              padding: 0 20px;
            }
            
            .signature-box {
              text-align: center;
              width: 250px;
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
              <h1 class="doc-title">LAPORAN DATA MITRA PERUSAHAAN</h1>
              <p class="doc-subtitle">PT Jasa Raharja - Kantor Wilayah Riau</p>
            </div>
          </div>
          
          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Tanggal Cetak</span>
              <span class="meta-value">${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Kata Kunci Pencarian</span>
              <span class="meta-value">${searchQuery ? searchQuery : 'Semua'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Urutan Tampilan</span>
              <span class="meta-value">Mitra ${sortOrder}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Total Item</span>
              <span class="meta-value">${filteredCompanies.length} Perusahaan</span>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 4%;" class="text-center">No</th>
                <th style="width: 20%;">Nama Perusahaan</th>
                <th style="width: 13%;">Nama Pengelola</th>
                <th style="width: 23%;">Alamat</th>
                <th style="width: 12%;">Email</th>
                <th style="width: 11%;">Nomor Telepon</th>
                <th style="width: 9%;" class="text-center">Status PKS</th>
                <th style="width: 8%;" class="text-center">Tanggal Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              ${companyRows}
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

  const cardList = [
    {
      title: 'TOTAL PERUSAHAAN',
      value: stats.totalCompanies,
      icon: Building2,
      iconColor: 'text-[#003b87]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      title: 'TOTAL PKS AKTIF',
      value: stats.totalPKSActive,
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100'
    },
    {
      title: 'PKS SEGERA BERAKHIR',
      value: stats.totalPKSSoonExp,
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    },
    {
      title: 'PKS BERAKHIR',
      value: stats.totalPKSExpired,
      icon: XCircle,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-none">
          Data Perusahaan Mitra
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-2">
          Kelola seluruh mitra dan organisasi dalam satu platform terpusat. Pantau status PKS, detail operasional, dan informasi kontak secara real-time.
        </p>
      </div>

      {/* Grid Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardList.map((card, index) => (
          <div 
            key={index} 
            className={`bg-white border ${card.borderColor} rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex items-center justify-between transition-all duration-300 hover:shadow-[0_10px_35px_rgba(0,0,0,0.04)]`}
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider block">
                {card.title}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 block tracking-tight">
                {card.value.toLocaleString('id-ID')}
              </span>
            </div>
            
            <div className={`w-11 h-11 rounded-xl ${card.bgColor} ${card.iconColor} flex items-center justify-center border border-transparent`}>
              <card.icon className="w-5.5 h-5.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Kontrol Pencarian */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 max-w-xl">
          {/* Input Pencarian */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Cari Perusahaan</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003b87] transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Ketik nama perusahaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
              />
            </div>
          </div>

          {/* Pengurutan */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Urutkan</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
            >
              <option value="Terbaru">Mitra Terbaru</option>
              <option value="Terlama">Mitra Terlama</option>
            </select>
          </div>
        </div>

        {/* Tombol Export */}
        <div className="flex-shrink-0">
          <ExportButton onExport={handleExport} dataName="Perusahaan" />
        </div>
      </div>

      {/* Tabel Data Perusahaan */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {filteredCompanies.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100">
                    <th className="py-4.5 px-6">Nama Perusahaan</th>
                    <th className="py-4.5 px-6">Pengelola</th>
                    <th className="py-4.5 px-6">Kontak</th>
                    <th className="py-4.5 px-6">Status PKS</th>
                    <th className="py-4.5 px-6 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {paginatedData.map((company, index) => (
                    <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                      {/* Nama Perusahaan (Dengan Avatar Inisial) */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#003b87] flex items-center justify-center font-extrabold text-xs shadow-inner flex-shrink-0">
                            {getInitials(company.nama_perusahaan)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-800 text-sm">{company.nama_perusahaan}</div>
                            {company.alamat && (
                              <div className="text-[10px] text-slate-400 font-light mt-0.5">{company.alamat}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Nama Pengelola */}
                      <td className="py-4 px-6 text-slate-700">
                        {company.nama_pengelola || '-'}
                      </td>

                      {/* Kontak Telepon */}
                      <td className="py-4 px-6 text-slate-500">
                        {company.telepon ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{company.telepon}</span>
                          </div>
                        ) : '-'}
                      </td>

                      {/* Status PKS (Berdasarkan sisa masa PKS terparah) */}
                      <td className="py-4 px-6">
                        <StatusBadge status={company.statusPKS} />
                      </td>

                      {/* Aksi Edit & Detail */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDetailClick(company.id)}
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-[#e8f1fc] hover:text-[#003b87] text-slate-400 transition-colors cursor-pointer"
                            title="Lihat Profil Detail Perusahaan & Riwayat PKS"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditClick(company.id)}
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Ubah Profil Perusahaan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4.5 border-t border-slate-50 flex items-center justify-between flex-wrap gap-4 text-xs font-semibold text-slate-500 bg-slate-50/30">
              <span>
                Menampilkan <strong className="text-slate-700">{startIndex + 1}</strong> - <strong className="text-slate-700">{Math.min(startIndex + itemsPerPage, filteredCompanies.length)}</strong> dari <strong className="text-slate-700">{filteredCompanies.length}</strong> mitra perusahaan
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
              title="Perusahaan Mitra Tidak Ditemukan"
              description="Tidak ada data profil mitra yang cocok dengan kriteria kata kunci pencarian Anda."
              icon={Building2}
            />
          </div>
        )}

      </div>

      {/* Modal Edit Profil Perusahaan */}
      {isEditOpen && (
        <EditCompanyModal
          companyId={selectedCompanyId}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Modal Detail Profil Perusahaan */}
      {isDetailOpen && (
        <DetailCompanyModal
          companyId={selectedCompanyId}
          onClose={() => setIsDetailOpen(false)}
        />
      )}

    </div>
  );
}

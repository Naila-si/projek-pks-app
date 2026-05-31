// src/pages/DataPKSPage.jsx
import { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit2, 
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

export default function DataPKSPage() {
  const { pksList, loading: loadingPks, refreshPKS, addPKS, editPKS } = usePKS();
  const { refreshCompanies } = useCompany();

  // State Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPKSId, setSelectedPKSId] = useState(null);

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
      alert(err.message || 'Gagal menyimpan PKS baru.');
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
      alert(err.message || 'Gagal memperbarui data PKS.');
    }
  };

  // Penanganan Modal Detail PKS
  const handleDetailClick = (id) => {
    setSelectedPKSId(id);
    setIsDetailOpen(true);
  };

  // Penanganan Ekspor CSV & Excel melalui Backend
  const handleExport = (exportType) => {
    const format = exportType === 'excel' ? 'xlsx' : 'csv';
    const queryParams = new URLSearchParams();
    
    if (searchQuery) queryParams.append('search', searchQuery);
    if (statusFilter && statusFilter !== 'Semua') queryParams.append('status', statusFilter);
    if (jenisPKSFilter && jenisPKSFilter !== 'Semua') queryParams.append('jenis_pks', jenisPKSFilter);
    if (jenisObjekFilter && jenisObjekFilter !== 'Semua') queryParams.append('jenis_objek', jenisObjekFilter);
    queryParams.append('format', format);

    const filename = `Data_PKS_JasaRaharja_${new Date().toISOString().slice(0, 10)}.${format}`;
    
    // Download directly using the api.download helper
    api.download(`/export/pks?${queryParams.toString()}`, filename);
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

    </div>
  );
}

// src/components/pks/AddPKSModal.jsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Building, FileText, Upload } from 'lucide-react';
import Button from '../common/Button';
import { toast } from '../../utils/toast';

export default function AddPKSModal({ onClose, onSubmit }) {
  // 1. State Informasi Perusahaan
  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [namaPengelola, setNamaPengelola] = useState('');
  const [alamat, setAlamat] = useState('');
  const [email, setEmail] = useState('');
  const [telepon, setTelepon] = useState('');

  // 2. State Informasi PKS
  const [judulPKS, setJudulPKS] = useState('');
  const [bidang, setBidang] = useState('IW');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalBerakhir, setTanggalBerakhir] = useState('');
  const [documentFile, setDocumentFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Pengecekan instan ukuran file (10MB = 10 * 1024 * 1024 bytes)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Ukuran berkas PDF tidak boleh melebihi 10 MB!', 'Ukuran Berkas Terlalu Besar');
        e.target.value = ''; // Reset inputan file
        setDocumentFile(null);
        return;
      }
      setDocumentFile(file);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!namaPerusahaan || !judulPKS || !tanggalMulai || !tanggalBerakhir) {
      toast.warning('Harap isi semua kolom wajib (berlabel bintang *)');
      return;
    }

    if (documentFile && documentFile.size > 10 * 1024 * 1024) {
      toast.error('Ukuran berkas PDF tidak boleh melebihi 10 MB!', 'Gagal Menyimpan');
      return;
    }

    const companyData = {
      nama_perusahaan: namaPerusahaan,
      nama_pengelola: namaPengelola,
      alamat,
      email,
      telepon
    };

    const pksData = {
      nomor_pks: '',
      judul_pks: judulPKS,
      bidang: bidang,
      tanggal_mulai: tanggalMulai,
      tanggal_berakhir: tanggalBerakhir,
      dokumen_pks: documentFile
    };

    onSubmit(pksData, companyData);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto glass-overlay flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f1fc] text-[#003b87] flex items-center justify-center border border-blue-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Tambah PKS Baru</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Daftarkan mitra kerja sama dan data PKS</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Isi (Scrollable) */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          
          {/* BAGIAN 1: INFORMASI PERUSAHAAN MITRA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#003b87] border-b border-blue-50 pb-2">
              <Building className="w-4 h-4" />
              <h4 className="font-bold text-sm uppercase tracking-wider">I. Informasi Perusahaan</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Perusahaan */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  Nama Perusahaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT. Artha Nugraha"
                  value={namaPerusahaan}
                  onChange={(e) => setNamaPerusahaan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
                />
              </div>

              {/* Nama Pengelola */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  Nama Pengelola
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bambang Wijaya"
                  value={namaPengelola}
                  onChange={(e) => setNamaPengelola(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
                />
              </div>

              {/* Nomor Telepon */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: +62 812-3456-7890"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  Email Korespondensi
                </label>
                <input
                  type="email"
                  placeholder="Contoh: info@arthanugraha.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
                />
              </div>

              {/* Alamat */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  Alamat Perusahaan
                </label>
                <textarea
                  rows="2"
                  placeholder="Contoh: Jl. Sudirman No. 12, Jakarta Selatan"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* BAGIAN 2: INFORMASI PKS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#003b87] border-b border-blue-50 pb-2">
              <FileText className="w-4 h-4" />
              <h4 className="font-bold text-sm uppercase tracking-wider">II. Informasi PKS (Kontrak)</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Judul PKS */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  Judul Perjanjian PKS <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kerjasama Pengutipan Iuran Wajib..."
                  value={judulPKS}
                  onChange={(e) => setJudulPKS(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
                />
              </div>

              {/* Bidang */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  Bidang <span className="text-rose-500">*</span>
                </label>
                <select
                  value={bidang}
                  onChange={(e) => setBidang(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
                >
                  <option value="IW">IW (Iuran Wajib)</option>
                  <option value="SW">SW (Sumbangan Wajib)</option>
                  <option value="pelayanan">Pelayanan</option>
                  <option value="umum">Umum</option>
                  <option value="HC">HC (Human Capital)</option>
                  <option value="keuangan">Keuangan</option>
                  <option value="tjsl">TJSL (Tanggung Jawab Sosial & Lingkungan)</option>
                </select>
              </div>

              {/* Tanggal Mulai */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  Tanggal Mulai Berlaku <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
                  />
                </div>
              </div>

              {/* Tanggal Berakhir */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  Tanggal Berakhir Berlaku <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={tanggalBerakhir}
                    onChange={(e) => setTanggalBerakhir(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
                  />
                </div>
              </div>



              {/* Upload Dokumen */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  Unggah Dokumen Surat PKS (PDF)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-5">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <p className="text-[10px] text-slate-500 font-bold">
                        {documentFile ? documentFile.name : 'Pilih Berkas PDF Dokumen PKS'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-light mt-0.5">Maksimum ukuran berkas 10MB</p>
                    </div>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      className="hidden" 
                      onChange={handleFileChange} 
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Modal Buttons */}
        <div className="px-6 py-4.5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/30 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Batalkan
          </Button>
          <Button variant="primary" onClick={handleFormSubmit}>
            Simpan PKS Baru
          </Button>
        </div>

      </div>
    </div>,
    document.body
  );
}

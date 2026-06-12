// src/components/pks/AddAddendumModal.jsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Upload, Link } from 'lucide-react';
import Button from '../common/Button';
import { toast } from '../../utils/toast';

export default function AddAddendumModal({ pks, onClose, onSubmit }) {
  // State Informasi Addendum
  const [judulAddendum, setJudulAddendum] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalBerakhir, setTanggalBerakhir] = useState('');
  const [documentFile, setDocumentFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Max size check: 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Ukuran berkas PDF tidak boleh melebihi 10 MB!', 'Ukuran Berkas Terlalu Besar');
        e.target.value = '';
        setDocumentFile(null);
        return;
      }
      setDocumentFile(file);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!judulAddendum || !tanggalMulai || !tanggalBerakhir || !documentFile) {
      toast.warning('Harap isi semua kolom wajib dan unggah dokumen PDF *');
      return;
    }

    const addendumData = {
      id_pks: pks.id_pks || pks.id,
      judul_addendum: judulAddendum,
      tanggal_mulai: tanggalMulai,
      tanggal_berakhir: tanggalBerakhir,
      dokumen_addendum: documentFile
    };

    onSubmit(addendumData);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto glass-overlay flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003b87] flex items-center justify-center border border-blue-100">
              <Link className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">Buat Addendum PKS Baru</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Tambahkan dokumen amandemen perubahan klausul PKS</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Isi */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Card Referensi PKS Induk */}
          <div className="bg-[#e8f1fc] p-5 rounded-xl border border-blue-100 space-y-3">
            <span className="text-[9px] font-black text-[#003b87] tracking-wider uppercase block">Referensi PKS Induk (Referensi Utama)</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-[#003b87]">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Nomor PKS Induk</span>
                <span className="font-mono text-sm font-bold text-slate-800">{pks.nomor_pks}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Nama Perusahaan Mitra</span>
                <span className="text-sm font-extrabold text-slate-800">{pks.nama_perusahaan || pks.perusahaan?.nama_perusahaan}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Judul PKS Induk</span>
                <span className="text-slate-700 leading-relaxed">{pks.judul_pks}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Judul Addendum */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Judul Dokumen Addendum <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Addendum I Perjanjian Perpanjangan Kontrak..."
                value={judulAddendum}
                onChange={(e) => setJudulAddendum(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
              />
            </div>

            {/* Tanggal Mulai Addendum */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Tanggal Mulai Berlaku Addendum <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
              />
            </div>

            {/* Tanggal Berakhir Addendum */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Tanggal Berakhir Berlaku Addendum <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggalBerakhir}
                onChange={(e) => setTanggalBerakhir(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
              />
            </div>

            {/* Upload PDF Addendum */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Unggah Dokumen Addendum (PDF) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-5 px-4 text-center">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <p className="text-xs text-slate-600 font-bold">
                      {documentFile ? documentFile.name : 'Pilih Berkas PDF Dokumen Addendum'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-light mt-1">Hanya file PDF dengan ukuran maksimal 10MB</p>
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
        </form>

        {/* Footer Modal Buttons */}
        <div className="px-6 py-4.5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/30 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Batalkan
          </Button>
          <Button variant="primary" onClick={handleFormSubmit}>
            Simpan Addendum Baru
          </Button>
        </div>

      </div>
    </div>,
    document.body
  );
}

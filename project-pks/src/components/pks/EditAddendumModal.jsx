// src/components/pks/EditAddendumModal.jsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Upload, Link } from 'lucide-react';
import { useAddendum } from '../../hooks/useAddendum';
import Button from '../common/Button';
import { toast } from '../../utils/toast';

export default function EditAddendumModal({ addendumId, onClose, onSubmit }) {
  const { getAddendumById } = useAddendum();
  const [addendum, setAddendum] = useState(null);
  
  // State Input Form Addendum
  const [nomorAddendum, setNomorAddendum] = useState('');
  const [judulAddendum, setJudulAddendum] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalBerakhir, setTanggalBerakhir] = useState('');
  const [documentFile, setDocumentFile] = useState(null);

  // Ambil data Addendum saat mount
  useEffect(() => {
    if (addendumId) {
      getAddendumById(addendumId).then(data => {
        if (data) {
          setAddendum(data);
          setNomorAddendum(data.nomor_addendum || '');
          setJudulAddendum(data.judul_addendum || '');
          setTanggalMulai(data.tanggal_mulai || '');
          setTanggalBerakhir(data.tanggal_berakhir || '');
        }
      }).catch(err => {
        console.error('Failed to load addendum details:', err);
        toast.error('Gagal memuat detail addendum.');
      });
    }
  }, [addendumId, getAddendumById]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
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
    if (!judulAddendum || !tanggalMulai || !tanggalBerakhir) {
      toast.warning('Harap isi semua kolom wajib!');
      return;
    }

    const updatedAddendum = {
      ...addendum,
      nomor_addendum: nomorAddendum,
      judul_addendum: judulAddendum,
      tanggal_mulai: tanggalMulai,
      tanggal_berakhir: tanggalBerakhir,
      dokumen_addendum: documentFile // file object or null
    };

    onSubmit(updatedAddendum);
  };

  if (!addendum) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto glass-overlay flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003b87] flex items-center justify-center border border-blue-100">
              <Link className="w-5 h-5 animate-pulse-soft" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">Ubah Dokumen Addendum PKS</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Sesuaikan isi Klausul dan tanggal Addendum PKS</p>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Nomor Addendum (Read-Only) */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                Nomor Surat Addendum <span className="text-slate-400 font-normal">(Tidak dapat diubah)</span>
              </label>
              <input
                type="text"
                disabled
                value={nomorAddendum}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-400 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Judul Addendum */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Judul Dokumen Addendum <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={judulAddendum}
                onChange={(e) => setJudulAddendum(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
              />
            </div>

            {/* Tanggal Mulai */}
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

            {/* Tanggal Berakhir */}
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

            {/* Upload PDF Baru */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Unggah Dokumen Addendum Baru (PDF, Opsional)
              </label>
              <label className="flex flex-col items-center justify-center w-full h-11 border border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors px-4">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] text-slate-500 font-bold">
                    {documentFile ? documentFile.name : 'Pilih Berkas PDF Baru'}
                  </span>
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
        </form>

        {/* Footer Modal Buttons */}
        <div className="px-6 py-4.5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/30 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Batalkan
          </Button>
          <Button variant="primary" onClick={handleFormSubmit}>
            Simpan Perubahan
          </Button>
        </div>

      </div>
    </div>,
    document.body
  );
}

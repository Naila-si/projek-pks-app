// src/components/pks/EditPKSModal.jsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Upload } from 'lucide-react';
import { usePKS } from '../../hooks/usePKS';
import Button from '../common/Button';

export default function EditPKSModal({ pksId, onClose, onSubmit }) {
  const { getPKSById } = usePKS();
  const [pks, setPks] = useState(null);
  
  // State Input Form PKS
  const [nomorPKS, setNomorPKS] = useState('');
  const [judulPKS, setJudulPKS] = useState('');
  const [jenisPKS, setJenisPKS] = useState('IWKBU');
  const [jenisObjek, setJenisObjek] = useState('Kendaraan');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalBerakhir, setTanggalBerakhir] = useState('');
  const [tanggalAddendum, setTanggalAddendum] = useState('');
  const [documentFile, setDocumentFile] = useState(null);

  // Ambil data PKS dari backend saat mount
  useEffect(() => {
    if (pksId) {
      getPKSById(pksId).then(data => {
        if (data) {
          setPks(data);
          setNomorPKS(data.nomor_pks || '');
          setJudulPKS(data.judul_pks || '');
          setJenisPKS(data.jenis_pks || 'IWKBU');
          setJenisObjek(data.jenis_objek || 'Kendaraan');
          setTanggalMulai(data.tanggal_mulai || '');
          setTanggalBerakhir(data.tanggal_berakhir || '');
          setTanggalAddendum(data.tanggal_addendum || '');
        }
      }).catch(err => {
        console.error('Failed to load PKS details:', err);
        alert('Gagal memuat detail PKS dari server.');
      });
    }
  }, [pksId, getPKSById]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!nomorPKS || !judulPKS || !tanggalMulai || !tanggalBerakhir) {
      alert('Harap isi semua kolom wajib!');
      return;
    }

    const updatedPKS = {
      ...pks,
      nomor_pks: nomorPKS,
      judul_pks: judulPKS,
      jenis_pks: jenisPKS,
      jenis_objek: jenisObjek,
      tanggal_mulai: tanggalMulai,
      tanggal_berakhir: tanggalBerakhir,
      tanggal_addendum: tanggalAddendum || null,
      dokumen_pks: documentFile // Pass actual File object if selected
    };

    onSubmit(updatedPKS);
  };

  if (!pks) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto glass-overlay flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003b87] flex items-center justify-center border border-blue-100">
              <FileText className="w-5 h-5 animate-pulse-soft" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">Ubah Data Perjanjian PKS</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Ubah informasi masa berlaku dan ketentuan kontrak PKS</p>
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
          
          <div className="bg-[#e8f1fc] p-4 rounded-xl border border-blue-100 text-xs font-semibold text-[#003b87] leading-relaxed">
            <span className="font-extrabold uppercase tracking-wide block mb-1">Catatan Keamanan</span>
            Sesuai regulasi sistem, perubahan profil perusahaan (alamat, kontak, email) harus diubah melalui menu <strong>Data Perusahaan</strong> demi menjaga integritas data relasi.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Nomor PKS */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Nomor Surat PKS <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nomorPKS}
                onChange={(e) => setNomorPKS(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
              />
            </div>

            {/* Judul PKS */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Judul Perjanjian PKS <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={judulPKS}
                onChange={(e) => setJudulPKS(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
              />
            </div>

            {/* Jenis PKS */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Jenis PKS
              </label>
              <select
                value={jenisPKS}
                onChange={(e) => setJenisPKS(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
              >
                <option value="IWKBU">IWKBU (Iuran Wajib Kendaraan Bermotor Umum)</option>
                <option value="IWKL">IWKL (Iuran Wajib Kapal Laut)</option>
              </select>
            </div>

            {/* Jenis Objek */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Jenis Objek
              </label>
              <select
                value={jenisObjek}
                onChange={(e) => setJenisObjek(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
              >
                <option value="Kendaraan">Kendaraan</option>
                <option value="Kapal">Kapal</option>
              </select>
            </div>

            {/* Tanggal Mulai */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Tanggal Mulai Berlaku <span className="text-rose-500">*</span>
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
                Tanggal Berakhir Berlaku <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggalBerakhir}
                onChange={(e) => setTanggalBerakhir(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
              />
            </div>

            {/* Tanggal Addendum */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Tanggal Addendum
              </label>
              <input
                type="date"
                value={tanggalAddendum}
                onChange={(e) => setTanggalAddendum(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
              />
            </div>

            {/* Upload Dokumen */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Unggah Dokumen Surat PKS (PDF Baru)
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

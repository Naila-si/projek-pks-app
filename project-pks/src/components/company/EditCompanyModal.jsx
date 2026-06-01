// src/components/company/EditCompanyModal.jsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Building } from 'lucide-react';
import { useCompany } from '../../hooks/useCompany';
import Button from '../common/Button';
import { toast } from '../../utils/toast';

export default function EditCompanyModal({ companyId, onClose, onSubmit }) {
  const { getCompanyById } = useCompany();
  const [company, setCompany] = useState(null);
  
  // State Input Form Perusahaan
  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [namaPengelola, setNamaPengelola] = useState('');
  const [alamat, setAlamat] = useState('');
  const [email, setEmail] = useState('');
  const [telepon, setTelepon] = useState('');

  useEffect(() => {
    if (companyId) {
      getCompanyById(companyId).then(data => {
        if (data) {
          setCompany(data);
          setNamaPerusahaan(data.nama_perusahaan || '');
          setNamaPengelola(data.nama_pengelola || '');
          setAlamat(data.alamat || '');
          setEmail(data.email || '');
          setTelepon(data.nomor_telepon || data.telepon || '');
        }
      }).catch(err => {
        console.error('Failed to load company details:', err);
        toast.error('Gagal memuat profil perusahaan dari server.');
      });
    }
  }, [companyId, getCompanyById]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!namaPerusahaan) {
      toast.warning('Harap isi nama perusahaan!');
      return;
    }

    const updatedCompany = {
      ...company,
      nama_perusahaan: namaPerusahaan,
      nama_pengelola: namaPengelola,
      alamat,
      email,
      telepon
    };

    onSubmit(updatedCompany);
  };

  if (!company) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto glass-overlay flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003b87] flex items-center justify-center border border-blue-100">
              <Building className="w-5 h-5 animate-pulse-soft" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">Edit Profil Perusahaan</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Ubah informasi kontak, alamat, dan pengelola mitra</p>
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
            <span className="font-extrabold uppercase tracking-wide block mb-1">Pemberitahuan Sistem</span>
            Perubahan profil di sini akan otomatis terintegrasi ke seluruh kontrak perjanjian kerja sama (PKS) aktif yang diikat oleh mitra perusahaan ini.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Nama Perusahaan */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Nama Perusahaan / Organisasi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={namaPerusahaan}
                onChange={(e) => setNamaPerusahaan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
              />
            </div>

            {/* Nama Pengelola */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Nama Pengelola / Penanggung Jawab
              </label>
              <input
                type="text"
                value={namaPengelola}
                onChange={(e) => setNamaPengelola(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
              />
            </div>

            {/* Nomor Telepon */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Nomor Telepon Kontak
              </label>
              <input
                type="tel"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Email Resmi Perusahaan
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all"
              />
            </div>

            {/* Alamat */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Alamat Lengkap Kantor
              </label>
              <textarea
                rows="3"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-[#003b87] transition-all resize-none leading-relaxed"
              ></textarea>
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

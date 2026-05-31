// src/components/common/ExportButton.jsx
import { useState, useRef, useEffect } from 'react';
import { Download, FileText, Printer, Check } from 'lucide-react';
import Button from './Button';

export default function ExportButton({ onExport, dataName = 'Data' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportingType, setExportingType] = useState(null); // 'excel' | 'pdf' | null
  const dropdownRef = useRef(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Menutup dropdown saat klik di luar area
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportClick = (type) => {
    setExportingType(type);
    setIsOpen(false);

    setTimeout(() => {
      onExport(type);
      setExportingType(null);

      setExportSuccess(true);

      setTimeout(() => {
        setExportSuccess(false);
      }, 2000);
    }, 800);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        icon={exportSuccess ? Check : Download}
        disabled={exportingType !== null}
        className="w-full sm:w-auto"
      >
        {exportingType === 'excel' && 'Mengekspor Excel...'}
        {exportingType === 'pdf' && 'Meninggalkan untuk Cetak...'}
        {exportingType === null && exportSuccess && 'Berhasil Diekspor'}
        {exportingType === null && !exportSuccess && 'Ekspor'}
      </Button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white border border-slate-100 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in">
          <div className="py-1.5 p-1">
            <button
              onClick={() => handleExportClick('excel')}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#e8f1fc] hover:text-[#003b87] rounded-lg transition-colors text-left"
            >
              <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <p>Unduh Berkas Excel (.xlsx)</p>
                <span className="text-[10px] text-slate-400 font-light font-sans">Format spreadsheet Excel</span>
              </div>
            </button>
            <button
              onClick={() => handleExportClick('pdf')}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#e8f1fc] hover:text-[#003b87] rounded-lg transition-colors text-left border-t border-slate-50"
            >
              <Printer className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <div>
                <p>Cetak Laporan PDF (.pdf)</p>
                <span className="text-[10px] text-slate-400 font-light font-sans">Format dokumen siap cetak</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

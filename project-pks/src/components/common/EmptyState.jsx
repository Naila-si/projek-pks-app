// src/components/common/EmptyState.jsx
import { Search } from 'lucide-react';

export default function EmptyState({
  title = 'Data Tidak Ditemukan',
  description = 'Coba ubah kata kunci pencarian Anda atau periksa filter yang sedang aktif.',
  icon: Icon = Search,
  actionButton
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-bold text-slate-800 text-base">{title}</h4>
      <p className="text-xs text-slate-400 font-medium max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionButton}
    </div>
  );
}

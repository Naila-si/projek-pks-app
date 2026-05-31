// src/components/dashboard/PKSBarChart.jsx
export default function PKSBarChart({ iwkbuCount = 0, iwklCount = 0 }) {
  const max = Math.max(iwkbuCount, iwklCount, 10);
  
  // Hitung persentase tinggi untuk visualisasi grafik
  const iwkbuHeight = (iwkbuCount / max) * 100;
  const iwklHeight = (iwklCount / max) * 100;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-[380px] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Jumlah PKS Berdasarkan Jenis</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Distribusi kategori perjanjian kerja sama aktif</p>
          </div>
          <span className="text-[10px] font-bold bg-[#e8f1fc] text-[#003b87] px-2 py-0.5 rounded-full uppercase tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Kontainer Bar Chart */}
      <div className="flex-1 flex items-end justify-center gap-12 sm:gap-16 px-4 py-8">
        
        {/* BAR 1: IWKBU */}
        <div className="flex flex-col items-center flex-1 max-w-[80px] group cursor-pointer">
          {/* Angka di atas bar */}
          <span className="text-sm font-extrabold text-[#003b87] mb-2 group-hover:scale-110 transition-transform duration-200">
            {iwkbuCount}
          </span>
          {/* Track Gray & Fill Blue */}
          <div className="w-full h-48 bg-slate-100 rounded-xl overflow-hidden flex items-end relative shadow-inner">
            <div 
              style={{ height: `${iwkbuHeight}%` }}
              className="w-full bg-[#003b87] group-hover:bg-[#002d69] transition-all duration-500 rounded-t-xl shadow-lg flex items-start justify-center pt-2 relative overflow-hidden"
            >
              {/* Highlight glass shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 mt-3 group-hover:text-[#003b87] transition-colors">
            IWKBU
          </span>
        </div>

        {/* BAR 2: IWKL */}
        <div className="flex flex-col items-center flex-1 max-w-[80px] group cursor-pointer">
          {/* Angka di atas bar */}
          <span className="text-sm font-extrabold text-blue-500 mb-2 group-hover:scale-110 transition-transform duration-200">
            {iwklCount}
          </span>
          {/* Track Gray & Fill Sky Blue */}
          <div className="w-full h-48 bg-slate-100 rounded-xl overflow-hidden flex items-end relative shadow-inner">
            <div 
              style={{ height: `${iwklHeight}%` }}
              className="w-full bg-blue-500 group-hover:bg-blue-600 transition-all duration-500 rounded-t-xl shadow-lg flex items-start justify-center pt-2 relative overflow-hidden"
            >
              {/* Highlight glass shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 mt-3 group-hover:text-blue-500 transition-colors">
            IWKL
          </span>
        </div>

      </div>

      {/* Footer Info Grafik */}
      <div className="border-t border-slate-50 pt-4 flex justify-between items-center text-[10px] font-bold text-slate-400 tracking-wider uppercase">
        <span>Total Terdata: {iwkbuCount + iwklCount} PKS</span>
        <span className="text-emerald-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Sinkron
        </span>
      </div>
    </div>
  );
}

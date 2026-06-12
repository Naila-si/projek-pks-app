// src/components/dashboard/PKSBarChart.jsx
export default function PKSBarChart({ bidangData = [] }) {
  // Pilihan warna yang harmonis untuk masing-masing bidang
  const colors = {
    IW: { text: 'text-[#003b87]', bg: 'bg-[#003b87]', hover: 'hover:bg-[#002d69]' },
    SW: { text: 'text-blue-500', bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    pelayanan: { text: 'text-indigo-500', bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600' },
    umum: { text: 'text-violet-500', bg: 'bg-violet-500', hover: 'hover:bg-violet-600' },
    HC: { text: 'text-pink-500', bg: 'bg-pink-500', hover: 'hover:bg-pink-600' },
    keuangan: { text: 'text-emerald-500', bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
    tjsl: { text: 'text-amber-500', bg: 'bg-amber-500', hover: 'hover:bg-amber-600' }
  };

  const total = bidangData.reduce((acc, curr) => acc + curr.jumlah, 0);
  const max = Math.max(...bidangData.map(d => d.jumlah), 10);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-[380px] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Jumlah PKS Berdasarkan Bidang</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Distribusi kategori perjanjian kerja sama aktif</p>
          </div>
          <span className="text-[10px] font-bold bg-[#e8f1fc] text-[#003b87] px-2 py-0.5 rounded-full uppercase tracking-wider">LANGSUNG</span>
        </div>
      </div>

      {/* Kontainer Bar Chart */}
      <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 px-1 py-8 overflow-x-auto">
        {bidangData.map((data, index) => {
          const colorKey = data.bidang;
          const color = colors[colorKey] || colors.IW;
          const heightPercent = (data.jumlah / max) * 100;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 min-w-[32px] group cursor-pointer">
              {/* Angka di atas bar */}
              <span className={`text-[10px] sm:text-xs font-extrabold ${color.text} mb-2 group-hover:scale-110 transition-transform duration-200`}>
                {data.jumlah}
              </span>
              {/* Track Gray & Fill Colored */}
              <div className="w-full h-36 bg-slate-100 rounded-lg overflow-hidden flex items-end relative shadow-inner">
                <div 
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full ${color.bg} ${color.hover} transition-all duration-500 rounded-t-lg shadow-lg flex items-start justify-center pt-2 relative overflow-hidden`}
                >
                  {/* Highlight glass shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 mt-3 group-hover:text-slate-800 transition-colors uppercase tracking-tight">
                {data.bidang}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Info Grafik */}
      <div className="border-t border-slate-50 pt-4 flex justify-between items-center text-[10px] font-bold text-slate-400 tracking-wider uppercase">
        <span>Total Terdata: {total} PKS</span>
        <span className="text-emerald-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Sinkron
        </span>
      </div>
    </div>
  );
}

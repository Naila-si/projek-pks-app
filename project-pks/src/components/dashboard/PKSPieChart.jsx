// src/components/dashboard/PKSPieChart.jsx
export default function PKSPieChart({ aktifCount = 0, segeraBerakhirCount = 0, berakhirCount = 0 }) {
  const total = aktifCount + segeraBerakhirCount + berakhirCount;
  const safeTotal = total || 1;
  
  // Hitung persentase masing-masing kategori
  const aktifPct = total > 0 ? Math.round((aktifCount / safeTotal) * 100) : 0;
  const segeraBerakhirPct = total > 0 ? Math.round((segeraBerakhirCount / safeTotal) * 100) : 0;
  const berakhirPct = total > 0 ? Math.round((berakhirCount / safeTotal) * 100) : 0;
  
  // Hitung sudut / dash-array untuk donut ring
  // Circumference = 2 * PI * r = 2 * 3.14159 * 40 = 251.327
  const r = 40;
  const c = 2 * Math.PI * r;
  
  // Dash length untuk masing-masing segmen
  const aktifDash = (aktifPct / 100) * c;
  const segeraBerakhirDash = (segeraBerakhirPct / 100) * c;
  const berakhirDash = (berakhirPct / 100) * c;
  
  // Offset kumulatif untuk masing-masing segmen (searah jarum jam)
  const aktifOffset = 0;
  const segeraBerakhirOffset = aktifDash;
  const berakhirOffset = aktifDash + segeraBerakhirDash;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-[380px] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Distribusi Status PKS</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Kondisi masa berlaku seluruh kontrak</p>
          </div>
          <span className="text-[10px] font-bold bg-blue-50 text-[#003b87] px-2 py-0.5 rounded-full uppercase tracking-wider">Status</span>
        </div>
      </div>

      {/* Konten Utama Pie/Donut SVG */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
        
        {/* SVG Ring Donut */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="12"
            />
            {/* Segmen 1: Aktif (Emerald/Teal) */}
            {aktifCount > 0 && (
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="transparent"
                stroke="#10b981" /* emerald-500 */
                strokeWidth="12"
                strokeDasharray={`${aktifDash} ${c}`}
                strokeDashoffset={-aktifOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            )}
            {/* Segmen 2: Segera Berakhir (Amber/Orange) */}
            {segeraBerakhirCount > 0 && (
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="transparent"
                stroke="#f59e0b" /* amber-500 */
                strokeWidth="12"
                strokeDasharray={`${segeraBerakhirDash} ${c}`}
                strokeDashoffset={-segeraBerakhirOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            )}
            {/* Segmen 3: Berakhir (Rose/Red) */}
            {berakhirCount > 0 && (
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="transparent"
                stroke="#f43f5e" /* rose-500 */
                strokeWidth="12"
                strokeDasharray={`${berakhirDash} ${c}`}
                strokeDashoffset={-berakhirOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            )}
          </svg>

          {/* Label Tengah Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-slate-800 leading-none">
              {total}
            </span>
            <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-1">
              TOTAL PKS
            </span>
          </div>
        </div>

        {/* Legenda Detail di Kanan */}
        <div className="space-y-3.5 min-w-[150px]">
          {/* Item 1: Aktif */}
          <div className="flex items-center justify-between gap-4 group">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#10b981] block"></span>
              <span className="text-xs font-bold text-slate-600 group-hover:text-[#10b981] transition-colors">Aktif</span>
            </div>
            <span className="text-xs font-extrabold text-slate-850">
              {aktifPct}% <span className="text-[10px] text-slate-400 font-medium">({aktifCount})</span>
            </span>
          </div>

          {/* Item 2: Segera Berakhir */}
          <div className="flex items-center justify-between gap-4 group">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#f59e0b] block"></span>
              <span className="text-xs font-bold text-slate-600 group-hover:text-[#f59e0b] transition-colors">Segera Berakhir</span>
            </div>
            <span className="text-xs font-extrabold text-slate-850">
              {segeraBerakhirPct}% <span className="text-[10px] text-slate-400 font-medium">({segeraBerakhirCount})</span>
            </span>
          </div>

          {/* Item 3: Berakhir */}
          <div className="flex items-center justify-between gap-4 group">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#f43f5e] block"></span>
              <span className="text-xs font-bold text-slate-600 group-hover:text-[#f43f5e] transition-colors">Berakhir</span>
            </div>
            <span className="text-xs font-extrabold text-slate-850">
              {berakhirPct}% <span className="text-[10px] text-slate-400 font-medium">({berakhirCount})</span>
            </span>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-slate-100"></div>

          {/* Total */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Sampel Mitra</span>
            <span className="text-slate-700">{total} Unit</span>
          </div>
        </div>

      </div>

      {/* Info Tambahan */}
      <div className="border-t border-slate-50 pt-4 text-[9px] font-semibold text-slate-400 text-center leading-relaxed">
        *Rasio status dihitung real-time berdasarkan tanggal akhir kontrak PKS
      </div>
    </div>
  );
}

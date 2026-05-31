import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, Shield, CheckCircle, ShieldCheck } from 'lucide-react';
import buildingBg from './assets/jasa_raharja_building.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Harap isi semua kolom.');
      return;
    }

    setIsLoading(true);
    // Simulasi proses login interaktif
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex font-sans antialiased text-slate-800 bg-[#f8fafc]">
      {/* PANEL KIRI: GAMBAR GEDUNG DENGAN GLASSMORPHIC CARD OVERLAY */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        {/* Gambar Latar Belakang */}
        <img
          src={buildingBg}
          alt="Jasa Raharja Building"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-85 scale-105 transition-transform duration-10000 ease-out hover:scale-100"
        />
        {/* Lapisan Overlay Gradien Biru */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#082f49]/80 via-[#0f172a]/60 to-transparent"></div>

        {/* Kartu Semi-Transparan Glassmorphic di Bagian Tengah */}
        <div className="relative z-10 flex items-center justify-center w-full h-full p-12">
          <div className="w-full max-w-lg bg-[#274567]/55 backdrop-blur-xl border border-white/10 rounded-2xl p-8 lg:p-10 shadow-2xl text-white">
            {/* Header Kartu: Ikon & Judul */}
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/20 shadow-inner">
                <Shield className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight leading-tight">
                  Sistem Manajemen PKS
                </h1>
              </div>
            </div>

            {/* Deskripsi */}
            <p className="text-white/85 text-sm lg:text-base font-light leading-relaxed mb-10">
              Sistem digital untuk mengelola data Perjanjian Kerja Sama (PKS) secara efisien, aman, dan sistematis. Rasakan keamanan tingkat institusional dengan efisiensi administratif modern.
            </p>

            {/* Statistik di Bagian Bawah Kartu */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
              <div className="pr-4">
                <div className="text-3xl font-extrabold tracking-tight">99.9%</div>
                <div className="text-[10px] font-bold tracking-widest text-white/60 mt-1 uppercase">UPTIME</div>
              </div>
              <div className="pl-6 border-l border-white/10">
                <div className="text-3xl font-extrabold tracking-tight">ISO 27001</div>
                <div className="text-[10px] font-bold tracking-widest text-white/60 mt-1 uppercase">CERTIFIED</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL KANAN: FORMULIR LOGIN */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 md:p-20 relative">
        {/* Dekorasi Latar Belakang Halus */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

        <div className="w-full max-w-md relative z-10">
          {/* KARTU FORMULIR */}
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 p-8 sm:p-10 transition-all duration-300 hover:shadow-[0_30px_60px_rgba(0,0,0,0.09)]">
            
            {success ? (
              /* State Sukses Setelah Login */
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mb-4 animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Login Berhasil!</h3>
                <p className="text-slate-500 text-sm mt-2">Mengarahkan Anda ke dasbor sistem...</p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-6 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Kembali ke Halaman Login
                </button>
              </div>
            ) : (
              /* Formulir Utama */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Selamat datang kembali
                  </h2>
                  <p className="text-slate-400 text-sm mt-1.5 font-normal">
                    Silakan masuk untuk melanjutkan ke dasbor Anda
                  </p>
                </div>

                {error && (
                  <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-3 rounded-r-lg text-xs font-semibold flex items-center gap-2 animate-shake">
                    <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* EMAIL ADDRESS */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-[11px] font-bold text-slate-600 tracking-widest uppercase">
                    ALAMAT EMAIL
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" strokeWidth={1.5} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.gov"
                      className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600/80 transition-all text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-[11px] font-bold text-slate-600 tracking-widest uppercase">
                    KATA SANDI
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" strokeWidth={1.5} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600/80 transition-all text-sm font-medium tracking-wide"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={1.5} /> : <Eye className="h-5 w-5" strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-[#003b87] hover:bg-[#002d69] active:bg-[#002352] text-white font-semibold rounded-xl shadow-lg shadow-blue-900/10 hover:shadow-xl hover:shadow-blue-900/15 focus:outline-none focus:ring-2 focus:ring-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center text-base"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Masuk'
                  )}
                </button>

                {/* DIVIDER */}
                <div className="h-[1px] bg-slate-100 my-8"></div>

                {/* INDIKATOR KEAMANAN */}
                <div className="flex justify-center items-center gap-6 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-slate-400" strokeWidth={2} />
                    <span className="text-[10px] font-bold tracking-widest uppercase">AMAN</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                    <span className="text-[10px] font-bold tracking-widest uppercase">TERENKRIPSI</span>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* FOOTER */}
          <div className="mt-8 text-center space-y-1">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              © 2024 PKS MANAGEMENT SYSTEM.
            </p>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              SECURE ADMINISTRATIVE PORTAL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

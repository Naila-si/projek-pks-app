// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import logoJasaRaharja from '../assets/logo_jasa_raharja.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Jika sudah terautentikasi, langsung arahkan ke Dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Harap masukkan email dan password.');
      return;
    }

    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Email atau password yang dimasukkan tidak sesuai.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      
      {/* PANEL KIRI: Ilustrasi Korporat & Tagline */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-tr from-[#002d69] to-[#004bb0] text-white p-16 flex-col justify-between overflow-hidden">
        {/* Dekorasi Grid Pattern halus */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        {/* Bulatan Gradien Estetik */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-300 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none"></div>

        {/* Logo/Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl shadow-md flex items-center justify-center">
            <img src={logoJasaRaharja} alt="Logo Jasa Raharja" className="h-10 object-contain" />
          </div>
        </div>

        {/* Tengah: Tagline Korporat */}
        <div className="relative z-10 my-auto max-w-md space-y-4">
          <span className="bg-white/10 border border-white/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-blue-100">
            Sistem Internal
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Manajemen Perjanjian Kerja Sama (PKS)
          </h1>
          <p className="text-blue-100/80 text-sm font-light leading-relaxed">
            Sistem digital yang membantu mengelola dokumen kerja sama, memantau masa berlaku secara otomatis, dan membuat pekerjaan lebih cepat serta terorganisir.
          </p>
        </div>

        {/* Bawah: Footer & Akreditasi */}
        <div className="relative z-10 flex items-center justify-between text-xs text-blue-200/60 font-semibold border-t border-white/10 pt-6">
          <p>© 2026 Jasa Raharja</p>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <p className="tracking-wider text-[10px]">AKSES AMAN</p>
          </div>
        </div>
      </div>

      {/* PANEL KANAN: Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white">
        
        {/* Dekorasi Latar Belakang Halus */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10 space-y-8 animate-fade-in">
          
          {/* Header Form */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Masukkan email dan kata sandi Anda untuk masuk ke sistem.
            </p>
          </div>

          {/* Form Utama */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Box Kesalahan */}
            {error && (
              <div className="bg-rose-50 border-l-4 border-rose-600 text-rose-800 p-4 rounded-r-xl text-xs font-semibold flex items-start gap-3 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-900">Gagal Masuk</p>
                  <p className="mt-0.5 font-medium text-rose-700/90">{error}</p>
                </div>
              </div>
            )}

            {/* Field Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[11px] font-bold text-slate-500 tracking-widest uppercase">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003b87] transition-colors">
                  <Mail className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan Email Anda"
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#003b87] transition-all text-sm font-semibold"
                  required
                />
              </div>
            </div>

            {/* Field Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-[11px] font-bold text-slate-500 tracking-widest uppercase">
                  Kata Sandi
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#003b87] transition-colors">
                  <Lock className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#003b87] transition-all text-sm font-semibold tracking-wide"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={1.75} /> : <Eye className="h-5 w-5" strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            {/* Tombol Login */}
            <Button
              type="submit"
              disabled={isLoading}
              fullWidth
              size="lg"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Masuk ke Sistem'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

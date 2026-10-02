import React from 'react';
import { UserProfile } from '../types';
import { loginPengurus } from '../lib/supabase';
import { X, Lock, Mail, LogIn, AlertCircle, Sparkles, Key } from 'lucide-react';
import logoImg from '../assets/images/logo_dkm_al_ikhlas_1790979470443.jpg';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  isSupabaseLive: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isSupabaseLive,
}) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
    }
  }, [isOpen]);

  const handleFillDemo = (role: 'bendahara' | 'pengurus') => {
    if (role === 'bendahara') {
      setEmail('bendahara@alikhlas.id');
      setPassword('dkm12345');
    } else {
      setEmail('pengurus@dkm-alikhlas.id');
      setPassword('dkm12345');
    }
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Masukkan email dan kata sandi.');
      return;
    }

    try {
      setIsLoading(true);
      const user = await loginPengurus(email.trim(), password);
      onLoginSuccess(user);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message || 'Login gagal');
      } else {
        setErrorMsg('Login gagal');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all my-8"
        role="dialog"
      >
        {/* Header with Mosque Accent */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-amber-400/80 bg-white shrink-0">
              <img src={logoImg} alt="Logo DKM Al Ikhlas" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Login Pengurus DKM</h3>
              <p className="text-xs text-emerald-200/90">
                KAS DKM AL IKHLAS - Dusun Pokek RW 004
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email / Akun Pengurus
            </label>
            <div className="relative rounded-xl">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@alikhlas.id"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kata Sandi (Password)
            </label>
            <div className="relative rounded-xl">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Demo quick fill helper */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Coba Akun Demo Pengurus:
              </span>
              <span className="text-[10px] text-slate-400">Password: dkm12345</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('bendahara')}
                className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors"
              >
                Bendahara Kas
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('pengurus')}
                className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors"
              >
                Pengurus DKM
              </button>
            </div>
          </div>

          {/* Status info */}
          <div className="text-[11px] text-slate-400 leading-tight">
            {isSupabaseLive ? (
              <span className="text-emerald-700 font-medium">✓ Menggunakan Supabase Authentication</span>
            ) : (
              <span>Autentikasi mode lokal aman siap pakai atau hubungkan ke Supabase Cloud melalui menu Koneksi Supabase.</span>
            )}
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Panel Pengurus'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

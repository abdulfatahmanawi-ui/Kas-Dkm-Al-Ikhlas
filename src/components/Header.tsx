import React from 'react';
import { UserProfile } from '../types';
import { 
  Building2, 
  LogIn, 
  LogOut, 
  LayoutDashboard, 
  ReceiptText, 
  FileSpreadsheet, 
  Database, 
  Menu, 
  X,
  UserCheck
} from 'lucide-react';
import logoImg from '../assets/images/logo_dkm_al_ikhlas_1790979470443.jpg';

interface HeaderProps {
  activeTab: 'dashboard' | 'transaksi' | 'laporan' | 'supabase';
  setActiveTab: (tab: 'dashboard' | 'transaksi' | 'laporan' | 'supabase') => void;
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenSupabaseModal: () => void;
  isSupabaseLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenSupabaseModal,
  isSupabaseLive,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard Publik', icon: LayoutDashboard },
    { id: 'transaksi' as const, label: 'Kelola Transaksi', icon: ReceiptText, requiresAuth: true },
    { id: 'laporan' as const, label: 'Laporan Keuangan', icon: FileSpreadsheet },
    { id: 'supabase' as const, label: 'Koneksi Supabase', icon: Database },
  ];

  const handleNavClick = (id: 'dashboard' | 'transaksi' | 'laporan' | 'supabase') => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Banner Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            
            {/* Logo & Identity */}
            <div 
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-emerald-600 shadow-sm shrink-0 bg-emerald-50">
                <img 
                  src={logoImg} 
                  alt="Logo DKM Al Ikhlas" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg sm:text-xl text-emerald-950 tracking-tight leading-tight">
                    KAS DKM AL IKHLAS
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    Transparan
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 font-normal">
                  Dusun Pokek RW 004, Desa Kawunganten, Cikaum, Subang
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/70'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.requiresAuth && !currentUser && (
                      <span className="text-[10px] text-amber-500 font-semibold">(Pengurus)</span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action: Auth & Supabase Status */}
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Supabase status indicator */}
              <button
                onClick={onOpenSupabaseModal}
                title={isSupabaseLive ? "Terhubung ke Supabase Cloud" : "Mode Penyimpanan Demo (Lokal)"}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
                <span className="hidden lg:inline">{isSupabaseLive ? 'Supabase Aktif' : 'Mode Demo'}</span>
              </button>

              {/* Login / User info */}
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    <span className="font-semibold max-w-[130px] truncate">{currentUser.nama}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Keluar dari akun pengurus"
                    className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login Pengurus</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-4 shadow-lg space-y-2">
            <div className="text-xs text-slate-400 px-2 font-medium">Navigasi Utama</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-emerald-800 text-white font-semibold'
                      : 'text-slate-700 hover:bg-emerald-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.requiresAuth && !currentUser && (
                    <span className="text-[11px] text-amber-500 font-normal">Kunci</span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenSupabaseModal();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Koneksi Supabase</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                  <span className="text-[11px] text-slate-500">{isSupabaseLive ? 'Online' : 'Demo Lokal'}</span>
                </span>
              </button>

              {currentUser ? (
                <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-lg">
                  <div className="text-xs text-emerald-900">
                    <div className="font-semibold">{currentUser.nama}</div>
                    <div className="text-[10px] text-emerald-700">{currentUser.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1 text-xs text-red-600 font-medium px-2 py-1 rounded bg-white border border-red-200"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onOpenLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-800 text-white text-xs font-semibold"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login Pengurus DKM</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb Friendly) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 flex justify-around items-center no-print">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-800 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-md ${isActive ? 'bg-emerald-100 text-emerald-900' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="mt-0.5 truncate max-w-[64px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};

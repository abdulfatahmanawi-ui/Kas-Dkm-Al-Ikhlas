/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Category, Transaction, UserProfile } from './types';
import { 
  createCategory, 
  createTransaction, 
  deleteCategory, 
  deleteTransaction, 
  getCategories, 
  getCurrentUser, 
  getTransactions, 
  isUsingLiveSupabase, 
  logoutPengurus, 
  updateTransaction 
} from './lib/supabase';
import { Header } from './components/Header';
import { PublicDashboard } from './components/PublicDashboard';
import { TransactionManager } from './components/TransactionManager';
import { TransactionModal } from './components/TransactionModal';
import { ReportView } from './components/ReportView';
import { LoginModal } from './components/LoginModal';
import { CategoryModal } from './components/CategoryModal';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import logoImg from './assets/images/logo_dkm_al_ikhlas_1790979470443.jpg';
import { Heart, ShieldCheck, MapPin, Database, Sparkles } from 'lucide-react';

export default function App() {
  // Main Data States
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'transaksi' | 'laporan' | 'supabase'>('dashboard');

  // Modal States
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState<boolean>(false);
  const [isTxModalOpen, setIsTxModalOpen] = React.useState<boolean>(false);
  const [txToEdit, setTxToEdit] = React.useState<Transaction | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = React.useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = React.useState<boolean>(false);

  // Live Supabase Status
  const [isSupabaseLive, setIsSupabaseLive] = React.useState<boolean>(false);

  // Toast Notifications
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load Initial Data
  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setIsSupabaseLive(isUsingLiveSupabase());
      const [txList, catList] = await Promise.all([
        getTransactions(),
        getCategories(),
      ]);
      setTransactions(txList);
      setCategories(catList);
      setCurrentUser(getCurrentUser());
    } catch (err) {
      console.error('Error loading data:', err);
      addToast('error', 'Gagal memuat sebagian data kas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Perhitungan Saldo Kas Otomatis:
  // Saldo = Total Pemasukan - Total Pengeluaran
  const { totalPemasukan, totalPengeluaran, saldo } = React.useMemo(() => {
    let pemasukan = 0;
    let pengeluaran = 0;

    transactions.forEach((tx) => {
      if (tx.jenis === 'pemasukan') {
        pemasukan += tx.nominal;
      } else {
        pengeluaran += tx.nominal;
      }
    });

    const saldoKas = pemasukan - pengeluaran;
    return {
      totalPemasukan: pemasukan,
      totalPengeluaran: pengeluaran,
      saldo: saldoKas,
    };
  }, [transactions]);

  // Transaction Handlers
  const handleSaveTransaction = async (payload: Omit<Transaction, 'id' | 'created_at'>) => {
    try {
      if (txToEdit) {
        const updated = await updateTransaction(txToEdit.id, payload);
        setTransactions((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        addToast('success', 'Transaksi berhasil diperbarui');
      } else {
        const created = await createTransaction(payload);
        setTransactions((prev) => [created, ...prev]);
        addToast('success', 'Transaksi baru berhasil dicatat ke buku kas');
      }
      setTxToEdit(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        addToast('error', err.message || 'Gagal menyimpan transaksi');
      } else {
        addToast('error', 'Gagal menyimpan transaksi');
      }
      throw err;
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      addToast('success', 'Transaksi berhasil dihapus dari buku kas');
    } catch (err) {
      addToast('error', 'Gagal menghapus transaksi');
    }
  };

  // Category Handlers
  const handleAddCategory = async (payload: Omit<Category, 'id' | 'created_at'>) => {
    try {
      const newCat = await createCategory(payload);
      setCategories((prev) => [...prev, newCat]);
      addToast('success', `Kategori "${newCat.nama}" berhasil ditambahkan`);
    } catch (err) {
      addToast('error', 'Gagal menambahkan kategori');
      throw err;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      addToast('success', 'Kategori berhasil dihapus');
    } catch (err) {
      addToast('error', 'Gagal menghapus kategori');
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    addToast('success', `Selamat datang, ${user.nama}`);
  };

  const handleLogout = async () => {
    await logoutPengurus();
    setCurrentUser(null);
    addToast('info', 'Anda telah keluar dari akun pengurus');
    if (activeTab === 'transaksi') {
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-800 flex flex-col font-sans">
      
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Main Header / Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        isSupabaseLive={isSupabaseLive}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Loading state skeleton */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-800 animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500 animate-pulse">
              Memuat pembukuan kas DKM Al Ikhlas...
            </p>
          </div>
        ) : (
          <>
            {/* View 1: Public Dashboard */}
            {activeTab === 'dashboard' && (
              <PublicDashboard
                transactions={transactions}
                totalPemasukan={totalPemasukan}
                totalPengeluaran={totalPengeluaran}
                saldo={saldo}
                onNavigateToReports={() => setActiveTab('laporan')}
                onNavigateToTransactions={() => {
                  if (!currentUser) {
                    setIsLoginModalOpen(true);
                  } else {
                    setActiveTab('transaksi');
                  }
                }}
                onOpenLogin={() => setIsLoginModalOpen(true)}
                isLoggedIn={Boolean(currentUser)}
              />
            )}

            {/* View 2: Transaction Management (Pengurus) */}
            {activeTab === 'transaksi' && (
              <TransactionManager
                transactions={transactions}
                categories={categories}
                currentUser={currentUser}
                onOpenAddModal={() => {
                  setTxToEdit(null);
                  setIsTxModalOpen(true);
                }}
                onOpenEditModal={(tx) => {
                  setTxToEdit(tx);
                  setIsTxModalOpen(true);
                }}
                onDeleteTransaction={handleDeleteTransaction}
                onOpenLogin={() => setIsLoginModalOpen(true)}
                onOpenCategoryManager={() => setIsCatModalOpen(true)}
              />
            )}

            {/* View 3: Laporan Keuangan */}
            {activeTab === 'laporan' && (
              <ReportView transactions={transactions} />
            )}

            {/* View 4: Supabase & Panduan */}
            {activeTab === 'supabase' && (
              <div className="space-y-6 pb-20">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                        Integrasi Database Supabase & Panduan
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Aplikasi telah dilengkapi skema database Supabase PostgreSQL & Row Level Security (RLS)
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setIsSupabaseModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs hover:shadow transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Buka Modal Konfigurasi & Salin Kode SQL</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer (No-print) */}
      <footer className="bg-white border-t border-slate-200/80 mt-auto py-8 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-600 shrink-0 bg-emerald-50">
                <img src={logoImg} alt="DKM Al Ikhlas" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">KAS DKM AL IKHLAS</p>
                <p className="text-[11px] text-slate-500 flex items-center justify-center md:justify-start gap-1">
                  <MapPin className="w-3 h-3 text-emerald-700" />
                  Dusun Pokek RW 004, Desa Kawunganten, Kecamatan Cikaum, Kabupaten Subang
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Transparan & Akuntabel
              </span>
              <span>·</span>
              <button 
                onClick={() => setIsSupabaseModalOpen(true)}
                className="hover:text-emerald-700 underline"
              >
                Konfigurasi Database
              </button>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} DKM Al Ikhlas Dusun Pokek. Dikelola untuk kemaslahatan jamaah dan umat.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        isSupabaseLive={isSupabaseLive}
      />

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setTxToEdit(null);
        }}
        onSave={handleSaveTransaction}
        transactionToEdit={txToEdit}
        categories={categories}
        currentUser={currentUser}
        onOpenCategoryManager={() => setIsCatModalOpen(true)}
      />

      <CategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <SupabaseSetupModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigChanged={loadData}
      />

    </div>
  );
}

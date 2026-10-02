import React from 'react';
import { Transaction } from '../types';
import { formatDateIndo, formatRupiah } from '../utils/formatters';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Receipt, 
  FileText, 
  LogIn, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Landmark,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import logoImg from '../assets/images/logo_dkm_al_ikhlas_1790979470443.jpg';
import mosqueHeroImg from '../assets/images/hero_mosque_dkm_1790979482028.jpg';

interface PublicDashboardProps {
  transactions: Transaction[];
  totalPemasukan: number;
  totalPengeluaran: number;
  saldo: number;
  onNavigateToReports: () => void;
  onNavigateToTransactions: () => void;
  onOpenLogin: () => void;
  isLoggedIn: boolean;
}

export const PublicDashboard: React.FC<PublicDashboardProps> = ({
  transactions,
  totalPemasukan,
  totalPengeluaran,
  saldo,
  onNavigateToReports,
  onNavigateToTransactions,
  onOpenLogin,
  isLoggedIn,
}) => {
  // Transaksi terbaru (5 transaksi paling baru)
  const recentTransactions = React.useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Rekapitulasi per kategori untuk ringkasan
  const categorySummary = React.useMemo(() => {
    const pemasukanByCat: Record<string, number> = {};
    const pengeluaranByCat: Record<string, number> = {};

    transactions.forEach((tx) => {
      if (tx.jenis === 'pemasukan') {
        pemasukanByCat[tx.kategori] = (pemasukanByCat[tx.kategori] || 0) + tx.nominal;
      } else {
        pengeluaranByCat[tx.kategori] = (pengeluaranByCat[tx.kategori] || 0) + tx.nominal;
      }
    });

    const topIncomeCategories = Object.entries(pemasukanByCat)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4);

    const topExpenseCategories = Object.entries(pengeluaranByCat)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4);

    return { topIncomeCategories, topExpenseCategories };
  }, [transactions]);

  // Hitung persentase kas masuk vs keluar
  const totalVolume = totalPemasukan + totalPengeluaran;
  const incomePercent = totalVolume > 0 ? Math.round((totalPemasukan / totalVolume) * 100) : 50;
  const expensePercent = 100 - incomePercent;

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      
      {/* Hero Mosque Header Card */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white shadow-xl">
        {/* Subtle Background Pattern & Image Backdrop */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img 
            src={mosqueHeroImg} 
            alt="Masjid Al Ikhlas" 
            className="w-full h-full object-cover" 
          />
        </div>
        
        {/* Islamic Geometric Pattern Decorator */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>

        <div className="relative px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-700/60 text-emerald-200 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Portal Transparansi Kas Jamaah & DKM</span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 pt-1">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-md shrink-0 bg-white">
                  <img 
                    src={logoImg} 
                    alt="Logo DKM Al Ikhlas" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-serif">
                    KAS DKM AL IKHLAS
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
                    Dusun Pokek RW 004, Desa Kawunganten, Kecamatan Cikaum, Kabupaten Subang
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed pt-1">
                Informasi penerimaan infak, sedekah, wakaf, dan pengeluaran operasional masjid disajikan secara terbuka, akurat, dan dapat dipantau oleh seluruh jamaah warga Dusun Pokek maupun masyarakat umum.
              </p>
            </div>

            {/* Quick Action CTA Box */}
            <div className="flex flex-row md:flex-col sm:items-stretch gap-2.5 shrink-0 pt-2 md:pt-0">
              <button
                onClick={onNavigateToReports}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
              >
                <FileText className="w-4 h-4 text-slate-950" />
                <span>Laporan Keuangan</span>
              </button>

              {isLoggedIn ? (
                <button
                  onClick={onNavigateToTransactions}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs sm:text-sm transition-all"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Kelola Transaksi</span>
                </button>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs sm:text-sm transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login Pengurus</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 4 Statistics Cards (Mandatory Core Feature) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Saldo Kas Saat Ini */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-emerald-100 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo Kas Saat Ini</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono tabular-nums">
              {formatRupiah(saldo)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Otomatis dihitung real-time</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-500"></div>
        </div>

        {/* Card 2: Total Pemasukan */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pemasukan</span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-teal-900 font-mono tabular-nums">
              {formatRupiah(totalPemasukan)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span>Infak, sedekah, donasi, zakat, wakaf</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-600"></div>
        </div>

        {/* Card 3: Total Pengeluaran */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pengeluaran</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-rose-900 font-mono tabular-nums">
              {formatRupiah(totalPengeluaran)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span>Listrik, air, kebersihan, kegiatan, dll</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500"></div>
        </div>

        {/* Card 4: Jumlah Transaksi */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jumlah Transaksi</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {transactions.length} <span className="text-sm font-normal text-slate-500">Catatan</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span>Tercatat dalam pembukuan kas</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
        </div>

      </section>

      {/* Ringkasan & Visual Breakdown Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom 1 & 2: Ringkasan Distribusi & Rasio Kas */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Ringkasan Pemasukan & Pengeluaran
              </h2>
              <p className="text-xs text-slate-500">
                Gambaran alokasi dana dan perbandingan penerimaan dengan pengeluaran
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-teal-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                Pemasukan ({incomePercent}%)
              </span>
              <span className="flex items-center gap-1.5 text-rose-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                Pengeluaran ({expensePercent}%)
              </span>
            </div>
          </div>

          {/* Visual Ratio Bar */}
          <div className="mt-5">
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              <div 
                style={{ width: `${incomePercent}%` }} 
                className="bg-teal-600 h-full transition-all duration-500" 
                title={`Pemasukan: ${incomePercent}%`}
              />
              <div 
                style={{ width: `${expensePercent}%` }} 
                className="bg-rose-500 h-full transition-all duration-500" 
                title={`Pengeluaran: ${expensePercent}%`}
              />
            </div>
          </div>

          {/* Top Categories Breakdown Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            
            {/* Kategori Pemasukan Terbesar */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-800">
                <ArrowDownLeft className="w-4 h-4 text-teal-600" />
                <span>Pemasukan Terbesar Berdasarkan Kategori</span>
              </div>
              <div className="space-y-2">
                {categorySummary.topIncomeCategories.length > 0 ? (
                  categorySummary.topIncomeCategories.map(([cat, amount]) => {
                    const percent = totalPemasukan > 0 ? Math.round((amount / totalPemasukan) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">{cat}</span>
                          <span className="font-mono text-slate-600 tabular-nums">{formatRupiah(amount)} ({percent}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${percent}%` }} 
                            className="h-full bg-teal-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">Belum ada data kategori pemasukan.</p>
                )}
              </div>
            </div>

            {/* Kategori Pengeluaran Terbesar */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-800">
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                <span>Pengeluaran Utama Berdasarkan Kategori</span>
              </div>
              <div className="space-y-2">
                {categorySummary.topExpenseCategories.length > 0 ? (
                  categorySummary.topExpenseCategories.map(([cat, amount]) => {
                    const percent = totalPengeluaran > 0 ? Math.round((amount / totalPengeluaran) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">{cat}</span>
                          <span className="font-mono text-slate-600 tabular-nums">{formatRupiah(amount)} ({percent}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${percent}%` }} 
                            className="h-full bg-rose-400 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">Belum ada data kategori pengeluaran.</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Kolom 3: Informasi Rekening & Komitmen Transparansi */}
        <div className="rounded-2xl bg-gradient-to-b from-white to-emerald-50/40 border border-emerald-100 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-800 text-white">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">Rekening Resmi Kas DKM</h3>
                <p className="text-[11px] text-slate-500">Salurkan infak & sedekah jariyah</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-emerald-200/70 space-y-1.5">
              <div className="text-[11px] font-semibold text-emerald-800">BANK SYARIAH INDONESIA (BSI)</div>
              <div className="font-mono text-base font-bold text-slate-900 tracking-wider">
                718 200 4001
              </div>
              <div className="text-[11px] text-slate-600">
                a.n. <span className="font-medium">DKM AL IKHLAS POKEK</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                <span className="font-semibold text-emerald-900">Prinsip Amanah:</span> Seluruh transaksi dicatat oleh bendahara dan dipertanggungjawabkan dalam musyawarah warga Dusun Pokek RW 004 Desa Kawunganten.
              </p>
              <p className="text-[11px] text-slate-500">
                Bagi jamaah yang melakukan transfer, konfirmasi dapat disampaikan kepada pengurus DKM dengan menyertakan bukti transfer.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-100 mt-4">
            <button
              onClick={onNavigateToReports}
              className="w-full inline-flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100/60 hover:bg-emerald-100 py-2.5 rounded-lg transition-colors"
            >
              <span>Buka Halaman Laporan Lengkap</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </section>

      {/* Transaksi Terbaru (Latest Transactions) */}
      <section className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        
        <div className="px-5 py-4 sm:px-6 flex items-center justify-between border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Transaksi Terbaru</span>
              <span className="text-xs font-normal text-slate-500 hidden sm:inline">
                (5 catatan kas termutakhir)
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Pembaruan mutasi kas masuk dan keluar secara kronologis
            </p>
          </div>

          <button
            onClick={onNavigateToReports}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tabel / Card List Transaksi Terbaru */}
        <div className="divide-y divide-slate-100">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => {
              const isPemasukan = tx.jenis === 'pemasukan';
              return (
                <div 
                  key={tx.id} 
                  className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isPemasukan ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {isPemasukan ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          isPemasukan ? 'bg-teal-100/70 text-teal-800' : 'bg-rose-100/70 text-rose-800'
                        }`}>
                          {tx.kategori}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500">{formatDateIndo(tx.tanggal)}</span>
                        <span className="text-xs text-slate-400 hidden sm:inline">·</span>
                        <span className="text-[11px] text-slate-500 hidden sm:inline">{tx.sumber_dana}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 leading-snug">
                        {tx.keterangan}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Pencatat: {tx.created_by}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 pl-11 sm:pl-0">
                    <div className={`text-base font-bold font-mono tabular-nums ${
                      isPemasukan ? 'text-teal-700' : 'text-rose-700'
                    }`}>
                      {isPemasukan ? '+' : '-'} {formatRupiah(tx.nominal)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isPemasukan ? 'Kas Masuk' : 'Kas Keluar'}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              Belum ada transaksi yang dicatat.
            </div>
          )}
        </div>

        {/* Footer Card */}
        <div className="bg-slate-50/80 px-5 py-3.5 sm:px-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>DKM Al Ikhlas berkomitmen pada tata kelola kas yang bersih & terbuka.</span>
          </div>
          <button
            onClick={onNavigateToReports}
            className="font-medium text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>Unduh Laporan Format PDF</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

      </section>

    </div>
  );
};

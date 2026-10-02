import React from 'react';
import { Category, FilterState, Transaction, UserProfile } from '../types';
import { formatDateIndo, formatDateTimeIndo, formatRupiah } from '../utils/formatters';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Edit3, 
  Trash2, 
  Eye, 
  ExternalLink, 
  Calendar, 
  Layers, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Lock,
  LogIn,
  SlidersHorizontal,
  FolderPlus
} from 'lucide-react';

interface TransactionManagerProps {
  transactions: Transaction[];
  categories: Category[];
  currentUser: UserProfile | null;
  onOpenAddModal: () => void;
  onOpenEditModal: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => Promise<void>;
  onOpenLogin: () => void;
  onOpenCategoryManager: () => void;
}

export const TransactionManager: React.FC<TransactionManagerProps> = ({
  transactions,
  categories,
  currentUser,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteTransaction,
  onOpenLogin,
  onOpenCategoryManager,
}) => {
  // Filters & State
  const [search, setSearch] = React.useState('');
  const [filterJenis, setFilterJenis] = React.useState<'semua' | 'pemasukan' | 'pengeluaran'>('semua');
  const [filterKategori, setFilterKategori] = React.useState<string>('semua');
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<'terbaru' | 'terlama' | 'nominal_terbesar' | 'nominal_terkecil'>('terbaru');

  // Modal Detail & Delete
  const [detailTx, setDetailTx] = React.useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const itemsPerPage = 8;

  // Filtered & Sorted Transactions
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchKeterangan = tx.keterangan.toLowerCase().includes(query);
        const matchKategori = tx.kategori.toLowerCase().includes(query);
        const matchSumber = tx.sumber_dana.toLowerCase().includes(query);
        const matchPencatat = tx.created_by.toLowerCase().includes(query);
        if (!matchKeterangan && !matchKategori && !matchSumber && !matchPencatat) {
          return false;
        }
      }

      // Filter Jenis
      if (filterJenis !== 'semua' && tx.jenis !== filterJenis) {
        return false;
      }

      // Filter Kategori
      if (filterKategori !== 'semua' && tx.kategori !== filterKategori) {
        return false;
      }

      // Filter Tanggal Mulai
      if (startDate && tx.tanggal < startDate) {
        return false;
      }

      // Filter Tanggal Selesai
      if (endDate && tx.tanggal > endDate) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'terbaru') {
        return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
      }
      if (sortBy === 'terlama') {
        return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
      }
      if (sortBy === 'nominal_terbesar') {
        return b.nominal - a.nominal;
      }
      if (sortBy === 'nominal_terkecil') {
        return a.nominal - b.nominal;
      }
      return 0;
    });
  }, [transactions, search, filterJenis, filterKategori, startDate, endDate, sortBy]);

  // Reset pagination when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, filterJenis, filterKategori, startDate, endDate, sortBy]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const handleResetFilters = () => {
    setSearch('');
    setFilterJenis('semua');
    setFilterKategori('semua');
    setStartDate('');
    setEndDate('');
    setSortBy('terbaru');
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await onDeleteTransaction(deleteId);
      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // If user is not logged in as pengurus
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200/80 shadow-md text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Area Khusus Pengurus DKM</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Untuk menambah, mengubah, atau menghapus catatan transaksi keuangan kas, Anda harus masuk sebagai pengurus DKM Al Ikhlas.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={onOpenLogin}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Login Pengurus Sekarang</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Transaksi Kas</h1>
          <p className="text-xs text-slate-500">
            Kelola mutasi pemasukan dan pengeluaran kas Masjid DKM Al Ikhlas
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenCategoryManager}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-emerald-700" />
            <span>Kelola Kategori</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Transaksi Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Row 1: Search & Jenis Tabs */}
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari keterangan, kategori, pencatat, atau sumber dana..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
          </div>

          {/* Segmented Jenis Tab */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setFilterJenis('semua')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterJenis === 'semua' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({transactions.length})
            </button>
            <button
              onClick={() => setFilterJenis('pemasukan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterJenis === 'pemasukan' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pemasukan
            </button>
            <button
              onClick={() => setFilterJenis('pengeluaran')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterJenis === 'pengeluaran' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengeluaran
            </button>
          </div>

        </div>

        {/* Row 2: Secondary Dropdowns (Kategori, Tanggal, Urutkan) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-slate-100">
          
          {/* Filter Kategori */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Kategori
            </label>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="semua">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.nama}>
                  {c.nama} ({c.jenis === 'pemasukan' ? 'Masuk' : 'Keluar'})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tanggal Mulai */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Filter Tanggal Selesai */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Urutkan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Urutkan Berdasarkan
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="terbaru">Tanggal Terbaru</option>
                <option value="terlama">Tanggal Terlama</option>
                <option value="nominal_terbesar">Nominal Terbesar</option>
                <option value="nominal_terkecil">Nominal Terkecil</option>
              </select>

              {(search || filterJenis !== 'semua' || filterKategori !== 'semua' || startDate || endDate) && (
                <button
                  onClick={handleResetFilters}
                  title="Reset Semua Filter"
                  className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Transaction Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Table Header Summary */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Menampilkan <strong className="text-slate-900">{filteredTransactions.length}</strong> transaksi
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Halaman {currentPage} dari {totalPages}
          </span>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Tanggal</th>
                <th className="py-3 px-4 font-semibold">Jenis</th>
                <th className="py-3 px-4 font-semibold">Kategori</th>
                <th className="py-3 px-4 font-semibold">Keterangan</th>
                <th className="py-3 px-4 font-semibold text-right">Nominal</th>
                <th className="py-3 px-4 font-semibold">Sumber Dana</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx) => {
                  const isPemasukan = tx.jenis === 'pemasukan';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Tanggal */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-900 font-medium">
                        {formatDateIndo(tx.tanggal)}
                      </td>

                      {/* Jenis */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                          isPemasukan ? 'bg-teal-50 text-teal-800' : 'bg-rose-50 text-rose-800'
                        }`}>
                          {isPemasukan ? <ArrowDownLeft className="w-3 h-3 text-teal-600" /> : <ArrowUpRight className="w-3 h-3 text-rose-600" />}
                          {isPemasukan ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </td>

                      {/* Kategori */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{tx.kategori}</span>
                      </td>

                      {/* Keterangan */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-900 truncate" title={tx.keterangan}>
                          {tx.keterangan}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Oleh: {tx.created_by}
                        </div>
                      </td>

                      {/* Nominal */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold tabular-nums">
                        <span className={isPemasukan ? 'text-teal-700' : 'text-rose-700'}>
                          {isPemasukan ? '+' : '-'} {formatRupiah(tx.nominal)}
                        </span>
                      </td>

                      {/* Sumber Dana */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                        {tx.sumber_dana}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1">
                          {/* Detail button */}
                          <button
                            onClick={() => setDetailTx(tx)}
                            title="Lihat Detail Transaksi"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => onOpenEditModal(tx)}
                            title="Edit Transaksi"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => setDeleteId(tx.id)}
                            title="Hapus Transaksi"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi yang cocok dengan kriteria filter saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <span className="font-semibold text-slate-800">
              Halaman {currentPage} dari {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-medium"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* Detail Transaction Modal */}
      {detailTx && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Detail Catatan Transaksi</h3>
              <button
                onClick={() => setDetailTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">ID Transaksi</span>
                <span className="font-mono text-slate-800">{detailTx.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Tanggal</span>
                <span className="font-semibold text-slate-800">{formatDateIndo(detailTx.tanggal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Jenis Transaksi</span>
                <span className={`font-bold ${detailTx.jenis === 'pemasukan' ? 'text-teal-700' : 'text-rose-700'}`}>
                  {detailTx.jenis === 'pemasukan' ? 'Pemasukan Kas (+)' : 'Pengeluaran Kas (-)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Kategori</span>
                <span className="font-semibold text-slate-900">{detailTx.kategori}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Nominal</span>
                <span className="font-mono font-bold text-sm text-slate-900">{formatRupiah(detailTx.nominal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Sumber / Rekening</span>
                <span className="text-slate-800">{detailTx.sumber_dana}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Nama Pencatat</span>
                <span className="text-slate-800">{detailTx.created_by}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Waktu Pencatatan</span>
                <span className="text-slate-600">{formatDateTimeIndo(detailTx.created_at)}</span>
              </div>

              <div className="pt-2">
                <span className="block text-slate-500 mb-1">Rincian Keterangan:</span>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed">
                  {detailTx.keterangan}
                </p>
              </div>

              {detailTx.bukti_url && (
                <div className="pt-2">
                  <span className="block text-slate-500 mb-1">Bukti Transaksi:</span>
                  <a
                    href={detailTx.bukti_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold hover:underline"
                  >
                    <span>Buka Tautan Bukti Nota / Transfer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDetailTx(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Transaksi</h3>
              <p className="text-xs text-slate-500">
                Apakah Anda yakin ingin menghapus catatan transaksi ini? Saldo kas akan otomatis dihitung ulang.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

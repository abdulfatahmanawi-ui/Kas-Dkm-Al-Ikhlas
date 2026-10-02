import React from 'react';
import { Category, TransactionType } from '../types';
import { X, Plus, Trash2, Tag, ArrowDownLeft, ArrowUpRight, FolderPlus } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (payload: Omit<Category, 'id' | 'created_at'>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [activeTab, setActiveTab] = React.useState<TransactionType>('pemasukan');
  const [namaKategori, setNamaKategori] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const filtered = categories.filter(c => c.jenis === activeTab);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const clean = namaKategori.trim();
    if (!clean) {
      setErrorMsg('Nama kategori tidak boleh kosong.');
      return;
    }

    if (categories.some(c => c.jenis === activeTab && c.nama.toLowerCase() === clean.toLowerCase())) {
      setErrorMsg('Kategori dengan nama ini sudah ada.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddCategory({
        nama: clean,
        jenis: activeTab,
      });
      setNamaKategori('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message || 'Gagal menambahkan kategori');
      } else {
        setErrorMsg('Gagal menambahkan kategori');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <FolderPlus className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">Kelola Kategori Kas</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Tabs Jenis Kategori */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab('pemasukan'); setErrorMsg(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'pemasukan' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-teal-600" />
              <span>Kategori Pemasukan</span>
            </button>
            <button
              onClick={() => { setActiveTab('pengeluaran'); setErrorMsg(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'pengeluaran' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
              <span>Kategori Pengeluaran</span>
            </button>
          </div>

          {/* Form Tambah Kategori */}
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Tambah Kategori Baru ({activeTab === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={namaKategori}
                onChange={(e) => setNamaKategori(e.target.value)}
                placeholder="Contoh: Infak Pembangunan"
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shrink-0 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
            {errorMsg && <p className="text-xs text-rose-600">{errorMsg}</p>}
          </form>

          {/* List Kategori Saat Ini */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500">
              Daftar Kategori Aktif ({filtered.length}):
            </span>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
              {filtered.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-800">{cat.nama}</span>
                  </div>
                  {/* Izinkan hapus untuk kategori kustom (yang dibuat user) */}
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    title="Hapus Kategori"
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
            >
              Selesai
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

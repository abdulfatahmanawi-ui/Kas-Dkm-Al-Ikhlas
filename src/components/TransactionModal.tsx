import React from 'react';
import { Category, Transaction, TransactionType, UserProfile } from '../types';
import { formatRupiah, getTodayDateString } from '../utils/formatters';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  Tag, 
  FileText, 
  DollarSign, 
  CreditCard, 
  Image as ImageIcon, 
  User, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  transactionToEdit?: Transaction | null;
  categories: Category[];
  currentUser: UserProfile | null;
  onOpenCategoryManager: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transactionToEdit,
  categories,
  currentUser,
  onOpenCategoryManager,
}) => {
  const [jenis, setJenis] = React.useState<TransactionType>('pemasukan');
  const [tanggal, setTanggal] = React.useState<string>(getTodayDateString());
  const [kategori, setKategori] = React.useState<string>('Infak');
  const [keterangan, setKeterangan] = React.useState<string>('');
  const [nominalStr, setNominalStr] = React.useState<string>('');
  const [sumberDana, setSumberDana] = React.useState<string>('Kotak Amal Utama');
  const [buktiUrl, setBuktiUrl] = React.useState<string>('');
  const [namaPenginput, setNamaPenginput] = React.useState<string>('');
  
  const [errorMsg, setErrorMsg] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Filter kategori berdasarkan jenis transaksi
  const filteredCategories = React.useMemo(() => {
    return categories.filter(c => c.jenis === jenis);
  }, [categories, jenis]);

  // Reset form ketika modal dibuka / diedit
  React.useEffect(() => {
    if (transactionToEdit) {
      setJenis(transactionToEdit.jenis);
      setTanggal(transactionToEdit.tanggal);
      setKategori(transactionToEdit.kategori);
      setKeterangan(transactionToEdit.keterangan);
      setNominalStr(transactionToEdit.nominal.toString());
      setSumberDana(transactionToEdit.sumber_dana || 'Kas Tunai DKM');
      setBuktiUrl(transactionToEdit.bukti_url || '');
      setNamaPenginput(transactionToEdit.created_by);
    } else {
      setJenis('pemasukan');
      setTanggal(getTodayDateString());
      setKategori(filteredCategories[0]?.nama || 'Infak');
      setKeterangan('');
      setNominalStr('');
      setSumberDana('Kotak Amal Utama');
      setBuktiUrl('');
      setNamaPenginput(currentUser ? `${currentUser.nama}` : 'Pengurus Kas DKM');
    }
    setErrorMsg('');
  }, [transactionToEdit, isOpen, currentUser]);

  // Sesuaikan kategori default saat ganti jenis
  const handleJenisChange = (newJenis: TransactionType) => {
    setJenis(newJenis);
    const available = categories.filter(c => c.jenis === newJenis);
    if (available.length > 0) {
      setKategori(available[0].nama);
    }
    if (newJenis === 'pemasukan') {
      setSumberDana('Kotak Amal Utama');
    } else {
      setSumberDana('Kas Tunai DKM');
    }
  };

  const parsedNominal = React.useMemo(() => {
    const cleaned = nominalStr.replace(/\D/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  }, [nominalStr]);

  const handleNominalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setNominalStr(rawVal);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!tanggal) {
      setErrorMsg('Pilih tanggal transaksi.');
      return;
    }

    if (!keterangan.trim()) {
      setErrorMsg('Keterangan transaksi wajib diisi.');
      return;
    }

    if (parsedNominal <= 0) {
      setErrorMsg('Nominal transaksi harus berupa angka positif.');
      return;
    }

    if (!kategori) {
      setErrorMsg('Pilih kategori transaksi.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        tanggal,
        jenis,
        kategori,
        keterangan: keterangan.trim(),
        nominal: parsedNominal,
        sumber_dana: sumberDana.trim() || (jenis === 'pemasukan' ? 'Kotak Amal Utama' : 'Kas Tunai DKM'),
        bukti_url: buktiUrl.trim() || undefined,
        created_by: namaPenginput.trim() || 'Pengurus DKM Al Ikhlas',
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message || 'Gagal menyimpan transaksi');
      } else {
        setErrorMsg('Gagal menyimpan transaksi');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all my-8"
        role="dialog"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {transactionToEdit ? 'Edit Catatan Transaksi' : 'Tambah Transaksi Kas Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              KAS DKM AL IKHLAS - Dusun Pokek RW 004
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Jenis Transaksi Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jenis Transaksi *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleJenisChange('pemasukan')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                  jenis === 'pemasukan'
                    ? 'bg-teal-50 border-teal-600 text-teal-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownLeft className={`w-4 h-4 ${jenis === 'pemasukan' ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>Pemasukan (Kas Masuk)</span>
              </button>

              <button
                type="button"
                onClick={() => handleJenisChange('pengeluaran')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                  jenis === 'pengeluaran'
                    ? 'bg-rose-50 border-rose-600 text-rose-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className={`w-4 h-4 ${jenis === 'pengeluaran' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>Pengeluaran (Kas Keluar)</span>
              </button>
            </div>
          </div>

          {/* Tanggal & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Transaksi *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Kategori *
                </label>
                <button
                  type="button"
                  onClick={onOpenCategoryManager}
                  className="text-[11px] text-emerald-700 hover:underline font-medium"
                >
                  + Kategori Baru
                </button>
              </div>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                required
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.nama}>
                    {c.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nominal (Rupiah Input) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nominal Transaksi (Rp) *
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-xs">
                Rp
              </div>
              <input
                type="text"
                value={nominalStr ? Number(nominalStr).toLocaleString('id-ID') : ''}
                onChange={handleNominalInput}
                placeholder="Contoh: 500.000"
                className="w-full text-sm font-bold font-mono pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                required
              />
            </div>
            {parsedNominal > 0 && (
              <p className="mt-1 text-[11px] text-emerald-700 font-medium">
                Terbaca: <span className="font-bold">{formatRupiah(parsedNominal)}</span>
              </p>
            )}
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan / Rincian *
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Infak Sholat Jumat pekan 1 atau Pembayaran token PLN masjid"
              className="w-full text-xs rounded-xl border border-slate-200 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              required
            />
          </div>

          {/* Sumber Dana / Saluran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sumber / Rekening Kas *
              </label>
              <select
                value={sumberDana}
                onChange={(e) => setSumberDana(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              >
                <option value="Kotak Amal Utama">Kotak Amal Utama</option>
                <option value="Kotak Amal Subuh">Kotak Amal Subuh</option>
                <option value="Kotak Amal Jumat">Kotak Amal Jumat</option>
                <option value="Kas Tunai DKM">Kas Tunai DKM</option>
                <option value="Transfer Rekening DKM">Transfer Rekening DKM (BSI)</option>
                <option value="Donatur Langsung">Donatur Langsung</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Penginput *
              </label>
              <input
                type="text"
                value={namaPenginput}
                onChange={(e) => setNamaPenginput(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Bukti Transaksi (Opsional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Link Bukti Transaksi / Nota (Opsional)
            </label>
            <div className="relative">
              <input
                type="url"
                value={buktiUrl}
                onChange={(e) => setBuktiUrl(e.target.value)}
                placeholder="https://drive.google.com/... atau URL foto nota"
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Bisa tautan Google Drive / Cloudinary foto struk atau kuitansi.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : transactionToEdit ? 'Perbarui Transaksi' : 'Simpan Transaksi'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

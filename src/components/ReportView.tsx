import React from 'react';
import { Transaction } from '../types';
import { formatDateIndo, formatRupiah, getDateRangeForPeriod, getTodayDateString } from '../utils/formatters';
import { exportReportToPDF } from '../utils/pdfExport';
import { 
  Printer, 
  Download, 
  Calendar, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  FileSpreadsheet,
  CheckCircle,
  BarChart3,
  Layers
} from 'lucide-react';
import logoImg from '../assets/images/logo_dkm_al_ikhlas_1790979470443.jpg';

interface ReportViewProps {
  transactions: Transaction[];
}

export const ReportView: React.FC<ReportViewProps> = ({ transactions }) => {
  const [period, setPeriod] = React.useState<'hari_ini' | 'minggu_ini' | 'bulan_ini' | 'tahun_ini' | 'kustom'>('bulan_ini');
  const [customStart, setCustomStart] = React.useState<string>('');
  const [customEnd, setCustomEnd] = React.useState<string>(getTodayDateString());
  const [filterJenis, setFilterJenis] = React.useState<'semua' | 'pemasukan' | 'pengeluaran'>('semua');
  const [isExporting, setIsExporting] = React.useState(false);

  // Hitung range tanggal aktif
  const activeDateRange = React.useMemo(() => {
    if (period === 'kustom') {
      return { start: customStart, end: customEnd };
    }
    return getDateRangeForPeriod(period);
  }, [period, customStart, customEnd]);

  // Label periode untuk laporan & PDF
  const periodLabel = React.useMemo(() => {
    if (period === 'hari_ini') {
      return `Hari Ini (${formatDateIndo(getTodayDateString())})`;
    }
    if (period === 'minggu_ini') {
      return `Minggu Ini (${formatDateIndo(activeDateRange.start)} s/d ${formatDateIndo(activeDateRange.end)})`;
    }
    if (period === 'bulan_ini') {
      const now = new Date();
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return `Bulan ${months[now.getMonth()]} ${now.getFullYear()}`;
    }
    if (period === 'tahun_ini') {
      return `Tahun ${new Date().getFullYear()}`;
    }
    if (period === 'kustom') {
      if (customStart && customEnd) {
        return `${formatDateIndo(customStart)} s/d ${formatDateIndo(customEnd)}`;
      }
      return 'Semua Periode Transaksi';
    }
    return 'Semua Periode';
  }, [period, activeDateRange, customStart, customEnd]);

  // Filter transaksi berdasarkan periode dan jenis
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      if (activeDateRange.start && tx.tanggal < activeDateRange.start) {
        return false;
      }
      if (activeDateRange.end && tx.tanggal > activeDateRange.end) {
        return false;
      }
      if (filterJenis !== 'semua' && tx.jenis !== filterJenis) {
        return false;
      }
      return true;
    }).sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  }, [transactions, activeDateRange, filterJenis]);

  // Hitung total pemasukan & pengeluaran untuk periode terpilih
  const reportTotals = React.useMemo(() => {
    let masuk = 0;
    let keluar = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.jenis === 'pemasukan') {
        masuk += tx.nominal;
      } else {
        keluar += tx.nominal;
      }
    });

    const saldoAkhir = masuk - keluar;
    return { masuk, keluar, saldoAkhir };
  }, [filteredTransactions]);

  // Rekap per kategori
  const categoryRecap = React.useMemo(() => {
    const recapMap: Record<string, { nama: string; jenis: 'pemasukan' | 'pengeluaran'; total: number; count: number }> = {};

    filteredTransactions.forEach((tx) => {
      if (!recapMap[tx.kategori]) {
        recapMap[tx.kategori] = {
          nama: tx.kategori,
          jenis: tx.jenis,
          total: 0,
          count: 0,
        };
      }
      recapMap[tx.kategori].total += tx.nominal;
      recapMap[tx.kategori].count += 1;
    });

    return Object.values(recapMap).sort((a, b) => b.total - a.total);
  }, [filteredTransactions]);

  // Handler Download PDF
  const handleDownloadPDF = async () => {
    try {
      setIsExporting(true);
      await exportReportToPDF({
        transactions: filteredTransactions,
        periodLabel,
        totalPemasukan: reportTotals.masuk,
        totalPengeluaran: reportTotals.keluar,
        saldo: reportTotals.saldoAkhir,
        logoUrl: logoImg,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handler Print
  const handlePrint = () => {
    window.print();
  };

  // Hitung saldo berjalan secara kronologis untuk tabel
  let runningBalance = 0;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Control Card (Hidden when printing) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 no-print">
        
        {/* Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Laporan Keuangan Kas Masjid</h1>
            <p className="text-xs text-slate-500">
              KAS DKM AL IKHLAS - Dusun Pokek RW 004, Desa Kawunganten
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Laporan</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Membuat PDF...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-semibold text-slate-700">
              Pilih Periode Laporan:
            </label>
            <span className="text-xs font-bold text-emerald-800">
              {periodLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'hari_ini', label: 'Harian' },
              { id: 'minggu_ini', label: 'Mingguan' },
              { id: 'bulan_ini', label: 'Bulanan' },
              { id: 'tahun_ini', label: 'Tahunan' },
              { id: 'kustom', label: 'Periode Kustom' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  period === p.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker */}
          {period === 'kustom' && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Dari Tanggal:</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Sampai Tanggal:</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          )}

          {/* Filter Jenis: Semua, Pemasukan, Pengeluaran */}
          <div className="flex items-center gap-2 pt-2 text-xs">
            <span className="text-slate-500 font-medium">Filter Jenis:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setFilterJenis('semua')}
                className={`px-3 py-1 rounded-md font-medium ${
                  filterJenis === 'semua' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterJenis('pemasukan')}
                className={`px-3 py-1 rounded-md font-medium ${
                  filterJenis === 'pemasukan' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Pemasukan Saja
              </button>
              <button
                onClick={() => setFilterJenis('pengeluaran')}
                className={`px-3 py-1 rounded-md font-medium ${
                  filterJenis === 'pengeluaran' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Pengeluaran Saja
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Official Printable Document Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 lg:p-10 space-y-8 print:p-0 print:border-none print:shadow-none">
        
        {/* Official Header Kop Surat */}
        <div className="flex items-center justify-between border-b-2 border-emerald-900 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-700 bg-emerald-50 shrink-0">
              <img src={logoImg} alt="Logo DKM Al Ikhlas" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 tracking-tight font-serif">
                KAS DKM AL IKHLAS
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Dusun Pokek RW 004, Desa Kawunganten
              </p>
              <p className="text-xs text-slate-600">
                Kecamatan Cikaum, Kabupaten Subang - Jawa Barat
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 hidden sm:block">
            <div className="font-semibold text-slate-800 uppercase tracking-wider">Laporan Keuangan</div>
            <div>Status: Terverifikasi Kas</div>
          </div>
        </div>

        {/* Laporan Subheader & Periode */}
        <div className="text-center space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wide">
            Rekapitulasi Arus Kas Masjid
          </h3>
          <p className="text-xs text-slate-600">
            Periode Laporan: <strong className="text-emerald-900">{periodLabel}</strong>
          </p>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80">
            <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Total Pemasukan</div>
            <div className="text-xl font-bold font-mono text-teal-900 mt-1 tabular-nums">
              {formatRupiah(reportTotals.masuk)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80">
            <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Total Pengeluaran</div>
            <div className="text-xl font-bold font-mono text-rose-900 mt-1 tabular-nums">
              {formatRupiah(reportTotals.keluar)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Saldo Periode Ini</div>
            <div className="text-xl font-bold font-mono text-emerald-950 mt-1 tabular-nums">
              {formatRupiah(reportTotals.saldoAkhir)}
            </div>
          </div>

        </div>

        {/* Rekap Per Kategori Table */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Rekapitulasi Nominal Per Kategori</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Kategori</th>
                  <th className="py-2.5 px-4 font-semibold">Jenis Arus Kas</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Jumlah Transaksi</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryRecap.length > 0 ? (
                  categoryRecap.map((c) => (
                    <tr key={c.nama} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-medium text-slate-900">{c.nama}</td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.jenis === 'pemasukan' ? 'bg-teal-50 text-teal-800' : 'bg-rose-50 text-rose-800'
                        }`}>
                          {c.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-slate-600">{c.count}x</td>
                      <td className={`py-2.5 px-4 text-right font-mono font-bold tabular-nums ${
                        c.jenis === 'pemasukan' ? 'text-teal-700' : 'text-rose-700'
                      }`}>
                        {formatRupiah(c.total)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">
                      Tidak ada transaksi pada periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Rincian Transaksi Lengkap */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Rincian Buku Kas Kronologis</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-900 text-white text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 text-center">No</th>
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Jenis</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Keterangan</th>
                  <th className="py-3 px-3 text-right">Pemasukan</th>
                  <th className="py-3 px-3 text-right">Pengeluaran</th>
                  <th className="py-3 px-3 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, idx) => {
                    const isMasuk = tx.jenis === 'pemasukan';
                    if (isMasuk) {
                      runningBalance += tx.nominal;
                    } else {
                      runningBalance -= tx.nominal;
                    }

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-800">{formatDateIndo(tx.tanggal)}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isMasuk ? 'bg-teal-50 text-teal-800' : 'bg-rose-50 text-rose-800'
                          }`}>
                            {isMasuk ? 'Pemasukan' : 'Pengeluaran'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">{tx.kategori}</td>
                        <td className="py-2.5 px-3 max-w-xs text-slate-700">{tx.keterangan}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-teal-700 tabular-nums">
                          {isMasuk ? formatRupiah(tx.nominal) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-rose-700 tabular-nums">
                          {!isMasuk ? formatRupiah(tx.nominal) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {formatRupiah(runningBalance)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada catatan transaksi pada filter atau periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                <tr>
                  <td colSpan={5} className="py-3 px-3 text-right uppercase text-[11px]">
                    Total Keseluruhan Periode:
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-teal-800 tabular-nums">
                    {formatRupiah(reportTotals.masuk)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-800 tabular-nums">
                    {formatRupiah(reportTotals.keluar)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-950 tabular-nums">
                    {formatRupiah(reportTotals.saldoAkhir)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Tanda Tangan Pengurus (Signatures Block) */}
        <div className="pt-8 border-t border-slate-200 text-xs text-slate-700 space-y-6">
          <div className="flex justify-between items-center text-slate-500">
            <span>Dusun Pokek RW 004, Desa Kawunganten</span>
            <span>Kawunganten, {formatDateIndo(getTodayDateString())}</span>
          </div>

          <div className="text-center font-semibold text-slate-800">
            Mengetahui,
          </div>

          <div className="grid grid-cols-3 gap-6 text-center pt-2">
            
            <div className="space-y-16">
              <span className="font-semibold text-slate-800">Ketua DKM</span>
              <div>
                <p className="font-bold text-slate-900 underline">( H. Maman )</p>
                <p className="text-[11px] text-slate-500">DKM Al Ikhlas</p>
              </div>
            </div>

            <div className="space-y-16">
              <span className="font-semibold text-slate-800">Bendahara DKM</span>
              <div>
                <p className="font-bold text-slate-900 underline">( H. Sobari )</p>
                <p className="text-[11px] text-slate-500">Bendahara Kas</p>
              </div>
            </div>

            <div className="space-y-16">
              <span className="font-semibold text-slate-800">Pengurus DKM</span>
              <div>
                <p className="font-bold text-slate-900 underline">( Ustadz Rahmat )</p>
                <p className="text-[11px] text-slate-500">Sekretaris</p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

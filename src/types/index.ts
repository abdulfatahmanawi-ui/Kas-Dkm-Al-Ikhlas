export type TransactionType = 'pemasukan' | 'pengeluaran';

export interface Transaction {
  id: string;
  tanggal: string; // YYYY-MM-DD
  jenis: TransactionType;
  kategori: string;
  keterangan: string;
  nominal: number;
  sumber_dana: string;
  bukti_url?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  nama: string;
  jenis: TransactionType;
  created_at: string;
}

export interface UserProfile {
  id: string;
  nama: string;
  email: string;
  role: 'pengurus' | 'bendahara' | 'ketua' | 'admin';
  created_at: string;
}

export type ReportPeriod = 'hari_ini' | 'minggu_ini' | 'bulan_ini' | 'tahun_ini' | 'kustom';

export interface FilterState {
  search: string;
  jenis: 'semua' | TransactionType;
  kategori: string;
  startDate: string;
  endDate: string;
  sortBy: 'terbaru' | 'terlama' | 'nominal_terbesar' | 'nominal_terkecil';
}

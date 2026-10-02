-- ====================================================================
-- SKEMA DATABASE SUPABASE: KAS DKM AL IKHLAS
-- Dusun Pokek RW 004, Desa Kawunganten, Kecamatan Cikaum, Kabupaten Subang
-- ====================================================================

-- 1. TABEL PROFILES (PENGURUS DKM)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'pengurus',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Aktifkan Row Level Security (RLS) untuk profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Pengurus can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. TABEL KATEGORI TRANSAKSI
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('pemasukan', 'pengeluaran')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Aktifkan RLS untuk categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Publik bisa melihat daftar kategori
CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT
  USING (true);

-- Hanya pengurus yang terautentikasi yang dapat menambah kategori
CREATE POLICY "Pengurus can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Hanya pengurus yang terautentikasi yang dapat menghapus kategori
CREATE POLICY "Pengurus can delete categories"
  ON public.categories FOR DELETE
  USING (auth.role() = 'authenticated');

-- 3. TABEL TRANSAKSI KAS
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  tanggal DATE NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('pemasukan', 'pengeluaran')),
  kategori TEXT NOT NULL,
  keterangan TEXT NOT NULL,
  nominal NUMERIC NOT NULL CHECK (nominal > 0),
  sumber_dana TEXT NOT NULL DEFAULT 'Kas Tunai DKM',
  bukti_url TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ
);

-- Aktifkan RLS untuk transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transparansi publik: Semua jamaah/masyarakat umum dapat membaca data transaksi
CREATE POLICY "Masyarakat umum dapat melihat transaksi publik"
  ON public.transactions FOR SELECT
  USING (true);

-- Hanya pengurus yang login yang dapat menambahkan transaksi baru
CREATE POLICY "Pengurus dapat menambah transaksi"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Hanya pengurus yang login yang dapat mengubah transaksi
CREATE POLICY "Pengurus dapat mengedit transaksi"
  ON public.transactions FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Hanya pengurus yang login yang dapat menghapus transaksi
CREATE POLICY "Pengurus dapat menghapus transaksi"
  ON public.transactions FOR DELETE
  USING (auth.role() = 'authenticated');

-- 4. INSERT DATA KATEGORI AWAL
INSERT INTO public.categories (id, nama, jenis) VALUES
  ('cat-in-1', 'Infak', 'pemasukan'),
  ('cat-in-2', 'Sedekah', 'pemasukan'),
  ('cat-in-3', 'Donasi', 'pemasukan'),
  ('cat-in-4', 'Zakat', 'pemasukan'),
  ('cat-in-5', 'Sumbangan', 'pemasukan'),
  ('cat-in-6', 'Wakaf', 'pemasukan'),
  ('cat-in-7', 'Lainnya', 'pemasukan'),
  ('cat-out-1', 'Operasional DKM', 'pengeluaran'),
  ('cat-out-2', 'Listrik', 'pengeluaran'),
  ('cat-out-3', 'Air', 'pengeluaran'),
  ('cat-out-4', 'Kebersihan', 'pengeluaran'),
  ('cat-out-5', 'Kegiatan Keagamaan', 'pengeluaran'),
  ('cat-out-6', 'Perawatan Masjid', 'pengeluaran'),
  ('cat-out-7', 'Perlengkapan', 'pengeluaran'),
  ('cat-out-8', 'Honorarium', 'pengeluaran'),
  ('cat-out-9', 'Sosial', 'pengeluaran'),
  ('cat-out-10', 'Lainnya', 'pengeluaran')
ON CONFLICT (id) DO NOTHING;

-- 5. INSERT DATA TRANSAKSI CONTOH UNTUK TESTING
INSERT INTO public.transactions (id, tanggal, jenis, kategori, keterangan, nominal, sumber_dana, created_by) VALUES
  ('tx-001', '2026-10-02', 'pemasukan', 'Infak', 'Infak Sholat Jumat Berjamaah (Pekan I Oktober)', 3450000, 'Kotak Amal Utama', 'Bendahara DKM (H. Sobari)'),
  ('tx-002', '2026-10-01', 'pengeluaran', 'Listrik', 'Pembayaran Token Listrik PLN Masjid & Penerangan Halaman', 650000, 'Kas Tunai DKM', 'Bendahara DKM (H. Sobari)'),
  ('tx-003', '2026-09-28', 'pemasukan', 'Donasi', 'Donasi Jamaah Keluarga Bpk. H. Supardi untuk Pengajian Bulanan', 2000000, 'Transfer Rekening DKM', 'Sekretaris DKM (Ustadz Rahmat)'),
  ('tx-004', '2026-09-26', 'pengeluaran', 'Kebersihan', 'Pembelian Alat Kebersihan, Sabun Pel, Karbol, dan Pewangi Ruangan', 320000, 'Kas Tunai DKM', 'Koordinator Perlengkapan'),
  ('tx-005', '2026-09-25', 'pemasukan', 'Infak', 'Infak Sholat Jumat Berjamaah (Pekan IV September)', 3120000, 'Kotak Amal Utama', 'Bendahara DKM (H. Sobari)'),
  ('tx-006', '2026-09-22', 'pengeluaran', 'Kegiatan Keagamaan', 'Konsumsi dan Perlengkapan Peringatan Maulid Nabi / Pengajian Rutin Jamaah', 1250000, 'Kas Tunai DKM', 'Sie Dakwah & Ibadah'),
  ('tx-007', '2026-09-20', 'pemasukan', 'Sedekah', 'Sedekah Subuh Kotak Koin Masjid Al Ikhlas', 875000, 'Kotak Amal Subuh', 'Bendahara DKM (H. Sobari)'),
  ('tx-008', '2026-09-18', 'pemasukan', 'Wakaf', 'Wakaf Karpet Shaf Utama dari Hamba Allah RT 012 Dusun Pokek', 4500000, 'Transfer Rekening DKM', 'Ketua DKM (Bpk. H. Maman)'),
  ('tx-009', '2026-09-15', 'pengeluaran', 'Perawatan Masjid', 'Servis Berkala AC Ruang Utama & Penggantian Lampu LED Halaman Depan', 850000, 'Kas Tunai DKM', 'Koordinator Perlengkapan'),
  ('tx-010', '2026-09-10', 'pengeluaran', 'Honorarium', 'Bisyarah / Honorarium Khotib Jumat, Imam Rawatib, dan Marbot Masjid', 1800000, 'Kas Tunai DKM', 'Bendahara DKM (H. Sobari)')
ON CONFLICT (id) DO NOTHING;

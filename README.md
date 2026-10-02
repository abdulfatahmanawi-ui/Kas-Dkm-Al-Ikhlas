# KAS DKM AL IKHLAS
**Dusun Pokek RW 004, Desa Kawunganten, Kecamatan Cikaum, Kabupaten Subang**

Aplikasi web modern, responsif, dan profesional untuk mengelola keuangan kas Dewan Kemakmuran Masjid (DKM) Al Ikhlas secara transparan, akuntabel, dan dapat diakses oleh masyarakat umum serta pengurus melalui HP maupun komputer.

---

## 🌟 Fitur Utama

1. **Dashboard Publik (Tanpa Login)**
   - Logo resmi DKM Al Ikhlas.
   - Saldo kas real-time (*Total Pemasukan - Total Pengeluaran*).
   - Kartu statistik: Saldo Kas, Total Pemasukan, Total Pengeluaran, dan Jumlah Transaksi.
   - Grafik & visualisasi perbandingan arus kas masuk dan keluar.
   - Transaksi terbaru dengan detail kategori, nominal, dan tanggal.
   - Akses cepat ke Laporan Keuangan dan Login Pengurus.

2. **Login Pengurus (Autentikasi Aman)**
   - Autentikasi menggunakan Supabase Auth (dengan dukungan mode penyimpanan lokal untuk demo langsung).
   - Akses RBAC: Hanya pengurus yang dapat menambah, mengubah, dan menghapus catatan kas.
   - Sandi tidak disimpan langsung di database kode sumber.

3. **Manajemen Transaksi Kas**
   - Form pencatatan lengkap: Tanggal, Jenis (Pemasukan/Pengeluaran), Kategori, Keterangan, Nominal (format Rupiah otomatis), Sumber Dana, Bukti Transaksi, dan Nama Penginput.
   - Pencarian transaksi secara langsung (*real-time*).
   - Filter berdasarkan jenis (Pemasukan/Pengeluaran), kategori, dan rentang tanggal.
   - Pengurutan berdasarkan tanggal terbaru/terlama atau nominal.
   - Konfirmasi modal sebelum menghapus transaksi.
   - Paginasi rapi untuk ribuan transaksi.

4. **Laporan Keuangan & Ekspor PDF / Cetak**
   - Periode laporan: Harian, Mingguan, Bulanan, Tahunan, dan Periode Kustom.
   - Rekapitulasi per kategori kas.
   - Tabel buku kas kronologis lengkap dengan saldo berjalan (*running balance*).
   - Tombol **Cetak Laporan** (dioptimalkan untuk kertas A4 dan format resmi kop surat DKM).
   - Tombol **Download PDF** menggunakan jsPDF dengan kop surat resmi DKM Al Ikhlas, ringkasan saldo, tabel kronologis, dan kolom tanda tangan (*Ketua DKM, Bendahara, Pengurus*).

5. **Manajemen Kategori**
   - Kategori pemasukan default: Infak, Sedekah, Donasi, Zakat, Sumbangan, Wakaf, Lainnya.
   - Kategori pengeluaran default: Operasional DKM, Listrik, Air, Kebersihan, Kegiatan Keagamaan, Perawatan Masjid, Perlengkapan, Honorarium, Sosial, Lainnya.
   - Pengurus dapat menambah kategori baru sesuai kebutuhan.

---

## 🗄️ Struktur Database Supabase

### 1. Tabel `profiles`
- `id` (UUID, Primary Key, relasi ke `auth.users`)
- `nama` (TEXT)
- `email` (TEXT)
- `role` (TEXT, default: `'pengurus'`)
- `created_at` (TIMESTAMPTZ)

### 2. Tabel `categories`
- `id` (TEXT, Primary Key)
- `nama` (TEXT)
- `jenis` (TEXT, `'pemasukan'` atau `'pengeluaran'`)
- `created_at` (TIMESTAMPTZ)

### 3. Tabel `transactions`
- `id` (TEXT, Primary Key)
- `tanggal` (DATE)
- `jenis` (TEXT, `'pemasukan'` atau `'pengeluaran'`)
- `kategori` (TEXT)
- `keterangan` (TEXT)
- `nominal` (NUMERIC, angka positif > 0)
- `sumber_dana` (TEXT)
- `bukti_url` (TEXT, opsional)
- `created_by` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

---

## 📜 Skrip SQL & Row Level Security (RLS)

Jalankan perintah SQL berikut di **SQL Editor** pada dashboard Supabase Anda:

```sql
-- 1. TABEL PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'pengurus',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- 2. TABEL KATEGORI
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('pemasukan', 'pengeluaran')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Pengurus can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

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

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Hak Akses Publik (Masyarakat Umum)
CREATE POLICY "Masyarakat umum dapat melihat transaksi publik"
  ON public.transactions FOR SELECT
  USING (true);

-- Hak Akses Pengurus yang terautentikasi
CREATE POLICY "Pengurus dapat menambah transaksi"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Pengurus dapat mengedit transaksi"
  ON public.transactions FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Pengurus dapat menghapus transaksi"
  ON public.transactions FOR DELETE
  USING (auth.role() = 'authenticated');
```

---

## ⚙️ Petunjuk Menghubungkan ke Supabase

1. Daftar dan buat project baru di [supabase.com](https://supabase.com).
2. Buka menu **SQL Editor**, salin skrip SQL di atas (atau dari file `supabase-schema.sql`), lalu klik tombol **Run**.
3. Buka **Project Settings** > **API**, salin **Project URL** dan **anon public key**.
4. Buat file `.env` di direktori utama proyek:
   ```env
   VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```
5. Atau masukkan URL dan Anon Key secara langsung melalui tombol **"Koneksi Supabase"** di navigasi aplikasi.

---

## 🚀 Petunjuk Instalasi & Menjalankan Lokal

```bash
# 1. Clone repository
git clone https://github.com/username/kas-dkm-al-ikhlas.git
cd kas-dkm-al-ikhlas

# 2. Install dependencies
npm install

# 3. Jalankan server pengembangan
npm run dev

# 4. Buka di browser
http://localhost:3000
```

---

## 🌐 Petunjuk Deploy

### Deploy ke Vercel
1. Impor repository GitHub Anda di dashboard Vercel.
2. Atur Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Masukkan Environment Variables: `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
6. Klik **Deploy**.

### Deploy ke Netlify
1. Pilih **Add new site** > **Import an existing project** dari GitHub.
2. Build Command: `npm run build`.
3. Publish directory: `dist`.
4. Tambahkan Environment Variables di **Site Configuration** > **Environment Variables**.
5. Klik **Deploy site**.

### Deploy ke GitHub Pages
1. Pastikan `base` di `vite.config.ts` sesuai dengan nama repository Anda.
2. Jalankan `npm run build`.
3. Arahkan GitHub Pages ke branch deployment atau folder `dist`.

---

## 🔑 Akun Demo Pengurus untuk Pengujian

- **Email**: `pengurus@dkm-alikhlas.id` atau `bendahara@alikhlas.id`
- **Kata Sandi**: `dkm12345`
*(Tersedia tombol satu-klik "Coba Akun Demo Pengurus" di dalam modal login)*

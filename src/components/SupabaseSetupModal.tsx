import React from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  Key, 
  ShieldCheck, 
  Server, 
  ExternalLink, 
  RotateCcw,
  Sparkles,
  Layers,
  Globe
} from 'lucide-react';
import { getSupabaseCredentials, isUsingLiveSupabase, resetDemoData, saveCustomSupabaseConfig } from '../lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const creds = getSupabaseCredentials();
  const [url, setUrl] = React.useState(creds.url);
  const [key, setKey] = React.useState(creds.key);
  const [copied, setCopied] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [activeGuide, setActiveGuide] = React.useState<'sql' | 'supabase' | 'deploy'>('sql');

  const isLive = isUsingLiveSupabase();

  const fullSqlScript = `-- ====================================================================
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profiles"
  ON public.profiles FOR SELECT USING (true);

-- 2. TABEL KATEGORI
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('pemasukan', 'pengeluaran')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Pengurus can insert categories"
  ON public.categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Pengurus can delete categories"
  ON public.categories FOR DELETE USING (auth.role() = 'authenticated');

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

CREATE POLICY "Masyarakat umum dapat melihat transaksi publik"
  ON public.transactions FOR SELECT USING (true);

CREATE POLICY "Pengurus dapat menambah transaksi"
  ON public.transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Pengurus dapat mengedit transaksi"
  ON public.transactions FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Pengurus dapat menghapus transaksi"
  ON public.transactions FOR DELETE USING (auth.role() = 'authenticated');

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
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(fullSqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomSupabaseConfig(url, key);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    onConfigChanged();
  };

  const handleResetData = () => {
    if (confirm('Kembalikan transaksi dan kategori ke data awal contoh?')) {
      resetDemoData();
      onConfigChanged();
      alert('Data kas berhasil dikembalikan ke data awal.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Konfigurasi Supabase & Deployment</h3>
              <p className="text-xs text-slate-500">
                KAS DKM AL IKHLAS - Database & Panduan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Status Bar */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            isLive 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              <div>
                <div className="text-xs font-bold">
                  {isLive ? 'Terhubung ke Supabase Cloud' : 'Mode Penyimpanan Lokal (Demo Aktif)'}
                </div>
                <div className="text-[11px] opacity-80">
                  {isLive 
                    ? 'Data kas tersinkronisasi langsung ke database PostgreSQL Supabase.'
                    : 'Aplikasi berjalan normal dengan penyimpanan browser (localStorage) & data awal masjid.'
                  }
                </div>
              </div>
            </div>

            <button
              onClick={handleResetData}
              title="Reset data demo"
              className="px-2.5 py-1.5 rounded-lg bg-white/80 hover:bg-white border text-xs font-semibold shrink-0 transition-colors"
            >
              Reset Data Demo
            </button>
          </div>

          {/* Form Input Custom Supabase Config */}
          <form onSubmit={handleSaveConfig} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-700" />
                Input Kredensial Supabase Sendiri (Opsional)
              </span>
              {savedSuccess && (
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Tersimpan!
                </span>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzabcdefg.supabase.co"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Anon Public Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">
                Kosongkan lalu Simpan untuk kembali ke Mode Demo Lokal.
              </span>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs"
              >
                Simpan & Sambungkan
              </button>
            </div>
          </form>

          {/* Guide Tabs */}
          <div className="space-y-3">
            <div className="flex border-b border-slate-200 gap-2">
              <button
                onClick={() => setActiveGuide('sql')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-all ${
                  activeGuide === 'sql'
                    ? 'border-emerald-700 text-emerald-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Skrip SQL & RLS
              </button>
              <button
                onClick={() => setActiveGuide('supabase')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-all ${
                  activeGuide === 'supabase'
                    ? 'border-emerald-700 text-emerald-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Cara Setup Supabase
              </button>
              <button
                onClick={() => setActiveGuide('deploy')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-all ${
                  activeGuide === 'deploy'
                    ? 'border-emerald-700 text-emerald-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                3. Panduan Deploy
              </button>
            </div>

            {/* Tab 1: SQL Script */}
            {activeGuide === 'sql' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Jalankan kode SQL ini di <strong>SQL Editor</strong> Supabase Anda:
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Semua SQL'}</span>
                  </button>
                </div>

                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono max-h-52 overflow-y-auto leading-relaxed">
                  {fullSqlScript}
                </pre>
              </div>
            )}

            {/* Tab 2: Supabase Step by step */}
            {activeGuide === 'supabase' && (
              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <ol className="list-decimal pl-4 space-y-2">
                  <li>
                    Buka <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">supabase.com</a> dan buat project baru (gratis).
                  </li>
                  <li>
                    Masuk ke menu <strong>SQL Editor</strong> di sidebar Supabase.
                  </li>
                  <li>
                    Salin skrip SQL dari tab <em>"1. Skrip SQL & RLS"</em> di atas, tempel di editor Supabase, lalu klik <strong>Run</strong>.
                  </li>
                  <li>
                    Tabel <code className="bg-slate-100 px-1 rounded text-emerald-800">transactions</code>, <code className="bg-slate-100 px-1 rounded text-emerald-800">categories</code>, dan <code className="bg-slate-100 px-1 rounded text-emerald-800">profiles</code> serta kebijakan Row Level Security (RLS) otomatis siap digunakan.
                  </li>
                  <li>
                    Buka <strong>Project Settings</strong> &gt; <strong>API</strong>, lalu salin <em>Project URL</em> dan <em>anon public key</em> ke dalam form di atas atau file <code className="bg-slate-100 px-1 rounded">.env</code>.
                  </li>
                </ol>
              </div>
            )}

            {/* Tab 3: Deploy Guides */}
            {activeGuide === 'deploy' && (
              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-700" />
                    Deploy ke Vercel / Netlify:
                  </div>
                  <p>1. Hubungkan repository GitHub Anda ke Vercel atau Netlify.</p>
                  <p>2. Build command: <code className="bg-white px-1.5 py-0.5 rounded border font-mono">npm run build</code></p>
                  <p>3. Output directory: <code className="bg-white px-1.5 py-0.5 rounded border font-mono">dist</code></p>
                  <p>4. Masukkan Environment Variables: <code className="font-mono">VITE_SUPABASE_URL</code> dan <code className="font-mono">VITE_SUPABASE_ANON_KEY</code>.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-700" />
                    Deploy ke GitHub Pages:
                  </div>
                  <p>Jalankan <code className="bg-white px-1.5 py-0.5 rounded border font-mono">npm run build</code>, dan arahkan GitHub Pages ke branch gh-pages atau folder docs / dist.</p>
                </div>
              </div>
            )}

          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

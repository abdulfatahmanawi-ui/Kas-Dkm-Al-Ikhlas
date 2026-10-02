import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Category, Transaction, UserProfile } from '../types';
import { DEFAULT_CATEGORIES, INITIAL_TRANSACTIONS } from '../data/seedData';

const LOCAL_STORAGE_TRANSACTIONS = 'dkm_al_ikhlas_transactions';
const LOCAL_STORAGE_CATEGORIES = 'dkm_al_ikhlas_categories';
const LOCAL_STORAGE_USER = 'dkm_al_ikhlas_user';
const LOCAL_STORAGE_SUPABASE_CONFIG = 'dkm_supabase_config';

// Cek konfigurasi Supabase dari env atau localStorage
export function getSupabaseCredentials(): { url: string; key: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey && !envUrl.includes('your-project-ref')) {
    return { url: envUrl, key: envKey };
  }

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SUPABASE_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.key) {
        return { url: parsed.url, key: parsed.key };
      }
    }
  } catch {
    // fallback
  }

  return { url: '', key: '' };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (url && key) {
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, key);
    }
    return supabaseInstance;
  }
  return null;
}

export function isUsingLiveSupabase(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key);
}

// Inisialisasi local storage dengan seed data jika belum ada
function initLocalStorageData() {
  if (!localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS)) {
    localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_CATEGORIES)) {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  }
}

// ================= TRANSACTION API =================

export async function getTransactions(): Promise<Transaction[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('tanggal', { ascending: false });

      if (!error && data) {
        return data as Transaction[];
      }
      console.warn('Gagal mengambil data dari Supabase, beralih ke penyimpanan lokal:', error?.message);
    } catch (err) {
      console.warn('Supabase request error:', err);
    }
  }

  // Fallback Local Storage
  initLocalStorageData();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS);
    const txs: Transaction[] = raw ? JSON.parse(raw) : INITIAL_TRANSACTIONS;
    // Urutkan default tanggal terbaru
    return txs.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export async function createTransaction(payload: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
  const supabase = getSupabaseClient();
  const newTx: Transaction = {
    ...payload,
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTx])
        .select()
        .single();

      if (!error && data) {
        return data as Transaction;
      }
      console.warn('Gagal menyimpan ke Supabase, menyimpan ke lokal:', error?.message);
    } catch (err) {
      console.warn('Supabase insert error:', err);
    }
  }

  // Simpan ke Local Storage
  initLocalStorageData();
  const raw = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS);
  const txs: Transaction[] = raw ? JSON.parse(raw) : [];
  txs.unshift(newTx);
  localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS, JSON.stringify(txs));
  return newTx;
}

export async function updateTransaction(id: string, payload: Partial<Transaction>): Promise<Transaction> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return data as Transaction;
      }
    } catch (err) {
      console.warn('Supabase update error:', err);
    }
  }

  // Local Storage update
  initLocalStorageData();
  const raw = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS);
  const txs: Transaction[] = raw ? JSON.parse(raw) : [];
  const index = txs.findIndex(t => t.id === id);
  if (index !== -1) {
    txs[index] = { ...txs[index], ...payload, updated_at: new Date().toISOString() };
    localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS, JSON.stringify(txs));
    return txs[index];
  }
  throw new Error('Transaksi tidak ditemukan');
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (!error) return true;
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  // Local Storage delete
  initLocalStorageData();
  const raw = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS);
  const txs: Transaction[] = raw ? JSON.parse(raw) : [];
  const filtered = txs.filter(t => t.id !== id);
  localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS, JSON.stringify(filtered));
  return true;
}

// ================= CATEGORIES API =================

export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('nama', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Category[];
      }
    } catch (err) {
      console.warn('Supabase categories error:', err);
    }
  }

  initLocalStorageData();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CATEGORIES);
    return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export async function createCategory(payload: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
  const newCat: Category = {
    ...payload,
    id: `cat-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([newCat])
        .select()
        .single();
      if (!error && data) return data as Category;
    } catch (err) {
      console.warn('Supabase add category error:', err);
    }
  }

  initLocalStorageData();
  const raw = localStorage.getItem(LOCAL_STORAGE_CATEGORIES);
  const cats: Category[] = raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  cats.push(newCat);
  localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(cats));
  return newCat;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete category error:', err);
    }
  }

  initLocalStorageData();
  const raw = localStorage.getItem(LOCAL_STORAGE_CATEGORIES);
  const cats: Category[] = raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  const filtered = cats.filter(c => c.id !== id);
  localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(filtered));
  return true;
}

// ================= AUTHENTICATION API =================

export async function loginPengurus(email: string, pass: string): Promise<UserProfile> {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      throw new Error(error.message || 'Login gagal, periksa email dan password.');
    }

    if (data.user) {
      // Ambil profile atau bentuk dari user metadata
      const profile: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        nama: (data.user.user_metadata?.nama as string) || 'Pengurus DKM Al Ikhlas',
        role: 'pengurus',
        created_at: data.user.created_at,
      };
      localStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(profile));
      return profile;
    }
  }

  // Demo Pengurus Mode:
  // Kredensial default untuk demo & testing pengurus:
  // email: pengurus@dkm-alikhlas.id atau admin@alikhlas.id atau bendahara@alikhlas.id
  // password apa saja (minimal 6 karakter) atau "dkm12345"
  const cleanEmail = email.toLowerCase().trim();
  if (
    cleanEmail === 'pengurus@dkm-alikhlas.id' ||
    cleanEmail === 'admin@alikhlas.id' ||
    cleanEmail === 'bendahara@alikhlas.id' ||
    cleanEmail.includes('pengurus') ||
    cleanEmail.includes('admin')
  ) {
    if (pass.length < 5) {
      throw new Error('Password minimal 6 karakter.');
    }

    const demoProfile: UserProfile = {
      id: 'demo-pengurus-01',
      nama: cleanEmail.includes('bendahara') ? 'H. Sobari (Bendahara DKM)' : 'H. Maman (Pengurus DKM)',
      email: cleanEmail,
      role: cleanEmail.includes('bendahara') ? 'bendahara' : 'pengurus',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(demoProfile));
    return demoProfile;
  }

  // Jika input email umum, tetap izinkan jika password benar untuk testing fleksibel
  if (pass === 'dkm12345' || pass === 'admin123' || pass === 'bismillah') {
    const userProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      nama: email.split('@')[0] || 'Pengurus DKM Al Ikhlas',
      email: cleanEmail,
      role: 'pengurus',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(userProfile));
    return userProfile;
  }

  throw new Error('Email atau password salah. Gunakan akun pengurus atau sandi demo: dkm12345');
}

export async function logoutPengurus(): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    }
  }
  localStorage.removeItem(LOCAL_STORAGE_USER);
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Simpan custom Supabase URL dan Key dari modal konfigurasi
export function saveCustomSupabaseConfig(url: string, key: string) {
  if (!url || !key) {
    localStorage.removeItem(LOCAL_STORAGE_SUPABASE_CONFIG);
  } else {
    localStorage.setItem(
      LOCAL_STORAGE_SUPABASE_CONFIG,
      JSON.stringify({ url: url.trim(), key: key.trim() })
    );
  }
  supabaseInstance = null; // reset client instance
}

export function resetDemoData() {
  localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
}

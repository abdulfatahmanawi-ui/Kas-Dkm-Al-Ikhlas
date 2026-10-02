/**
 * Format angka ke format Rupiah standar Indonesia
 * Contoh: 1000000 -> "Rp 1.000.000"
 */
export function formatRupiah(nominal: number): string {
  if (isNaN(nominal)) return 'Rp 0';
  return 'Rp ' + Math.round(nominal).toLocaleString('id-ID');
}

/**
 * Format tanggal YYYY-MM-DD ke format Indonesia
 * Contoh: "2026-10-02" -> "02 Oktober 2026"
 */
export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(d);
    }
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    return `${dayStr} ${months[month - 1]} ${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format timestamp ISO ke format tanggal dan jam Indonesia
 * Contoh: "2026-10-02T13:30:00Z" -> "02 Oktober 2026, 13:30 WIB"
 */
export function formatDateTimeIndo(dateTimeStr: string): string {
  if (!dateTimeStr) return '-';
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return dateTimeStr;
    const dateFormatted = new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
    return `${dateFormatted} WIB`;
  } catch {
    return dateTimeStr;
  }
}

/**
 * Dapatkan tanggal hari ini dalam format YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Dapatkan rentang tanggal berdasarkan periode
 */
export function getDateRangeForPeriod(period: 'hari_ini' | 'minggu_ini' | 'bulan_ini' | 'tahun_ini'): { start: string; end: string } {
  const now = new Date();
  const todayStr = getTodayDateString();

  if (period === 'hari_ini') {
    return { start: todayStr, end: todayStr };
  }

  if (period === 'minggu_ini') {
    // 7 hari terakhir
    const past = new Date(now);
    past.setDate(now.getDate() - 6);
    const startStr = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`;
    return { start: startStr, end: todayStr };
  }

  if (period === 'bulan_ini') {
    // Awal bulan ini sampai hari ini
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return { start: `${year}-${month}-01`, end: todayStr };
  }

  if (period === 'tahun_ini') {
    // Awal tahun ini sampai hari ini
    const year = now.getFullYear();
    return { start: `${year}-01-01`, end: todayStr };
  }

  return { start: '', end: '' };
}

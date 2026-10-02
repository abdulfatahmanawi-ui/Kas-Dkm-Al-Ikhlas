import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '../types';
import { formatDateIndo, formatRupiah } from './formatters';

interface ExportPdfOptions {
  transactions: Transaction[];
  periodLabel: string;
  totalPemasukan: number;
  totalPengeluaran: number;
  saldo: number;
  logoUrl?: string;
}

export async function exportReportToPDF(options: ExportPdfOptions): Promise<void> {
  const {
    transactions,
    periodLabel,
    totalPemasukan,
    totalPengeluaran,
    saldo,
    logoUrl,
  } = options;

  // Initialize A4 document in portrait
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let startY = 15;

  // Coba muat logo jika ada
  if (logoUrl) {
    try {
      const img = new Image();
      img.src = logoUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // fallback graceful
      });
      if (img.complete && img.naturalWidth > 0) {
        doc.addImage(img, 'JPEG', 14, 12, 22, 22);
      }
    } catch {
      // Abaikan jika gambar gagal dimuat
    }
  }

  // Kop Surat DKM
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(6, 95, 70); // Emerald 800
  doc.text('KAS DKM AL IKHLAS', pageWidth / 2, startY + 2, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85); // Slate 700
  doc.text('Dusun Pokek RW 004, Desa Kawunganten', pageWidth / 2, startY + 8, { align: 'center' });
  doc.text('Kecamatan Cikaum, Kabupaten Subang - Jawa Barat', pageWidth / 2, startY + 13, { align: 'center' });

  // Garis pemisah kop surat ganda
  doc.setDrawColor(6, 95, 70);
  doc.setLineWidth(0.8);
  doc.line(14, startY + 18, pageWidth - 14, startY + 18);
  doc.setLineWidth(0.2);
  doc.line(14, startY + 19.5, pageWidth - 14, startY + 19.5);

  startY += 26;

  // Judul Laporan & Periode
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN KAS & KEUANGAN MASJID', pageWidth / 2, startY, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Periode Laporan: ${periodLabel}`, pageWidth / 2, startY + 6, { align: 'center' });
  doc.text(`Dicetak pada: ${formatDateIndo(new Date().toISOString().split('T')[0])}`, pageWidth / 2, startY + 11, { align: 'center' });

  startY += 18;

  // Box Ringkasan Keuangan
  const boxWidth = (pageWidth - 28) / 3;
  const boxHeight = 18;

  // Box Pemasukan
  doc.setFillColor(240, 253, 244); // Green 50
  doc.setDrawColor(187, 247, 208); // Green 200
  doc.roundedRect(14, startY, boxWidth - 3, boxHeight, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52);
  doc.text('TOTAL PEMASUKAN', 14 + (boxWidth - 3) / 2, startY + 6, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(formatRupiah(totalPemasukan), 14 + (boxWidth - 3) / 2, startY + 13, { align: 'center' });

  // Box Pengeluaran
  const box2X = 14 + boxWidth;
  doc.setFillColor(254, 242, 242); // Red 50
  doc.setDrawColor(254, 202, 202); // Red 200
  doc.roundedRect(box2X, startY, boxWidth - 3, boxHeight, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(153, 27, 27);
  doc.text('TOTAL PENGELUARAN', box2X + (boxWidth - 3) / 2, startY + 6, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(formatRupiah(totalPengeluaran), box2X + (boxWidth - 3) / 2, startY + 13, { align: 'center' });

  // Box Saldo Kas
  const box3X = 14 + boxWidth * 2;
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(167, 243, 208); // Emerald 200
  doc.roundedRect(box3X, startY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(6, 95, 70);
  doc.text('SALDO KAS SAAT INI', box3X + boxWidth / 2, startY + 6, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(formatRupiah(saldo), box3X + boxWidth / 2, startY + 13, { align: 'center' });

  startY += boxHeight + 8;

  // Hitung running balance untuk tabel
  let runningSaldo = 0;
  // Urutkan transaksi dari terlama ke terbaru untuk kalkulasi saldo berjalan kronologis
  const chronologicalTxs = [...transactions].sort(
    (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
  );

  const rows = chronologicalTxs.map((tx, idx) => {
    const isMasuk = tx.jenis === 'pemasukan';
    if (isMasuk) {
      runningSaldo += tx.nominal;
    } else {
      runningSaldo -= tx.nominal;
    }

    return [
      (idx + 1).toString(),
      formatDateIndo(tx.tanggal),
      isMasuk ? 'Pemasukan' : 'Pengeluaran',
      tx.kategori,
      tx.keterangan,
      isMasuk ? formatRupiah(tx.nominal) : '-',
      !isMasuk ? formatRupiah(tx.nominal) : '-',
      formatRupiah(runningSaldo),
    ];
  });

  // Generate Table
  autoTable(doc, {
    startY: startY,
    head: [['No', 'Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Pemasukan', 'Pengeluaran', 'Saldo']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [6, 95, 70],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      font: 'helvetica',
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', cellWidth: 22 },
      2: { halign: 'center', cellWidth: 20 },
      3: { cellWidth: 24 },
      4: { cellWidth: 'auto' },
      5: { halign: 'right', cellWidth: 24, textColor: [22, 101, 52] },
      6: { halign: 'right', cellWidth: 24, textColor: [185, 28, 28] },
      7: { halign: 'right', cellWidth: 26, fontStyle: 'bold' },
    },
    foot: [
      [
        '',
        '',
        'Total',
        '',
        `Rekapitulasi ${transactions.length} Transaksi`,
        formatRupiah(totalPemasukan),
        formatRupiah(totalPengeluaran),
        formatRupiah(saldo),
      ],
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'right',
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer Nomor Halaman
      const str = 'Halaman ' + doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, pageWidth - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
      doc.text(
        'KAS DKM AL IKHLAS - Dusun Pokek RW 004, Desa Kawunganten, Cikaum, Subang',
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    },
  });

  // Tanda Tangan Pengurus (Signatures)
  // Ambil posisi akhir tabel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : startY + 40;

  // Jika posisi terlalu dekat dengan dasar kertas, buat halaman baru
  let signY = finalY;
  if (signY + 45 > doc.internal.pageSize.getHeight()) {
    doc.addPage();
    signY = 20;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Kawunganten, ' + formatDateIndo(new Date().toISOString().split('T')[0]), pageWidth - 25, signY, {
    align: 'right',
  });
  doc.text('Mengetahui,', pageWidth / 2, signY + 6, { align: 'center' });

  const sigCol1 = 45;
  const sigCol2 = pageWidth / 2;
  const sigCol3 = pageWidth - 45;

  doc.text('Ketua DKM', sigCol1, signY + 14, { align: 'center' });
  doc.text('Bendahara DKM', sigCol2, signY + 14, { align: 'center' });
  doc.text('Pengurus Kas', sigCol3, signY + 14, { align: 'center' });

  // Ruang tanda tangan
  doc.setFont('helvetica', 'bold');
  doc.text('( H. Maman )', sigCol1, signY + 36, { align: 'center' });
  doc.text('( H. Sobari )', sigCol2, signY + 36, { align: 'center' });
  doc.text('( Ustadz Rahmat )', sigCol3, signY + 36, { align: 'center' });

  // Simpan file PDF
  const cleanPeriod = periodLabel.replace(/\s+/g, '_').toLowerCase();
  doc.save(`Laporan_Kas_DKM_Al_Ikhlas_${cleanPeriod}.pdf`);
}

// src/utils/exportHelper.js

/**
 * Ekspor data array ke format CSV/TSV profesional untuk dibuka di Microsoft Excel atau Google Sheets.
 * @param {Array} data - Data mentah yang akan diekspor
 * @param {Array} headers - Header kolom (contoh: ['Nama Perusahaan', 'Nomor PKS'])
 * @param {Array} keys - Kunci objek data yang dicocokkan dengan header
 * @param {string} filename - Nama file hasil unduhan
 */
export function exportToCSV(data, headers, keys, filename) {
  if (!data || !data.length) return;

  // Membuat konten CSV
  const csvRows = [];
  
  // Gabungkan header dengan pemisah koma
  csvRows.push(headers.map(header => `"${header.replace(/"/g, '""')}"`).join(','));

  // Tambahkan data baris per baris
  for (const row of data) {
    const values = keys.map(key => {
      let val = row[key];
      if (val === null || val === undefined) {
        val = '';
      } else {
        val = String(val);
      }
      // Bersihkan tanda kutip ganda di dalam nilai untuk mencegah malformasi CSV
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  // Gunakan UTF-8 BOM (\uFEFF) agar Microsoft Excel langsung mendeteksi encoding UTF-8
  const csvContent = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Memicu unduhan file di browser
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

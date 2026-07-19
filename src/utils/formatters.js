// Format tampilan RPKPS.

export const formatSksJam = (sks, jam) => `${+sks || 0} SKS / ${+jam || 0} jam per minggu`

export const formatTanggal = (d = new Date()) =>
  d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

// Tanggal + jam dari string ISO (untuk "Terakhir diubah"). '' jika kosong/invalid.
export const formatTanggalWaktu = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return ''
  return d.toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export const formatPustaka = (p) =>
  `${p.penulis}. ${p.tahun}. ${p.judul}. ${p.penerbit}.`

// Angka romawi 1..16 untuk kolom "Minggu Ke" RKPBM (seragam).
const ROMAWI = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI']
export const toRomawi = (n) => ROMAWI[n] || String(n)

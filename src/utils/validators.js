// Semua aturan validasi RPKPS. Dipakai wizard, dashboard, dan sebelum ekspor.

const num = (v) => (Number.isFinite(+v) ? +v : 0)

export function totalPenilaian(rpkps) {
  const p = rpkps.penilaian
  return num(p.uts) + num(p.uas) + num(p.nkp) + num(p.nkpr)
}

export function totalJamPelaksanaan(rpkps) {
  const j = rpkps.jam
  return num(j.perkuliahan_jam) + num(j.latihan_jam) + num(j.praktikum_jam) + num(j.ujian_jam)
}

// Rumus NAS persis contoh: kelompok (UTS+UAS+NKP) = 90%, NKPr = 10%.
export function formatRumusNas(rpkps) {
  const p = rpkps.penilaian
  return `NAS = ((UTS ${num(p.uts)}% + UAS ${num(p.uas)}% + NKP ${num(p.nkp)}%)) + (NKPr ${num(p.nkpr)}%)`
}

// Mengembalikan daftar pesan error (kosong = RPKPS valid & siap ekspor).
export function validateRpkps(rpkps) {
  const errors = []

  // Langkah 1: identitas & pengesahan
  if (!rpkps.mata_kuliah?.trim()) errors.push('Nama mata kuliah wajib diisi.')
  if (!rpkps.kode_mk?.trim()) errors.push('Kode mata kuliah wajib diisi.')
  if (!rpkps.program_studi_id) errors.push('Program studi/kelas wajib dipilih.')
  if (num(rpkps.sks) <= 0) errors.push('SKS harus lebih dari 0.')
  if (num(rpkps.jam_per_minggu) < 0) errors.push('Jam per minggu tidak boleh negatif.')
  if (!rpkps.pengesahan.dosen_pengampu_ids?.length) errors.push('Pilih minimal satu dosen pengampu.')
  if (!rpkps.pengesahan.ka_prodi_id) errors.push('Koordinator/Ketua Program Studi wajib dipilih.')
  if (!rpkps.pengesahan.ketua_jurusan_id) errors.push('Ketua Jurusan wajib dipilih.')

  // Langkah 2: deskripsi & tujuan
  if (!rpkps.deskripsi_singkat?.trim()) errors.push('Deskripsi singkat mata kuliah wajib diisi.')
  if (!rpkps.tujuan_umum?.trim()) errors.push('Tujuan Pembelajaran Umum wajib diisi.')
  const tk = rpkps.tujuan_khusus.filter((t) => t.trim())
  if (!tk.length) errors.push('Isi minimal satu Tujuan Pembelajaran Khusus.')

  // Langkah 3: jam & buku bacaan
  Object.entries(rpkps.jam).forEach(([k, v]) => {
    if (num(v) < 0) errors.push(`Nilai jam (${k}) tidak boleh negatif.`)
  })
  if (!rpkps.pustaka_utama_ids?.length) errors.push('Pilih minimal satu buku bacaan utama.')

  // Langkah 4: kontrak penilaian
  ;['uts', 'uas', 'nkp', 'nkpr'].forEach((k) => {
    if (num(rpkps.penilaian[k]) < 0) errors.push(`Bobot ${k.toUpperCase()} tidak boleh negatif.`)
  })
  const tp = totalPenilaian(rpkps)
  if (tp !== 100) errors.push(`Total bobot kontrak penilaian ${tp}%, wajib tepat 100% (UTS+UAS+NKP+NKPr).`)

  // Langkah 5: RKPBM 16 minggu
  rpkps.rkpbm.forEach((b, i) => {
    const ke = i + 1
    const ujian = ke === 8 || ke === 16
    if (!ujian && !b.tujuan_khusus?.trim()) errors.push(`RKPBM minggu ${ke}: tujuan khusus masih kosong.`)
    if (!ujian && !b.pokok_bahasan?.trim()) errors.push(`RKPBM minggu ${ke}: pokok bahasan masih kosong.`)
  })

  return errors
}

export function isReady(rpkps) {
  return validateRpkps(rpkps).length === 0
}

// Indikator "langkah selesai" pada wizard (per langkah 1..6).
export function stepDone(rpkps, step) {
  const p = rpkps.penilaian
  switch (step) {
    case 1:
      return !!(rpkps.mata_kuliah?.trim() && rpkps.kode_mk?.trim() && rpkps.program_studi_id
        && num(rpkps.sks) > 0 && rpkps.pengesahan.dosen_pengampu_ids?.length
        && rpkps.pengesahan.ka_prodi_id && rpkps.pengesahan.ketua_jurusan_id)
    case 2:
      return !!(rpkps.deskripsi_singkat?.trim() && rpkps.tujuan_umum?.trim()
        && rpkps.tujuan_khusus.some((t) => t.trim()))
    case 3:
      return !!rpkps.pustaka_utama_ids?.length
    case 4:
      return totalPenilaian(rpkps) === 100
    case 5:
      return rpkps.rkpbm.every((b, i) => {
        const ke = i + 1
        return ke === 8 || ke === 16 || (b.tujuan_khusus?.trim() && b.pokok_bahasan?.trim())
      })
    case 6:
      return isReady(rpkps)
    default:
      return false
  }
}

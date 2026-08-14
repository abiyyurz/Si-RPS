// Ekspor RPKPS ke Word. Logika terpusat di sini.
// Template: src/assets/template-merps.docx (dibuat scripts/makeTemplate.mjs).
// Ganti template resmi kampus kelak = ganti file docx dengan tag yang sama.
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'
import templateUrl from '../assets/template-merps.docx?url'
import * as storage from './storage.js'
import { totalPenilaian, formatRumusNas } from './validators.js'
import { formatPustaka } from './formatters.js'

function dosenTeks(d) {
  return d ? { nama: d.nama, nomor: `${d.jenis_nomor}. ${d.nomor_induk}` } : { nama: '', nomor: '' }
}

function buildData(rpkps) {
  const dosens = storage.list('dosens')
  const pustakas = storage.list('pustakas')
  const prodi = storage.list('prodis').find((p) => p.id === rpkps.program_studi_id) || {}
  const byId = (id) => dosens.find((d) => d.id === id)

  const pel = rpkps.pengesahan
  const pengampu = pel.dosen_pengampu_ids.map(byId).filter(Boolean)
  const jam = rpkps.jam
  const totalJam = jam.perkuliahan_jam + jam.latihan_jam + jam.praktikum_jam + jam.ujian_jam
  const totalMinggu = jam.perkuliahan_minggu + jam.latihan_minggu + jam.praktikum_minggu

  const pustakaTeks = (ids) => pustakas.filter((p) => ids.includes(p.id)).map((p) => ({ teks: formatPustaka(p) }))

  return {
    mata_kuliah: rpkps.mata_kuliah,
    mata_kuliah_upper: (rpkps.mata_kuliah || '').toUpperCase(),
    kode_mk: rpkps.kode_mk,
    prodi: prodi.nama_prodi || '',
    jurusan: prodi.jurusan || 'Teknik Mesin',
    institusi: prodi.institusi || 'Politeknik Negeri Bengkalis',
    prodi_upper: (prodi.nama_prodi || '').toUpperCase(),
    jurusan_upper: (prodi.jurusan || 'Teknik Mesin').toUpperCase(),
    institusi_upper: (prodi.institusi || 'Politeknik Negeri Bengkalis').toUpperCase(),
    sks: String(rpkps.sks),
    jam_per_minggu: String(rpkps.jam_per_minggu),
    semester_kelas: [rpkps.semester_angka, rpkps.semester_kelas && `(Kelas ${rpkps.semester_kelas})`]
      .filter(Boolean).join(' ') || rpkps.semester,
    prasyarat: rpkps.prasyarat || '-',
    perkiraan_peserta: rpkps.perkiraan_peserta || '-',
    deskripsi_singkat: rpkps.deskripsi_singkat,
    tujuan_umum: rpkps.tujuan_umum,
    tujuan_khusus: rpkps.tujuan_khusus.filter((t) => t.trim()).map((t) => ({ teks: t })),

    // Jumlah jam pelaksanaan
    perkuliahan_jam: String(jam.perkuliahan_jam), perkuliahan_minggu: String(jam.perkuliahan_minggu),
    latihan_jam: String(jam.latihan_jam), latihan_minggu: String(jam.latihan_minggu),
    praktikum_jam: String(jam.praktikum_jam), praktikum_minggu: String(jam.praktikum_minggu),
    ujian_jam: String(jam.ujian_jam),
    total_jam: String(totalJam), total_minggu: String(totalMinggu),

    // Buku bacaan
    buku_utama: pustakaTeks(rpkps.pustaka_utama_ids),
    buku_pendukung: pustakaTeks(rpkps.pustaka_pendukung_ids),

    // Kontrak penilaian
    uts: String(rpkps.penilaian.uts),
    uas: String(rpkps.penilaian.uas),
    nkp: String(rpkps.penilaian.nkp),
    nkpr: String(rpkps.penilaian.nkpr),
    total_penilaian: String(totalPenilaian(rpkps)),
    rumus_nas: formatRumusNas(rpkps),
    hbh_sikap: rpkps.penilaian.hasil_belajar_harian.sikap || '-',
    hbh_latihan_kuis: rpkps.penilaian.hasil_belajar_harian.latihan_kuis || '-',
    hbh_tugas: rpkps.penilaian.hasil_belajar_harian.tugas || '-',
    etika_kerapian: String(rpkps.penilaian.etika.kerapian),
    etika_kerja_sama: String(rpkps.penilaian.etika.kerja_sama),
    etika_kedisiplinan: String(rpkps.penilaian.etika.kedisiplinan),
    etika_ketelitian: String(rpkps.penilaian.etika.ketelitian),

    // RKPBM (minggu 8 = UTS, 16 = UAS → baris tergabung via {#ujian})
    rkpbm: rpkps.rkpbm.map((b, i) => {
      const ke = i + 1
      const ujian = ke === 8 || ke === 16
      return {
        minggu: b.minggu_ke,
        ujian,
        label: ke === 8 ? 'UJIAN TENGAH SEMESTER (UTS)' : ke === 16 ? 'UJIAN AKHIR SEMESTER (UAS)' : '',
        tujuan: b.tujuan_khusus || '-',
        pokok: b.pokok_bahasan || '-',
        metoda: b.metoda_media || '-',
        evaluasi: b.evaluasi_waktu || '-',
        buku: b.buku_sumber || '-',
      }
    }),

    // Pengesahan (key datar; docxtemplater default tak akses properti bertitik)
    kota: pel.kota || 'Bengkalis',
    tanggal: pel.tanggal || '',
    dosen_pengampu: pengampu.map(dosenTeks),
    dosen_utama_nama: dosenTeks(pengampu[0]).nama,
    dosen_utama_nomor: dosenTeks(pengampu[0]).nomor,
    ka_prodi_nama: dosenTeks(byId(pel.ka_prodi_id)).nama,
    ka_prodi_nomor: dosenTeks(byId(pel.ka_prodi_id)).nomor,
    ketua_jurusan_nama: dosenTeks(byId(pel.ketua_jurusan_id)).nama,
    ketua_jurusan_nomor: dosenTeks(byId(pel.ketua_jurusan_id)).nomor,
  }
}

// Render template + data → Blob .docx (dipakai ekspor & preview di web).
export async function renderRpkpsDocx(rpkps) {
  const res = await fetch(templateUrl)
  const zip = new PizZip(await res.arrayBuffer())
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
  doc.render(buildData(rpkps))
  return doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}

export async function exportRpkps(rpkps) {
  const blob = await renderRpkpsDocx(rpkps)
  saveAs(blob, `RPS ${rpkps.kode_mk} ${rpkps.mata_kuliah}.docx`)
}

const namaAman = (s) => (s || '').replace(/[\\/:*?"<>|]/g, '').trim()

// Ekspor beberapa RPS sekaligus jadi satu file .zip.
export async function exportSemuaZip(list) {
  const zip = new PizZip()
  const counts = {}
  for (const r of list) {
    const buf = await (await renderRpkpsDocx(r)).arrayBuffer()
    const base = namaAman(`RPS ${r.kode_mk || ''} ${r.mata_kuliah || 'tanpa nama'}`).slice(0, 90)
    counts[base] = (counts[base] || 0) + 1
    const nama = counts[base] === 1 ? `${base}.docx` : `${base} (${counts[base]}).docx`
    zip.file(nama, buf)
  }
  const out = zip.generate({ type: 'blob', mimeType: 'application/zip' })
  saveAs(out, `RPS ${new Date().toISOString().slice(0, 10)}.zip`)
}

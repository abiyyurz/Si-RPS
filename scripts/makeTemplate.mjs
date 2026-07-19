// Membuat src/assets/template-merps.docx — template docxtemplater bertag untuk RPKPS.
// Struktur mengikuti TEMPLATE_RPS.docx (RPKPS Polbeng Teknik Mesin).
// Saat template resmi berformat sama tersedia, cukup sisipkan tag {...} yang sama di file itu.
// Jalankan: npm run make-template
import PizZip from 'pizzip'
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const r = (t, { b } = {}) =>
  `<w:r><w:rPr>${b ? '<w:b/>' : ''}<w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">${esc(t)}</w:t></w:r>`
const p = (t = '', opts = {}) =>
  `<w:p><w:pPr>${opts.center ? '<w:jc w:val="center"/>' : ''}</w:pPr>${t ? r(t, opts) : ''}</w:p>`
const judul = (t) => p(t, { b: true })

const BORDERS =
  '<w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders>'
const tc = (t, opts = {}) => `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr>${p(t, opts)}</w:tc>`
const tcSpan = (t, span, opts = {}) => `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/><w:gridSpan w:val="${span}"/></w:tcPr>${p(t, opts)}</w:tc>`
const tr = (cells) => `<w:tr>${cells.join('')}</w:tr>`
const tbl = (rows) =>
  `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>${BORDERS}</w:tblPr>${rows.join('')}</w:tbl>`
const kv = (label, tag) => tr([tc(label, { b: true }), tc(tag)])

const body = [
  // ---- Sampul ----
  p('RENCANA PROGRAM DAN KEGIATAN PEMBELAJARAN SEMESTER (RPKPS)', { b: true, center: true }),
  p('MATA KULIAH: {mata_kuliah} ({kode_mk})', { b: true, center: true }),
  p('PROGRAM STUDI {prodi}', { center: true }),
  p('JURUSAN {jurusan} — {institusi}', { center: true }),
  p('Oleh: {dosen_utama_nama} ({dosen_utama_nomor})', { center: true }),
  p('{kota}, {tanggal}', { center: true }),
  p(),

  // ---- Identitas MK ----
  judul('IDENTITAS MATA KULIAH'),
  tbl([
    kv('Mata Kuliah', '{mata_kuliah}'),
    kv('Kode Mata Kuliah', '{kode_mk}'),
    kv('SKS / Jam per minggu', '{sks} / {jam_per_minggu}'),
    kv('Semester / Kelas', '{semester_kelas}'),
    kv('Prasyarat', '{prasyarat}'),
    kv('Perkiraan Jumlah Peserta', '{perkiraan_peserta}'),
  ]),
  p(),

  // ---- Deskripsi ----
  judul('DESKRIPSI SINGKAT MATA KULIAH'),
  p('{deskripsi_singkat}'),
  p(),

  // ---- Tujuan Umum ----
  judul('TUJUAN PEMBELAJARAN UMUM'),
  p('{tujuan_umum}'),
  p(),

  // ---- Tujuan Khusus ----
  judul('TUJUAN PEMBELAJARAN KHUSUS'),
  p('{#tujuan_khusus}'),
  p('- {teks}'),
  p('{/tujuan_khusus}'),
  p(),

  // ---- Jumlah Jam ----
  judul('JUMLAH JAM PELAKSANAAN'),
  tbl([
    tr([tc('Kegiatan', { b: true }), tc('Jam', { b: true }), tc('Minggu', { b: true })]),
    tr([tc('Perkuliahan & Diskusi'), tc('{perkuliahan_jam}'), tc('{perkuliahan_minggu}')]),
    tr([tc('Latihan Soal & Kuis'), tc('{latihan_jam}'), tc('{latihan_minggu}')]),
    tr([tc('Praktikum'), tc('{praktikum_jam}'), tc('{praktikum_minggu}')]),
    tr([tc('Ujian Tengah & Akhir Semester'), tc('{ujian_jam}'), tc('-')]),
    tr([tc('Total', { b: true }), tc('{total_jam}', { b: true }), tc('{total_minggu}', { b: true })]),
  ]),
  p(),

  // ---- Buku Bacaan ----
  judul('DAFTAR BUKU BACAAN'),
  p('a. Buku Utama:', { b: true }),
  p('{#buku_utama}'),
  p('- {teks}'),
  p('{/buku_utama}'),
  p('b. Buku Pendukung:', { b: true }),
  p('{#buku_pendukung}'),
  p('- {teks}'),
  p('{/buku_pendukung}'),
  p(),

  // ---- Kontrak Penilaian ----
  judul('KONTRAK PENILAIAN'),
  tbl([
    tr([tc('Komponen', { b: true }), tc('Bobot (%)', { b: true })]),
    tr([tc('Ujian Tengah Semester (UTS / NM)'), tc('{uts}')]),
    tr([tc('Ujian Akhir Semester (UAS / NA)'), tc('{uas}')]),
    tr([tc('Nilai Kegiatan Perkuliahan (NKP)'), tc('{nkp}')]),
    tr([tc('Nilai Kegiatan Praktikum (NKPr)'), tc('{nkpr}')]),
    tr([tc('Total', { b: true }), tc('{total_penilaian}', { b: true })]),
  ]),
  p('{rumus_nas}'),
  p(),
  p('Penjabaran NKP — Hasil Belajar Harian:', { b: true }),
  tbl([
    tr([tc('Sikap', { b: true }), tc('{hbh_sikap}')]),
    tr([tc('Latihan & Kuis', { b: true }), tc('{hbh_latihan_kuis}')]),
    tr([tc('Tugas', { b: true }), tc('{hbh_tugas}')]),
  ]),
  p('Nilai Sikap / Etika (Afektif):', { b: true }),
  tbl([
    tr([tc('Kriteria', { b: true }), tc('Skor', { b: true })]),
    tr([tc('Kerapian'), tc('{etika_kerapian}')]),
    tr([tc('Kerja Sama'), tc('{etika_kerja_sama}')]),
    tr([tc('Kedisiplinan'), tc('{etika_kedisiplinan}')]),
    tr([tc('Ketelitian'), tc('{etika_ketelitian}')]),
  ]),
  p(),

  // ---- RKPBM ----
  judul('RENCANA KEGIATAN PEMBELAJARAN MINGGUAN (RKPBM)'),
  tbl([
    tr([
      tc('Minggu Ke', { b: true }), tc('Tujuan Pembelajaran Khusus', { b: true }),
      tc('Pokok Bahasan', { b: true }), tc('Metoda / Media', { b: true }),
      tc('Latihan, Evaluasi & Waktu', { b: true }), tc('Buku Sumber', { b: true }),
    ]),
    // Baris biasa (bukan ujian)
    tr([
      tc('{#rkpbm}{^ujian}{minggu}'), tc('{tujuan}'), tc('{pokok}'),
      tc('{metoda}'), tc('{evaluasi}'), tc('{buku}{/ujian}'),
    ]),
    // Baris ujian (UTS/UAS) — sel tengah digabung
    tr([
      tc('{#ujian}{minggu}'), tcSpan('{label}', 3, { b: true, center: true }),
      tc('{evaluasi}'), tc('{buku}{/ujian}{/rkpbm}'),
    ]),
  ]),
  p(),

  // ---- Pengesahan ----
  judul('PENGESAHAN'),
  tbl([
    tr([tc('Dibuat oleh — Dosen Pengampu', { b: true }), tc('Disetujui oleh — Ka Prodi', { b: true }), tc('Mengetahui — Ketua Jurusan', { b: true })]),
    tr([tc('{dosen_utama_nama}'), tc('{ka_prodi_nama}'), tc('{ketua_jurusan_nama}')]),
    tr([tc('{dosen_utama_nomor}'), tc('{ka_prodi_nomor}'), tc('{ketua_jurusan_nomor}')]),
  ]),
].join('')

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>${body}<w:sectPr><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/></w:sectPr></w:body>
</w:document>`

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`

const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`

const zip = new PizZip()
zip.file('[Content_Types].xml', contentTypes)
zip.file('_rels/.rels', rels)
zip.file('word/document.xml', documentXml)

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'template-merps.docx')
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, zip.generate({ type: 'nodebuffer' }))
console.log('Template RPKPS dibuat:', out)

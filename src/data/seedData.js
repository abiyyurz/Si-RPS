// Data contoh awal RPKPS — dimuat sekali saat localStorage masih kosong.
import { toRomawi } from '../utils/formatters.js'

const HOLMAN = 'Holman, J.P. 1997. Perpindahan Kalor (Heat Transfer). Erlangga, Jakarta.'

// Isi RKPBM nyata dari TEMPLATE_RPS.docx, dipetakan ke 16 minggu tetap
// (minggu 8 = UTS, minggu 16 = UAS).
const RKPBM_ISI = {
  1: {
    tujuan_khusus: 'Mahasiswa mampu memahami kontrak kuliah selama satu semester. Mahasiswa mampu memahami konversi satuan yang berlaku.',
    pokok_bahasan: 'Kontrak kuliah dan prinsip penilaian. Konversi satuan panjang, berat, volume, dan tekanan.',
    buku_sumber: 'Panduan Akademik SK Dir No. 1797 Tahun 2019.',
  },
  2: {
    tujuan_khusus: 'Mahasiswa mampu memahami pengertian serta jenis dan pembagian perpindahan kalor.',
    pokok_bahasan: 'Ilmu Perpindahan Kalor: pengertian dan pembagian; konveksi, konduksi, radiasi; sifat-sifat bahan.',
  },
  3: {
    tujuan_khusus: 'Mahasiswa mampu memahami perpindahan kalor konduksi, konveksi, dan radiasi.',
    pokok_bahasan: 'Perpindahan kalor konduksi, konveksi, dan radiasi. Sifat termal bahan.',
  },
  4: {
    tujuan_khusus: 'Mahasiswa mampu memahami analogi kalor dan listrik.',
    pokok_bahasan: 'Analogi kalor dan listrik. Latihan soal ilmu perpindahan kalor.',
  },
  5: {
    tujuan_khusus: 'Mahasiswa mampu memahami koefisien serta sistem sumber kalor dan konduksi keadaan tunak satu dimensi.',
    pokok_bahasan: 'Konduksi keadaan tunak satu dimensi: dinding datar, sistem radial silinder, koefisien perpindahan kalor menyeluruh.',
  },
  6: {
    tujuan_khusus: 'Mahasiswa mampu memahami tebal isolasi kritis, sistem sumber kalor, dan konduksi-konveksi pada sirip.',
    pokok_bahasan: 'Tebal isolasi kritis. Sistem sumber kalor. Sistem konduksi-konveksi pada sirip. Efisiensi sirip.',
  },
  7: {
    tujuan_khusus: 'Mahasiswa mampu membuat dan memahami analisis grafik serta faktor bentuk konduksi.',
    pokok_bahasan: 'Konduksi keadaan tunak dimensi rangkap: pendahuluan, analisis grafik, faktor bentuk konduksi.',
  },
  9: {
    tujuan_khusus: 'Mahasiswa mampu memahami analisa kapasitas kalor tergabung dan aliran kalor transien pada benda padat.',
    pokok_bahasan: 'Konduksi keadaan tak tunak: analisa kapasitas kalor tergabung; aliran kalor transien pada benda padat semi tak hingga.',
  },
  10: {
    tujuan_khusus: 'Mahasiswa mampu memahami parameter tak berdimensi dalam perpindahan panas konveksi.',
    pokok_bahasan: 'Perpindahan panas konveksi: parameter tak berdimensi; lapisan batas laminar pada plat rata.',
  },
  11: {
    tujuan_khusus: 'Mahasiswa mampu memahami lapisan batas laminar dan turbulen serta persamaan energi.',
    pokok_bahasan: 'Persamaan energi lapisan batas (laminer). Lapisan batas turbulen pada pelat rata.',
  },
  12: {
    tujuan_khusus: 'Mahasiswa mampu memahami perpindahan kalor lapisan batas turbulen.',
    pokok_bahasan: 'Perpindahan kalor lapisan batas turbulen pada pelat. Latihan soal konveksi.',
  },
  13: {
    tujuan_khusus: 'Mahasiswa mampu memahami rumus-rumus empiris untuk perpindahan kalor konveksi paksa.',
    pokok_bahasan: 'Rumus empiris dan praktis untuk perpindahan kalor konveksi paksa. Rumus empiris (eksperimental).',
  },
  14: {
    tujuan_khusus: 'Mahasiswa mampu memahami aliran menyilang pada silinder dan susunan tabung.',
    pokok_bahasan: 'Aliran menyilang silinder dan bola. Aliran menyilang pada susunan tabung (tube bank).',
  },
  15: {
    tujuan_khusus: 'Mahasiswa mampu memahami jenis dan rancangan penukar kalor.',
    pokok_bahasan: 'Jenis penukar kalor: shell & tube, aliran silang, kompak. Rancangan penukar kalor sederhana.',
  },
}

function rkpbmBaris(ke) {
  const ujian = ke === 8 || ke === 16
  const isi = RKPBM_ISI[ke] || {}
  const labelUjian = ke === 8 ? 'UJIAN TENGAH SEMESTER (UTS)' : ke === 16 ? 'UJIAN AKHIR SEMESTER (UAS)' : ''
  return {
    minggu_ke: toRomawi(ke),
    tujuan_khusus: isi.tujuan_khusus || '',
    pokok_bahasan: ujian ? labelUjian : isi.pokok_bahasan || '',
    metoda_media: ujian ? '' : 'Menyimak, diskusi, tanya jawab. Media: papan tulis dan in focus. Perangkat praktikum.',
    evaluasi_waktu: ujian ? "2 × 50'" : "4 × 50'",
    buku_sumber: ujian ? '' : isi.buku_sumber || HOLMAN,
  }
}

export function seedData() {
  const prodis = [
    { id: 'prd-d3tm', kode_kelas: 'D3TM', nama_prodi: 'D-III Teknik Mesin', jurusan: 'Teknik Mesin', institusi: 'Politeknik Negeri Bengkalis' },
    { id: 'prd-d3te', kode_kelas: 'D3TE', nama_prodi: 'D-III Teknik Elektronika', jurusan: 'Teknik Mesin', institusi: 'Politeknik Negeri Bengkalis' },
    { id: 'prd-tmpp', kode_kelas: 'TMPP', nama_prodi: 'Sarjana Terapan Teknik Mesin Produksi dan Perawatan', jurusan: 'Teknik Mesin', institusi: 'Politeknik Negeri Bengkalis' },
    { id: 'prd-rpl', kode_kelas: 'RPL', nama_prodi: 'Sarjana Terapan Teknik Mesin (RPL)', jurusan: 'Teknik Mesin', institusi: 'Politeknik Negeri Bengkalis' },
  ]

  const katalog = [
    { id: 'kat-1', nama: 'Praktek Gambar Teknik Mesin 1', kelas: 'D3TM', semester: 'Ganjil' },
    { id: 'kat-2', nama: 'Praktek Kerja Bangku dan Pelat', kelas: 'D3TM', semester: 'Ganjil' },
    { id: 'kat-3', nama: 'Praktek Elektromekanik', kelas: 'D3TE', semester: 'Ganjil' },
    { id: 'kat-4', nama: 'Pesawat Angkat', kelas: 'RPL', semester: 'Ganjil' },
    { id: 'kat-5', nama: 'Praktek Gambar Teknik Mesin 2', kelas: 'D3TM', semester: 'Genap' },
    { id: 'kat-6', nama: 'Perpindahan Kalor dan Penukar Kalor', kelas: 'TMPP', semester: 'Genap' },
    { id: 'kat-7', nama: 'Perpindahan Kalor dan Penukar Kalor', kelas: 'RPL', semester: 'Genap' },
  ]

  const dosens = [
    { id: 'dsn-1', nama: 'Syahrizal, ST., MT.', jenis_nomor: 'NIP', nomor_induk: '197310142021211005', peran: 'pengampu' },
    { id: 'dsn-2', nama: 'Bambang Dwi Haripriadi, ST., MT.', jenis_nomor: 'NIP', nomor_induk: '197801302021211004', peran: 'koordinator prodi' },
    { id: 'dsn-3', nama: 'Ibnu Hajar, ST., MT.', jenis_nomor: 'NIP', nomor_induk: '197108102021211001', peran: 'ketua jurusan' },
  ]

  const pustakas = [
    { id: 'pus-1', jenis: 'utama', penulis: 'Holman, J.P., Jasjfi, E.', tahun: '1997', judul: 'Perpindahan Kalor (Heat Transfer)', penerbit: 'Erlangga, Jakarta', nomor_urut: 1 },
    { id: 'pus-2', jenis: 'utama', penulis: 'Mahmudi, Ali', tahun: '2005', judul: 'Modul Bahan Ajar Perpindahan Kalor dan Penukar Kalor', penerbit: 'Politeknik Negeri Bandung', nomor_urut: 2 },
  ]

  const rkpbm = Array.from({ length: 16 }, (_, i) => rkpbmBaris(i + 1))

  const rpkpsContoh = {
    id: 'rpkps-1',
    mata_kuliah: 'Perpindahan Kalor dan Penukar Kalor',
    kode_mk: 'KBPP 2152',
    sks: 2,
    jam_per_minggu: 4,
    semester: 'Genap',
    semester_angka: 'VI',
    semester_kelas: '3A-3B-3C',
    kelas: 'TMPP',
    program_studi_id: 'prd-tmpp',
    prasyarat: 'Termodinamika',
    perkiraan_peserta: '27 sampai 30 orang mahasiswa',
    deskripsi_singkat:
      'Mata kuliah Perpindahan Kalor & Penukar Kalor merupakan mata kuliah wajib 2 SKS (4 jam) yang membahas dasar-dasar perpindahan kalor; sifat termal bahan; prinsip konduksi, konveksi, dan radiasi; serta jenis dan rancangan penukar kalor.',
    tujuan_umum:
      'Setelah mengikuti mata kuliah ini, mahasiswa mampu memahami perpindahan kalor dan penukar kalor baik secara prinsip konduksi, konveksi, dan radiasi serta penukar kalor aliran silang, kompak, dan rancangan penukar kalor.',
    tujuan_khusus: [
      'Mampu memahami dan menjelaskan konsep Perpindahan Kalor & Penukar Kalor.',
      'Mengenal dan memahami prinsip-prinsip Perpindahan Kalor & Penukar Kalor.',
      'Mampu membuat rancangan penukar kalor sederhana.',
    ],
    jam: {
      perkuliahan_jam: 36, perkuliahan_minggu: 9,
      latihan_jam: 8, latihan_minggu: 2,
      praktikum_jam: 12, praktikum_minggu: 3,
      ujian_jam: 4,
    },
    pustaka_utama_ids: ['pus-1', 'pus-2'],
    pustaka_pendukung_ids: [],
    penilaian: {
      uts: 30, uas: 40, nkp: 20, nkpr: 10,
      hasil_belajar_harian: { sikap: 'Penilaian sikap saat perkuliahan', latihan_kuis: 'Latihan dan kuis tiap pokok bahasan', tugas: 'Tugas mandiri dan kelompok' },
      etika: { kerapian: 2.5, kerja_sama: 2.5, kedisiplinan: 2.5, ketelitian: 2.5 },
    },
    rkpbm,
    pengesahan: {
      dosen_pengampu_ids: ['dsn-1'],
      ka_prodi_id: 'dsn-2',
      ketua_jurusan_id: 'dsn-3',
      kota: 'Bengkalis',
      tanggal: '20 Februari 2023',
    },
    status: 'siap_ekspor',
  }

  return { prodis, katalog, dosens, pustakas, rpkpsList: [rpkpsContoh] }
}

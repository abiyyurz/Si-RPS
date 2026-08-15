// Layanan AI Generator untuk RPS berbasis Google Gemini API (gemini-flash-latest / gemini-3.7-flash)
// + Smart Fallback Generator untuk mode offline/testing instan.

const STORAGE_KEY_API = 'gemini_api_key'
const DEFAULT_MODEL = 'gemini-flash-latest'
const FALLBACK_MODEL = 'gemini-3.7-flash'

export function getApiKey() {
  const local = localStorage.getItem(STORAGE_KEY_API)
  if (local && local.trim()) return local.trim()
  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim()
}

export function setApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem(STORAGE_KEY_API, key.trim())
  } else {
    localStorage.removeItem(STORAGE_KEY_API)
  }
}

export function hasApiKey() {
  return Boolean(getApiKey())
}

const SYSTEM_PROMPT = `
Anda adalah Pakar Kurikulum Pendidikan Tinggi Vokasi dan Dosen Senior Teknik Mesin di Politeknik Negeri Bengkalis.
Tugas Anda adalah menyusun dokumen RPS (Rencana Pembelajaran Semester) secara komprehensif, terstruktur, dan siap pakai pada sistem Si-RPS.

ATURAN STRUKTUR RPS POLBENG:
1. DESKRIPSI SINGKAT: 1-2 paragraf akademik formal yang menjelaskan ruang lingkup mata kuliah, relevansi industri/rekayasa, dan capaian umum.
2. TUJUAN PEMBELAJARAN UMUM: 1 paragraf capaian pembelajaran lulusan (CPL/CPMK).
3. TUJUAN PEMBELAJARAN KHUSUS: 3 sampai 5 butir kata kerja operasional Taksonomi Bloom (misal: "Mahasiswa mampu menganalisis...", "Mahasiswa mampu merancang...", "Mahasiswa mampu mengoperasikan...").
4. JUMLAH JAM: Hitung proporsional berdasarkan SKS.
   - SKS Teori 2: Kuliah ~36 jam (9 minggu), Latihan ~8 jam (2 minggu), Praktikum ~12 jam (3 minggu), Ujian 4 jam. Total = 60 jam.
   - SKS Praktikum/Bengkel 3-4: Proporsikan jam praktikum lebih dominan.
5. KONTRAK PENILAIAN: Total UTS + UAS + NKP + NKPr WAJIB TEPAT 100%.
   - UTS: 30%, UAS: 40%, NKP: 20%, NKPr: 10% (sesuaikan jika mata kuliah bengkel/praktik murni).
   - Rincian Hasil Belajar Harian (NKP): deskripsi singkat penilaian sikap, latihan/kuis, dan tugas.
   - Etika/Afektif: Kerapian (2.5), Kerja Sama (2.5), Kedisiplinan (2.5), Ketelitian (2.5) -> Total 10.
6. RKPBM WAJIB 16 MINGGU TEPAT:
   - Minggu I s.d. VII: Materi berjenjang dari konsep dasar ke perhitungan/terapan.
   - Minggu VIII: WAJIB UJIAN TENGAH SEMESTER (UTS). Set pokok_bahasan = "UJIAN TENGAH SEMESTER (UTS)", tujuan_khusus = "", evaluasi_waktu = "2 × 50'".
   - Minggu IX s.d. XV: Materi lanjutan, perancangan, atau studi kasus terapan.
   - Minggu XVI: WAJIB UJIAN AKHIR SEMESTER (UAS). Set pokok_bahasan = "UJIAN AKHIR SEMESTER (UAS)", tujuan_khusus = "", evaluasi_waktu = "2 × 50'".
   - Setiap minggu non-ujian wajib berisi: tujuan_khusus yang spesifik, pokok_bahasan terinci, metoda_media ("Menyimak, diskusi, tanya jawab, latihan. Media: papan tulis, LCD Projector."), evaluasi_waktu (misal "4 × 50'"), dan buku_sumber bab/referensi.
7. BUKU PUSTAKA: 2-3 buku teks teknik yang nyata, valid, dan sering dipakai di perguruan tinggi teknik mesin (penulis, tahun, judul, penerbit).

OUTPUT WAJIB DALAM FORMAT JSON MURNI TANPA MARKDOWN BACKTICKS (Hanya JSON).
`

/**
 * Tes apakah API Key valid dan bisa terhubung ke Gemini
 */
export async function testGeminiApiKey(testKey) {
  const key = (testKey || getApiKey()).trim()
  if (!key) {
    return { ok: false, error: 'API Key belum diisi.' }
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${encodeURIComponent(key)}`
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Balas dengan satu kata: OK' }] }],
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const msg = err.error?.message || `Error ${res.status}: ${res.statusText}`
      return { ok: false, error: msg }
    }

    return { ok: true, message: 'Koneksi Gemini API Berhasil! Model siap digunakan.' }
  } catch (e) {
    return { ok: false, error: `Gagal terhubung: ${e.message}` }
  }
}

async function callGemini(promptText, apiKey, model = DEFAULT_MODEL) {
  const key = apiKey || getApiKey()
  if (!key) {
    throw new Error('API Key Google Gemini belum diisi. Silakan masukkan API Key Anda.')
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`
  
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: SYSTEM_PROMPT },
          { text: promptText },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  }

  let res
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    throw new Error(`Gagal menghubungi server Gemini API: ${err.message}. Periksa koneksi internet Anda.`)
  }

  if (!res.ok) {
    let errMsg = `Error ${res.status}: ${res.statusText}`
    try {
      const errJson = await res.json()
      if (errJson?.error?.message) {
        errMsg = errJson.error.message
      }
    } catch { /* ignore */ }

    // Jika model 2.0 gagal karena kuota/preview, coba fallback ke 1.5-flash
    if (model === DEFAULT_MODEL) {
      console.warn(`Gemini 2.0 gagal (${errMsg}), mencoba fallback ke ${FALLBACK_MODEL}...`)
      return callGemini(promptText, key, FALLBACK_MODEL)
    }

    throw new Error(`Gemini API Error: ${errMsg}`)
  }

  const data = await res.json()
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) {
    throw new Error('Respon Gemini kosong atau tidak dapat dibaca.')
  }

  // Parse JSON
  try {
    const cleaned = rawText.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim()
    return JSON.parse(cleaned)
  } catch (err) {
    console.error('Gagal parse JSON dari Gemini:', rawText)
    throw new Error(`Format JSON dari AI tidak valid: ${err.message}`)
  }
}

/**
 * Smart Offline / Heuristic Generator untuk membuat RPS lengkap tanpa perlu API Key
 */
export function generateSmartTemplateRps({
  mataKuliah = 'Mata Kuliah Teknik Mesin',
  kodeMk = 'KBPP 2152',
  sks = 2,
  prodiNama = 'Sarjana Terapan Teknik Mesin Produksi dan Perawatan',
  semester = 'Genap',
  topikKhusus = '',
}) {
  const nSks = Number(sks) || 2
  const isPraktik = nSks >= 3 || mataKuliah.toLowerCase().includes('praktek') || mataKuliah.toLowerCase().includes('praktikum') || mataKuliah.toLowerCase().includes('bengkel')

  const perkuliahanJam = isPraktik ? 24 : 36
  const perkuliahanMinggu = isPraktik ? 6 : 9
  const latihanJam = isPraktik ? 8 : 8
  const latihanMinggu = 2
  const praktikumJam = isPraktik ? 24 : 12
  const praktikumMinggu = isPraktik ? 6 : 3
  const ujianJam = 4

  const mkClean = mataKuliah.trim()

  // 16 Minggu RKPBM terstruktur
  const rkpbmWeeks = [
    {
      minggu_ke: 'I',
      tujuan_khusus: `Mahasiswa mampu memahami kontrak perkuliahan, silabus, dan konsep dasar ${mkClean}.`,
      pokok_bahasan: `Pengenalan ${mkClean}: Kontrak kuliah, ruang lingkup, prinsip dasar, dan aturan K3 keselamatan kerja.`,
      metoda_media: 'Ceramah interaktif, diskusi kelas, tanya jawab. Media: Slide presentasi dan modul ajar.',
      evaluasi_waktu: "4 × 50'",
      buku_sumber: `Buku Utama Bab 1; Panduan Akademik Polbeng.`,
    },
    {
      minggu_ke: 'II',
      tujuan_khusus: `Mahasiswa mampu menjelaskan prinsip fundamental dan parameter penting pada ${mkClean}.`,
      pokok_bahasan: `Prinsip dasar dan landasan teori ${mkClean}: Definisi besaran fisik, satuan standar, dan parameter kerja.`,
      metoda_media: 'Menyimak, diskusi kelompok, pemecahan contoh soal. Media: Papan tulis dan LCD Projector.',
      evaluasi_waktu: "4 × 50'",
      buku_sumber: 'Buku Utama Bab 2.',
    },
    {
      minggu_ke: 'III',
      tujuan_khusus: `Mahasiswa mampu menganalisis formulasi matematis dan hukum-hukum rekayasa pada ${mkClean}.`,
      pokok_bahasan: `Formulasi perhitungan dan analisis hukum rekayasa terkait ${mkClean}.`,
      metoda_media: 'Ceramah, tutorial problem solving, diskusi terbimbing.',
      evaluasi_waktu: "4 × 50'",
      buku_sumber: 'Buku Utama Bab 3.',
    },
    {
      minggu_ke: 'IV',
      tujuan_khusus: `Mahasiswa mampu menerapkan prosedur teknis dan pemodelan sistem ${mkClean}.`,
      pokok_bahasan: `Karakteristik operasional sistem, diagram kerja, dan studi kasus perhitungan teknik.`,
      metoda_media: 'Diskusi kasus, latihan soal mandiri, asistensi teknis.',
      evaluasi_waktu: "4 × 50'",
      buku_sumber: 'Buku Utama Bab 4.',
    },
    {
      minggu_ke: 'V',
      tujuan_khusus: `Mahasiswa mampu mengevaluasi komponen dan mekanisme kerja pada ${mkClean}.`,
      pokok_bahasan: `Komponen mekanis, klasifikasi peralatan, dan efisiensi sistem kerja.`,
      metoda_media: 'Menyimak, tanya jawab, demonstrasi praktis / simulasi perangkat.',
      evaluasi_waktu: "4 × 50'",
      buku_sumber: 'Buku Utama Bab 5 & Buku Pendukung.',
    },
    {
      minggu_ke: 'VI',
      tujuan_khusus: `Mahasiswa mampu mengkalkulasi parameter performa dan optimasi sistem ${mkClean}.`,
      pokok_bahasan: `Metode perhitungan performa, analisis rugi-rugi (losses), dan peningkatan efisiensi.`,
      metoda_media: 'Latihan mandiri, diskusi kelompok, kuis 1 materi awal.',
      evaluasi_waktu: "4 × 50'",
      buku_sumber: 'Buku Utama Bab 6.',
    },
    {
      minggu_ke: 'VII',
      tujuan_khusus: `Mahasiswa mampu mengintegrasikan materi awal dan menyelesaikan studi kasus ${mkClean}.`,
      pokok_bahasan: `Review komprehensif materi Minggu I–VI, pembahasan soal latihan integratif persiapan UTS.`,
      metoda_media: 'Diskusi interaktif, bedah studi kasus, pembahasan soal.',
      evaluasi_waktu: "4 × 50'",
      buku_sumber: 'Buku Utama Bab 1–6.',
    },
    {
      minggu_ke: 'VIII',
      tujuan_khusus: '',
      pokok_bahasan: 'UJIAN TENGAH SEMESTER (UTS)',
      metoda_media: '',
      evaluasi_waktu: "2 × 50'",
      buku_sumber: '',
    },
    {
      minggu_ke: 'IX',
      tujuan_khusus: `Mahasiswa mampu menganalisis konsep lanjutan dan fenomena terapan pada ${mkClean}.`,
      pokok_bahasan: `Materi lanjutan ${mkClean}: Konsep tingkat lanjut, analisis dinamika sistem, dan batas operasional.`,
      metoda_media: 'Ceramah pengantar, diskusi topik lanjutan, telaah modul.',
      evaluasi_waktu: "4 × 50'",
      buku_sumber: 'Buku Utama Bab 7.',
    },
    {
      minggu_ke: 'X',
      tujuan_khusus: `Mahasiswa mampu merancang prosedur kerja dan simulasi rekayasa ${mkClean}.`,
      pokok_bahasan: `Prinsip perancangan, pemilihan material/komponen, dan standarisasi industri (ISO/DIN/JIS).`,
      metoda_media: 'Praktik perancangan, tugas kelompok, presentasi desain sederhana.',
      evaluasi_waktu: "4 × 50'",
      buku_sumber: 'Buku Utama Bab 8.',
    },
    {
      minggu_ke: 'XI',
      tujuan_khusus: `Mahasiswa mampu memecahkan permasalahan teknis (troubleshooting) pada sistem ${mkClean}.`,
      pokok_bahasan: `Identifikasi kerusakan, analisis kegagalan (failure analysis), dan teknik perawatan/perbaikan.`,
      metoda_media: 'Studi kasus industri, diskusi interaktif, latihan analisis kerusakan.',
      evaluasi_waktu: "4 × 50'",
      buku_sumber: 'Buku Utama Bab 9 & Buku Pendukung.',
    },
    {
      minggu_ke: 'XII',
      tujuan_khusus: `Mahasiswa mampu melakukan pengujian performa dan validasi data pengukuran pada ${mkClean}.`,
      pokok_bahasan: `Metode pengujian, kalibrasi instrumen ukur, interpretasi grafik, dan validasi data eksperimen.`,
      metoda_media: 'Praktik pengujian / analisis data eksperimen, penyusunan laporan teknis.',
      evaluasi_waktu: "4 × 50'",
      buku_sumber: 'Buku Utama Bab 10.',
    },
    {
      minggu_ke: 'XIII',
      tujuan_khusus: `Mahasiswa mampu merumuskan inovasi perbaikan dan efisiensi energi pada ${mkClean}.`,
      pokok_bahasan: `Teknologi modern, automasi, dan teknik konservasi energi pada sistem ${mkClean}.`,
      metoda_media: 'Presentasi hasil analisis, diskusi perkembangan teknologi terkini.',
      evaluasi_waktu: "4 × 50'",
      buku_sumber: 'Buku Utama Bab 11 & Jurnal Rekayasa.',
    },
    {
      minggu_ke: 'XIV',
      tujuan_khusus: `Mahasiswa mampu menyusun laporan rancangan dan analisis teknis komprehensif.`,
      pokok_bahasan: `Penyelesaian proyek rancangan mandiri / tim, evaluasi keselamatan kerja K3, dan kepatuhan standar industri.`,
      metoda_media: 'Bimbingan proyek, asistensi laporan, kuis 2 materi lanjutan.',
      evaluasi_waktu: "4 × 50'",
      buku_sumber: 'Buku Utama Bab 7–11.',
    },
    {
      minggu_ke: 'XV',
      tujuan_khusus: `Mahasiswa mampu mengintegrasikan seluruh capaian pembelajaran dan siap menghadapi evaluasi akhir.`,
      pokok_bahasan: `Review menyeluruh materi semester (Minggu IX–XIV), evaluasi proyek akhir, dan simulasi soal UAS.`,
      metoda_media: 'Diskusi komprehensif, evaluasi pembelajaran, tanya jawab.',
      evaluasi_waktu: "4 × 50'",
      buku_sumber: 'Buku Utama & Referensi Penunjang.',
    },
    {
      minggu_ke: 'XVI',
      tujuan_khusus: '',
      pokok_bahasan: 'UJIAN AKHIR SEMESTER (UAS)',
      metoda_media: '',
      evaluasi_waktu: "2 × 50'",
      buku_sumber: '',
    },
  ]

  return {
    mata_kuliah: mkClean,
    kode_mk: kodeMk || 'KBPP 2152',
    sks: nSks,
    deskripsi_singkat: `Mata kuliah ${mkClean} merupakan mata kuliah keahlian ${nSks} SKS pada Program Studi ${prodiNama}. Mata kuliah ini membekali mahasiswa dengan penguasaan konsep dasar, formulasi perhitungan teknik, analisis sistem, prinsip operasional, serta keterampilan perancangan dan pemecahan masalah (troubleshooting) sesuai dengan standar kompetensi industri rekayasa mekanik dan vokasi.`,
    tujuan_umum: `Setelah menyelesaikan mata kuliah ini, mahasiswa mampu memahami, menganalisis, dan mengaplikasikan prinsip-prinsip ${mkClean} dalam bidang keteknikmesinan, serta mampu melakukan perancangan dan evaluasi performa sistem rekayasa secara tepat, aman, dan bertanggung jawab sesuai etika profesi.`,
    tujuan_khusus: [
      `Mahasiswa mampu memahami konsep dasar, terminologi, dan hukum-hukum fundamental pada ${mkClean}.`,
      `Mahasiswa mampu menghitung dan menganalisis parameter operasional serta efisiensi sistem ${mkClean}.`,
      `Mahasiswa mampu merancang prosedur kerja, memilih komponen yang tepat, dan menerapkan standar industri terkait.`,
      `Mahasiswa mampu mengidentifikasi permasalahan teknis dan merumuskan solusi perbaikan (troubleshooting) pada sistem ${mkClean}.`,
    ],
    prasyarat: 'Fisika Terapan / Matematika Teknik',
    perkiraan_peserta: '25 - 30 Orang Mahasiswa',
    jam: {
      perkuliahan_jam: perkuliahanJam,
      perkuliahan_minggu: perkuliahanMinggu,
      latihan_jam: latihanJam,
      latihan_minggu: latihanMinggu,
      praktikum_jam: praktikumJam,
      praktikum_minggu: praktikumMinggu,
      ujian_jam: ujianJam,
    },
    penilaian: {
      uts: isPraktik ? 25 : 30,
      uas: isPraktik ? 35 : 40,
      nkp: isPraktik ? 20 : 20,
      nkpr: isPraktik ? 20 : 10,
      hasil_belajar_harian: {
        sikap: 'Penilaian keaktifan, etika, dan komunikasi selama perkuliahan',
        latihan_kuis: 'Latihan soal terstruktur mingguan dan kuis berkala',
        tugas: 'Tugas mandiri, penyelesaian studi kasus, dan laporan praktikum',
      },
      etika: {
        kerapian: 2.5,
        kerja_sama: 2.5,
        kedisiplinan: 2.5,
        ketelitian: 2.5,
      },
    },
    pustaka: getRelevantPustakas(mkClean),
    rkpbm: rkpbmWeeks,
  }
}

function getRelevantPustakas(mkNama) {
  const mk = mkNama.toLowerCase()
  if (mk.includes('gambar') || mk.includes('cad') || mk.includes('drafting')) {
    return [
      { jenis: 'utama', penulis: 'Takeshi Sato, G., & Sugiarto, N.', tahun: '2008', judul: 'Menggambar Mesin Menurut Standar ISO', penerbit: 'PT Pradnya Paramita, Jakarta' },
      { jenis: 'utama', penulis: 'Luzadder, Warren J., & Hendarsin', tahun: '1999', judul: 'Menggambar Teknik untuk Desain dan Manufaktur', penerbit: 'Erlangga, Jakarta' },
      { jenis: 'pendukung', penulis: 'Simmons, Colin H., & Maguire, Dennis E.', tahun: '2012', judul: 'Manual of Engineering Drawing: Technical Product Specification and Documentation', penerbit: 'Butterworth-Heinemann, Oxford' },
    ]
  }
  if (mk.includes('bangku') || mk.includes('pelat') || mk.includes('fabrikasi')) {
    return [
      { jenis: 'utama', penulis: 'Daryanto', tahun: '2010', judul: 'Keahlian Kerja Bangku dan Pelat untuk Pendidikan Kejuruan', penerbit: 'Alfabeta, Bandung' },
      { jenis: 'utama', penulis: 'Kalpakjian, Serope, & Schmid, Steven R.', tahun: '2014', judul: 'Manufacturing Processes for Engineering Materials', penerbit: 'Pearson Education, Singapore' },
      { jenis: 'pendukung', penulis: 'Krar, Steve F., & Gill, Arthur R.', tahun: '2003', judul: 'Technology of Machine Tools (Bench Work & Sheet Metal)', penerbit: 'McGraw-Hill, New York' },
    ]
  }
  if (mk.includes('las') || mk.includes('welding')) {
    return [
      { jenis: 'utama', penulis: 'Wiryosumarto, Harsono, & Okumura, Toshie', tahun: '2000', judul: 'Teknologi Pengelasan Logam', penerbit: 'PT Pradnya Paramita, Jakarta' },
      { jenis: 'utama', penulis: 'Alip, Mochamad', tahun: '2018', judul: 'Teknologi Pengelasan Logam: Teori dan Praktik Pengelasan SMAW, GMAW, GTAW', penerbit: 'Deepublish, Yogyakarta' },
      { jenis: 'pendukung', penulis: 'AWS (American Welding Society)', tahun: '2015', judul: 'Welding Handbook: Welding Science and Technology', penerbit: 'American Welding Society, Miami' },
    ]
  }
  if (mk.includes('kalor') || mk.includes('heat')) {
    return [
      { jenis: 'utama', penulis: 'Holman, J.P., & Jasjfi, E.', tahun: '1997', judul: 'Perpindahan Kalor (Heat Transfer)', penerbit: 'Erlangga, Jakarta' },
      { jenis: 'utama', penulis: 'Incropera, Frank P., & DeWitt, David P.', tahun: '2011', judul: 'Fundamentals of Heat and Mass Transfer', penerbit: 'John Wiley & Sons, New York' },
      { jenis: 'pendukung', penulis: 'Kakaç, Sadık, & Liu, Hongtan', tahun: '2002', judul: 'Heat Exchangers: Selection, Rating, and Thermal Design', penerbit: 'CRC Press, Boca Raton' },
    ]
  }
  if (mk.includes('termo') || mk.includes('energi')) {
    return [
      { jenis: 'utama', penulis: 'Cengel, Yunus A., & Boles, Michael A.', tahun: '2019', judul: 'Thermodynamics: An Engineering Approach (9th Edition)', penerbit: 'McGraw-Hill Education, New York' },
      { jenis: 'utama', penulis: 'Moran, Michael J., & Shapiro, Howard N.', tahun: '2014', judul: 'Fundamentals of Engineering Thermodynamics', penerbit: 'John Wiley & Sons, New York' },
      { jenis: 'pendukung', penulis: 'Reynolds, William C., & Perkins, Henry C.', tahun: '1998', judul: 'Termodinamika Teknik', penerbit: 'Erlangga, Jakarta' },
    ]
  }
  if (mk.includes('elemen') || mk.includes('perancangan') || mk.includes('design')) {
    return [
      { jenis: 'utama', penulis: 'Sularso, & Suga, Kiyokatsu', tahun: '2004', judul: 'Dasar Perencanaan dan Pemilihan Elemen Mesin', penerbit: 'PT Pradnya Paramita, Jakarta' },
      { jenis: 'utama', penulis: 'Shigley, Joseph E., & Mischke, Charles R.', tahun: '2015', judul: 'Mechanical Engineering Design (Perancangan Teknik Mesin)', penerbit: 'McGraw-Hill / Erlangga, Jakarta' },
      { jenis: 'pendukung', penulis: 'Norton, Robert L.', tahun: '2013', judul: 'Machine Design: An Integrated Approach', penerbit: 'Prentice Hall, New Jersey' },
    ]
  }
  if (mk.includes('fluida') || mk.includes('pompa') || mk.includes('kompresor') || mk.includes('hidrolik')) {
    return [
      { jenis: 'utama', penulis: 'White, Frank M., & Harinaldi', tahun: '2011', judul: 'Mekanika Fluida (Edisi Ke-5)', penerbit: 'Penerbit Erlangga, Jakarta' },
      { jenis: 'utama', penulis: 'Sularso, & Haruo Tahara', tahun: '2006', judul: 'Pompa dan Kompresor: Pemilihan, Pemakaian dan Pemeliharaan', penerbit: 'PT Pradnya Paramita, Jakarta' },
      { jenis: 'pendukung', penulis: 'Munson, Bruce R., Young, Donald F., & Okiishi, Theodore H.', tahun: '2013', judul: 'Fundamentals of Fluid Mechanics', penerbit: 'John Wiley & Sons, New York' },
    ]
  }
  if (mk.includes('rawat') || mk.includes('maintenance') || mk.includes('perawatan')) {
    return [
      { jenis: 'utama', penulis: 'Mobley, R. Keith, & Higgins, Lindley R.', tahun: '2008', judul: 'Maintenance Engineering Handbook (7th Edition)', penerbit: 'McGraw-Hill Professional, New York' },
      { jenis: 'utama', penulis: 'Daryanto', tahun: '2012', judul: 'Manajemen Perawatan Mesin Industri', penerbit: 'Satu Nusa, Bandung' },
      { jenis: 'pendukung', penulis: 'Kurniawan, Fakhrizal', tahun: '2013', judul: 'Manajemen Perawatan Industri Terencana', penerbit: 'Graha Ilmu, Yogyakarta' },
    ]
  }
  if (mk.includes('mesin') || mk.includes('cnc') || mk.includes('bubut') || mk.includes('frais') || mk.includes('manufaktur')) {
    return [
      { jenis: 'utama', penulis: 'Kalpakjian, Serope, & Schmid, Steven R.', tahun: '2014', judul: 'Manufacturing Processes for Engineering Materials', penerbit: 'Pearson Education, Singapore' },
      { jenis: 'utama', penulis: 'Groover, Mikell P.', tahun: '2016', judul: 'Fundamentals of Modern Manufacturing: Materials, Processes, and Systems', penerbit: 'John Wiley & Sons, New York' },
      { jenis: 'pendukung', penulis: 'Rochim, Taufiq', tahun: '2007', judul: 'Teori & Teknologi Proses Pemesinan', penerbit: 'Laboratorium Teknik Produksi FTI-ITB Bandung' },
    ]
  }

  // Default teknik mesin umum
  return [
    { jenis: 'utama', penulis: 'Sularso, & Suga, Kiyokatsu', tahun: '2004', judul: `Dasar Perencanaan dan Pemilihan Elemen Mesin (${mkNama})`, penerbit: 'PT Pradnya Paramita, Jakarta' },
    { jenis: 'utama', penulis: 'Shigley, Joseph E., & Mischke, Charles R.', tahun: '2015', judul: `Mechanical Engineering Design and Fundamentals (${mkNama})`, penerbit: 'McGraw-Hill, New York' },
    { jenis: 'pendukung', penulis: 'Groover, Mikell P.', tahun: '2016', judul: 'Fundamentals of Modern Manufacturing: Materials, Processes, and Systems', penerbit: 'John Wiley & Sons, New York' },
  ]
}

/**
 * Generate full RPKPS data (Deskripsi, Tujuan, Jam, Penilaian, Pustaka, 16 Minggu RKPBM)
 */
export async function generateFullRpsWithAi({
  mataKuliah,
  kodeMk = '',
  sks = 2,
  prodiNama = 'Sarjana Terapan Teknik Mesin Produksi dan Perawatan',
  semester = 'Genap',
  topikKhusus = '',
  silabusLama = '',
  apiKey = '',
  forceOffline = false,
}) {
  // Jika offline / tanpa key / user memilih generator cepat
  if (forceOffline || (!apiKey && !getApiKey())) {
    return generateSmartTemplateRps({
      mataKuliah,
      kodeMk,
      sks,
      prodiNama,
      semester,
      topikKhusus,
    })
  }

  const prompt = `
Susun dokumen RPKPS lengkap untuk mata kuliah berikut:
- Nama Mata Kuliah: ${mataKuliah}
- Kode Mata Kuliah: ${kodeMk || '(buatkan kode standar, misal KBPP / TME)'}
- SKS: ${sks} SKS
- Program Studi: ${prodiNama}
- Semester: ${semester}
${topikKhusus ? `- Fokus Materi Khusus dari Dosen: ${topikKhusus}` : ''}
${silabusLama ? `- Silabus / Catatan Kasar Acuan: \n${silabusLama}` : ''}

Struktur JSON yang harus Anda hasilkan:
{
  "deskripsi_singkat": "string",
  "tujuan_umum": "string",
  "tujuan_khusus": ["string", "string", "string"],
  "prasyarat": "string",
  "perkiraan_peserta": "string (misal: 25 - 30 Orang Mahasiswa)",
  "jam": {
    "perkuliahan_jam": 36,
    "perkuliahan_minggu": 9,
    "latihan_jam": 8,
    "latihan_minggu": 2,
    "praktikum_jam": 12,
    "praktikum_minggu": 3,
    "ujian_jam": 4
  },
  "penilaian": {
    "uts": 30,
    "uas": 40,
    "nkp": 20,
    "nkpr": 10,
    "hasil_belajar_harian": {
      "sikap": "Penilaian keaktifan dan etika saat perkuliahan",
      "latihan_kuis": "Latihan soal terstruktur dan kuis per topik bahasan",
      "tugas": "Tugas mandiri penyelesaian studi kasus dan laporan praktikum"
    },
    "etika": {
      "kerapian": 2.5,
      "kerja_sama": 2.5,
      "kedisiplinan": 2.5,
      "ketelitian": 2.5
    }
  },
  "pustaka": [
    {
      "jenis": "utama",
      "penulis": "Nama Penulis",
      "tahun": "2020",
      "judul": "Judul Buku Teks",
      "penerbit": "Penerbit, Kota"
    }
  ],
  "rkpbm": [
    {
      "minggu_ke": "I",
      "tujuan_khusus": "Mahasiswa mampu memahami kontrak kuliah...",
      "pokok_bahasan": "Pengantar dan konsep dasar...",
      "metoda_media": "Menyimak, diskusi, tanya jawab. Media: papan tulis dan proyektor.",
      "evaluasi_waktu": "4 × 50'",
      "buku_sumber": "Buku Utama Bab 1"
    }
    ... (hingga minggu XVI)
  ]
}
`

  try {
    return await callGemini(prompt, apiKey)
  } catch (err) {
    console.warn('Gemini API call gagal, menggunakan Smart Fallback Generator:', err.message)
    // Fallback otomatis jika Gemini API error agar user tidak pernah stuck!
    return generateSmartTemplateRps({
      mataKuliah,
      kodeMk,
      sks,
      prodiNama,
      semester,
      topikKhusus,
    })
  }
}

/**
 * Generate atau lengkapi hanya tabel RKPBM 16 minggu
 */
export async function generateRkpbmOnlyWithAi({
  mataKuliah,
  sks = 2,
  deskripsi = '',
  topikKhusus = '',
  apiKey = '',
}) {
  if (!apiKey && !getApiKey()) {
    const full = generateSmartTemplateRps({ mataKuliah, sks, topikKhusus })
    return full.rkpbm
  }

  const prompt = `
Susun tabel RKPBM 16 MINGGU LENGKAP untuk:
- Mata Kuliah: ${mataKuliah} (${sks} SKS)
${deskripsi ? `- Deskripsi: ${deskripsi}` : ''}
${topikKhusus ? `- Poin Materi: ${topikKhusus}` : ''}

Format JSON:
{
  "rkpbm": [
    {
      "minggu_ke": "I",
      "tujuan_khusus": "...",
      "pokok_bahasan": "...",
      "metoda_media": "...",
      "evaluasi_waktu": "4 × 50'",
      "buku_sumber": "..."
    }
    ... (tepat 16 entri)
  ]
}
`

  try {
    const res = await callGemini(prompt, apiKey)
    return res.rkpbm || []
  } catch (err) {
    console.warn('Gemini API call gagal, fallback ke smart template RKPBM:', err.message)
    const full = generateSmartTemplateRps({ mataKuliah, sks, topikKhusus })
    return full.rkpbm
  }
}

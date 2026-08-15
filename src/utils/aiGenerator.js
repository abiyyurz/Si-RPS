// Layanan AI Generator untuk RPS berbasis Google Gemini API (gemini-flash-latest / gemini-3.7-flash)
// + Smart Engineering Curricula Knowledge Base untuk Politeknik Negeri Bengkalis.

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
Anda adalah Pakar Kurikulum Pendidikan Tinggi Vokasi dan Dosen Senior Teknik Mesin di Politeknik Negeri Bengkalis (Polbeng).
Tugas Anda adalah menyusun dokumen RPS (Rencana Pembelajaran Semester) secara komprehensif, terstruktur, valid secara keilmuan teknik, dan siap pakai pada sistem Si-RPS.

PENTING & WAJIB - KONSISTENSI MATERI 100% SESUAI BIDANG MATA KULIAH (JANGAN CAMPUR ADUK):
Materi 16 Minggu RKPBM, Deskripsi, Tujuan, dan Pustaka WAJIB 100% RELEVAN & SPESIFIK dengan topik mata kuliah:

1. JIKA MATA KULIAH: GAMBAR TEKNIK / PRAKTEK GAMBAR MESIN / CAD
   - WAJIB HANYA MEMBAHAS: Standarisasi gambar teknik ISO/JIS, peralatan gambar, standarisasi garis, huruf & angka, etiket (kepala gambar), proyeksi piktorial (isometri, dimetri), proyeksi ortogonal (Eropa & Amerika), gambar potongan/irisan (penuh, separuh, putar, sobekan), aturan penunjukan ukuran, toleransi linier & suaian ISO (longgar, pas, paksa), toleransi geometris, tanda pengerjaan & kekasaran permukaan, gambar susunan (assembly) & part list (daftar bagian), serta pemodelan CAD 2D/3D.
   - DILARANG KERAS memasukkan kikir, gergaji, las, atau termodinamika ke dalam Gambar Teknik!

2. JIKA MATA KULIAH: PRAKTEK KERJA BANGKU DAN PELAT / FABRIKASI
   - WAJIB HANYA MEMBAHAS: K3 bengkel kerja bangku, alat ukur presisi (jangka sorong, mikrometer, beveled protector, height gauge), penandaan/penggoresan (scriber, centre punch), teknik menggergaji manual/mesin, teknik mengikir rata, siku, sejajar & profil, teknik pengeboran (drilling) & reaming, pembuatan ulir dalam & luar manual (tap & snei), pemotongan pelat manual & mesin (guillotine/hand shear), penekukan pelat (bending), sambungan keling (riveting), perakitan (assembly fitting), serta inspeksi kualitas dimensi benda kerja.

3. JIKA MATA KULIAH: PRAKTEK ELEKTROMEKANIK / LISTRIK MESIN
   - WAJIB HANYA MEMBAHAS: K3 listrik industri, instrumen ukur listrik (multimeter, tang ampere, megger, osiloskop), komponen kendali elektromagnetik (kontaktor, push button, relay, timer on/off delay), pengaman beban lebih (Thermal Overload Relay / TOR & MCB), rangkaian kontrol motor listrik 3 fasa: DOL (Direct On Line), Forward-Reverse, Star-Delta manual & otomatis, pengawatan kabel panel listrik industri (wiring diagram), pengenalan sensor industri & aktuator, dasar elektro-pneumatik, serta pemeliharaan & troubleshooting instalasi motor listrik.

4. JIKA MATA KULIAH: PESAWAT ANGKAT & ANGKUT
   - WAJIB HANYA MEMBAHAS: Klasifikasi pesawat angkat (overhead travelling crane, gantry crane, jib crane, electric hoist, forklift), tali kawat baja (wire rope: konstruksi, tegangan putus, faktor keamanan), puli & drum penggulung, kait beban (hook: penampang, tegangan kritis), sistem rem pesawat angkat (shoe brake, disc brake), motor penggerak & transmisi reduksi putaran (gearbox), perhitungan struktur gelagar crane (girder), stabilitas pesawat angkat terhadap guling, serta pengujian beban (load test) & regulasi standar keselamatan Depnaker/ASME.

5. JIKA MATA KULIAH: PERPINDAHAN KALOR DAN PENUKAR KALOR / TERMAL
   - WAJIB HANYA MEMBAHAS: Mekanisme dasar kalor (konduksi, konveksi, radiasi), sifat termal bahan (konduktivitas, kalor jenis), konduksi 1D keadaan tunak (dinding datar, silinder, bola), isolasi kritis & sirip (fins), konduksi 2D & transien (kapasitas kalor tergabung), konveksi paksa & alami (bilangan tak berdimensi Nu, Re, Pr, Gr), radiasi termal (hukum Stefan-Boltzmann, faktor bentuk radiasi), jenis penukar kalor (shell and tube, double pipe, compact HE), serta analisis rancangan penukar kalor metode LMTD dan ε-NTU.

6. JIKA MATA KULIAH: ELEMEN MESIN / PERANCANGAN MEKANIK
   - WAJIB HANYA MEMBAHAS: Konsep tegangan, deformasi & faktor keamanan, sambungan baut (bolted joint), sambungan las (welded joint), sambungan paku keling, perancangan poros transmisi (shaft) berdasarkan torsi & momen lentur, pasak (key) & splines, kopling tetap (flange coupling) & fleksibel, transmisi sabuk-puli (belt & pulley), transmisi rantai-sprocket, roda gigi lurus (spur gear) & miring (helical gear), bantalan luncur & gelinding (bearing), serta pegas mekanis.

7. JIKA MATA KULIAH: PNEUMATIK DAN HIDROLIK
   - WAJIB HANYA MEMBAHAS: Prinsip dasar daya fluida (hukum Pascal, fluida hidrolik & udara kempa), kompresor, tangki udara & unit FRL (Filter, Regulator, Lubricator), pompa hidrolik & reservoir, katup kendali arah / DCV (3/2, 4/2, 5/2, 4/3), katup kontrol tekanan (relief valve, reducing valve) & katup kontrol aliran (throttle valve, check valve), silinder kerja tunggal & ganda, motor hidrolik/pneumatik, desain rangkaian sekuensial metode kaskade, rangkaian elektro-pneumatik, serta pemeliharaan & troubleshooting sistem fluida.

8. JIKA MATA KULIAH: MEKANIKA TEKNIK / STATIKA STRUKTUR
   - WAJIB HANYA MEMBAHAS: Besaran vektor gaya, resultan gaya 2D/3D, kesetimbangan partikel & benda tegar, diagram benda bebas (Free Body Diagram), analisis struktur rangka batang (truss: metode titik buhul / joint dan metode potongan / section), gaya-gaya dalam pada balok (bidang gaya normal N, gaya lintang D, dan momen lentur M), tegangan lentur & geser balok, titik berat & momen inersia penampang, serta lendutan/defleksi balok.

STRUKTUR DOKUMEN RPS POLBENG:
1. DESKRIPSI SINGKAT: 1-2 paragraf akademik formal yang menjelaskan ruang lingkup mata kuliah, relevansi industri/rekayasa, dan capaian umum.
2. TUJUAN PEMBELAJARAN UMUM: 1 paragraf capaian pembelajaran lulusan (CPL/CPMK).
3. TUJUAN PEMBELAJARAN KHUSUS: 3 sampai 5 butir Taksonomi Bloom berjenjang (C1-C6).
4. JUMLAH JAM: Proporsional berdasarkan SKS (misal 2 SKS = Perkuliahan 36 jam, Latihan 8 jam, Praktikum 12 jam, Ujian 4 jam. Total = 60 jam).
5. KONTRAK PENILAIAN: Total UTS + UAS + NKP + NKPr WAJIB TEPAT 100% (UTS: 30%, UAS: 40%, NKP: 20%, NKPr: 10%).
   - Hasil Belajar Harian: deskripsi sikap, latihan/kuis, tugas.
   - Etika: Kerapian (2.5), Kerja Sama (2.5), Kedisiplinan (2.5), Ketelitian (2.5) -> Total 10.
6. RKPBM WAJIB 16 MINGGU TEPAT:
   - Minggu I s.d. VII: Materi berjenjang runtut dari konsep awal sampai aplikasi terapan.
   - Minggu VIII: WAJIB UJIAN TENGAH SEMESTER (UTS). Set pokok_bahasan = "UJIAN TENGAH SEMESTER (UTS)", tujuan_khusus = "", evaluasi_waktu = "2 × 50'".
   - Minggu IX s.d. XV: Materi lanjutan spesifik topik mata kuliah.
   - Minggu XVI: WAJIB UJIAN AKHIR SEMESTER (UAS). Set pokok_bahasan = "UJIAN AKHIR SEMESTER (UAS)", tujuan_khusus = "", evaluasi_waktu = "2 × 50'".
   - Minggu non-ujian berisi: tujuan_khusus yang spesifik, pokok_bahasan terinci, metoda_media, evaluasi_waktu ("4 × 50'"), dan buku_sumber bab.
7. BUKU PUSTAKA: 2-3 buku teks teknik yang nyata, valid, dan sering dipakai di perguruan tinggi teknik (penulis, tahun, judul, penerbit).

OUTPUT WAJIB DALAM FORMAT JSON MURNI TANPA MARKDOWN BACKTICKS.
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
      temperature: 0.2, // Temperatur rendah agar AI presisi dan tidak berhalusinasi
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

    if (model === DEFAULT_MODEL) {
      console.warn(`Gemini model gagal (${errMsg}), mencoba fallback ke ${FALLBACK_MODEL}...`)
      return callGemini(promptText, key, FALLBACK_MODEL)
    }

    throw new Error(`Gemini API Error: ${errMsg}`)
  }

  const data = await res.json()
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) {
    throw new Error('Respon Gemini kosong atau tidak dapat dibaca.')
  }

  try {
    const cleaned = rawText.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim()
    return JSON.parse(cleaned)
  } catch (err) {
    console.error('Gagal parse JSON dari Gemini:', rawText)
    throw new Error(`Format JSON dari AI tidak valid: ${err.message}`)
  }
}

/**
 * MASTER CURRICULA DATABASE (16 MINGGU RESMI & AKURAT) UNTUK TEKNIK MESIN
 */
const MASTER_CURRICULA = {
  gambar_teknik: {
    match: ['gambar', 'cad', 'drafting', 'autocad', 'inventor', 'solidworks'],
    deskripsi: 'Mata kuliah Praktek Gambar Teknik Mesin merupakan mata kuliah keahlian dasar yang membekali mahasiswa dengan kompetensi membaca, menginterpretasikan, dan membuat gambar teknik mesin sesuai dengan standar internasional ISO/JIS. Pembelajaran mencakup penguasaan alat gambar, standarisasi garis dan etiket, proyeksi piktorial dan ortogonal (proyeksi Eropa dan Amerika), potongan gambar (sectional views), penunjukan ukuran dan toleransi suaian ISO, toleransi geometris, tanda pengerjaan, gambar susunan (assembly drawing), serta perancangan berbasis Computer Aided Design (CAD 2D/3D).',
    tujuan_umum: 'Setelah menyelesaikan mata kuliah ini, mahasiswa mampu membuat dan membaca gambar kerja teknik mesin yang komunikatif, presisi, dan sesuai standar ISO, baik secara manual maupun menggunakan perangkat lunak CAD 2D/3D sebagai media komunikasi rekayasa manufaktur.',
    tujuan_khusus: [
      'Mampu menerapkan standarisasi garis, huruf, angka, skala, dan tata letak etiket sesuai standar ISO pada kertas gambar.',
      'Mampu menyajikan gambar proyeksi piktorial (isometri, dimetri) dan proyeksi ortogonal sistem proyeksi Eropa dan Amerika.',
      'Mampu membuat gambar potongan (irisan penuh, separuh, putar, dan sobekan) serta menerapkan aturan penunjukan ukuran secara tepat.',
      'Mampu menentukan toleransi linier (suaian ISO), toleransi geometris, dan simbol kekasaran permukaan pada gambar kerja.',
      'Mampu membuat gambar susunan (assembly drawing) lengkap dengan daftar bagian (part list) dan memodelkan komponen menggunakan perangkat lunak CAD.',
    ],
    pustaka: [
      { jenis: 'utama', penulis: 'Sato, Takeshi G., & Sugiarto, N. Hartanto', tahun: '2008', judul: 'Menggambar Mesin Menurut Standar ISO', penerbit: 'PT Pradnya Paramita, Jakarta' },
      { jenis: 'utama', penulis: 'Luzadder, Warren J., & Duff, Jon M.', tahun: '1995', judul: 'Introduction to Graphical Communication for Engineers', penerbit: 'Prentice Hall, New Jersey' },
      { jenis: 'pendukung', penulis: 'Bhatt, N.D., & Panchal, V.M.', tahun: '2014', judul: 'Machine Drawing', penerbit: 'Charotar Publishing House, Anand, India' },
    ],
    rkpbm: [
      { minggu_ke: 'I', tujuan_khusus: 'Mahasiswa mampu memahami kontrak perkuliahan, aturan K3 studio gambar, fungsi gambar teknik sebagai bahasa teknik, standarisasi ISO, serta pengenalan alat-alat gambar manual dan digital.', pokok_bahasan: 'Pengantar Gambar Teknik Mesin: Standarisasi ISO, fungsi gambar kerja, jenis kertas gambar, pensil, penggaris T/segitiga, jangka, dan pemeliharaan alat gambar.', metoda_media: 'Ceramah, demonstrasi penggunaan alat gambar, latihan dasar garis.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Sato Bab 1 & 2' },
      { minggu_ke: 'II', tujuan_khusus: 'Mahasiswa mampu menerapkan standarisasi macam-macam garis, standarisasi huruf dan angka, skala gambar, serta pembuatan etiket (kepala gambar).', pokok_bahasan: 'Konstruksi Geometri & Standarisasi Garis: Garis tebal kontur, garis tipis ukur, garis putus-putus gores (terhalang), garis sumbu strip-titik, pembuatan huruf/angka standar ISO, dan format kepala gambar (etiket).', metoda_media: 'Praktik menggambar konstruksi geometris dan etiket pada kertas A3.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Sato Bab 3 & 4' },
      { minggu_ke: 'III', tujuan_khusus: 'Mahasiswa mampu membuat gambar konstruksi geometris bidang, segi banyak beraturan, elips, dan garis singgung lingkaran secara presisi.', pokok_bahasan: 'Konstruksi Geometris Lanjutan: Membagi garis sama panjang, membuat sudut presisi, menggambar poligon segilima/segienam beraturan, kurva involut, dan sambungan garis singgung busur lingkaran.', metoda_media: 'Praktik mandiri tugas 1 konstruksi geometris, evaluasi ketelitian.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Sato Bab 4; Bhatt Bab 3' },
      { minggu_ke: 'IV', tujuan_khusus: 'Mahasiswa mampu memproyeksikan benda 3 dimensi ke dalam gambar piktorial isometri, dimetri, dan miring (oblique).', pokok_bahasan: 'Proyeksi Piktorial (Gambar Pandangan Tunggal): Sumbu isometri (30°-30°), sudut dimetri, proyeksi miring kavalir/kabinet, dan teknik penggambaran lingkaran dalam isometri (isocircle).', metoda_media: 'Praktik menggambar model 3D isometri blok bertingkat dan poros bertingkat.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Sato Bab 5; Luzadder Bab 6' },
      { minggu_ke: 'V', tujuan_khusus: 'Mahasiswa mampu memahami dan menyajikan gambar proyeksi ortogonal sudut pertama (Metode Proyeksi Eropa) dari model 3D.', pokok_bahasan: 'Proyeksi Ortogonal Sistem Eropa (First Angle Projection): Lambang proyeksi Eropa, kuadran I, penempatan pandangan utama (pandangan depan, atas, samping kiri, samping kanan, bawah, belakang).', metoda_media: 'Tutorial problem solving, praktik proyeksi 3 pandangan utama Eropa.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Sato Bab 6; Bhatt Bab 7' },
      { minggu_ke: 'VI', tujuan_khusus: 'Mahasiswa mampu memahami dan menyajikan gambar proyeksi ortogonal sudut ketiga (Metode Proyeksi Amerika) serta membandingkannya dengan metode Eropa.', pokok_bahasan: 'Proyeksi Ortogonal Sistem Amerika (Third Angle Projection): Lambang proyeksi Amerika, kuadran III, tata letak pandangan depan-atas-kanan, perbandingan aturan Eropa vs Amerika.', metoda_media: 'Praktik menggambar pandangan ortogonal Amerika benda bertingkat berlubang.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Sato Bab 6; Luzadder Bab 7' },
      { minggu_ke: 'VII', tujuan_khusus: 'Mahasiswa mampu menyelesaikan latihan integratif penggambaran proyeksi ortogonal benda kompleks bertingkat dan berongga.', pokok_bahasan: 'Studi Kasus Proyeksi Ortogonal Komprehensif: Pemilihan pandangan utama yang paling informatif, penggambaran garis sembunyi, dan review materi persiapan UTS.', metoda_media: 'Latihan mandiri studi kasus ortogonal, asistensi gambar kerja.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Sato Bab 5–6' },
      { minggu_ke: 'VIII', tujuan_khusus: '', pokok_bahasan: 'UJIAN TENGAH SEMESTER (UTS)', metoda_media: '', evaluasi_waktu: "2 × 50'", buku_sumber: '' },
      { minggu_ke: 'IX', tujuan_khusus: 'Mahasiswa mampu membuat gambar potongan/irisan (sectional views) sesuai aturan standar ISO untuk memperjelas rongga dalam benda.', pokok_bahasan: 'Gambar Potongan (Cross Section): Potongan penuh (full section), potongan separuh (half section), potongan putar, potongan meloncat (offset section), potongan sobekan (broken-out), serta aturan arsir standar bahan teknik.', metoda_media: 'Praktik membuat gambar potongan rumah bantalan dan puli bertingkat.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Sato Bab 7; Bhatt Bab 9' },
      { minggu_ke: 'X', tujuan_khusus: 'Mahasiswa mampu menerapkan aturan penunjukan ukuran (dimensioning) yang benar, jelas, dan tidak berulang pada gambar kerja teknik.', pokok_bahasan: 'Aturan Pemberian Ukuran (Dimensioning): Garis ukur, garis bantu, angka ukur, tanda panah, penunjukan ukuran berantai, sejajar, gabungan, penunjukan diameter, radius, chamfer, sudut, dan ulir.', metoda_media: 'Praktik pemberian dimensi lengkap pada komponen mesin.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Sato Bab 8; Luzadder Bab 9' },
      { minggu_ke: 'XI', tujuan_khusus: 'Mahasiswa mampu menentukan toleransi linier dan sistem suaian ISO (suaian longgar, pas, dan sesak/paksa).', pokok_bahasan: 'Toleransi Linier & Sistem Suaian ISO: Ukuran nominal, penyimpangan atas & bawah, daerah toleransi (H7, g6, js6), sistem basis lubang dan sistem basis poros, perhitungan batas maksimum/minimum.', metoda_media: 'Ceramah, tutorial tabel suaian ISO, praktik pencantuman toleransi pada poros-bantalan.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Sato Bab 9; Bhatt Bab 11' },
      { minggu_ke: 'XII', tujuan_khusus: 'Mahasiswa mampu mencantumkan toleransi geometris dan simbol tanda pengerjaan/kekasaran permukaan (surface roughness) pada gambar kerja mesin.', pokok_bahasan: 'Toleransi Geometris & Kekasaran Permukaan: Simbol kelurusan, kerataan, kebulatan, silindrisitas, kesikuan, keparalelan, posisi, konsentrisitas. Simbol nilai kekasaran Ra, arah bekas pengerjaan.', metoda_media: 'Praktik pencantuman simbol geometris dan kekasaran pada komponen mesin presisi.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Sato Bab 10; Bhatt Bab 12' },
      { minggu_ke: 'XIII', tujuan_khusus: 'Mahasiswa mampu mengoperasikan perangkat lunak CAD 2D untuk membuat gambar kerja komponen mesin secara digital.', pokok_bahasan: 'Dasar Perancangan CAD 2D: User Interface, sistem koordinat (kartesian & polar), perintah Draw (Line, Circle, Arc, Polyline), perintah Modify (Trim, Extend, Offset, Fillet, Mirror), Layering, dan Dimension style.', metoda_media: 'Praktik mandiri di laboratorium komputer CAD, drafting komponen 2D.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Modul CAD Polbeng; Luzadder Bab 12' },
      { minggu_ke: 'XIV', tujuan_khusus: 'Mahasiswa mampu membuat gambar susunan (assembly drawing) dan gambar detail (part drawing) lengkap dengan daftar bagian (bill of material).', pokok_bahasan: 'Gambar Susunan (Assembly Drawing): Tata letak komponen rakitan, penomoran posisi (balloon number), pembuatan tabel daftar bagian (part list), gambar detail komponen individual (poros, pasak, puli, rumah pasang).', metoda_media: 'Proyek drafting susunan mekanisme sederhana (ragum / katup pengatur).', evaluasi_waktu: "4 × 50'", buku_sumber: 'Sato Bab 12; Bhatt Bab 15' },
      { minggu_ke: 'XV', tujuan_khusus: 'Mahasiswa mampu menyelesaikan proyek akhir gambar kerja manufaktur lengkap, memvalidasi ukuran, dan menyiapkan layout cetak (plotting).', pokok_bahasan: 'Penyelesaian Proyek Gambar Manufaktur & Plotting: Pengecekan tabrakan geometri (interference check), setting layout viewport, skala cetak, plotting PDF/kertas standar A3/A4.', metoda_media: 'Asistensi proyek gambar, review menyeluruh, persiapan UAS.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Sato Bab 1–12' },
      { minggu_ke: 'XVI', tujuan_khusus: '', pokok_bahasan: 'UJIAN AKHIR SEMESTER (UAS)', metoda_media: '', evaluasi_waktu: "2 × 50'", buku_sumber: '' },
    ],
  },
  kerja_bangku: {
    match: ['bangku', 'pelat', 'kikir', 'fabrikasi', 'perkakas tangan', 'bengkel mekanik'],
    deskripsi: 'Mata kuliah Praktek Kerja Bangku dan Pelat merupakan mata kuliah kejuruan dasar yang membekali mahasiswa dengan keterampilan motorik dan keselamatan kerja dalam pembentukan material logam secara manual dan semi-otomatis. Praktik meliputi K3 bengkel, penggunaan alat ukur presisi (jangka sorong, mikrometer, height gauge), penggoresan/penandaan benda kerja, teknik menggergaji manual/mesin, teknik mengikir rata, siku, dan profil, teknik pengeboran (drilling) dan reaming, pembuatan ulir manual (mengetap dan menyenei), pemotongan pelat (guillotine & hand shear), penekukan pelat (bending), penyambungan keling (riveting), serta perakitan komponen presisi (fitting) sesuai standar toleransi industri.',
    tujuan_umum: 'Setelah menyelesaikan mata kuliah ini, mahasiswa terampil mengoperasikan perkakas tangan dan mesin perkakas dasar untuk memproduksi benda kerja kerja bangku dan konstruksi pelat dengan kepresisian ukuran, kesikuan, kerataan, serta kepatuhan penuh terhadap standar keselamatan kerja K3.',
    tujuan_khusus: [
      'Mampu menerapkan standar Keselamatan dan Kesehatan Kerja (K3) serta pemeliharaan perkakas bengkel mekanik.',
      'Mampu melakukan pengukuran dan penandaan/penggoresan benda kerja menggunakan instrumen presisi.',
      'Mampu memotong material dengan gergaji tangan dan mengikir benda kerja dengan kerataan, kesikuan, dan ukuran presisi.',
      'Mampu melakukan proses pengeboran, reaming, serta pembuatan ulir dalam (tapping) dan ulir luar (threading) manual.',
      'Mampu memotong, menekuk, merivet, dan merakit konstruksi pelat logam lembaran menjadi produk jadi.',
    ],
    pustaka: [
      { jenis: 'utama', penulis: 'Daryanto', tahun: '2010', judul: 'Keahlian Perkakas Tangan Bengkel Mesin', penerbit: 'PT Sarana Tutorial Nurani Sejahtera, Bandung' },
      { jenis: 'utama', penulis: 'Krar, Steve F., Gill, Arthur R., & Smid, Peter', tahun: '2011', judul: 'Technology of Machine Tools (7th Edition)', penerbit: 'McGraw-Hill Education, New York' },
      { jenis: 'pendukung', penulis: 'Tim Dosen Bengkel Polbeng', tahun: '2021', judul: 'Modul Praktik Kerja Bangku dan Pelat Logam', penerbit: 'Politeknik Negeri Bengkalis' },
    ],
    rkpbm: [
      { minggu_ke: 'I', tujuan_khusus: 'Mahasiswa mampu memahami tata tertib bengkel, potensi bahaya, penggunaan APD (Alat Pelindung Diri), dan prosedur darurat keselamatan kerja K3.', pokok_bahasan: 'K3 Bengkel Mekanik & Pengenalan Perkakas: Standar keselamatan kerja, APD kacamata/baju kerja/safety shoes, pengenalan ragum meja (bench vise), dan layout bengkel kerja bangku.', metoda_media: 'Pengarahan K3, demonstrasi keselamatan, inspeksi APD.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Daryanto Bab 1; Modul Polbeng' },
      { minggu_ke: 'II', tujuan_khusus: 'Mahasiswa mampu menggunakan alat ukur presisi (jangka sorong ketelitian 0.05 & 0.02 mm, mikrometer luar ketelitian 0.01 mm) dan alat penandaan.', pokok_bahasan: 'Pengukuran Presisi & Layout Penandaan: Pembacaan skala utama/nonius vernier caliper, mikrometer sekrup, penggores (scriber), penitik (centre punch), balok ukur, dan jangka hati (hermaphrodite caliper).', metoda_media: 'Demonstrasi dan praktik mandiri pengukuran berbagai sampel logam.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Daryanto Bab 2; Krar Bab 6' },
      { minggu_ke: 'III', tujuan_khusus: 'Mahasiswa mampu memotong material balok baja karbon rendah dengan gergaji tangan secara lurus dan presisi.', pokok_bahasan: 'Teknik Menggergaji Manual (Hacksawing): Pemilihan daun gergaji (TPI), pemasangan daun gergaji dengan tegangan tepat, posisi kuda-kuda tubuh, ritme pemotongan, dan pendinginan.', metoda_media: 'Praktik pemotongan raw material benda kerja balok baja St.37.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Daryanto Bab 3; Modul Polbeng' },
      { minggu_ke: 'IV', tujuan_khusus: 'Mahasiswa mampu melakukan teknik pengikiran dasar untuk menghasilkan bidang datar (flat filing) dengan tingkat kerataan tinggi.', pokok_bahasan: 'Teknik Mengikir Bidang Datar: Jenis kikir (kikir kasar, sedang, halus/bastard, second cut, smooth), bentuk penampang kikir (plat, setengah bulat, segitiga, bulat), teknik memegang kikir dan dorongan melintang.', metoda_media: 'Praktik pengikiran bidang utama bidang 1 benda kerja balok St.37.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Daryanto Bab 4; Krar Bab 10' },
      { minggu_ke: 'V', tujuan_khusus: 'Mahasiswa mampu mengikir bidang siku 90 derajat terhadap bidang acuan dan memeriksa kesikuan menggunakan penyiku baja (try square).', pokok_bahasan: 'Pengikiran Bidang Siku & Sejajar: Pengikiran bidang 2 dan bidang 3 tegak lurus bidang acuan, teknik draw filing untuk finishing permukaan, dan verifikasi kesikuan penyiku baja presisi.', metoda_media: 'Praktik pengikiran bidang siku dan sejajar benda kerja balok.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Daryanto Bab 4; Modul Polbeng' },
      { minggu_ke: 'VI', tujuan_khusus: 'Mahasiswa mampu mengikir benda kerja mencapai ukuran dimensi nominal dengan toleransi ketat ± 0.1 mm.', pokok_bahasan: 'Pengikiran Dimensi Presisi & Chamfering: Pengukuran berkala dimensi panjang, lebar, tebal, pembuatan sudut chamfer 45° keliling benda kerja, dan deburring.', metoda_media: 'Praktik penyelesaian balok presisi modul job 1.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Daryanto Bab 4–5' },
      { minggu_ke: 'VII', tujuan_khusus: 'Mahasiswa mampu membuat penandaan titik lubang dan kontur profil bertingkat pada permukaan benda kerja.', pokok_bahasan: 'Penandaan Pola Profil & Pusat Lubang: Pelapisan cairan penanda (layout dye), penggoresan koordinat titik bor menggunakan height gauge, dan penitik presisi.', metoda_media: 'Praktik layout penandaan job bertingkat dan persiapan evaluasi UTS.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Daryanto Bab 2; Modul Polbeng' },
      { minggu_ke: 'VIII', tujuan_khusus: '', pokok_bahasan: 'UJIAN TENGAH SEMESTER (UTS)', metoda_media: '', evaluasi_waktu: "2 × 50'", buku_sumber: '' },
      { minggu_ke: 'IX', tujuan_khusus: 'Mahasiswa mampu mengoperasikan mesin bor meja (bench drilling machine) untuk melubangi benda kerja dengan parameter kecepatan putar yang tepat.', pokok_bahasan: 'Pengeboran Logam (Drilling): Bagian mesin bor meja, geometri mata bor heliks (twist drill), perhitungan putaran spindel (RPM) berdasarkan cutting speed (Cs), pencekaman ragum bor, dan keselamatan pengeboran.', metoda_media: 'Praktik pengeboran bertingkat (pilot hole & finishing hole).', evaluasi_waktu: "4 × 50'", buku_sumber: 'Daryanto Bab 6; Krar Bab 15' },
      { minggu_ke: 'X', tujuan_khusus: 'Mahasiswa mampu melakukan proses pembersaran lubang presisi (reaming) dan pembuatan pembenaman kepala baut (countersink/counterbore).', pokok_bahasan: 'Reaming & Countersinking: Penggunaan peluas lubang (hand reamer), pelumasan proses reaming, pembuatan chamfer lubang (countersink 90°), dan lubang bertingkat (counterbore).', metoda_media: 'Praktik reaming dan countersinking pada job plate.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Daryanto Bab 6–7' },
      { minggu_ke: 'XI', tujuan_khusus: 'Mahasiswa mampu membuat ulir dalam menggunakan set tap tangan (hand taps 1, 2, 3) dan ulir luar menggunakan snei (threading die).', pokok_bahasan: 'Pembuatan Ulir Manual (Tapping & Threading): Perhitungan diameter lubang bor tap (D_bor = D_nominal - Pitch), set tap tangan (taper, plug, bottoming), tangkai tap, pelumasan ulir, teknik pembalikan 1/4 putaran untuk pemotongan tatal, dan penyeneian poros.', metoda_media: 'Praktik pembuatan ulir M8 dan M10 pada benda kerja balok.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Daryanto Bab 7; Krar Bab 11' },
      { minggu_ke: 'XII', tujuan_khusus: 'Mahasiswa mampu membuat bentangan pola dan memotong lembaran pelat logam (sheet metal) menggunakan gunting tuas manual dan mesin potong guillotine.', pokok_bahasan: 'Pekerjaan Fabrikasi Pelat (Sheet Metal): Karakteristik pelat baja/galvanis, pembuatan pola bukaan (bentangan kotak/silinder), pemotongan pelat dengan gunting tangan lurus/kiri/kanan, dan mesin potong pelat guillotine.', metoda_media: 'Praktik pembuatan pola bentangan dan pemotongan pelat tebal 1.0 mm.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Daryanto Bab 8; Modul Polbeng' },
      { minggu_ke: 'XIII', tujuan_khusus: 'Mahasiswa mampu melakukan proses penekukan pelat (sheet metal bending) menggunakan mesin bending manual (hand folding machine) sesuai sudut rancangan.', pokok_bahasan: 'Penekukan Pelat (Bending): Faktor K-factor tebal pelat, kelonggaran tekukan (bend allowance), urutan langkah penekukan kotak/saluran U, lipatan tepi (hem), dan keselamatan penekukan.', metoda_media: 'Praktik penekukan pelat membentuk kotak toolbox / panel komponen.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Daryanto Bab 8; Modul Polbeng' },
      { minggu_ke: 'XIV', tujuan_khusus: 'Mahasiswa mampu menyambung konstruksi pelat menggunakan sambungan paku keling (blind rivet & solid rivet) dan sambungan lipat (seam joint).', pokok_bahasan: 'Penyambungan Pelat (Joining): Sambungan lipat tunggal/ganda (grooved seam), pemasangan paku keling (pop riveter / hand riveter), pemilihan diameter paku keling, dan perapian sambungan.', metoda_media: 'Praktik perakitan konstruksi pelat kotak instrumen / wadah cairan.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Daryanto Bab 9' },
      { minggu_ke: 'XV', tujuan_khusus: 'Mahasiswa mampu melakukan perakitan akhir (fitting assembly), penyesuaian suaian komponen pasangan, dan finishing permukaan benda kerja.', pokok_bahasan: 'Assembly Fitting, QC Inspeksi & Finishing: Perakitan komponen pasangan geser (slide fitting), pembersihan kerak, penghalangan karat, dan inspeksi toleransi dimensi akhir seluruh modul.', metoda_media: 'Finishing produk, perakitan akhir, asistensi laporan praktik.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Daryanto Bab 1–9' },
      { minggu_ke: 'XVI', tujuan_khusus: '', pokok_bahasan: 'UJIAN AKHIR SEMESTER (UAS)', metoda_media: '', evaluasi_waktu: "2 × 50'", buku_sumber: '' },
    ],
  },
  elektromekanik: {
    match: ['elektromekanik', 'listrik', 'motor listrik', 'instalasi listrik', 'panel', 'rangkaian'],
    deskripsi: 'Mata kuliah Praktek Elektromekanik merupakan mata kuliah keahlian yang membekali mahasiswa dengan kompetensi praktis instalasi, pengawatan (wiring), kontrol kendali, dan pemeliharaan sistem elektromekanik industri. Pembelajaran mencakup K3 kelistrikan, instrumen pengukuran listrik, karakteristik komponen kontrol elektromagnetik (kontaktor, push button, relay, timer delay, MCB, thermal overload relay), perakitan rangkaian kendali motor 3 fasa (Direct On Line, Forward-Reverse, Star-Delta manual dan otomatis), pengawatan panel daya industri, integrasi sensor dan aktuator, dasar sistem elektro-pneumatik, serta teknik pelacakan gangguan (troubleshooting) sistem kendali motor.',
    tujuan_umum: 'Setelah menyelesaikan mata kuliah ini, mahasiswa mampu merancang, merakit, menguji, dan memelihara sistem kendali elektromekanik dan instalasi motor listrik industri secara aman, andal, dan sesuai standar PUIL (Persyaratan Umum Instalasi Listrik).',
    tujuan_khusus: [
      'Mampu menerapkan standar K3 kelistrikan industri dan menggunakan alat ukur listrik (multimeter, megger, clamp meter) secara benar.',
      'Mampu memahami prinsip kerja dan memilih komponen kendali elektromagnetik (kontaktor, relay, timer, MCB, TOR).',
      'Mampu merakit dan menguji rangkaian daya dan kontrol motor 3 fasa: sistem DOL, Forward-Reverse, dan Star-Delta.',
      'Mampu melakukan pengawatan panel listrik industri rapi sesuai diagram pengawatan (wiring diagram) dan standar PUIL.',
      'Mampu melakukan troubleshooting dan pemeliharaan preventif pada sistem elektromekanik dan elektro-pneumatik.',
    ],
    pustaka: [
      { jenis: 'utama', penulis: 'Suryatmo, F.', tahun: '2007', judul: 'Teknik Motor Listrik', penerbit: 'Rineka Cipta, Jakarta' },
      { jenis: 'utama', penulis: 'Petruzella, Frank D.', tahun: '2010', judul: 'Electric Motors and Control Systems', penerbit: 'McGraw-Hill Education, New York' },
      { jenis: 'pendukung', penulis: 'Badan Standarisasi Nasional', tahun: '2011', judul: 'Persyaratan Umum Instalasi Listrik (PUIL 2011)', penerbit: 'BSN, Jakarta' },
    ],
    rkpbm: [
      { minggu_ke: 'I', tujuan_khusus: 'Mahasiswa mampu memahami K3 kelistrikan industri, bahaya sengatan listrik, sistem pembumian (grounding), APD listrik, dan regulasi PUIL.', pokok_bahasan: 'K3 Kelistrikan Industri & Pengenalan Bengkel Elektromekanik: Bahaya arus listrik pada tubuh manusia, alat pelindung diri listrik, prosedur Lockout-Tagout (LOTO), dan pengenalan regulasi PUIL.', metoda_media: 'Ceramah keselamatan, demonstrasi LOTO, pengenalan trainer kelistrikan.', evaluasi_waktu: "4 × 50'", buku_sumber: 'PUIL 2011; Petruzella Bab 1' },
      { minggu_ke: 'II', tujuan_khusus: 'Mahasiswa mampu mengoperasikan alat ukur listrik analog dan digital (multimeter, clamp meter, insulation tester/megger, phase sequence indicator).', pokok_bahasan: 'Instrumen Pengukuran Elektromekanik: Pengukuran tegangan AC/DC 1 fasa dan 3 fasa (line-to-neutral, line-to-line), arus beban motor, resistansi isolasi belitan motor, dan urutan fasa R-S-T.', metoda_media: 'Praktik pengukuran parameter listrik pada panel daya.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Petruzella Bab 2; Suryatmo Bab 2' },
      { minggu_ke: 'III', tujuan_khusus: 'Mahasiswa mampu memahami fungsi, struktur internal, dan prinsip kerja kontaktor magnetik, push button (NO/NC), dan pilot lamp.', pokok_bahasan: 'Komponen Kendali Elektromagnetik: Kontaktor magnet (koil AC 220V/380V, kontak utama L1-L2-L3/T1-T2-T3, kontak bantu NO/NC 13-14, 21-22), push button start-stop, dan lampu indikator.', metoda_media: 'Praktik pembongkaran dan identifikasi terminal kontak kontaktor.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Petruzella Bab 3; Suryatmo Bab 3' },
      { minggu_ke: 'IV', tujuan_khusus: 'Mahasiswa mampu merancang dan merakit rangkaian kontrol swadaya (self-holding / latching circuit) sebagai dasar kendali motor listrik.', pokok_bahasan: 'Rangkaian Kontrol Dasar & Pengunci (Latching Circuit): Diagram skematik kontrol 1 fasa, fungsi kontak bantu NO pengunci (latch), tombol emergency stop, dan simulasi pengawatan.', metoda_media: 'Praktik perakitan rangkaian pengunci kontaktor pada papan peraga.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Petruzella Bab 4' },
      { minggu_ke: 'V', tujuan_khusus: 'Mahasiswa mampu memahami pengaman motor listrik menggunakan MCB (Miniature Circuit Breaker) dan Thermal Overload Relay (TOR).', pokok_bahasan: 'Sistem Proteksi Motor Listrik: Karakteristik trip kurva MCB, prinsip kerja bimetal Thermal Overload Relay (TOR), setting arus trip nominal (In), tombol reset manual/auto, dan kontak bantu 95-96 / 97-98.', metoda_media: 'Praktik penyetelan TOR dan pengujian simulasi trip beban lebih.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Petruzella Bab 4; PUIL 2011' },
      { minggu_ke: 'VI', tujuan_khusus: 'Mahasiswa mampu merakit rangkaian daya dan rangkaian kontrol motor 3 fasa Direct On Line (DOL).', pokok_bahasan: 'Rangkaian Motor Direct On Line (DOL): Diagram daya 3 fasa 380V, diagram kontrol 220V, pengawatan kabel tenaga dan kabel kontrol, serta pengujian putaran motor asinkron 3 fasa.', metoda_media: 'Praktik mandiri pengawatan motor 3 fasa sistem DOL starter.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Suryatmo Bab 4; Petruzella Bab 5' },
      { minggu_ke: 'VII', tujuan_khusus: 'Mahasiswa mampu merakit rangkaian kontrol dua tempat kendali (two stations control) dan interlock keselamatan.', pokok_bahasan: 'Pengendalian Motor Multistation & Interlocking: Sistem kontrol ON-OFF dari 2 lokasi berbeda, sistem interlock elektrikal (electrical interlock) dan mekanikal.', metoda_media: 'Praktik pengawatan kontrol motor dari 2 tempat (lokal dan remote).', evaluasi_waktu: "4 × 50'", buku_sumber: 'Petruzella Bab 5' },
      { minggu_ke: 'VIII', tujuan_khusus: '', pokok_bahasan: 'UJIAN TENGAH SEMESTER (UTS)', metoda_media: '', evaluasi_waktu: "2 × 50'", buku_sumber: '' },
      { minggu_ke: 'IX', tujuan_khusus: 'Mahasiswa mampu merakit rangkaian kendali putar kanan-putar kiri (Forward-Reverse) motor induksi 3 fasa dengan interlock aman.', pokok_bahasan: 'Rangkaian Kontrol Forward-Reverse Motor 3 Fasa: Prinsip penukaran 2 fasa kabel daya (R-S-T menjadi T-S-R), interlocking ganda kontaktor FWD dan REV untuk mencegah hubungan singkat fasa-ke-fasa.', metoda_media: 'Praktik perakitan rangkaian daya dan kontrol Forward-Reverse.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Suryatmo Bab 5; Petruzella Bab 6' },
      { minggu_ke: 'X', tujuan_khusus: 'Mahasiswa mampu mengoperasikan Time Delay Relay (TDR / Timer) untuk aplikasi kontrol sekuensial otomatis.', pokok_bahasan: 'Relay Penunda Waktu (Timer On/Off Delay): Karakteristik On-Delay Timer dan Off-Delay Timer, konfigurasi koil timer (pin 2-7) dan kontak pindah (pin 1-3, 1-4, 8-5, 8-6), serta aplikasi pengurutan motor (sequential starting).', metoda_media: 'Praktik perakitan kontrol 2 motor listrik berurutan otomatis berbasis timer.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Petruzella Bab 7' },
      { minggu_ke: 'XI', tujuan_khusus: 'Mahasiswa mampu merakit rangkaian pengasutan Bintang-Segitiga (Star-Delta Starter) manual dan otomatis untuk mereduksi arus start motor.', pokok_bahasan: 'Rangkaian Pengasutan Star-Delta (Y-Δ): Analisis lonjakan arus start (inrush current), hubungan kumparan U1-U2, V1-V2, W1-W2 motor 3 fasa, konfigurasi 3 kontaktor (Utama, Bintang, Segitiga) dengan perpindahan otomatis timer.', metoda_media: 'Praktik perakitan sistem Starter Star-Delta otomatis motor 3 fasa.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Suryatmo Bab 6; Petruzella Bab 8' },
      { minggu_ke: 'XII', tujuan_khusus: 'Mahasiswa mampu melakukan instalasi pengawatan panel kontrol industri rapi menggunakan ducting kabel, terminal block, dan ferrules.', pokok_bahasan: 'Tata Letak & Pengawatan Panel Kontrol (Panel Wiring): Penataan komponen pada DIN rail, pemotongan kabel dan crimping ferrule/skun kabel, penomoran kabel (wire marker), pengikatan kabel, dan pengujian kesinambungan (continuity test).', metoda_media: 'Praktik pembuatan box panel starter motor industri.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Petruzella Bab 9; PUIL 2011' },
      { minggu_ke: 'XIII', tujuan_khusus: 'Mahasiswa mampu mengintegrasikan sensor industri (proximity switch, limit switch, photo sensor) dengan kontaktor/relay pengendali.', pokok_bahasan: 'Integrasi Sensor Industri & Aktuator Elektromekanik: Sensor proximity induktif/kapasitif, limit switch mekanis, solenoid valve, dan rangkaian kendali pintu otomatis / conveyor feeder.', metoda_media: 'Praktik perakitan kendali conveyor otomatis berbasis limit switch.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Petruzella Bab 10' },
      { minggu_ke: 'XIV', tujuan_khusus: 'Mahasiswa mampu mengintegrasikan rangkaian kendali elektro-pneumatik (kontrol silinder pneumatik dengan solenoid valve).', pokok_bahasan: 'Sistem Kendali Elektro-Pneumatik: Katup solenoid pneumatik 5/2 arah single/double solenoid, silinder kerja ganda, reed switch magnetic sensor, dan rangkaian bolak-balik otomatis (reciprocating cylinder).', metoda_media: 'Praktik sistem elektro-pneumatik transfer benda kerja.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Petruzella Bab 11; Modul Polbeng' },
      { minggu_ke: 'XV', tujuan_khusus: 'Mahasiswa mampu melakukan pelacakan gangguan (troubleshooting) sistem kontrol motor dan pemeliharaan preventif panel.', pokok_bahasan: 'Troubleshooting & Maintenance Sistem Elektromekanik: Prosedur sistematis melacak kerusakan rangkaian putus, kontak terbakar, trip beban lebih, motor berdengung, dan uji isolasi megger berkala.', metoda_media: 'Studi kasus pelacakan gangguan buatan pada panel kontrol, persiapan UAS.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Petruzella Bab 12; Suryatmo Bab 7' },
      { minggu_ke: 'XVI', tujuan_khusus: '', pokok_bahasan: 'UJIAN AKHIR SEMESTER (UAS)', metoda_media: '', evaluasi_waktu: "2 × 50'", buku_sumber: '' },
    ],
  },
  pesawat_angkat: {
    match: ['pesawat angkat', 'angkat angkut', 'crane', 'hoist', 'tali kawat', 'rigging'],
    deskripsi: 'Mata kuliah Pesawat Angkat dan Angkut membekali mahasiswa dengan kompetensi analisis, perhitungan kekuatan, perancangan komponen kritis, dan inspeksi keselamatan peralatan pengangkat dan pengangkut material industri. Materi perkuliahan mencakup klasifikasi pesawat angkat (overhead crane, gantry, jib crane, hoist, forklift), karakteristik tali kawat baja (wire rope), drum penggulung, puli dan sheave, pengait beban (hook), sistem pengereman, transmisi reduksi dan motor penggerak, perhitungan kekuatan gelagar utama (main girder), analisis stabilitas terhadap guling, serta regulasi pengujian beban dan inspeksi keselamatan kerja standar Depnaker dan ASME B30.',
    tujuan_umum: 'Setelah menyelesaikan mata kuliah ini, mahasiswa mampu menghitung beban kerja aman, merancang komponen kritis mekanisme angkat, serta mengevaluasi kelayakan operasi pesawat angkat sesuai standar rekayasa mekanik dan keselamatan kerja.',
    tujuan_khusus: [
      'Mampu mengklasifikasikan jenis pesawat angkat dan memahami regulasi keselamatan operasi (ASME B30 & Depnaker).',
      'Mampu menghitung tegangan, kapasitas angkat, dan memilih tali kawat baja (wire rope) dengan faktor keamanan tepat.',
      'Mampu merancang komponen kait beban (hook), puli (sheave), drum penggulung, dan sistem rem pesawat angkat.',
      'Mampu menganalisis kekuatan gelagar crane (girder) terhadap momen lentur, defleksi, dan tegangan geser.',
      'Mampu merencanakan prosedur inspeksi keselamatan dan pengujian beban (load testing) pesawat angkat.',
    ],
    pustaka: [
      { jenis: 'utama', penulis: 'Rudenko, N.', tahun: '1996', judul: 'Materials Handling Equipment (Mesin Pengangkat)', penerbit: 'Erlangga, Jakarta' },
      { jenis: 'utama', penulis: 'Spivakovsky, A., & Dyachkov, V.', tahun: '1985', judul: 'Conveying Machines', penerbit: 'Peace Publishers, Moscow' },
      { jenis: 'pendukung', penulis: 'Kementerian Tenaga Kerja RI', tahun: '2020', judul: 'Permenaker No. 8 Tahun 2020 tentang Keselamatan dan Kesehatan Kerja Pesawat Angkat dan Pesawat Angkut', penerbit: 'Kemenaker RI, Jakarta' },
    ],
    rkpbm: [
      { minggu_ke: 'I', tujuan_khusus: 'Mahasiswa mampu memahami kontrak perkuliahan, ruang lingkup pesawat angkat & angkut, klasifikasi alat angkat, dan dasar regulasi keselamatan kerja K3 (Permenaker No. 8/2020 & ASME B30).', pokok_bahasan: 'Pengantar Pesawat Angkat dan Angkut: Definisi, klasifikasi mesin pengangkat (crane, elevator, hoist) dan pengangkut (konveyor, forklift), serta prinsip beban kerja aman (Safe Working Load / SWL).', metoda_media: 'Ceramah pengantar, studi kasus video crane industri, diskusi regulasi.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Rudenko Bab 1; Permenaker 2020' },
      { minggu_ke: 'II', tujuan_khusus: 'Mahasiswa mampu memahami konstruksi tali kawat baja (wire rope), jenis anyaman, tegangan nominal, dan kriteria pemilihan tali angkat.', pokok_bahasan: 'Tali Kawat Baja (Steel Wire Rope): Konstruksi inti (fiber core / IWRC), susunan kawat (strand), jenis pilinan (regular lay, lang lay), tegangan putus nominal, dan analisis tegangan tarik.', metoda_media: 'Ceramah, pemeriksaan sampel wire rope, tutorial perhitungan tegangan.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Rudenko Bab 2' },
      { minggu_ke: 'III', tujuan_khusus: 'Mahasiswa mampu menghitung beban kerja aman tali, faktor keamanan (safety factor), tegangan lentur pada puli, dan umur pakai wire rope.', pokok_bahasan: 'Perhitungan & Pemilihan Tali Kawat Baja: Penentuan faktor keamanan sesuai standar, perhitungan tegangan lentur pada puli (bending stress), kriteria keausan & kawat putus batas afkir tali.', metoda_media: 'Latihan soal mandiri perancangan tali angkat crane 10 ton.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Rudenko Bab 2; ASME B30' },
      { minggu_ke: 'IV', tujuan_khusus: 'Mahasiswa mampu merancang dan menghitung dimensi puli (sheave) serta susunan sistem puli ganda (tackle system).', pokok_bahasan: 'Puli & Sistem Puli (Sheaves & Tackle System): Hubungan diameter puli terhadap diameter tali (D/d ratio), geometri alur puli, efisiensi puli bantalan luncur/gelinding, keuntungan mekanis susunan puli majemuk.', metoda_media: 'Ceramah, analisis diagram gaya sistem puli, tutorial perhitungan efisiensi.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Rudenko Bab 3' },
      { minggu_ke: 'V', tujuan_khusus: 'Mahasiswa mampu merancang drum penggulung tali (winch drum) beralur dan polos.', pokok_bahasan: 'Perancangan Drum Penggulung Tali: Penentuan diameter dan panjang drum, tebal dinding drum akibat tegangan tekan dan puntir, profil alur drum, dan sistem pengikatan ujung tali.', metoda_media: 'Tutorial problem solving perancangan drum hoist.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Rudenko Bab 4' },
      { minggu_ke: 'VI', tujuan_khusus: 'Mahasiswa mampu menganalisis kekuatan dan merancang kait beban (crane hook) terhadap tegangan lengkung kritis.', pokok_bahasan: 'Kait Pengangkat Beban (Hooks): Jenis kait standar (kait tunggal dan ganda), analisis tegangan penampang kritis trapezoidal kait menggunakan teori balok lengkung (curved beam theory), pemilihan material kait.', metoda_media: 'Perhitungan analitis tegangan kait beban dan faktor keselamatan.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Rudenko Bab 5' },
      { minggu_ke: 'VII', tujuan_khusus: 'Mahasiswa mampu mengintegrasikan perhitungan mekanisme pengangkat awal (tali, puli, drum, kait) dalam studi kasus terpadu.', pokok_bahasan: 'Review Komprehensif Mekanisme Pengangkat: Evaluasi interaksi tali-puli-drum-kait, verifikasi beban kerja aman, dan pembahasan soal latihan persiapan UTS.', metoda_media: 'Diskusi terarah, bedah kasus kegagalan tali crane, kuis UTS.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Rudenko Bab 1–5' },
      { minggu_ke: 'VIII', tujuan_khusus: '', pokok_bahasan: 'UJIAN TENGAH SEMESTER (UTS)', metoda_media: '', evaluasi_waktu: "2 × 50'", buku_sumber: '' },
      { minggu_ke: 'IX', tujuan_khusus: 'Mahasiswa mampu merancang dan memilih sistem rem mekanik pesawat angkat (shoe brake, band brake, disc brake).', pokok_bahasan: 'Sistem Rem Pesawat Angkat (Braking Systems): Prinsip pengereman gesek, perhitungan torsi pengereman yang dibutuhkan, gaya tekan sepatu rem, sistem aktuator elektromagnetik (solenoid / electro-hydraulic thruster).', metoda_media: 'Ceramah, analisis perhitungan gaya dan panas rem pesawat angkat.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Rudenko Bab 6' },
      { minggu_ke: 'X', tujuan_khusus: 'Mahasiswa mampu menghitung daya motor penggerak mekanisme angkat (hoisting) dan mekanisme jalan (travelling).', pokok_bahasan: 'Daya Motor & Transmisi Reduksi: Perhitungan daya statis pengangkatan beban, daya akselerasi, pemilihan rasio reduksi gearbox, dan efisiensi transmisi total mekanisme angkat.', metoda_media: 'Tutorial perancangan pemilihan motor motor-gearbox crane.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Rudenko Bab 7' },
      { minggu_ke: 'XI', tujuan_khusus: 'Mahasiswa mampu menganalisis kekuatan struktur gelagar utama (main girder) overhead crane terhadap beban statis dan dinamis.', pokok_bahasan: 'Perancangan Gelagar Crane (Main Girder): Struktur box girder / I-beam, kombinasi beban mati, beban roda troli bergerak, faktor tumbukan dinamis, analisis momen lentur maksimum dan defleksi batas (L/800).', metoda_media: 'Analisis tegangan balok gelagar dan verifikasi kekakuan defleksi.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Rudenko Bab 8; Spivakovsky Bab 3' },
      { minggu_ke: 'XII', tujuan_khusus: 'Mahasiswa mampu menganalisis stabilitas alat angkat bergerak (mobile crane / jib crane / forklift) terhadap bahaya guling.', pokok_bahasan: 'Analisis Stabilitasi Pesawat Angkat: Titik berat total, garis tumpu roda/outrigger, momen penahan vs momen guling dengan variasi radius boom dan sudut kemiringan kerja.', metoda_media: 'Studi kasus stabilitas crane pelabuhan dan forklift industri.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Rudenko Bab 9; Permenaker 2020' },
      { minggu_ke: 'XIII', tujuan_khusus: 'Mahasiswa mampu memahami prinsip kerja dan komponen utama pesawat angkut material (belt conveyor, bucket elevator, screw conveyor).', pokok_bahasan: 'Pesawat Angkut Material (Conveying Machinery): Karakteristik sabuk konveyor, kapasitas angkut per jam, daya tarikan motor konveyor, konveyor ulir, dan lift barang (elevator).', metoda_media: 'Ceramah, analisis perhitungan kapasitas sabuk konveyor.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Spivakovsky Bab 1–4' },
      { minggu_ke: 'XIV', tujuan_khusus: 'Mahasiswa mampu menyusun laporan perancangan sistem pesawat angkat lengkap dengan lembar perhitungan teknis.', pokok_bahasan: 'Penyelesaian Proyek Perancangan Overhead Crane: Integrasi perhitungan tali, drum, puli, rem, motor, dan gelagar dalam satu dokumen spesifikasi teknis manufaktur.', metoda_media: 'Asistensi proyek mandiri rancang bangun crane.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Rudenko Bab 1–9' },
      { minggu_ke: 'XV', tujuan_khusus: 'Mahasiswa mampu memahami prosedur inspeksi keselamatan berkala, pengujian tanpa beban, dan pengujian beban lebih (proof load test) pesawat angkat.', pokok_bahasan: 'Inspeksi & Pengujian Beban Pesawat Angkat: Prosedur uji fungsi tanpa beban, uji beban dinamis (110% SWL), uji beban statis (125% SWL), sertifikasi kelayakan izin operasi Depnaker, dan persiapan UAS.', metoda_media: 'Diskusi komprehensif, evaluasi kelayakan operasi, pembahasan soal UAS.', evaluasi_waktu: "4 × 50'", buku_sumber: 'Permenaker No. 8/2020; ASME B30' },
      { minggu_ke: 'XVI', tujuan_khusus: '', pokok_bahasan: 'UJIAN AKHIR SEMESTER (UAS)', metoda_media: '', evaluasi_waktu: "2 × 50'", buku_sumber: '' },
    ],
  },
}

/**
 * Mencari kurikulum master yang paling cocok berdasarkan nama mata kuliah
 */
export function getMasterCurriculum(mataKuliahNama) {
  const norm = (mataKuliahNama || '').toLowerCase().trim()
  
  for (const [key, cur] of Object.entries(MASTER_CURRICULA)) {
    if (cur.match.some((kw) => norm.includes(kw))) {
      return { key, ...cur }
    }
  }
  return null
}

/**
 * Smart Generator untuk membuat RPS lengkap yang teruji secara keilmuan teknik
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
  const mkClean = mataKuliah.trim()
  const matched = getMasterCurriculum(mkClean)

  // Jika cocok dengan kurikulum master spesifik (Gambar Teknik, Kerja Bangku, Elektromekanik, dll.)
  if (matched) {
    const isPraktik = mkClean.toLowerCase().includes('praktek') || mkClean.toLowerCase().includes('praktikum') || nSks >= 3
    const perkuliahanJam = isPraktik ? 24 : 36
    const perkuliahanMinggu = isPraktik ? 6 : 9
    const latihanJam = isPraktik ? 8 : 8
    const praktikumJam = isPraktik ? 24 : 12
    const praktikumMinggu = isPraktik ? 6 : 3

    return {
      mata_kuliah: mkClean,
      kode_mk: kodeMk || 'KBPP 2152',
      sks: nSks,
      deskripsi_singkat: matched.deskripsi,
      tujuan_umum: matched.tujuan_umum,
      tujuan_khusus: matched.tujuan_khusus,
      prasyarat: mkClean.toLowerCase().includes('gambar') ? 'Tidak ada' : 'Fisika Terapan / Matematika Teknik',
      perkiraan_peserta: '25 - 30 Orang Mahasiswa',
      jam: {
        perkuliahan_jam: perkuliahanJam,
        perkuliahan_minggu: perkuliahanMinggu,
        latihan_jam: latihanJam,
        latihan_minggu: 2,
        praktikum_jam: praktikumJam,
        praktikum_minggu: praktikumMinggu,
        ujian_jam: 4,
      },
      penilaian: {
        uts: isPraktik ? 25 : 30,
        uas: isPraktik ? 35 : 40,
        nkp: isPraktik ? 20 : 20,
        nkpr: isPraktik ? 20 : 10,
        hasil_belajar_harian: {
          sikap: 'Penilaian keaktifan, kedisiplinan APD, dan etika kerja',
          latihan_kuis: 'Penilaian tugas gambar/benda kerja mingguan dan kuis',
          tugas: 'Penyelesaian proyek tugas gambar kerja / job sheet bengkel',
        },
        etika: {
          kerapian: 2.5,
          kerja_sama: 2.5,
          kedisiplinan: 2.5,
          ketelitian: 2.5,
        },
      },
      pustaka: matched.pustaka,
      rkpbm: matched.rkpbm,
    }
  }

  // Fallback standar dinamis yang konsisten
  const isPraktik = nSks >= 3 || mkClean.toLowerCase().includes('praktek') || mkClean.toLowerCase().includes('bengkel')
  const perkuliahanJam = isPraktik ? 24 : 36
  const perkuliahanMinggu = isPraktik ? 6 : 9
  const praktikumJam = isPraktik ? 24 : 12

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
      latihan_jam: 8,
      latihan_minggu: 2,
      praktikum_jam: praktikumJam,
      praktikum_minggu: isPraktik ? 6 : 3,
      ujian_jam: 4,
    },
    penilaian: {
      uts: isPraktik ? 25 : 30,
      uas: isPraktik ? 35 : 40,
      nkp: 20,
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
    pustaka: [
      { jenis: 'utama', penulis: 'Shigley, Joseph E., & Mischke, Charles R.', tahun: '2014', judul: 'Mechanical Engineering Design', penerbit: 'McGraw-Hill, New York' },
      { jenis: 'utama', penulis: 'Dosen Teknik Mesin Polbeng', tahun: '2022', judul: `Buku Ajar ${mkClean}`, penerbit: 'Politeknik Negeri Bengkalis' },
    ],
    rkpbm: Array.from({ length: 16 }, (_, i) => {
      const ke = i + 1
      if (ke === 8) {
        return { minggu_ke: 'VIII', tujuan_khusus: '', pokok_bahasan: 'UJIAN TENGAH SEMESTER (UTS)', metoda_media: '', evaluasi_waktu: "2 × 50'", buku_sumber: '' }
      }
      if (ke === 16) {
        return { minggu_ke: 'XVI', tujuan_khusus: '', pokok_bahasan: 'UJIAN AKHIR SEMESTER (UAS)', metoda_media: '', evaluasi_waktu: "2 × 50'", buku_sumber: '' }
      }
      return {
        minggu_ke: ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI'][i],
        tujuan_khusus: `Mahasiswa mampu memahami dan mengaplikasikan materi topik minggu ke-${ke} pada ${mkClean}.`,
        pokok_bahasan: `Pembahasan materi terstruktur minggu ke-${ke} bidang ${mkClean}: konsep dasar, formulasi perhitungan, dan aplikasi industri.`,
        metoda_media: 'Menyimak, diskusi, tanya jawab, latihan soal. Media: LCD Projector dan papan tulis.',
        evaluasi_waktu: "4 × 50'",
        buku_sumber: `Buku Utama Bab ${ke > 8 ? ke - 1 : ke}.`,
      }
    }),
  }
}

/**
 * Generate RPS lengkap menggunakan Google Gemini AI dengan aturan disiplin ilmu ketat
 */
export async function generateRpsWithAi({
  mataKuliah,
  kodeMk = '',
  sks = 2,
  prodiNama = 'D-III Teknik Mesin',
  semester = 'Ganjil',
  topikKhusus = '',
  silabusLama = '',
  apiKey = '',
}) {
  const prompt = `
Susun dokumen RPS resmi Politeknik Negeri Bengkalis secara LENGKAP & PRESISI untuk:
- Mata Kuliah: ${mataKuliah}
- Kode Mata Kuliah: ${kodeMk || 'KBPP 2152'}
- Bobot SKS: ${sks} SKS
- Program Studi: ${prodiNama}
- Semester: ${semester}
${topikKhusus ? `- Fokus Materi Dosen: ${topikKhusus}` : ''}
${silabusLama ? `- Silabus / Catatan Acuan: \n${silabusLama}` : ''}

PERINGATAN KERAS:
Materi 16 minggu RKPBM WAJIB 100% NYAMBUNG dan SPESIFIK dengan bidang "${mataKuliah}". JANGAN PERNAH mencampurkan materi bidang lain (misal: jangan masukkan kikir ke gambar teknik, jangan masukkan las ke termodinamika)!

Format JSON yang dihasilkan:
{
  "deskripsi_singkat": "string akademik formal 1-2 paragraf",
  "tujuan_umum": "string CPL/CPMK 1 paragraf",
  "tujuan_khusus": ["string", "string", "string", "string"],
  "prasyarat": "string",
  "perkiraan_peserta": "25 - 30 Orang Mahasiswa",
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
      "sikap": "Penilaian keaktifan dan etika",
      "latihan_kuis": "Latihan soal dan kuis",
      "tugas": "Tugas mandiri dan laporan"
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
      "penulis": "Penulis Buku Teks",
      "tahun": "2020",
      "judul": "Judul Buku Teks Terkait",
      "penerbit": "Penerbit"
    }
  ],
  "rkpbm": [
    {
      "minggu_ke": "I",
      "tujuan_khusus": "...",
      "pokok_bahasan": "...",
      "metoda_media": "Menyimak, diskusi, tanya jawab. Media: proyektor.",
      "evaluasi_waktu": "4 × 50'",
      "buku_sumber": "Buku Utama Bab 1"
    }
    ... (hingga minggu XVI dengan minggu VIII = UTS dan minggu XVI = UAS)
  ]
}
`

  try {
    return await callGemini(prompt, apiKey)
  } catch (err) {
    console.warn('Gemini API call gagal, menggunakan Smart Curricula Generator:', err.message)
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

export const generateFullRpsWithAi = generateRpsWithAi
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

PASTIKAN seluruh materi 16 minggu 100% NYAMBUNG dengan bidang "${mataKuliah}".

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
    ... (tepat 16 entri, minggu VIII = UTS, minggu XVI = UAS)
  ]
}
`

  try {
    const res = await callGemini(prompt, apiKey)
    return res.rkpbm || []
  } catch (err) {
    console.warn('Gemini API call gagal, fallback ke smart curricula RKPBM:', err.message)
    const full = generateSmartTemplateRps({ mataKuliah, sks, topikKhusus })
    return full.rkpbm
  }
}

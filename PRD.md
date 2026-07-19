# PRD — MERPS (Mesin Penyusun RPS OBE Teknik Mesin Polbeng)

> Dokumen ini adalah spesifikasi lengkap untuk dibangun dengan Claude Code di VS Code.
> Perintah awal ke Claude Code: *"Baca PRD.md dan CLAUDE.md, lalu bangun aplikasi mengikuti urutan milestone. Jangan lompat ke fitur NANTI."*

---

## 1. Ringkasan Proyek

| | |
|---|---|
| **Nama aplikasi** | MERPS |
| **Kepanjangan / arti nama** | Mesin Penyusun RPS OBE (bermakna ganda: mesin penyusun otomatis, sekaligus identitas Teknik Mesin) |
| **Pemilik / klien** | Dosen Jurusan Teknik Mesin, Politeknik Negeri Bengkalis (aplikasi single-user, dipakai pribadi oleh penyusun RPS) |
| **Deskripsi 1 kalimat** | Aplikasi web pribadi untuk menyusun Rencana Pembelajaran Semester berbasis OBE secara terstruktur lalu mengekspornya menjadi dokumen Word (.docx) sesuai format resmi Jurusan Teknik Mesin. |
| **Masalah yang diselesaikan** | Penyusunan RPS OBE saat ini manual di Word. Pemetaan CPL ke CPMK ke Sub-CPMK mudah tidak konsisten, tabel rencana mingguan 16 pertemuan melelahkan diketik ulang, dan total bobot penilaian sering tidak pas 100%. MERPS memandu pengisian terstruktur, memvalidasi otomatis (bobot, pemetaan), lalu menghasilkan dokumen Word yang rapi dan seragam dengan sekali klik. |
| **Bahasa UI** | Indonesia |

## 2. Pengguna & Hak Akses (Role)

Aplikasi ini **single-user tanpa login**. Tidak ada pemisahan role.

| Role | Siapa mereka | Boleh melakukan apa | TIDAK boleh apa |
|---|---|---|---|
| Penyusun (pengguna tunggal) | Dosen Teknik Mesin penyusun RPS | Kelola seluruh data master (CPL, dosen, prodi, pustaka), buat/edit/hapus/duplikat RPS, isi seluruh komponen RPS, ekspor ke Word | Tidak ada batasan; hanya ada satu peran |

**Cara login:** Tanpa login. Aplikasi langsung terbuka pada dashboard.
**Registrasi:** Tidak ada.
**Lupa password:** Tidak berlaku.

> Catatan: karena tanpa login, aplikasi ditujukan untuk pemakaian pribadi. Opsi gerbang kata sandi sederhana ada di bagian 3.3 sebagai jaring pengaman jika suatu saat aplikasi dipublikasikan.

## 3. Fitur

### 3.1 WAJIB ada di versi 1 (tanpa ini aplikasi tidak berguna)

- [ ] **Dashboard daftar RPS:** lihat semua RPS, cari/filter per program studi, semester, dan tahun akademik. Tombol: Buat Baru, Edit, Duplikat, Hapus, Ekspor. Tampilkan status tiap RPS (Draf / Siap Ekspor).
- [ ] **Kelola data master:**
  - [ ] CPL Program Studi: kode CPL, ranah (Sikap / Pengetahuan / Keterampilan Umum / Keterampilan Khusus), rumusan.
  - [ ] Dosen: nama, jenis nomor induk (NP/NIP/NIPPPK) + nomornya, peran (pengembang / koordinator prodi / pengampu).
  - [ ] Identitas Prodi: nama program studi, jurusan (default Teknik Mesin), institusi (default Politeknik Negeri Bengkalis).
  - [ ] Pustaka/Referensi: penulis, tahun, judul, penerbit, jenis (utama/pendukung).
- [ ] **Form penyusun RPS (wizard bertahap)** yang mengisi seluruh komponen template resmi (lihat bagian 5 untuk daftar field lengkap):
  - [ ] Langkah 1: Identitas & pengesahan (mata kuliah, kode, SKS teori-praktik, semester, tahun akademik, prasyarat, deskripsi, revisi ke-, dosen pengampu, koordinator prodi).
  - [ ] Langkah 2: CPL yang dibebankan pada MK (pilih dari master).
  - [ ] Langkah 3: CPMK, dipetakan ke CPL terpilih.
  - [ ] Langkah 4: Sub-CPMK, dipetakan ke CPMK induk; tampilkan tabel Korelasi CPMK terhadap Sub-CPMK.
  - [ ] Langkah 5: Tabel rencana pembelajaran mingguan (16 pertemuan; pertemuan ke-8 UTS, ke-16 UAS) dengan seluruh kolom template (lihat 5).
  - [ ] Langkah 6: Rencana Evaluasi (komponen penilaian + bobot, total wajib 100%).
  - [ ] Langkah 7: Ringkasan & validasi sebelum ekspor.
- [ ] **Visualisasi pemetaan OBE:** matriks keterkaitan CPL ke CPMK ke Sub-CPMK ditampilkan agar konsistensi mudah dicek.
- [ ] **Validasi otomatis** (lihat aturan lengkap di bagian 5):
  - [ ] Total bobot penilaian tabel mingguan = 100%.
  - [ ] Total bobot Rencana Evaluasi = 100%.
  - [ ] Setiap CPMK terhubung minimal satu CPL; setiap Sub-CPMK terhubung tepat satu CPMK.
  - [ ] Field wajib tidak kosong; angka tidak negatif.
  - [ ] Peringatan ditampilkan; ekspor diblokir jika ada validasi merah.
- [ ] **Simpan otomatis / draf** dan lanjutkan mengedit RPS yang belum selesai.
- [ ] **Ekspor ke Word (.docx)** dengan mengisi template resmi (bagian 7). Hasil siap dicetak dan ditandatangani.

### 3.2 PENTING tapi boleh menyusul (versi 1.1)

- [ ] Duplikat RPS sebagai basis mata kuliah/semester berikutnya.
- [ ] Tabel Portofolio Penilaian & Evaluasi Ketercapaian CPL/LO (bagian perencanaan: kolom CPL, CPMK, Sub-CPMK, indikator, bentuk soal, bobot; kolom nilai mahasiswa dibiarkan kosong pada dokumen).
- [ ] Impor CPL dari file Excel/CSV.
- [ ] Pratinjau dokumen di layar sebelum ekspor.
- [ ] Ekspor PDF selain Word.

### 3.3 NANTI saja / ide (jangan dikerjakan dulu)

- [ ] Gerbang kata sandi sederhana di depan aplikasi.
- [ ] Bantuan penulisan narasi dengan AI (usulan rumusan Sub-CPMK/indikator yang tetap wajib ditinjau manusia).
- [ ] Multi-user & hak akses (jika kelak dipakai satu jurusan bersama).
- [ ] Bank Sub-CPMK & indikator yang bisa dipakai ulang antar mata kuliah.

## 4. Halaman & Alur

### 4.1 Daftar halaman

| Halaman | Untuk role | Isi utama |
|---|---|---|
| Dashboard / Daftar RPS | Penyusun | Tabel daftar RPS + pencarian & filter (prodi, semester, tahun akademik). Tombol Buat/Edit/Duplikat/Hapus/Ekspor + status Draf/Siap Ekspor. |
| Master CPL | Penyusun | CRUD CPL Program Studi. |
| Master Dosen | Penyusun | CRUD dosen + peran. |
| Master Prodi & Pustaka | Penyusun | Identitas prodi/jurusan/institusi + daftar pustaka. |
| Penyusun RPS (wizard) | Penyusun | Form 7 langkah (lihat 3.1). Navigasi antar langkah, indikator langkah selesai/belum, simpan draf. |
| Ringkasan & Ekspor | Penyusun | Matriks OBE, hasil validasi, tombol Ekspor ke Word. |

### 4.2 Alur penting

**Alur menyusun RPS baru sampai ekspor:**
1. Penyusun menekan **Buat RPS Baru**.
2. **Identitas & pengesahan:** isi mata kuliah, kode, SKS (format `n (t-p)`, contoh `3 (2-1)`), semester, tahun akademik, prasyarat, deskripsi, revisi ke-, pilih dosen pengampu (boleh lebih dari satu) dan koordinator prodi dari master.
3. **CPL dibebankan:** centang CPL dari master.
4. **CPMK:** tulis rumusan tiap CPMK (gunakan kata kerja operasional level HOTS 3 sampai 6, hindari "memahami/mengerti"), petakan ke CPL. Sistem menolak CPMK tanpa CPL.
5. **Sub-CPMK:** uraikan tiap CPMK menjadi Sub-CPMK, tiap Sub-CPMK dipetakan ke satu CPMK. Sistem menyusun tabel Korelasi CPMK ke Sub-CPMK otomatis.
6. **Tabel mingguan:** isi 16 baris. Tiap baris: pilih Sub-CPMK, bahan kajian, centang pelaksanaan (Daring/Luring), metode, media, alokasi waktu (menit), indikator penilaian, instrumen/bentuk penilaian, bobot (%), pengalaman belajar, referensi. Baris ke-8 dan ke-16 otomatis ditandai UTS/UAS. Sistem menjumlahkan bobot langsung.
7. **Rencana Evaluasi:** isi bobot komponen (Aktivitas Partisipatif, Hasil Proyek, Kognitif: Tugas, Kuis, UTS, UAS) beserta deskripsi. Sistem memastikan total 100%.
8. **Ringkasan & validasi:** tampilkan matriks OBE + status validasi. Status RPS **Belum lengkap** hingga semua validasi hijau, lalu menjadi **Siap ekspor**.
9. Penyusun menekan **Ekspor ke Word**. Sistem mengisi template dan mengunduh berkas `.docx`.

## 5. Data (apa saja yang disimpan)

> Semua akses data lewat `src/utils/storage.js`. Bentuk data mengikuti kolom template resmi.

**RPS (dokumen utama)**
- mata_kuliah, kode_mk, rumpun_mk, sks_teori, sks_praktik, semester (Gasal/Genap), tahun_akademik, prasyarat, deskripsi_mk, revisi_ke, program_studi_id, status (draf/siap_ekspor), model_pembelajaran (default "Hybrid").

**Pengesahan (bagian dari RPS)**
- daftar dosen_pengampu (relasi ke master Dosen, boleh lebih dari satu), koordinator_prodi (relasi ke master Dosen).

**CPL (master)**
- kode_cpl (contoh CPL-1), ranah (Sikap / Pengetahuan / Keterampilan Umum / Keterampilan Khusus), rumusan.

**CPMK (milik satu RPS)**
- kode_cpmk (contoh CPMK-1 / CLO-1), rumusan, daftar cpl_ids yang dipetakan.

**Sub-CPMK (milik satu CPMK)**
- kode_subcpmk (contoh Sub-CPMK1 / LLO-1), rumusan, cpmk_id induk.

**Pertemuan / baris tabel mingguan (milik satu RPS)**
- pertemuan_ke (1 sampai 16), subcpmk_id, bahan_kajian, pelaksanaan_daring (boolean), pelaksanaan_luring (boolean), metode_pembelajaran, media_pembelajaran, alokasi_waktu_menit, indikator_penilaian, instrumen_penilaian, bobot_penilaian_persen, pengalaman_belajar, referensi (relasi ke master Pustaka). Baris ke-8 = UTS, ke-16 = UAS (ditandai otomatis).

**Rencana Evaluasi (milik satu RPS)**
- basis_evaluasi, dan komponen: aktivitas_partisipatif (bobot%, deskripsi), hasil_proyek (bobot%, deskripsi), kognitif berisi tugas_mandiri_kelompok, kuis, uts, uas (masing-masing bobot% + deskripsi). Jumlah semua = 100.

**Dosen (master)**
- nama, jenis_nomor (NP/NIP/NIPPPK), nomor_induk, peran.

**Pustaka (master)**
- jenis (utama/pendukung), penulis, tahun, judul, penerbit, nomor_urut.

**Program Studi (master)**
- nama_prodi, jurusan (default "Teknik Mesin"), institusi (default "Politeknik Negeri Bengkalis").

**Aturan data penting:**
- Total bobot penilaian pada tabel mingguan wajib berjumlah tepat 100%.
- Total bobot Rencana Evaluasi wajib berjumlah tepat 100%.
- Setiap CPMK terhubung minimal satu CPL; setiap Sub-CPMK terhubung tepat satu CPMK.
- SKS, alokasi waktu, dan bobot tidak boleh negatif.
- Kode CPL, CPMK, dan Sub-CPMK tidak boleh kembar dalam satu RPS.
- Menghapus CPMK ikut mengosongkan Sub-CPMK dan keterkaitannya, dikonfirmasi dulu ke pengguna.
- Perkuliahan selalu 16 pertemuan; pertemuan ke-8 UTS dan ke-16 UAS.

## 6. Tampilan & Desain

| | |
|---|---|
| **Warna utama** | Biru navy (identitas Politeknik Negeri Bengkalis) sebagai warna utama, dipadu abu netral dan aksen kuning/emas untuk tombol aksi, mengikuti warna logo. |
| **Logo** | `logo1.jpeg` (logo Politeknik Negeri Bengkalis) untuk header aplikasi dan kop dokumen Word. |
| **Mode gelap (dark mode)** | Tidak perlu. |
| **Wajib enak dipakai di HP?** | Tidak wajib. Utamakan desktop/laptop (form panjang & tabel lebar). Usahakan tetap terbaca di HP. |
| **Referensi tampilan** | Wizard bersih seperti Google Forms/Notion; tabel mingguan mengikuti tata letak RPS resmi. |

## 7. Teknologi (Stack) & Mesin Ekspor

| | Pilihan | Catatan |
|---|---|---|
| Frontend | React + Vite | SPA sederhana untuk aplikasi internal single-user. |
| Styling | Tailwind CSS | Cepat menata form panjang & tabel. |
| Database | Supabase (Postgres) | Data tersimpan permanen di cloud, bisa diakses lintas perangkat. Tanpa login: pakai satu proyek Supabase pribadi + anon key. Tahap 1 boleh pakai localStorage dulu. |
| Hosting | Netlify | Gratis, auto-deploy dari GitHub. |
| Ekspor Word | **docxtemplater + pizzip + file-saver** | Isi template `.docx` bertag. Loop `{#pertemuan}` untuk 16 baris tabel, `{#cpl}` `{#cpmk}` `{#subcpmk}` untuk daftar. |
| Library tambahan | xlsx (impor CPL, v1.1), jsPDF/print (ekspor PDF, v1.1) | Jangan tambah library lain kecuali perlu. |

**Template ekspor (PENTING):**
- File `Template RPS OBE - Polbeng TM.docx` di folder proyek **bersifat sementara**. Ini hasil adaptasi template Universitas Bangka Belitung (logo diganti ke Polbeng, "Universitas" jadi "Politeknik Negeri Bengkalis", "Fakultas" jadi "Jurusan Teknik Mesin"). Dipakai agar pembangunan bisa jalan sekarang.
- Saat template resmi dari kampus tersedia, cukup ganti file ini dan sesuaikan tag `{...}`; logika aplikasi tidak berubah.
- Developer perlu membuat versi bertag dari template ini (`template-merps.docx`) dengan placeholder docxtemplater di posisi field yang sesuai bagian 5.
- Teks petunjuk kolom "Media Pembelajaran" pada template masih menyebut aplikasi SIAKAD "SEVIMA" milik UBB. Ganti/hapus sesuai sistem Polbeng ketika informasinya sudah pasti.

## 8. Struktur File Proyek

```
merps/
├── PRD.md                              ← file ini
├── CLAUDE.md                           ← memory proyek (dibuat Claude Code)
├── .env                                ← kunci Supabase, JANGAN masuk GitHub
├── .gitignore                          ← node_modules, dist, .env
├── netlify.toml
├── package.json
├── index.html
├── vite.config.js
├── tailwind.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                         ← kerangka + navigasi antar page
    ├── index.css
    ├── assets/
    │   ├── logo1.jpeg                  ← logo Polbeng
    │   └── template-merps.docx         ← template ekspor bertag (dari template sementara)
    ├── components/
    │   ├── common/                     ← Button, Modal, Toast, Table, FormField, StepNav, ValidationBadge
    │   └── layout/                     ← Navbar, Sidebar
    ├── context/
    │   └── RpsContext.jsx              ← state RPS yang sedang disusun
    ├── pages/                          ← Dashboard, MasterCPL, MasterDosen, MasterProdi, PenyusunRPS, RingkasanEkspor
    ├── utils/
    │   ├── storage.js                  ← SEMUA baca/tulis data lewat sini
    │   ├── validators.js               ← bobot 100%, pemetaan CPL/CPMK/Sub-CPMK, field wajib
    │   ├── docxExport.js               ← isi template & unduh .docx
    │   ├── formatters.js               ← tanggal, angka, format SKS
    │   └── supabase.js                 ← koneksi database
    └── data/
        └── seedData.js                 ← contoh CPL, dosen, satu RPS mata kuliah Teknik Mesin
```

**Prinsip penting untuk AI/developer:**
- Semua akses data HANYA lewat `src/utils/storage.js`. Migrasi localStorage ke Supabase cukup ubah satu file ini.
- Logika validasi terpusat di `src/utils/validators.js`, dipakai di form dan sebelum ekspor.
- Logika ekspor Word terpusat di `src/utils/docxExport.js`. Ganti template = ganti file `.docx` + sesuaikan tag, tanpa menyentuh logika lain.
- Komponen UI berulang dibuat sekali di `components/common/`.
- Kunci Supabase di `.env`, tidak pernah di-hardcode.

## 9. Keamanan & Aturan Wajib

- [ ] `.env` masuk `.gitignore`; kunci Supabase tidak pernah di-hardcode.
- [ ] Validasi input di semua form: SKS, alokasi waktu, dan bobot tidak boleh negatif; field wajib tidak boleh kosong; kode tidak kembar.
- [ ] Validasi total bobot mingguan = 100% dan total Rencana Evaluasi = 100% sebelum ekspor diizinkan.
- [ ] Validasi pemetaan OBE (CPMK punya CPL, Sub-CPMK punya CPMK) sebelum ekspor.
- [ ] Konfirmasi sebelum menghapus RPS/CPMK (aksi destruktif).
- [ ] Karena tanpa login: gunakan anon key khusus; sediakan opsi gerbang kata sandi (3.3) sebelum publikasi.
- [ ] Tidak menampilkan URL/kunci Supabase di antarmuka.

## 10. Deployment

| | |
|---|---|
| **Repo GitHub** | merps (private) |
| **Hosting** | Netlify, import dari GitHub, auto-deploy tiap push. |
| **Env var di hosting** | VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY |
| **Domain** | Subdomain gratis dulu (merps.netlify.app). Boleh ganti domain sendiri kelak. |

## 11. Tahapan Pengerjaan (Milestone)

1. **Tahap 1 — Kerangka & fitur inti:** dashboard, master (CPL/dosen/prodi/pustaka), wizard 7 langkah, tabel mingguan, Rencana Evaluasi, validasi, ekspor Word. Pakai localStorage/data dummy dulu. *Selesai jika: satu RPS lengkap bisa dibuat dari nol dan diekspor ke `.docx` di laptop.*
2. **Tahap 2 — Format ekspor:** samakan hasil `.docx` dengan template (kop, tabel mingguan lengkap, lembar pengesahan, Rencana Evaluasi). *Selesai jika: hasil ekspor tinggal dicetak tanpa dirapikan ulang.*
3. **Tahap 3 — Database sungguhan:** migrasi ke Supabase (ganti `storage.js`). *Selesai jika: data tersimpan permanen & bisa diakses dari perangkat lain.*
4. **Tahap 4 — Deploy:** GitHub ke Netlify + env var. *Selesai jika: aplikasi bisa dibuka dari perangkat lain.*
5. **Tahap 5 — Uji coba:** buat beberapa RPS mata kuliah Teknik Mesin nyata, kumpulkan masukan, perbaiki.
6. **Tahap 6 — Rilis:** finalkan template (ganti dengan template resmi kampus bila sudah ada), opsional pasang gerbang kata sandi, serahkan untuk pemakaian rutin.

## 12. Kriteria "Selesai"

- [ ] Semua fitur WAJIB (3.1) berfungsi dan sudah dites end-to-end.
- [ ] Satu RPS lengkap bisa dibuat dari nol lalu diekspor ke Word yang rapi.
- [ ] Hasil ekspor `.docx` sesuai struktur template (sampul, pengesahan, identitas, CPL/CPMK/Sub-CPMK, korelasi, tabel 16 pertemuan, Rencana Evaluasi).
- [ ] Validasi bobot 100% (mingguan & evaluasi) dan pemetaan OBE mencegah ekspor jika tidak valid.
- [ ] Nyaman di laptop; tidak rusak di HP.
- [ ] Tidak ada error di console browser.
- [ ] Data tersimpan permanen di Supabase dan bisa diakses dari perangkat lain.

---

## Lampiran A: Peta komponen template ke aplikasi

| Bagian dokumen RPS | Diisi dari | Bentuk di aplikasi |
|---|---|---|
| Sampul (MK, kode, prodi, semester, TA) | RPS + Master Prodi | Langkah 1 wizard |
| Lembar Pengesahan (koordinator + dosen pengampu) | Pengesahan + Master Dosen | Langkah 1 wizard |
| Identitas Mata Kuliah | RPS | Langkah 1 wizard |
| CPL yang dibebankan | Master CPL (dipilih) | Langkah 2 |
| CPMK/CLO | CPMK | Langkah 3 |
| Sub-CPMK/LLO + Korelasi CPMK-Sub-CPMK | Sub-CPMK | Langkah 4 (matriks otomatis) |
| Tabel rencana mingguan (12 kolom, 16 baris) | Pertemuan | Langkah 5 |
| Daftar Referensi | Master Pustaka | otomatis dari referensi terpakai |
| Rencana Evaluasi | Rencana Evaluasi | Langkah 6 |
| Portofolio Ketercapaian CPL/LO | (v1.1) | menyusul |

## Lampiran B: Catatan untuk Claude Code

- Buat `CLAUDE.md` sebagai memory proyek dan perbarui setiap perubahan signifikan.
- Kerjakan sesuai urutan milestone; jangan lompat ke fitur NANTI (3.3).
- Inti aplikasi adalah ketepatan OBE (pemetaan CPL ke CPMK ke Sub-CPMK dan penilaian berbasis CPMK) dan ekspor Word yang persis template, bukan sekadar form biasa.
- Template `.docx` sekarang sementara; buat versi bertag dan pastikan logika ekspor tidak bergantung pada isi teks template agar mudah diganti template resmi kampus.
- Setiap selesai fitur besar: jalankan build, tes alur sungguhan (buat RPS, validasi, ekspor), baru commit dan push.
- Jangan menambah library baru bila bisa diselesaikan dengan yang sudah ada.
- Jelaskan konsep teknis dengan bahasa sederhana; pemilik proyek seorang dosen, bukan programmer.

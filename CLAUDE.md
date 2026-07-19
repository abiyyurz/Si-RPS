# CLAUDE.md — Memory Proyek MERPS

## Apa ini
MERPS = penyusun **RPKPS** (Rencana Program dan Kegiatan Pembelajaran Semester), Jurusan Teknik Mesin Politeknik Negeri Bengkalis.
Aplikasi web **multi-dosen (wajib login)** untuk menyusun RPKPS lalu ekspor ke Word (.docx). Tiap dosen punya akun & data RPKPS sendiri (isolasi per-akun); dosen tidak bisa melihat RPKPS milik dosen lain.
Pemilik proyek dosen, bukan programmer — jelaskan teknis dengan bahasa sederhana.

**PENTING — pivot dari PRD:** [PRD.md](PRD.md) awalnya menargetkan format **OBE** (CPL→CPMK→Sub-CPMK). User memutuskan acuan resmi = **`TEMPLATE_RPS.docx`** (format RPKPS: Tujuan Umum/Khusus, Kontrak Penilaian UTS/UAS/NKP/NKPr, tabel RKPBM). Jadi aplikasi kini berbasis RPKPS, BUKAN OBE. Abaikan bagian OBE di PRD.

## Perintah
- `npm run dev` — jalankan lokal (Vite)
- `npm run build` — build produksi
- `npm run make-template` — regenerasi `src/assets/template-merps.docx` dari `scripts/makeTemplate.mjs`
- `node scripts/test-validators.mjs` — cek cepat logika validasi

## Stack
React 19 + Vite + Tailwind v4 (plugin `@tailwindcss/vite`, **tanpa** tailwind.config.js).
Ekspor Word: docxtemplater + pizzip + file-saver. Preview docx di web: `docx-preview` (render file .docx asli di browser agar logo/format persis — halaman `pages/PreviewCetak.jsx`). Tanpa react-router (navigasi state di App.jsx).
Jangan tambah library baru kecuali benar-benar perlu.

## Arsitektur (aturan keras dari PRD)
- **Semua akses data RPKPS HANYA lewat `src/utils/storage.js`**. Data disimpan PER-AKUN di Supabase (tabel `rps_stores`, satu baris jsonb per dosen `owner_id = users.id`), cache di localStorage. API tetap sinkron: data di-`hydrate(userId)` ke memori saat login (di `App.jsx`), semua baca/tulis memori, simpan ke server otomatis (debounce). **Project Supabase TERPISAH khusus RPS** (bukan project Si-BHP). **Wajib jalankan `supabase-rps.sql` sekali** untuk membuat tabel `users` + `rps_stores`.
- **Auth**: `src/context/AuthContext.jsx` (login/daftar/lupa-password + `updateProfile`/`changePassword` via tabel `users`), `src/utils/auth.js` (CRUD user), `src/utils/password.js` (hash SHA-256+salt), `src/pages/Login.jsx`, `src/pages/Profil.jsx` (ubah nama & password, diakses via klik nama di Navbar). Konfigurasi Supabase di `.env` (VITE_SUPABASE_URL / _ANON_KEY), gitignored.
- **Fitur RPS**: tiap rpkps distempel `diperbarui` (ISO) saat disimpan → kolom "Terakhir diubah" di Dashboard (urut terbaru). Tombol "Ekspor Semua (ZIP)" (`exportSemuaZip` di docxExport, pakai PizZip). Peringatan tutup-tab & konfirmasi Keluar bila `storage.hasPendingSave()` (belum tersinkron server); `storage.flush()` memaksa sinkron.
- Validasi terpusat di `src/utils/validators.js` — dipakai form, dashboard, dan sebelum ekspor.
- Ekspor Word terpusat di `src/utils/docxExport.js`. Ganti template = ganti file docx + sesuaikan tag, logika tidak berubah.
- State RPS yang sedang disusun: `src/context/RpsContext.jsx` (autosave ke storage tiap perubahan; status draf/siap_ekspor dihitung otomatis dari validator).
- Wizard 7 langkah: `src/pages/PenyusunRPS.jsx` + `src/pages/wizard/Step1..Step7`.
- Master (CPL/Dosen/Prodi/Pustaka): satu komponen generik `src/components/common/Crud.jsx` dipakai semua halaman master.
- Template ekspor `src/assets/template-merps.docx` = **template resmi Polbeng bertag** (dari `template-merps-tagged.docx`, hasil user menandai `TEMPLATE_RPS.docx` di Word). **JANGAN jalankan `npm run make-template`** — itu akan menimpanya dengan versi fallback sederhana. Script `scripts/makeTemplate.mjs` hanya cadangan/rujukan tag.
- Daftar tag & panduan penandaan: `PANDUAN_TAG_TEMPLATE.md`. Tag prodi pakai versi HURUF BESAR (`{prodi_upper}` dll) di sampul & pengesahan agar dinamis lintas prodi. RKPBM: baris biasa `{#rkpbm}{^ujian}…{/ujian}`, baris ujian (UTS/UAS, sel tergabung) `{#ujian}…{/ujian}{/rkpbm}`.

## Bentuk data (localStorage key `merps-data-v2`)
`{ prodis, katalog, dosens, pustakas, rpkpsList }`.
- **prodis** = program studi/kelas, tiap entri punya `kode_kelas` (D3TM/D3TE/TMPP/RPL).
- **katalog** = daftar mata kuliah `{ nama, kelas, semester }`, difilter di wizard Langkah 1.
- Satu **rpkps** menampung semuanya (tujuan_khusus[], jam, penilaian, rkpbm[16], pengesahan) — nested.
- RKPBM selalu 16 minggu; ke-8 = UTS, ke-16 = UAS.

## Wizard 6 langkah (RPKPS)
1 Identitas & Pengesahan · 2 Deskripsi & Tujuan · 3 Jam & Buku Bacaan · 4 Kontrak Penilaian · 5 RKPBM · 6 Ringkasan & Ekspor. File: `pages/wizard/Step1..Step6`.

## Aturan validasi inti
Total Kontrak Penilaian (UTS+UAS+NKP+NKPr) = 100; SKS > 0; angka tidak negatif; buku utama ≥1; tiap minggu RKPBM non-ujian wajib isi tujuan+pokok bahasan; dosen pengampu/ka prodi/ketua jurusan wajib. Ekspor diblokir jika ada error.

## Status milestone
- [x] **Tahap 1 — Kerangka & fitur inti** (OBE, localStorage) — lalu **dirombak ke RPKPS**
- [x] **Tahap 2 — Ekspor docx persis template** — template resmi Polbeng bertag jadi template aktif; render terverifikasi lintas prodi (D3TM/TMPP), semua field & RKPBM (UTS/UAS tergabung) terisi. Ada halaman Preview + tombol Cetak (unduh .docx).
- [ ] Tahap 3 — Migrasi Supabase (hanya ubah storage.js)
- [ ] Tahap 4 — Deploy Netlify
- [ ] Tahap 5 — Uji coba, Tahap 6 — Rilis

## Konvensi
- Bahasa UI & pesan validasi: Indonesia. Warna: biru navy (blue-900) utama, aksen amber, netral slate.
- Konfirmasi destruktif pakai `window.confirm` (hapus RPS, hapus CPMK ber-cascade).
- Setiap selesai fitur besar: `npm run build` + tes alur nyata (buat RPS → validasi → ekspor) sebelum commit.

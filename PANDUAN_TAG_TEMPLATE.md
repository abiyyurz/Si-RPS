# Panduan Menandai Template Word (TEMPLATE_RPS.docx)

Tujuan: menyisipkan **penanda** (tag) ke template Word Anda supaya aplikasi bisa mengisinya otomatis.
Hasil ekspor akan **persis** template ini (font, margin, kop, logo) karena kita pakai file asli Anda.

## Langkah singkat
1. Buka **`TEMPLATE_RPS.docx`** di Microsoft Word.
2. **Simpan sebagai** salinan baru: `template-merps-tagged.docx` (biar aslinya aman).
3. Di salinan itu, **ganti teks contoh** (nilai punya Pak Syahrizal) dengan **tag** sesuai tabel di bawah.
4. Simpan, lalu **kirim file itu ke saya**. Saya pasang ke aplikasi & uji.

## Aturan penting (wajib dibaca)
- Ketik kurung kurawal dengan keyboard biasa: `{` dan `}`. **Jangan** pakai simbol lain.
- Ketik tag **tanpa spasi di dalam**: tulis `{mata_kuliah}` — **bukan** `{ mata_kuliah }`.
- Nama tag **huruf kecil** dan pakai garis bawah, salin persis dari tabel.
- Jangan menebalkan/memiringkan hanya sebagian tag (mis. `{`-nya saja).
- Matikan AutoCorrect Word bila perlu (File → Options → Proofing → AutoCorrect Options) supaya `{ }` tidak diubah otomatis.
- Satu tag boleh dipakai berkali-kali (mis. nama mata kuliah muncul di sampul & di dalam — isi tag yang sama di semua tempat).

---

## A. Tag isian tunggal (ketik di tempat datanya)

| Bagian di template | Ganti teks contoh… | …dengan tag |
|---|---|---|
| Sampul, judul MK (HURUF BESAR) | PERPINDAHAN KALOR & PENUKAR KALOR | `{mata_kuliah_upper}` |
| **Sampul, nama Program Studi** | SARJANA TERAPAN TEKNIK MESIN PRODUKSI DAN PERAWATAN | `{prodi_upper}` |
| **Sampul, "JURUSAN …"** | TEKNIK MESIN (setelah kata JURUSAN) | `{jurusan_upper}` |
| **Sampul, nama institusi** | POLITEKNIK NEGERI BENGKALIS | `{institusi_upper}` |
| Sampul, "Oleh: nama" | SYAHRIZAL, ST., MT. | `{dosen_utama_nama}` |
| Sampul, NIP di bawah nama | NIP. 197310142021211005 | `NIP. {dosen_utama_nomor}`* |
| Sampul, kota–tahun / tanggal | BENGKALIS, … 2023 | `{kota}, {tanggal}` |
| Identitas: Mata Kuliah | Perpindahan Kalor & Penukar Kalor | `{mata_kuliah}` |
| Identitas: Kode Mata Kuliah | KBPP 2152 | `{kode_mk}` |
| Identitas: SKS / Jam | 2 / 4 | `{sks} / {jam_per_minggu}` |
| Identitas: Semester / Kelas | VI (Kelas 3A-3B-3C) | `{semester_kelas}` |
| Identitas: Pra Syarat | Termodinamika | `{prasyarat}` |
| Identitas: Perkiraan Peserta | 27 - 30 Orang Mahasiswa | `{perkiraan_peserta}` |
| Deskripsi Singkat (seluruh paragraf) | (paragraf deskripsi) | `{deskripsi_singkat}` |
| Tujuan Pembelajaran Umum (paragraf) | (paragraf tujuan umum) | `{tujuan_umum}` |
| Jumlah Jam: Perkuliahan | 36 Jam … (9 minggu) | `{perkuliahan_jam} Jam = ({perkuliahan_minggu} minggu)` |
| Jumlah Jam: Latihan & Kuis | 8 Jam … (2 minggu) | `{latihan_jam} Jam = ({latihan_minggu} minggu)` |
| Jumlah Jam: Praktikum | 12 Jam … (3 minggu) | `{praktikum_jam} Jam = ({praktikum_minggu} minggu)` |
| Jumlah Jam: Ujian | 4 Jam | `{ujian_jam} Jam` |
| Jumlah Jam: Total | 60 Jam | `{total_jam} Jam` |
| Kontrak Penilaian: UTS (NM) | 30 % | `{uts} %` |
| Kontrak Penilaian: UAS (NA) | 40 % | `{uas} %` |
| Kontrak Penilaian: NKP | 20 % | `{nkp} %` |
| Kontrak Penilaian: NKPr | 10 % | `{nkpr} %` |
| Rincian NKP: Sikap | (isi) | `{hbh_sikap}` |
| Rincian NKP: Latihan & Kuis | (isi) | `{hbh_latihan_kuis}` |
| Rincian NKP: Tugas | (isi) | `{hbh_tugas}` |
| Etika: Kerapian / Kerja Sama / Kedisiplinan / Ketelitian | 2,5 dst | `{etika_kerapian}` `{etika_kerja_sama}` `{etika_kedisiplinan}` `{etika_ketelitian}` |
| Pengesahan: Dosen Pengampu (nama) | SYAHRIZAL, ST., MT. | `{dosen_utama_nama}` |
| Pengesahan: Dosen Pengampu (NIP) | NIP: 197310142021211005 | `NIP: {dosen_utama_nomor}`* |
| Pengesahan: Ka Prodi (nama) | BAMBANG DWI HARIPRIADI, ST., MT. | `{ka_prodi_nama}` |
| Pengesahan: Ka Prodi (NIP) | NIP: 197801302021211004 | `NIP: {ka_prodi_nomor}`* |
| Pengesahan: Ketua Jurusan (nama) | IBNU HAJAR, ST., MT. | `{ketua_jurusan_nama}` |
| Pengesahan: Ketua Jurusan (NIP) | NIP: 197108102021211001 | `NIP: {ketua_jurusan_nomor}`* |
| **Pengesahan: label "KA PRODI …"** | KA PRODI SARJANA TERAPAN TEKNIK MESIN PRODUKSI & PERAWATAN | `KA PRODI {prodi_upper}` |
| **Pengesahan: label "KETUA JURUSAN …"** | KETUA JURUSAN TEKNIK MESIN | `KETUA JURUSAN {jurusan_upper}` |

*Catatan NIP: tag `{..._nomor}` sudah otomatis berisi "NIP. 1973…". Jadi kalau di template sudah ada tulisan "NIP." tetap, cukup hapus dulu supaya tidak dobel — atau biarkan tag saja yang menuliskannya. (Beri tahu saya mana yang Anda pilih.)

---

## B. Bagian berulang (daftar & tabel) — pakai tag "loop"

Untuk bagian yang barisnya bisa banyak, **sisakan SATU baris/butir contoh**, lalu apit dengan tag pembuka `{#...}` dan penutup `{/...}`. Aplikasi akan menggandakannya otomatis.

**1. Tujuan Pembelajaran Khusus** (daftar bernomor)
Sisakan satu butir, jadikan begini:
```
{#tujuan_khusus}{teks}{/tujuan_khusus}
```
(hapus butir contoh lainnya)

**2. Daftar Buku Bacaan — Utama**
```
{#buku_utama}{teks}{/buku_utama}
```
**Buku Pendukung**
```
{#buku_pendukung}{teks}{/buku_pendukung}
```

**3. Tabel RKPBM (mingguan)** — ini yang penting

Tabel ini perlu **DUA model baris** (biar UTS/UAS tergabung persis template). Di bawah baris judul kolom, **hapus semua baris contoh**, lalu buat **dua baris**:

**Baris A — minggu biasa (6 kolom seperti biasa):**

| Kolom | Isi sel |
|---|---|
| Minggu Ke | `{#rkpbm}{^ujian}{minggu}` |
| Tujuan Pembelajaran Khusus | `{tujuan}` |
| Pokok Bahasan / Subpokok | `{pokok}` |
| Metoda / Aktifitas & Media | `{metoda}` |
| Latihan, Evaluasi & Estimasi Waktu | `{evaluasi}` |
| Buku Sumber Bab/Hal | `{buku}{/ujian}` |

**Baris B — minggu ujian (UTS/UAS), sel tengah DIGABUNG:**
1. Buat satu baris lagi di bawahnya.
2. **Blok sel kolom 2–4** (Tujuan + Pokok + Metoda), klik kanan → **Merge Cells** (Gabungkan Sel) supaya jadi satu sel besar.
3. Isi selnya begini:

| Kolom | Isi sel |
|---|---|
| Minggu Ke | `{#ujian}{minggu}` |
| (sel besar gabungan kolom 2–4) | `{label}` |
| Latihan, Evaluasi & Estimasi Waktu | `{evaluasi}` |
| Buku Sumber Bab/Hal | `{buku}{/ujian}{/rkpbm}` |

**Cara kerjanya:** `{#rkpbm}` (di awal Baris A) dan `{/rkpbm}` (di akhir Baris B) mengapit kedua baris. Untuk tiap minggu, aplikasi otomatis memilih: minggu biasa → Baris A; minggu VIII & XVI (ujian) → Baris B yang tergabung. `{label}` berisi "UJIAN TENGAH SEMESTER (UTS)" / "UJIAN AKHIR SEMESTER (UAS)".

**Kolom "Minggu Ke" otomatis angka romawi** I, II, III, … XVI (Anda tidak perlu ketik angkanya). Total selalu 16 baris; VIII = UTS, XVI = UAS.

> Bagian ini paling teliti. Kalau ragu, kirim saja template Anda apa adanya (baris RKPBM boleh Anda kosongkan/biarkan) — saya bantu susun dua baris ujian ini.

---

## Sesudah selesai
Kirim `template-merps-tagged.docx` ke saya. Saya akan:
1. Pasang jadi `src/assets/template-merps.docx`.
2. Uji render dengan data contoh — memastikan semua tag terisi & tidak ada yang salah ketik.
3. Kabari kalau ada tag yang perlu diperbaiki.

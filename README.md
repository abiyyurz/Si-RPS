# MERPS

**Aplikasi penyusun Rencana Pembelajaran Semester (RPS)** untuk Jurusan Teknik Mesin, Politeknik Negeri Bengkalis.

Setiap dosen punya akun sendiri dan hanya dapat melihat serta menyusun RPS untuk mata kuliahnya sendiri — data antar-dosen terpisah (terisolasi). RPS yang sudah lengkap dapat diekspor ke Word (`.docx`) sesuai template resmi kampus.

---

## ✨ Fitur

- 🔐 **Login per-dosen** (daftar, masuk, lupa password) — tiap akun terisolasi, dosen tidak bisa melihat RPS milik dosen lain.
- 📝 **Wizard penyusun RPS 6 langkah**: Identitas & Pengesahan · Deskripsi & Tujuan · Jam & Buku Bacaan · Kontrak Penilaian · RKPBM (16 minggu) · Ringkasan & Ekspor.
- 💾 **Autosave** ke server (Supabase) + cache lokal, dengan penanda "Terakhir diubah".
- 📤 **Ekspor ke Word** (`.docx`) sesuai template resmi Polbeng — per RPS atau **semua sekaligus (ZIP)**.
- 👁️ **Preview cetak** dokumen langsung di web.
- 🗂️ **Data master**: Katalog Mata Kuliah, Dosen, Prodi & Pustaka.
- 👤 **Profil**: ubah nama & ganti password.

## 🛠️ Teknologi

- **React 19** + **Vite** + **Tailwind CSS v4**
- **Supabase** (Postgres) untuk akun & penyimpanan data
- Ekspor Word: `docxtemplater` + `pizzip` + `file-saver`; preview: `docx-preview`

## 🚀 Menjalankan secara lokal

**1. Clone & install**
```bash
git clone https://github.com/Mozardrz/MERPS.git
cd MERPS
npm install
```

**2. Siapkan Supabase**
- Buat project baru di [supabase.com](https://supabase.com).
- Buka **SQL Editor** → jalankan seluruh isi [`supabase-rps.sql`](supabase-rps.sql) (membuat tabel `users` + `rps_stores`).

**3. Konfigurasi `.env`** (di root project)
```env
VITE_SUPABASE_URL=https://<project-anda>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key-anda>
```
> Ambil URL + anon key di Supabase → **Settings → API**. File `.env` tidak ikut ter-commit (sudah di `.gitignore`).

**4. Jalankan**
```bash
npm run dev
```
Buka alamat yang muncul (mis. `http://localhost:5173`), daftar akun, lalu mulai menyusun RPS.

## 📦 Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan server pengembangan (Vite) |
| `npm run build` | Build produksi ke `dist/` |
| `npm run preview` | Pratinjau hasil build |

## 🌐 Deploy (Netlify)

1. Hubungkan repo ini ke Netlify (build `npm run build`, publish `dist`).
2. Tambahkan **Environment variables**: `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
3. `netlify.toml` sudah disertakan (build + SPA redirect).

## 📁 Struktur singkat

```
src/
  context/    AuthContext, RpsContext
  pages/      Login, Dashboard, Profil, Master*, PenyusunRPS, wizard/, PreviewCetak
  utils/      storage (Supabase), auth, password, docxExport, validators, formatters
  components/ layout & UI bersama
supabase-rps.sql   skema tabel (jalankan sekali di Supabase)
```

## 📝 Catatan arsitektur

- **Semua akses data RPS lewat `src/utils/storage.js`** — data disimpan per-akun di tabel `rps_stores` (satu baris JSONB per dosen, kunci `owner_id = users.id`).
- Akun & login lewat tabel `users` (password di-hash SHA-256 + salt).
- Template ekspor: `src/assets/template-merps.docx` (template resmi Polbeng bertag).

---

Jurusan Teknik Mesin — Politeknik Negeri Bengkalis

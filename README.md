# Si-RPS

Sistem Informasi Rencana Pembelajaran Semester (RPS) berbasis web untuk mendukung proses penyusunan, pengelolaan, dan ekspor RPS secara lebih cepat, rapi, dan terstruktur.

Project ini dikembangkan untuk kebutuhan akademik di lingkungan Politeknik Negeri Bengkalis, dengan fokus pada pengalaman penggunaan yang sederhana bagi dosen dan sistem penyimpanan data yang aman per akun.

## Fitur Utama

- Autentikasi dosen dengan akun terpisah per pengguna
- Wizard penyusunan RPS yang terstruktur dan mudah diikuti
- Penyimpanan data per akun dengan autosave
- Preview dokumen sebelum ekspor
- Ekspor RPS ke format Word (.docx) sesuai template resmi
- Dukungan ekspor semua RPS sekaligus dalam format ZIP
- Data master untuk prodi, dosen, katalog, dan pustaka
- Profil pengguna untuk pengelolaan akun dasar

## Stack Teknologi

- React 19
- Vite
- Tailwind CSS v4
- Supabase
- Docxtemplater + PizZip + FileSaver
- docx-preview

## Cara Menjalankan

1. Clone repository
2. Install dependency:
   ```bash
   npm install
   ```
3. Siapkan file `.env` di root project:
   ```env
   VITE_SUPABASE_URL=https://<project-anda>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-key-anda>
   ```
4. Jalankan SQL di [`supabase-rps.sql`](supabase-rps.sql) satu kali pada project Supabase Anda
5. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

## Perintah Penting

- `npm run dev` — jalankan aplikasi secara lokal
- `npm run build` — build untuk produksi
- `npm run preview` — pratinjau hasil build

## Deploy

Project ini dapat dideploy ke Vercel atau Netlify dengan konfigurasi build default:

- Build command: `npm run build`
- Publish directory: `dist`
- Tambahkan environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Struktur Project

- `src/pages` — halaman utama aplikasi
- `src/context` — state dan konteks autentikasi serta RPS
- `src/utils` — logika penyimpanan, validasi, ekspor dokumen, dan auth
- `src/components` — komponen reusable UI dan layout
- `supabase-rps.sql` — skema database yang perlu dijalankan sekali

## Catatan

Si-RPS dirancang untuk kebutuhan penyusunan RPS yang lebih rapi, seragam, dan siap untuk diekspor sesuai format resmi kampus.

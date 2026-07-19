import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Bind ke semua alamat (IPv4 + IPv6). Tanpa ini, di sebagian Windows Vite
  // hanya bind IPv6 [::1] sehingga http://localhost / http://127.0.0.1 "refused".
  server: { host: true },
})

// Kerangka aplikasi + navigasi antar halaman. MODE PERSONAL: tanpa login,
// data disimpan di localStorage. (Login multi-user diparkir; lihat AuthContext.)
import { useEffect, useState } from 'react'
import * as storage from './utils/storage.js'
import Navbar from './components/layout/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import MasterKatalog from './pages/MasterKatalog.jsx'
import MasterDosen from './pages/MasterDosen.jsx'
import MasterProdi from './pages/MasterProdi.jsx'
import PenyusunRPS from './pages/PenyusunRPS.jsx'
import PreviewCetak from './pages/PreviewCetak.jsx'

function FullScreen({ children }) {
  return <div className="flex min-h-screen items-center justify-center text-slate-500">{children}</div>
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [view, setView] = useState({ page: 'dashboard' })
  const go = (page, params = {}) => setView({ page, ...params })

  // Muat data ke memori sebelum halaman dirender.
  useEffect(() => {
    let alive = true
    storage.hydrate().then(() => { if (alive) setReady(true) })
    return () => { alive = false }
  }, [])

  // Peringatan bila menutup/refresh tab saat ada perubahan belum tersinkron.
  useEffect(() => {
    const warn = (e) => {
      if (storage.hasPendingSave()) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  if (!ready) return <FullScreen>Menyiapkan data…</FullScreen>

  return (
    <div className="min-h-screen">
      <Navbar page={view.page} go={go} />
      <main className="mx-auto max-w-7xl px-4 py-6">
        {view.page === 'dashboard' && <Dashboard go={go} />}
        {view.page === 'katalog' && <MasterKatalog />}
        {view.page === 'dosen' && <MasterDosen />}
        {view.page === 'prodi' && <MasterProdi />}
        {view.page === 'wizard' && (
          <PenyusunRPS key={view.rpsId} rpsId={view.rpsId} stepAwal={view.step || 1} go={go} />
        )}
        {view.page === 'preview' && <PreviewCetak key={view.rpsId} rpsId={view.rpsId} go={go} />}
      </main>
    </div>
  )
}

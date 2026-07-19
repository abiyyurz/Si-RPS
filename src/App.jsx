// Kerangka aplikasi + navigasi antar halaman. Wajib login; data di-hydrate per-akun.
import { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext.jsx'
import * as storage from './utils/storage.js'
import Login from './pages/Login.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import MasterKatalog from './pages/MasterKatalog.jsx'
import MasterDosen from './pages/MasterDosen.jsx'
import MasterProdi from './pages/MasterProdi.jsx'
import PenyusunRPS from './pages/PenyusunRPS.jsx'
import PreviewCetak from './pages/PreviewCetak.jsx'
import Profil from './pages/Profil.jsx'

function FullScreen({ children }) {
  return <div className="flex min-h-screen items-center justify-center text-slate-500">{children}</div>
}

export default function App() {
  const { currentUser, loading } = useAuth()
  const [ready, setReady] = useState(false)
  const [view, setView] = useState({ page: 'dashboard' })
  const go = (page, params = {}) => setView({ page, ...params })

  // Muat data akun ke memori sebelum halaman dirender.
  useEffect(() => {
    if (!currentUser) { storage.reset(); setReady(false); return }
    let alive = true
    setReady(false)
    storage.hydrate(currentUser.id).then(() => { if (alive) setReady(true) })
    return () => { alive = false }
  }, [currentUser?.id])

  // Peringatan bila menutup/refresh tab saat ada perubahan belum tersinkron ke server.
  useEffect(() => {
    const warn = (e) => {
      if (storage.hasPendingSave()) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  if (loading) return <FullScreen>Memuat…</FullScreen>
  if (!currentUser) return <Login />
  if (!ready) return <FullScreen>Menyiapkan data Anda…</FullScreen>

  return (
    <div className="min-h-screen">
      <Navbar page={view.page} go={go} />
      <main className="mx-auto max-w-7xl px-4 py-6">
        {view.page === 'dashboard' && <Dashboard go={go} />}
        {view.page === 'profil' && <Profil />}
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

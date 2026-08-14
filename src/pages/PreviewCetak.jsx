// Preview RPS = render file .docx aslinya di browser (logo, font, format persis).
// Memakai docx-preview untuk menampilkan dokumen yang sama dengan yang diunduh.
import { useEffect, useRef, useState } from 'react'
import { renderAsync } from 'docx-preview'
import * as storage from '../utils/storage.js'
import { renderRpkpsDocx, exportRpkps } from '../utils/docxExport.js'
import { Btn } from '../components/common/ui.jsx'

export default function PreviewCetak({ rpsId, go }) {
  const ref = useRef(null)
  const [status, setStatus] = useState('memuat') // memuat | siap | error
  const [sedang, setSedang] = useState(false)
  const rpkps = storage.getRpkps(rpsId)

  useEffect(() => {
    if (!rpkps || !ref.current) return
    let batal = false
    setStatus('memuat')
    ;(async () => {
      try {
        const blob = await renderRpkpsDocx(rpkps)
        if (batal || !ref.current) return
        ref.current.innerHTML = ''
        await renderAsync(blob, ref.current, undefined, {
          className: 'docx',
          inWrapper: true,
          ignoreLastRenderedPageBreak: true,
        })
        if (!batal) setStatus('siap')
      } catch (e) {
        console.error(e)
        if (!batal) setStatus('error')
      }
    })()
    return () => { batal = true }
  }, [rpsId])

  if (!rpkps) return <p className="text-slate-500">RPS tidak ditemukan.</p>

  const unduh = async () => {
    setSedang(true)
    try { await exportRpkps(rpkps) } catch (e) { console.error(e); alert('Gagal membuat file Word.') } finally { setSedang(false) }
  }

  return (
    <div>
      <div className="no-print mb-4 flex items-center gap-2">
        <Btn variant="accent" onClick={unduh} disabled={sedang}>{sedang ? 'Menyiapkan…' : '🖨 Cetak / Unduh Word (.docx)'}</Btn>
        <Btn variant="ghost" className="ml-auto" onClick={() => go('dashboard')}>← Kembali</Btn>
      </div>
      <p className="no-print mb-4 text-xs text-slate-500">
        Preview di bawah hanya <b>perkiraan tampilan</b> (dirender oleh browser). Logo dan sebagian format bisa tidak muncul dan huruf bisa terlihat sedikit berbeda karena keterbatasan browser. <b>File Word yang diunduh adalah versi resmi</b> — logo, huruf, dan format tampil persis di Microsoft Word. Klik “Cetak / Unduh Word” untuk hasil sebenarnya.
      </p>

      {status === 'memuat' && <p className="text-sm text-slate-500">Memuat preview dokumen…</p>}
      {status === 'error' && <p className="text-sm text-red-600">Gagal menampilkan preview. Coba muat ulang halaman.</p>}
      <div className="overflow-x-auto rounded border border-slate-200 bg-slate-200 p-4">
        <div ref={ref} className="mx-auto" />
      </div>
    </div>
  )
}

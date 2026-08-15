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

  const cetakBrowser = () => {
    window.print()
  }

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        <Btn variant="accent" onClick={unduh} disabled={sedang}>
          {sedang ? 'Menyiapkan…' : '⬇ Unduh File Word (.docx)'}
        </Btn>
        <Btn variant="ghost" onClick={cetakBrowser} disabled={status !== 'siap'}>
          🖨 Cetak Dokumen
        </Btn>
        <Btn variant="ghost" className="ml-auto" onClick={() => go('dashboard')}>
          ← Kembali
        </Btn>
      </div>
      <p className="no-print mb-4 text-xs text-slate-500">
        Preview di bawah adalah tampilan render dokumen RPS. Untuk hasil cetak fisik/PDF resmi terbaik dengan format Microsoft Word asli, Anda bisa mengklik <b>“Unduh File Word (.docx)”</b> atau langsung <b>“Cetak Dokumen”</b>.
      </p>

      {status === 'memuat' && <p className="no-print text-sm text-slate-500">Memuat preview dokumen…</p>}
      {status === 'error' && <p className="no-print text-sm text-red-600">Gagal menampilkan preview. Coba muat ulang halaman.</p>}
      <div className="preview-container overflow-x-auto rounded border border-slate-200 bg-slate-200 p-4 print:border-none print:bg-white print:p-0">
        <div ref={ref} className="mx-auto" />
      </div>
    </div>
  )
}

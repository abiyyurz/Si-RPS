// Langkah 6: ringkasan, hasil validasi, dan tombol ekspor.
import { useState } from 'react'
import { useRps } from '../../context/RpsContext.jsx'
import { validateRpkps } from '../../utils/validators.js'
import { exportRpkps } from '../../utils/docxExport.js'
import { Btn, Card, StatusBadge } from '../../components/common/ui.jsx'

export default function Step6Ringkasan() {
  const { rps } = useRps()
  const [sedangEkspor, setSedangEkspor] = useState(false)
  const errors = validateRpkps(rps)
  const siap = errors.length === 0

  const ekspor = async () => {
    setSedangEkspor(true)
    try {
      await exportRpkps(rps)
    } catch (err) {
      console.error(err)
      alert('Gagal mengekspor dokumen. Coba lagi atau periksa console browser.')
    } finally {
      setSedangEkspor(false)
    }
  }

  return (
    <Card title="Hasil Validasi" actions={<StatusBadge status={siap ? 'siap_ekspor' : 'draf'} />}>
      {siap ? (
        <p className="text-sm font-medium text-green-700">✓ Semua validasi lolos. RPS siap diekspor ke Word.</p>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}
      <div className="mt-4">
        <Btn variant="accent" disabled={!siap || sedangEkspor} onClick={ekspor}>
          {sedangEkspor ? 'Menyiapkan dokumen…' : '⬇ Ekspor ke Word (.docx)'}
        </Btn>
        {!siap && <p className="mt-2 text-xs text-slate-500">Ekspor terkunci sampai semua validasi hijau.</p>}
      </div>
    </Card>
  )
}

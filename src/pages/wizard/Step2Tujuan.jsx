// Langkah 2: deskripsi singkat, tujuan umum, dan daftar tujuan khusus.
import { useRps } from '../../context/RpsContext.jsx'
import { Btn, Card, Field, Textarea, inputCls } from '../../components/common/ui.jsx'

export default function Step2Tujuan() {
  const { rps, patch } = useRps()

  const setKhusus = (i, val) => patch({ tujuan_khusus: rps.tujuan_khusus.map((t, idx) => (idx === i ? val : t)) })
  const tambah = () => patch({ tujuan_khusus: [...rps.tujuan_khusus, ''] })
  const hapus = (i) => patch({ tujuan_khusus: rps.tujuan_khusus.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <Card title="Deskripsi Singkat Mata Kuliah">
        <Textarea value={rps.deskripsi_singkat} onChange={(e) => patch({ deskripsi_singkat: e.target.value })} className="min-h-28" />
      </Card>

      <Card title="Tujuan Pembelajaran Umum">
        <Textarea value={rps.tujuan_umum} onChange={(e) => patch({ tujuan_umum: e.target.value })} className="min-h-24" />
      </Card>

      <Card title="Tujuan Pembelajaran Khusus" actions={<Btn variant="accent" onClick={tambah}>+ Tambah</Btn>}>
        <div className="space-y-2">
          {rps.tujuan_khusus.map((t, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-2 w-6 text-right text-sm text-slate-400">{i + 1}.</span>
              <textarea className={`${inputCls} min-h-12`} value={t} onChange={(e) => setKhusus(i, e.target.value)} />
              <Btn variant="danger" className="mt-1" onClick={() => hapus(i)} disabled={rps.tujuan_khusus.length === 1}>Hapus</Btn>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

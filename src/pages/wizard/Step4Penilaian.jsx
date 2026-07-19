// Langkah 4: Kontrak Penilaian (UTS/UAS/NKP/NKPr = 100%) + rincian NKP.
import { useRps } from '../../context/RpsContext.jsx'
import { totalPenilaian, formatRumusNas } from '../../utils/validators.js'
import { Card, Field, Input, inputCls } from '../../components/common/ui.jsx'

export default function Step4Penilaian() {
  const { rps, patch } = useRps()
  const p = rps.penilaian
  const total = totalPenilaian(rps)

  const set = (obj) => patch({ penilaian: { ...p, ...obj } })
  const setHbh = (k, v) => set({ hasil_belajar_harian: { ...p.hasil_belajar_harian, [k]: v } })
  const setEtika = (k, v) => set({ etika: { ...p.etika, [k]: +v } })

  const komponen = [
    ['uts', 'Ujian Tengah Semester (UTS / NM)'],
    ['uas', 'Ujian Akhir Semester (UAS / NA)'],
    ['nkp', 'Nilai Kegiatan Perkuliahan (NKP)'],
    ['nkpr', 'Nilai Kegiatan Praktikum (NKPr)'],
  ]

  return (
    <div className="space-y-4">
      <Card
        title="Kontrak Penilaian"
        actions={
          <span className={`rounded px-3 py-1 text-sm font-bold ${total === 100 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
            Total: {total}% {total === 100 ? '✓' : '(wajib 100%)'}
          </span>
        }
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-slate-600">
              <th className="px-2 py-2 font-medium">Komponen</th>
              <th className="w-32 px-2 py-2 font-medium">Bobot (%)</th>
            </tr>
          </thead>
          <tbody>
            {komponen.map(([key, label]) => (
              <tr key={key} className="border-b border-slate-100">
                <td className="px-2 py-2 font-medium">{label}</td>
                <td className="px-2 py-2">
                  <input type="number" min="0" className={inputCls} value={p[key]} onChange={(e) => set({ [key]: +e.target.value })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 rounded bg-slate-50 px-3 py-2 text-sm text-slate-600">{formatRumusNas(rps)}</p>
      </Card>

      <Card title="Penjabaran NKP · Hasil Belajar Harian">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Sikap"><Input value={p.hasil_belajar_harian.sikap} onChange={(e) => setHbh('sikap', e.target.value)} /></Field>
          <Field label="Latihan & Kuis"><Input value={p.hasil_belajar_harian.latihan_kuis} onChange={(e) => setHbh('latihan_kuis', e.target.value)} /></Field>
          <Field label="Tugas"><Input value={p.hasil_belajar_harian.tugas} onChange={(e) => setHbh('tugas', e.target.value)} /></Field>
        </div>
      </Card>

      <Card title="Nilai Sikap / Etika (Afektif)">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Field label="Kerapian"><Input type="number" min="0" value={p.etika.kerapian} onChange={(e) => setEtika('kerapian', e.target.value)} /></Field>
          <Field label="Kerja Sama"><Input type="number" min="0" value={p.etika.kerja_sama} onChange={(e) => setEtika('kerja_sama', e.target.value)} /></Field>
          <Field label="Kedisiplinan"><Input type="number" min="0" value={p.etika.kedisiplinan} onChange={(e) => setEtika('kedisiplinan', e.target.value)} /></Field>
          <Field label="Ketelitian"><Input type="number" min="0" value={p.etika.ketelitian} onChange={(e) => setEtika('ketelitian', e.target.value)} /></Field>
        </div>
      </Card>
    </div>
  )
}

// Langkah 5: RKPBM 16 minggu tetap (minggu 8 UTS, minggu 16 UAS).
import { useRps } from '../../context/RpsContext.jsx'
import { toRomawi } from '../../utils/formatters.js'
import { Card, inputCls } from '../../components/common/ui.jsx'

const cell = `${inputCls} min-w-40 px-2 py-1 text-xs`

export default function Step5Rkpbm() {
  const { rps, patch } = useRps()
  const setB = (i, obj) => patch({ rkpbm: rps.rkpbm.map((b, idx) => (idx === i ? { ...b, ...obj } : b)) })

  return (
    <Card title="Rencana Kegiatan Pembelajaran Mingguan (RKPBM) · 16 Minggu">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-blue-900 text-white">
              {['Minggu', 'Tujuan Pembelajaran Khusus', 'Pokok Bahasan', 'Metoda / Media', 'Latihan, Evaluasi & Waktu', 'Buku Sumber'].map((h) => (
                <th key={h} className="border border-blue-800 px-2 py-2 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rps.rkpbm.map((b, i) => {
              const ke = i + 1
              const ujian = ke === 8 ? 'UTS' : ke === 16 ? 'UAS' : null
              return (
                <tr key={ke} className={ujian ? 'bg-amber-50' : 'odd:bg-white even:bg-slate-50'}>
                  <td className="border border-slate-200 px-2 py-1 text-center font-semibold whitespace-nowrap">
                    {toRomawi(ke)}
                    {ujian && <span className="ml-1 block rounded bg-amber-400 px-1 py-0.5 text-[10px] font-bold text-blue-950">{ujian}</span>}
                  </td>
                  <td className="border border-slate-200 p-1">
                    <textarea className={`${cell} min-h-12`} value={b.tujuan_khusus} onChange={(e) => setB(i, { tujuan_khusus: e.target.value })} />
                  </td>
                  <td className="border border-slate-200 p-1">
                    <textarea className={`${cell} min-h-12`} value={b.pokok_bahasan} onChange={(e) => setB(i, { pokok_bahasan: e.target.value })} />
                  </td>
                  <td className="border border-slate-200 p-1">
                    <textarea className={`${cell} min-h-12`} value={b.metoda_media} onChange={(e) => setB(i, { metoda_media: e.target.value })} />
                  </td>
                  <td className="border border-slate-200 p-1">
                    <input className={`${cell} min-w-24`} value={b.evaluasi_waktu} onChange={(e) => setB(i, { evaluasi_waktu: e.target.value })} />
                  </td>
                  <td className="border border-slate-200 p-1">
                    <textarea className={`${cell} min-h-12`} value={b.buku_sumber} onChange={(e) => setB(i, { buku_sumber: e.target.value })} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">Minggu ke-8 otomatis UTS dan ke-16 otomatis UAS (boleh dikosongkan isinya).</p>
    </Card>
  )
}

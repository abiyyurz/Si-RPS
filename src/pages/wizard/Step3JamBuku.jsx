// Langkah 3: jumlah jam pelaksanaan & pilihan buku bacaan dari master pustaka.
import { useRps } from '../../context/RpsContext.jsx'
import * as storage from '../../utils/storage.js'
import { Card, Field, Input } from '../../components/common/ui.jsx'

export default function Step3JamBuku() {
  const { rps, patch } = useRps()
  const pustakas = storage.list('pustakas')
  const jam = rps.jam
  const setJam = (k, v) => patch({ jam: { ...jam, [k]: +v } })

  const totalJam = jam.perkuliahan_jam + jam.latihan_jam + jam.praktikum_jam + jam.ujian_jam

  const togglePustaka = (field, id) => {
    const arr = rps[field]
    patch({ [field]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id] })
  }

  const daftar = (jenis, field) => (
    <div>
      <div className="mb-1 text-sm font-medium text-slate-600">Buku {jenis}</div>
      <div className="space-y-1 rounded border border-slate-200 p-2">
        {pustakas.filter((p) => p.jenis === jenis).length === 0 && (
          <p className="text-sm text-slate-400">Belum ada pustaka {jenis}. Tambahkan di Prodi & Pustaka.</p>
        )}
        {pustakas.filter((p) => p.jenis === jenis).map((p) => (
          <label key={p.id} className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={rps[field].includes(p.id)} onChange={() => togglePustaka(field, p.id)} />
            <span>{p.penulis} ({p.tahun}). {p.judul}. {p.penerbit}.</span>
          </label>
        ))}
      </div>
    </div>
  )

  const barisJam = (label, jamKey, mingguKey) => (
    <div className="grid grid-cols-3 items-center gap-2">
      <span className="text-sm text-slate-600">{label}</span>
      <Field label="Jam"><Input type="number" min="0" value={jam[jamKey]} onChange={(e) => setJam(jamKey, e.target.value)} /></Field>
      {mingguKey
        ? <Field label="Minggu"><Input type="number" min="0" value={jam[mingguKey]} onChange={(e) => setJam(mingguKey, e.target.value)} /></Field>
        : <span className="text-xs text-slate-400 pt-5"></span>}
    </div>
  )

  return (
    <div className="space-y-4">
      <Card title="Jumlah Jam Pelaksanaan" actions={<span className="rounded bg-slate-100 px-3 py-1 text-sm font-semibold">Total: {totalJam} jam</span>}>
        <div className="space-y-2">
          {barisJam('Perkuliahan & Diskusi', 'perkuliahan_jam', 'perkuliahan_minggu')}
          {barisJam('Latihan Soal & Kuis', 'latihan_jam', 'latihan_minggu')}
          {barisJam('Praktikum', 'praktikum_jam', 'praktikum_minggu')}
          {barisJam('Ujian Tengah & Akhir Semester', 'ujian_jam', null)}
        </div>
      </Card>

      <Card title="Daftar Buku Bacaan">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {daftar('utama', 'pustaka_utama_ids')}
          {daftar('pendukung', 'pustaka_pendukung_ids')}
        </div>
      </Card>
    </div>
  )
}

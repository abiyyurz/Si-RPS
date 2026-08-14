// Daftar RPS: cari/filter, Buat/Edit/Duplikat/Hapus/Ekspor, status Draf/Siap Ekspor.
import { useState } from 'react'
import * as storage from '../utils/storage.js'
import { validateRpkps } from '../utils/validators.js'
import { exportRpkps, exportSemuaZip } from '../utils/docxExport.js'
import { formatTanggalWaktu } from '../utils/formatters.js'
import { Btn, Card, Input, Select, StatusBadge } from '../components/common/ui.jsx'

export default function Dashboard({ go }) {
  const [rpkpsList, setRpkpsList] = useState(() => storage.listRpkps())
  const [q, setQ] = useState('')
  const [fProdi, setFProdi] = useState('')
  const [fSemester, setFSemester] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [zipping, setZipping] = useState(false)
  const prodis = storage.list('prodis')
  const prodiNama = (id) => prodis.find((p) => p.id === id)?.nama_prodi || ''
  const jumlahAktif = [q, fProdi, fSemester].filter(Boolean).length

  const refresh = () => setRpkpsList(storage.listRpkps())

  const tampil = rpkpsList
    .filter((r) =>
      (!q || `${r.mata_kuliah} ${r.kode_mk}`.toLowerCase().includes(q.toLowerCase())) &&
      (!fProdi || r.program_studi_id === fProdi) &&
      (!fSemester || r.semester === fSemester)
    )
    .sort((a, b) => (b.diperbarui || '').localeCompare(a.diperbarui || '')) // terbaru di atas

  const eksporSemua = async () => {
    if (rpkpsList.length === 0) { alert('Belum ada RPS untuk diekspor.'); return }
    setZipping(true)
    try {
      await exportSemuaZip(rpkpsList)
    } catch (e) {
      alert('Gagal membuat ZIP: ' + (e?.message || e))
    } finally {
      setZipping(false)
    }
  }

  const buatBaru = () => {
    const rpkps = storage.newRpkps()
    storage.saveRpkps(rpkps)
    go('wizard', { rpsId: rpkps.id })
  }

  const hapus = (r) => {
    if (!window.confirm(`Hapus RPS "${r.mata_kuliah || '(tanpa nama)'}"? Tindakan ini tidak bisa dibatalkan.`)) return
    storage.deleteRpkps(r.id)
    refresh()
  }

  const duplikat = (r) => { storage.duplicateRpkps(r.id); refresh() }

  const ekspor = async (r) => {
    const errs = validateRpkps(r)
    if (errs.length) {
      alert(`RPS belum siap diekspor:\n\n• ${errs.slice(0, 10).join('\n• ')}${errs.length > 10 ? `\n… dan ${errs.length - 10} lainnya` : ''}`)
      go('wizard', { rpsId: r.id, step: 6 })
      return
    }
    await exportRpkps(r)
  }

  return (
    <Card
      title="Daftar RPS"
      actions={
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={eksporSemua} disabled={zipping}>{zipping ? 'Menyiapkan…' : 'Ekspor Semua (ZIP)'}</Btn>
          <Btn variant="accent" onClick={buatBaru}>+ Buat RPS Baru</Btn>
        </div>
      }
    >
      {/* Bar filter: ikon Filter + chip kategori aktif */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Btn variant="ghost" className="flex items-center gap-1.5" onClick={() => setFilterOpen((v) => !v)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter
            {jumlahAktif > 0 && <span className="ml-0.5 rounded-full bg-blue-900 px-1.5 text-[10px] font-bold text-white">{jumlahAktif}</span>}
          </Btn>

          {filterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
              <div className="absolute left-0 z-20 mt-1 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">Cari mata kuliah / kode</span>
                    <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ketik kata kunci…" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">Program studi / kelas</span>
                    <Select value={fProdi} onChange={(e) => setFProdi(e.target.value)}>
                      <option value="">Semua prodi/kelas</option>
                      {prodis.map((p) => <option key={p.id} value={p.id}>{p.nama_prodi}</option>)}
                    </Select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">Semester</span>
                    <Select value={fSemester} onChange={(e) => setFSemester(e.target.value)}>
                      <option value="">Semua semester</option>
                      <option>Ganjil</option>
                      <option>Genap</option>
                    </Select>
                  </label>
                  <div className="flex justify-between border-t border-slate-100 pt-2">
                    <button className="text-xs text-slate-500 hover:underline" onClick={() => { setQ(''); setFProdi(''); setFSemester('') }}>Reset semua</button>
                    <button className="text-xs font-medium text-blue-900 hover:underline" onClick={() => setFilterOpen(false)}>Tutup</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {q && <FilterChip label="Cari" value={q} onClear={() => setQ('')} />}
        {fProdi && <FilterChip label="Prodi" value={prodiNama(fProdi)} onClear={() => setFProdi('')} />}
        {fSemester && <FilterChip label="Semester" value={fSemester} onClear={() => setFSemester('')} />}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-slate-600">
              <th className="px-2 py-2 font-medium">Mata Kuliah</th>
              <th className="px-2 py-2 font-medium">Kode</th>
              <th className="px-2 py-2 font-medium">Prodi/Kelas</th>
              <th className="px-2 py-2 font-medium">Semester</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium">Terakhir diubah</th>
              <th className="px-2 py-2 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tampil.length === 0 && (
              <tr><td colSpan={7} className="px-2 py-6 text-center text-slate-400">Tidak ada RPS. Klik "Buat RPS Baru" untuk memulai.</td></tr>
            )}
            {tampil.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-2 py-2 font-medium">{r.mata_kuliah || <span className="text-slate-400">(tanpa nama)</span>}</td>
                <td className="px-2 py-2">{r.kode_mk}</td>
                <td className="px-2 py-2">{prodiNama(r.program_studi_id)}</td>
                <td className="px-2 py-2">{r.semester}</td>
                <td className="px-2 py-2"><StatusBadge status={r.status} /></td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-500">{formatTanggalWaktu(r.diperbarui)}</td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <Btn variant="ghost" className="mr-1" onClick={() => go('wizard', { rpsId: r.id })}>Edit</Btn>
                  <Btn variant="ghost" className="mr-1" onClick={() => go('preview', { rpsId: r.id })}>Preview/Cetak</Btn>
                  <Btn variant="ghost" className="mr-1" onClick={() => duplikat(r)}>Duplikat</Btn>
                  <Btn variant="accent" className="mr-1" onClick={() => ekspor(r)}>Ekspor</Btn>
                  <Btn variant="danger" onClick={() => hapus(r)}>Hapus</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// Chip filter aktif — label kategori + nilai, dengan tombol hapus.
function FilterChip({ label, value, onClear }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 py-1 pl-2.5 pr-1 text-xs text-blue-900">
      <span className="font-semibold">{label}:</span>
      <span className="max-w-40 truncate">{value}</span>
      <button
        onClick={onClear}
        title="Hapus filter"
        className="flex h-4 w-4 items-center justify-center rounded-full text-blue-500 hover:bg-blue-200 hover:text-blue-900"
      >
        ×
      </button>
    </span>
  )
}

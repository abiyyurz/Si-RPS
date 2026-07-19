// Langkah 1: identitas mata kuliah (dari katalog) & pengesahan.
import { useRps } from '../../context/RpsContext.jsx'
import * as storage from '../../utils/storage.js'
import { Card, Field, Input, Select } from '../../components/common/ui.jsx'

export default function Step1Identitas() {
  const { rps, patch } = useRps()
  const dosens = storage.list('dosens')
  const prodis = storage.list('prodis')
  const katalog = storage.list('katalog')
  const kelas = prodis.find((p) => p.id === rps.program_studi_id)?.kode_kelas

  // Mata kuliah difilter dari katalog sesuai kelas (prodi) + semester terpilih.
  const matkulOpsi = katalog.filter((k) => (!kelas || k.kelas === kelas) && k.semester === rps.semester)

  const pilihProdi = (id) => patch({ program_studi_id: id, mata_kuliah: '', kelas: prodis.find((p) => p.id === id)?.kode_kelas || '' })

  const setPengesahan = (obj) => patch({ pengesahan: { ...rps.pengesahan, ...obj } })
  const toggleDosen = (id) => {
    const ada = rps.pengesahan.dosen_pengampu_ids.includes(id)
    setPengesahan({ dosen_pengampu_ids: ada ? rps.pengesahan.dosen_pengampu_ids.filter((x) => x !== id) : [...rps.pengesahan.dosen_pengampu_ids, id] })
  }

  return (
    <div className="space-y-4">
      <Card title="Identitas Mata Kuliah">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Program studi / kelas">
            <Select value={rps.program_studi_id} onChange={(e) => pilihProdi(e.target.value)}>
              <option value="">(pilih)</option>
              {prodis.map((p) => <option key={p.id} value={p.id}>{p.kode_kelas} · {p.nama_prodi}</option>)}
            </Select>
          </Field>
          <Field label="Semester">
            <Select value={rps.semester} onChange={(e) => patch({ semester: e.target.value, mata_kuliah: '' })}>
              <option>Ganjil</option>
              <option>Genap</option>
            </Select>
          </Field>
          <Field label="Pilih dari katalog">
            <Select value="" onChange={(e) => e.target.value && patch({ mata_kuliah: e.target.value })}>
              <option value="">(pilih untuk mengisi)</option>
              {matkulOpsi.map((k) => <option key={k.id} value={k.nama}>{k.nama}</option>)}
            </Select>
          </Field>
          <Field label="Nama mata kuliah">
            <Input value={rps.mata_kuliah} onChange={(e) => patch({ mata_kuliah: e.target.value })} placeholder="Pilih dari katalog atau ketik manual" />
          </Field>
          <Field label="Kode mata kuliah"><Input value={rps.kode_mk} onChange={(e) => patch({ kode_mk: e.target.value })} /></Field>
          <Field label="SKS"><Input type="number" min="0" value={rps.sks} onChange={(e) => patch({ sks: +e.target.value })} /></Field>
          <Field label="Jam per minggu"><Input type="number" min="0" value={rps.jam_per_minggu} onChange={(e) => patch({ jam_per_minggu: +e.target.value })} /></Field>
          <Field label="Semester ke-">
            <Select value={rps.semester_angka} onChange={(e) => patch({ semester_angka: e.target.value })}>
              <option value="">(pilih)</option>
              {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Kelas (mis. 3A, 3B, 3C)"><Input value={rps.semester_kelas} onChange={(e) => patch({ semester_kelas: e.target.value })} /></Field>
          <Field label="Prasyarat"><Input value={rps.prasyarat} onChange={(e) => patch({ prasyarat: e.target.value })} /></Field>
          <Field label="Perkiraan jumlah peserta"><Input value={rps.perkiraan_peserta} onChange={(e) => patch({ perkiraan_peserta: e.target.value })} /></Field>
        </div>
      </Card>

      <Card title="Pengesahan">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-3">
            <div className="mb-1 text-sm font-medium text-slate-600">Dosen pengampu (dibuat oleh; boleh lebih dari satu)</div>
            <div className="space-y-1 rounded border border-slate-200 p-2">
              {dosens.length === 0 && <p className="text-sm text-slate-400">Belum ada dosen. Tambahkan di Master Dosen.</p>}
              {dosens.map((d) => (
                <label key={d.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={rps.pengesahan.dosen_pengampu_ids.includes(d.id)} onChange={() => toggleDosen(d.id)} />
                  {d.nama} <span className="text-xs text-slate-400">({d.jenis_nomor}. {d.nomor_induk})</span>
                </label>
              ))}
            </div>
          </div>
          <Field label="Koordinator / Ketua Program Studi (disetujui oleh)">
            <Select value={rps.pengesahan.ka_prodi_id} onChange={(e) => setPengesahan({ ka_prodi_id: e.target.value })}>
              <option value="">(pilih)</option>
              {dosens.map((d) => <option key={d.id} value={d.id}>{d.nama}</option>)}
            </Select>
          </Field>
          <Field label="Ketua Jurusan (mengetahui)">
            <Select value={rps.pengesahan.ketua_jurusan_id} onChange={(e) => setPengesahan({ ketua_jurusan_id: e.target.value })}>
              <option value="">(pilih)</option>
              {dosens.map((d) => <option key={d.id} value={d.id}>{d.nama}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kota"><Input value={rps.pengesahan.kota} onChange={(e) => setPengesahan({ kota: e.target.value })} /></Field>
            <Field label="Tanggal (teks)"><Input value={rps.pengesahan.tanggal} onChange={(e) => setPengesahan({ tanggal: e.target.value })} placeholder="20 Februari 2023" /></Field>
          </div>
        </div>
      </Card>
    </div>
  )
}

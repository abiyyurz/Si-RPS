// Dashboard Si-RPS: Pencarian, Filter Cepat, Multi-select Batch Export ZIP, Status Kelengkapan & AI Generator.
import { useState, useMemo } from 'react'
import * as storage from '../utils/storage.js'
import { validateRpkps } from '../utils/validators.js'
import { exportRpkps, exportSemuaZip } from '../utils/docxExport.js'
import { formatTanggalWaktu } from '../utils/formatters.js'
import { Btn, Card, Input, Select, StatusBadge } from '../components/common/ui.jsx'
import AiGeneratorModal from '../components/common/AiGeneratorModal.jsx'

export default function Dashboard({ go }) {
  const [rpkpsList, setRpkpsList] = useState(() => storage.listRpkps())
  const [q, setQ] = useState('')
  const [fProdi, setFProdi] = useState('')
  const [fSemester, setFSemester] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [zipping, setZipping] = useState(false)
  const [modalAiOpen, setModalAiOpen] = useState(false)

  const prodis = storage.list('prodis') || []
  const prodiNama = (id) => prodis.find((p) => p.id === id)?.nama_prodi || '-'

  const refresh = () => {
    setRpkpsList(storage.listRpkps())
    setSelectedIds([])
  }

  // Hitung persentase kelengkapan tiap RPS
  const getKelengkapan = (r) => {
    const errs = validateRpkps(r)
    if (errs.length === 0) return { pct: 100, label: 'Siap Cetak', color: 'bg-emerald-500', text: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
    if (errs.length <= 3) return { pct: 80, label: 'Draf 80%', color: 'bg-amber-500', text: 'text-amber-700 bg-amber-50 border-amber-200' }
    return { pct: 50, label: 'Draf 50%', color: 'bg-blue-500', text: 'text-blue-700 bg-blue-50 border-blue-200' }
  }

  // Filter & Urutan
  const tampil = useMemo(() => {
    return rpkpsList
      .filter((r) =>
        (!q || `${r.mata_kuliah} ${r.kode_mk}`.toLowerCase().includes(q.toLowerCase())) &&
        (!fProdi || r.program_studi_id === fProdi) &&
        (!fSemester || r.semester === fSemester)
      )
      .sort((a, b) => (b.diperbarui || '').localeCompare(a.diperbarui || ''))
  }, [rpkpsList, q, fProdi, fSemester])

  // Statistik Ringkas
  const stats = useMemo(() => {
    const total = rpkpsList.length
    const siap = rpkpsList.filter((r) => validateRpkps(r).length === 0).length
    const draf = total - siap
    const totalSks = rpkpsList.reduce((acc, r) => acc + (Number(r.sks) || 0), 0)
    return { total, siap, draf, totalSks }
  }, [rpkpsList])

  // Checkbox Selection
  const isAllSelected = tampil.length > 0 && selectedIds.length === tampil.length
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(tampil.map((r) => r.id))
    }
  }

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // Batch Export ZIP
  const handleBatchExport = async () => {
    const listToExport = selectedIds.length > 0
      ? rpkpsList.filter((r) => selectedIds.includes(r.id))
      : rpkpsList

    if (listToExport.length === 0) {
      alert('Pilih minimal satu RPS untuk diekspor.')
      return
    }

    setZipping(true)
    try {
      await exportSemuaZip(listToExport)
    } catch (e) {
      alert('Gagal mengekspor ZIP: ' + (e?.message || e))
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

  const duplikat = (r) => {
    storage.duplicateRpkps(r.id)
    refresh()
  }

  const ekspor = async (r) => {
    const errs = validateRpkps(r)
    if (errs.length) {
      if (!window.confirm(`RPS belum 100% lengkap:\n• ${errs.slice(0, 4).join('\n• ')}\n\nTetap ingin mengekspor?`)) {
        go('wizard', { rpsId: r.id, step: 6 })
        return
      }
    }
    await exportRpkps(r)
  }

  const handleApplyAi = (aiData, meta) => {
    const dosens = storage.list('dosens') || []
    const pustakas = storage.list('pustakas') || []

    const pengampu = dosens.find((d) => d.peran === 'pengampu') || dosens[0]
    const kaProdi = dosens.find((d) => d.peran === 'koordinator prodi') || dosens[1] || dosens[0]
    const kajur = dosens.find((d) => d.peran === 'ketua jurusan') || dosens[2] || dosens[0]

    const pustakaUtamaIds = []
    if (Array.isArray(aiData.pustaka)) {
      aiData.pustaka.forEach((p) => {
        const existing = pustakas.find((ex) => ex.judul && p.judul && ex.judul.toLowerCase() === p.judul.toLowerCase())
        if (existing) {
          pustakaUtamaIds.push(existing.id)
        } else if (p.judul) {
          const baru = storage.add('pustakas', {
            jenis: p.jenis || 'utama',
            penulis: p.penulis || 'Pustaka Utama',
            tahun: String(p.tahun || new Date().getFullYear()),
            judul: p.judul,
            penerbit: p.penerbit || 'Politeknik Negeri Bengkalis',
            nomor_urut: pustakas.length + 1,
          })
          pustakaUtamaIds.push(baru.id)
        }
      })
    }
    if (pustakaUtamaIds.length === 0 && pustakas.length > 0) {
      pustakaUtamaIds.push(pustakas[0].id)
    }

    const rpkps = {
      ...storage.newRpkps(),
      mata_kuliah: meta.mata_kuliah || aiData.mata_kuliah,
      kode_mk: meta.kode_mk || aiData.kode_mk || 'KBPP 2152',
      sks: meta.sks || aiData.sks || 2,
      jam_per_minggu: (meta.sks || aiData.sks || 2) * 2,
      semester: meta.semester || 'Genap',
      semester_angka: 'VI',
      semester_kelas: 'Kelas A & B',
      program_studi_id: meta.program_studi_id || prodis[0]?.id || '',
      prasyarat: aiData.prasyarat || '-',
      perkiraan_peserta: aiData.perkiraan_peserta || '25 - 30 Orang Mahasiswa',
      deskripsi_singkat: aiData.deskripsi_singkat || '',
      tujuan_umum: aiData.tujuan_umum || '',
      tujuan_khusus: Array.isArray(aiData.tujuan_khusus) ? aiData.tujuan_khusus : [''],
      jam: {
        perkuliahan_jam: aiData.jam?.perkuliahan_jam ?? 36,
        perkuliahan_minggu: aiData.jam?.perkuliahan_minggu ?? 9,
        latihan_jam: aiData.jam?.latihan_jam ?? 8,
        latihan_minggu: aiData.jam?.latihan_minggu ?? 2,
        praktikum_jam: aiData.jam?.praktikum_jam ?? 12,
        praktikum_minggu: aiData.jam?.praktikum_minggu ?? 3,
        ujian_jam: aiData.jam?.ujian_jam ?? 4,
      },
      pustaka_utama_ids: pustakaUtamaIds,
      pustaka_pendukung_ids: [],
      penilaian: {
        uts: aiData.penilaian?.uts ?? 30,
        uas: aiData.penilaian?.uas ?? 40,
        nkp: aiData.penilaian?.nkp ?? 20,
        nkpr: aiData.penilaian?.nkpr ?? 10,
        hasil_belajar_harian: aiData.penilaian?.hasil_belajar_harian || { sikap: '', latihan_kuis: '', tugas: '' },
        etika: aiData.penilaian?.etika || { kerapian: 2.5, kerja_sama: 2.5, kedisiplinan: 2.5, ketelitian: 2.5 },
      },
      rkpbm: Array.isArray(aiData.rkpbm) && aiData.rkpbm.length === 16 ? aiData.rkpbm : storage.newRpkps().rkpbm,
      pengesahan: {
        dosen_pengampu_ids: pengampu ? [pengampu.id] : [],
        ka_prodi_id: kaProdi?.id || '',
        ketua_jurusan_id: kajur?.id || '',
        kota: 'Bengkalis',
        tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      },
      status: 'siap_ekspor',
    }

    storage.saveRpkps(rpkps)
    refresh()
    go('wizard', { rpsId: rpkps.id })
  }

  return (
    <>
      <AiGeneratorModal
        isOpen={modalAiOpen}
        onClose={() => setModalAiOpen(false)}
        onApply={handleApplyAi}
      />

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Dokumen RPS</p>
          <p className="mt-1 text-2xl font-bold text-blue-950">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-600">Siap Cetak / Ekspor</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.siap}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-600">Dalam Draf</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{stats.draf}</p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-xs">
          <p className="text-xs font-medium text-indigo-600">Total Beban SKS</p>
          <p className="mt-1 text-2xl font-bold text-indigo-700">{stats.totalSks} SKS</p>
        </div>
      </div>

      <Card
        title="Daftar Dokumen RPS"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Btn variant="accent" className="flex items-center gap-1 shadow-xs" onClick={() => setModalAiOpen(true)}>
              ✨ Buat Otomatis (AI)
            </Btn>
            <Btn
              variant="primary"
              className="flex items-center gap-1.5 shadow-xs"
              onClick={handleBatchExport}
              disabled={zipping || rpkpsList.length === 0}
            >
              📦 {zipping ? 'Mengompres…' : selectedIds.length > 0 ? `Ekspor ${selectedIds.length} Terpilih (.ZIP)` : 'Ekspor Semua (.ZIP)'}
            </Btn>
            <Btn variant="ghost" onClick={buatBaru}>+ Buat Manual</Btn>
          </div>
        }
      >
        {/* Search & Filter Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative min-w-64 max-w-xs flex-1">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="🔍 Cari nama mata kuliah / kode…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
              {q && (
                <button
                  onClick={() => setQ('')}
                  className="absolute right-2 top-1.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Semester Toggle Pills */}
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
              {['', 'Ganjil', 'Genap'].map((sem) => (
                <button
                  key={sem}
                  type="button"
                  onClick={() => setFSemester(sem)}
                  className={`rounded-md px-2.5 py-1 transition ${
                    fSemester === sem ? 'bg-white font-semibold text-blue-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sem || 'Semua'}
                </button>
              ))}
            </div>

            {/* Prodi Filter */}
            <select
              value={fProdi}
              onChange={(e) => setFProdi(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-900"
            >
              <option value="">Semua Program Studi</option>
              {prodis.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_prodi}
                </option>
              ))}
            </select>
          </div>

          {selectedIds.length > 0 && (
            <span className="text-xs font-semibold text-blue-900">
              {selectedIds.length} RPS dipilih
            </span>
          )}
        </div>

        {/* Tabel Data RPS */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-600">
                <th className="px-3 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                  />
                </th>
                <th className="px-3 py-2.5">Mata Kuliah & Kode</th>
                <th className="px-3 py-2.5">Program Studi</th>
                <th className="px-3 py-2.5 text-center">SKS & Sem</th>
                <th className="px-3 py-2.5">Kelengkapan</th>
                <th className="px-3 py-2.5">Terakhir Diubah</th>
                <th className="px-3 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tampil.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-400">
                    Tidak ditemukan RPS yang sesuai. Klik <b>"✨ Buat Otomatis (AI)"</b> untuk membuat baru.
                  </td>
                </tr>
              ) : (
                tampil.map((r) => {
                  const kel = getKelengkapan(r)
                  const isSelected = selectedIds.includes(r.id)
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-slate-100 transition hover:bg-slate-50/80 ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(r.id)}
                          className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-blue-950">
                          {r.mata_kuliah || <span className="text-slate-400 italic">(Tanpa Nama)</span>}
                        </p>
                        <p className="text-xs text-slate-500">{r.kode_mk || '-'}</p>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-700">
                        {prodiNama(r.program_studi_id)}
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs">
                        <span className="font-semibold text-slate-800">{r.sks || 2} SKS</span>
                        <span className="block text-[11px] text-slate-500">Sem. {r.semester}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="w-28">
                          <div className="mb-1 flex items-center justify-between text-[11px]">
                            <span className="font-medium text-slate-600">{kel.label}</span>
                            <span className="font-semibold text-slate-800">{kel.pct}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div className={`h-full ${kel.color}`} style={{ width: `${kel.pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-slate-500">
                        {formatTanggalWaktu(r.diperbarui)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Btn variant="ghost" className="px-2 py-1 text-xs" onClick={() => go('wizard', { rpsId: r.id })}>
                            Edit
                          </Btn>
                          <Btn variant="ghost" className="px-2 py-1 text-xs" onClick={() => go('preview', { rpsId: r.id })}>
                            Preview
                          </Btn>
                          <Btn variant="accent" className="px-2 py-1 text-xs" onClick={() => ekspor(r)}>
                            Word
                          </Btn>
                          <Btn variant="ghost" className="px-2 py-1 text-xs" onClick={() => duplikat(r)} title="Duplikat RPS">
                            Salin
                          </Btn>
                          <Btn variant="danger" className="px-2 py-1 text-xs" onClick={() => hapus(r)}>
                            Hapus
                          </Btn>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

// Langkah 5: RKPBM 16 minggu tetap (minggu 8 UTS, minggu 16 UAS).
import { useState } from 'react'
import { useRps } from '../../context/RpsContext.jsx'
import { toRomawi } from '../../utils/formatters.js'
import { Card, Btn, inputCls } from '../../components/common/ui.jsx'
import { generateRkpbmOnlyWithAi } from '../../utils/aiGenerator.js'

const cell = `${inputCls} min-w-40 px-2 py-1 text-xs`

export default function Step5Rkpbm() {
  const { rps, patch } = useRps()
  const [sedangAi, setSedangAi] = useState(false)

  const setB = (i, obj) => patch({ rkpbm: rps.rkpbm.map((b, idx) => (idx === i ? { ...b, ...obj } : b)) })

  const handleLengkapiRkpbm = async () => {
    if (!rps.mata_kuliah) {
      alert('Isi nama mata kuliah terlebih dahulu di Langkah 1.')
      return
    }
    if (!window.confirm(`Susun otomatis 16 minggu RKPBM untuk "${rps.mata_kuliah}"? Data minggu saat ini akan diperbarui.`)) {
      return
    }

    setSedangAi(true)
    try {
      const generated = await generateRkpbmOnlyWithAi({
        mataKuliah: rps.mata_kuliah,
        sks: rps.sks || 2,
        deskripsi: rps.deskripsi_singkat || '',
      })
      if (Array.isArray(generated) && generated.length === 16) {
        patch({ rkpbm: generated })
      } else {
        alert('Respon RKPBM tidak lengkap. Silakan coba lagi.')
      }
    } catch (err) {
      console.error(err)
      alert(err.message || 'Gagal memproses.')
    } finally {
      setSedangAi(false)
    }
  }

  // Aksi Cepat: Terapkan Metoda Standar ke seluruh minggu non-ujian
  const handleSamakanMetoda = () => {
    const metodaStandar = 'Menyimak, diskusi kelompok, tanya jawab, pemecahan contoh kasus. Media: Slide presentasi, papan tulis, LCD Projector.'
    patch({
      rkpbm: rps.rkpbm.map((b, i) => {
        if (i === 7 || i === 15) return b
        return { ...b, metoda_media: metodaStandar }
      }),
    })
  }

  // Aksi Cepat: Terapkan Waktu Standar ke seluruh minggu
  const handleSamakanWaktu = () => {
    patch({
      rkpbm: rps.rkpbm.map((b, i) => {
        const isUjian = i === 7 || i === 15
        return { ...b, evaluasi_waktu: isUjian ? "2 × 50'" : "4 × 50'" }
      }),
    })
  }

  // Salin isi baris minggu ini ke minggu berikutnya
  const handleSalinKeBawah = (i) => {
    if (i >= 15) return
    const src = rps.rkpbm[i]
    setB(i + 1, {
      metoda_media: src.metoda_media,
      evaluasi_waktu: src.evaluasi_waktu,
      buku_sumber: src.buku_sumber,
    })
  }

  return (
    <Card
      title="Rencana Kegiatan Pembelajaran Mingguan (RKPBM) · 16 Minggu"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Btn variant="accent" className="flex items-center gap-1 text-xs" onClick={handleLengkapiRkpbm} disabled={sedangAi}>
            {sedangAi ? 'Menyusun RKPBM…' : '✨ Susun RKPBM dengan AI'}
          </Btn>
        </div>
      }
    >
      {/* Quick Bulk Actions Toolbar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs">
        <span className="font-semibold text-slate-700">⚡ Aksi Cepat Tabel:</span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={handleSamakanMetoda}
            className="rounded bg-white px-2.5 py-1 font-medium text-slate-700 shadow-xs border border-slate-200 hover:bg-slate-100 hover:text-blue-900"
          >
            📋 Samakan Metoda & Media
          </button>
          <button
            type="button"
            onClick={handleSamakanWaktu}
            className="rounded bg-white px-2.5 py-1 font-medium text-slate-700 shadow-xs border border-slate-200 hover:bg-slate-100 hover:text-blue-900"
          >
            ⏱ Set Waktu Standar (4 × 50')
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-blue-900 text-white">
              {['Minggu', 'Tujuan Pembelajaran Khusus', 'Pokok Bahasan', 'Metoda / Media', 'Latihan, Evaluasi & Waktu', 'Buku Sumber', 'Aksi'].map((h) => (
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
                  <td className="border border-slate-200 p-1 text-center">
                    {i < 15 && (
                      <button
                        type="button"
                        onClick={() => handleSalinKeBawah(i)}
                        title="Salin Metoda, Waktu & Buku ke Minggu Berikutnya"
                        className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-900 shadow-2xs"
                      >
                        ↓ Salin
                      </button>
                    )}
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

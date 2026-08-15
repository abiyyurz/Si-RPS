import { useState } from 'react'
import { RpsProvider, useRps } from '../context/RpsContext.jsx'
import { stepDone } from '../utils/validators.js'
import * as storage from '../utils/storage.js'
import { Btn } from '../components/common/ui.jsx'
import AiGeneratorModal from '../components/common/AiGeneratorModal.jsx'
import Step1Identitas from './wizard/Step1Identitas.jsx'
import Step2Tujuan from './wizard/Step2Tujuan.jsx'
import Step3JamBuku from './wizard/Step3JamBuku.jsx'
import Step4Penilaian from './wizard/Step4Penilaian.jsx'
import Step5Rkpbm from './wizard/Step5Rkpbm.jsx'
import Step6Ringkasan from './wizard/Step6Ringkasan.jsx'

const LANGKAH = [
  'Identitas & Pengesahan',
  'Deskripsi & Tujuan',
  'Jam & Buku Bacaan',
  'Kontrak Penilaian',
  'RKPBM (16 Minggu)',
  'Ringkasan & Ekspor',
]

function StepNav({ step, setStep }) {
  const { rps } = useRps()
  return (
    <ol className="mb-6 flex flex-wrap gap-1">
      {LANGKAH.map((label, i) => {
        const n = i + 1
        const done = stepDone(rps, n)
        const active = step === n
        return (
          <li key={n}>
            <button
              onClick={() => setStep(n)}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition ${
                active ? 'bg-blue-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                  done ? 'bg-green-500 text-white' : active ? 'bg-amber-400 text-blue-950' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {done ? '✓' : n}
              </span>
              {label}
            </button>
          </li>
        )
      })}
    </ol>
  )
}

function WizardBody({ stepAwal, go }) {
  const [step, setStep] = useState(stepAwal)
  const [modalAiOpen, setModalAiOpen] = useState(false)
  const { rps, setRps } = useRps()

  const handleApplyAi = (aiData, meta) => {
    const pustakas = storage.list('pustakas') || []
    const pustakaUtamaIds = [...(rps.pustaka_utama_ids || [])]

    if (Array.isArray(aiData.pustaka)) {
      aiData.pustaka.forEach((p) => {
        const existing = pustakas.find((ex) => ex.judul && p.judul && ex.judul.toLowerCase() === p.judul.toLowerCase())
        if (existing) {
          if (!pustakaUtamaIds.includes(existing.id)) pustakaUtamaIds.push(existing.id)
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

    setRps((prev) => ({
      ...prev,
      mata_kuliah: meta.mata_kuliah || aiData.mata_kuliah || prev.mata_kuliah,
      kode_mk: meta.kode_mk || aiData.kode_mk || prev.kode_mk || 'KBPP 2152',
      sks: meta.sks || aiData.sks || prev.sks || 2,
      jam_per_minggu: (meta.sks || aiData.sks || prev.sks || 2) * 2,
      semester: meta.semester || aiData.semester || prev.semester || 'Genap',
      program_studi_id: meta.program_studi_id || prev.program_studi_id,
      prasyarat: aiData.prasyarat || prev.prasyarat || '-',
      perkiraan_peserta: aiData.perkiraan_peserta || prev.perkiraan_peserta || '25 - 30 Orang Mahasiswa',
      deskripsi_singkat: aiData.deskripsi_singkat || prev.deskripsi_singkat,
      tujuan_umum: aiData.tujuan_umum || prev.tujuan_umum,
      tujuan_khusus: Array.isArray(aiData.tujuan_khusus) && aiData.tujuan_khusus.length ? aiData.tujuan_khusus : prev.tujuan_khusus,
      jam: {
        perkuliahan_jam: aiData.jam?.perkuliahan_jam ?? prev.jam.perkuliahan_jam,
        perkuliahan_minggu: aiData.jam?.perkuliahan_minggu ?? prev.jam.perkuliahan_minggu,
        latihan_jam: aiData.jam?.latihan_jam ?? prev.jam.latihan_jam,
        latihan_minggu: aiData.jam?.latihan_minggu ?? prev.jam.latihan_minggu,
        praktikum_jam: aiData.jam?.praktikum_jam ?? prev.jam.praktikum_jam,
        praktikum_minggu: aiData.jam?.praktikum_minggu ?? prev.jam.praktikum_minggu,
        ujian_jam: aiData.jam?.ujian_jam ?? prev.jam.ujian_jam,
      },
      pustaka_utama_ids: pustakaUtamaIds.length ? pustakaUtamaIds : prev.pustaka_utama_ids,
      penilaian: {
        uts: aiData.penilaian?.uts ?? prev.penilaian.uts,
        uas: aiData.penilaian?.uas ?? prev.penilaian.uas,
        nkp: aiData.penilaian?.nkp ?? prev.penilaian.nkp,
        nkpr: aiData.penilaian?.nkpr ?? prev.penilaian.nkpr,
        hasil_belajar_harian: aiData.penilaian?.hasil_belajar_harian || prev.penilaian.hasil_belajar_harian,
        etika: aiData.penilaian?.etika || prev.penilaian.etika,
      },
      rkpbm: Array.isArray(aiData.rkpbm) && aiData.rkpbm.length === 16 ? aiData.rkpbm : prev.rkpbm,
    }))
  }

  const STEPS = {
    1: <Step1Identitas />,
    2: <Step2Tujuan />,
    3: <Step3JamBuku />,
    4: <Step4Penilaian />,
    5: <Step5Rkpbm />,
    6: <Step6Ringkasan />,
  }

  return (
    <div>
      <AiGeneratorModal
        isOpen={modalAiOpen}
        onClose={() => setModalAiOpen(false)}
        onApply={handleApplyAi}
        initialData={{
          mata_kuliah: rps.mata_kuliah,
          kode_mk: rps.kode_mk,
          sks: rps.sks,
          program_studi_id: rps.program_studi_id,
          semester: rps.semester,
        }}
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-blue-950">
            Penyusun RPS{rps.mata_kuliah ? `: ${rps.mata_kuliah}` : ''}
          </h1>
          <p className="text-xs text-slate-500">Perubahan tersimpan otomatis.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn variant="accent" className="flex items-center gap-1 shadow-xs" onClick={() => setModalAiOpen(true)}>
            ✨ Isi Otomatis dengan AI
          </Btn>
          <Btn variant="ghost" onClick={() => go('preview', { rpsId: rps.id })}>Preview/Cetak</Btn>
          <Btn variant="ghost" onClick={() => go('dashboard')}>← Kembali ke Dashboard</Btn>
        </div>
      </div>

      <StepNav step={step} setStep={setStep} />
      {STEPS[step]}

      <div className="mt-6 flex justify-between">
        <Btn variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)}>← Sebelumnya</Btn>
        {step < 6 && <Btn onClick={() => setStep(step + 1)}>Berikutnya →</Btn>}
      </div>
    </div>
  )
}

export default function PenyusunRPS({ rpsId, stepAwal, go }) {
  return (
    <RpsProvider rpsId={rpsId}>
      <WizardBody stepAwal={stepAwal} go={go} />
    </RpsProvider>
  )
}

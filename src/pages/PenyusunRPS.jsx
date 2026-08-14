// Wizard 6 langkah penyusun RPKPS. State di RpsContext (autosave otomatis).
import { useState } from 'react'
import { RpsProvider, useRps } from '../context/RpsContext.jsx'
import { stepDone } from '../utils/validators.js'
import { Btn } from '../components/common/ui.jsx'
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
  const { rps } = useRps()

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
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-blue-950">
            Penyusun RPS{rps.mata_kuliah ? `: ${rps.mata_kuliah}` : ''}
          </h1>
          <p className="text-xs text-slate-500">Perubahan tersimpan otomatis.</p>
        </div>
        <div className="flex gap-2">
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

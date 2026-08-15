import { useState, useEffect } from 'react'
import PizZip from 'pizzip'
import * as storage from '../../utils/storage.js'
import { generateFullRpsWithAi, getApiKey, setApiKey, testGeminiApiKey } from '../../utils/aiGenerator.js'
import { Btn, Field, Input, Select, Textarea } from './ui.jsx'

export default function AiGeneratorModal({ isOpen, onClose, onApply, initialData = {} }) {
  const [apiKey, setApiKeyState] = useState('')
  const [showKeySetting, setShowKeySetting] = useState(false)
  const [sedang, setSedang] = useState(false)
  const [sedangTesKey, setSedangTesKey] = useState(false)
  const [hasilTesKey, setHasilTesKey] = useState(null)
  const [pesanProses, setPesanProses] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const katalog = storage.list('katalog') || []
  const prodis = storage.list('prodis') || []

  const [modeInput, setModeInput] = useState('katalog') // 'katalog' | 'manual'
  const [katalogId, setKatalogId] = useState('')
  const [mataKuliah, setMataKuliah] = useState(initialData.mata_kuliah || '')
  const [kodeMk, setKodeMk] = useState(initialData.kode_mk || '')
  const [sks, setSks] = useState(initialData.sks || 2)
  const [prodiId, setProdiId] = useState(initialData.program_studi_id || prodis[0]?.id || '')
  const [semester, setSemester] = useState(initialData.semester || 'Genap')
  const [topikKhusus, setTopikKhusus] = useState('')
  const [silabusLama, setSilabusLama] = useState('')

  useEffect(() => {
    if (isOpen) {
      const key = getApiKey()
      setApiKeyState(key)
      if (initialData.mata_kuliah) {
        setMataKuliah(initialData.mata_kuliah)
        setModeInput('manual')
      }
      setErrorMsg('')
      setHasilTesKey(null)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handlePilihKatalog = (id) => {
    setKatalogId(id)
    const item = katalog.find((k) => k.id === id)
    if (item) {
      setMataKuliah(item.nama)
      setSemester(item.semester || 'Genap')
      const matchedProdi = prodis.find((p) => p.kode_kelas === item.kelas)
      if (matchedProdi) setProdiId(matchedProdi.id)
    }
  }

  const handleSimpanKey = (e) => {
    if (e) e.preventDefault()
    setApiKey(apiKey)
    setHasilTesKey({ ok: true, msg: 'Key berhasil disimpan di browser.' })
  }

  const handleTesKey = async () => {
    const key = apiKey.trim() || getApiKey()
    if (!key) {
      setHasilTesKey({ ok: false, msg: 'Masukkan API Key terlebih dahulu.' })
      return
    }
    setSedangTesKey(true)
    setHasilTesKey(null)
    try {
      const res = await testGeminiApiKey(key)
      if (res.ok) {
        setHasilTesKey({ ok: true, msg: '✓ API Key Gemini valid & terhubung!' })
        setApiKey(key)
      } else {
        setHasilTesKey({ ok: false, msg: `Gagal: ${res.error}. (Tip: Buat key gratis yang diawali "AIzaSy..." di Google AI Studio).` })
      }
    } finally {
      setSedangTesKey(false)
    }
  }

  const handleGenerate = async () => {
    if (!mataKuliah.trim()) {
      setErrorMsg('Pilih atau ketik nama mata kuliah terlebih dahulu.')
      return
    }

    setSedang(true)
    setErrorMsg('')
    setPesanProses('1/3 Menganalisis capaian & deskripsi mata kuliah…')

    const timer1 = setTimeout(() => setPesanProses('2/3 Menyusun struktur RKPBM 16 minggu & UTS/UAS…'), 600)
    const timer2 = setTimeout(() => setPesanProses('3/3 Memetakan referensi buku & proporsi penilaian…'), 1200)

    try {
      const prodiObj = prodis.find((p) => p.id === prodiId) || prodis[0] || {}
      const key = apiKey.trim() || getApiKey()

      const result = await generateFullRpsWithAi({
        mataKuliah: mataKuliah.trim(),
        kodeMk: kodeMk.trim(),
        sks: Number(sks) || 2,
        prodiNama: prodiObj.nama_prodi || 'Sarjana Terapan Teknik Mesin',
        semester,
        topikKhusus: topikKhusus.trim(),
        silabusLama: silabusLama.trim(),
        apiKey: key,
      })

      clearTimeout(timer1)
      clearTimeout(timer2)

      onApply(result, {
        mata_kuliah: mataKuliah.trim(),
        kode_mk: kodeMk.trim(),
        sks: Number(sks) || 2,
        program_studi_id: prodiId,
        semester,
      })

      onClose()
    } catch (err) {
      clearTimeout(timer1)
      clearTimeout(timer2)
      console.error(err)
      setErrorMsg(err.message || 'Gagal memproses data. Silakan coba lagi.')
    } finally {
      setSedang(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              ✨
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-950">AI Smart RPS Generator</h2>
              <p className="text-xs text-slate-500">Susun 16 minggu RKPBM dan formulir RPS otomatis via Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={sedang}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* API Key Banner / Settings */}
        <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${apiKey || getApiKey() ? 'bg-green-500' : 'bg-amber-500'}`} />
              <span className="font-medium text-slate-700">
                {apiKey || getApiKey() ? 'Google Gemini API: Disetel' : 'Google Gemini API: Belum Disetel (Otomatis Mode Generator)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowKeySetting((v) => !v)}
              className="font-semibold text-blue-900 hover:underline"
            >
              {showKeySetting ? 'Sembunyikan' : '⚙ Pengaturan Key'}
            </button>
          </div>

          {showKeySetting && (
            <div className="mt-3 border-t border-blue-100 pt-2">
              <p className="mb-2 text-slate-600">
                Gunakan API Key dari{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-blue-700 underline hover:text-blue-900"
                >
                  Google AI Studio ↗
                </a>{' '}
                (pilih <i>Create API key in new project</i>, diawali <code>AIzaSy...</code>).
              </p>
              <div className="flex flex-wrap gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKeyState(e.target.value)
                    setHasilTesKey(null)
                  }}
                  placeholder="Paste Gemini API Key (AIzaSy…)"
                  className="min-w-48 flex-1 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
                <Btn variant="ghost" className="whitespace-nowrap text-xs" onClick={handleTesKey} disabled={sedangTesKey}>
                  {sedangTesKey ? 'Mengecek…' : '🧪 Tes Key'}
                </Btn>
                <Btn variant="primary" className="whitespace-nowrap text-xs" onClick={handleSimpanKey}>
                  Simpan
                </Btn>
              </div>

              {hasilTesKey && (
                <p className={`mt-2 font-medium ${hasilTesKey.ok ? 'text-green-700' : 'text-red-600'}`}>
                  {hasilTesKey.msg}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <b>Peringatan:</b> {errorMsg}
          </div>
        )}

        {/* Form Inputs */}
        <div className="space-y-3">
          {/* Mode Pemilihan */}
          <div className="flex gap-2 rounded-lg bg-slate-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => setModeInput('katalog')}
              className={`flex-1 rounded-md py-1.5 font-medium transition ${
                modeInput === 'katalog' ? 'bg-white font-semibold text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pilih dari Katalog MK
            </button>
            <button
              type="button"
              onClick={() => setModeInput('manual')}
              className={`flex-1 rounded-md py-1.5 font-medium transition ${
                modeInput === 'manual' ? 'bg-white font-semibold text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ketik Manual / Kustom
            </button>
          </div>

          {modeInput === 'katalog' ? (
            <Field label="Pilih Mata Kuliah dari Katalog">
              <Select value={katalogId} onChange={(e) => handlePilihKatalog(e.target.value)}>
                <option value="">-- Pilih Mata Kuliah --</option>
                {katalog.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama} ({k.kelas} • Semester {k.semester})
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <Field label="Nama Mata Kuliah" className="col-span-2">
                <Input
                  value={mataKuliah}
                  onChange={(e) => setMataKuliah(e.target.value)}
                  placeholder="Contoh: Elemen Mesin 1"
                />
              </Field>
              <Field label="Kode MK (opsional)">
                <Input
                  value={kodeMk}
                  onChange={(e) => setKodeMk(e.target.value)}
                  placeholder="KBPP 2152"
                />
              </Field>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Program Studi">
              <Select value={prodiId} onChange={(e) => setProdiId(e.target.value)}>
                {prodis.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_prodi}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Bobot SKS">
              <Select value={sks} onChange={(e) => setSks(e.target.value)}>
                <option value={1}>1 SKS</option>
                <option value={2}>2 SKS (Standar)</option>
                <option value={3}>3 SKS</option>
                <option value={4}>4 SKS (Bengkel/Praktik)</option>
              </Select>
            </Field>
          </div>

          <Field label="Fokus Topik Khusus (Opsional)">
            <Input
              value={topikKhusus}
              onChange={(e) => setTopikKhusus(e.target.value)}
              placeholder="Misal: fokus pada tegangan, sambungan las, dan transmisi daya"
            />
          </Field>

          <Field
            label={
              <div className="flex items-center justify-between">
                <span>Catatan / Silabus Acuan (Opsional)</span>
                <label className="cursor-pointer font-semibold text-blue-700 hover:text-blue-900">
                  📁 Unggah File (.docx / .txt)
                  <input
                    type="file"
                    accept=".docx,.txt"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        if (file.name.endsWith('.txt')) {
                          const text = await file.text()
                          setSilabusLama(text.slice(0, 5000))
                        } else if (file.name.endsWith('.docx')) {
                          const buf = await file.arrayBuffer()
                          const zip = new PizZip(buf)
                          const xml = zip.file('word/document.xml')?.asText() || ''
                          const matches = xml.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || []
                          const extracted = matches
                            .map((m) => m.replace(/<[^>]+>/g, ''))
                            .join(' ')
                            .replace(/\s+/g, ' ')
                            .trim()
                          setSilabusLama(extracted.slice(0, 5000))
                        }
                      } catch (err) {
                        alert('Gagal membaca file: ' + err.message)
                      }
                    }}
                  />
                </label>
              </div>
            }
          >
            <Textarea
              value={silabusLama}
              onChange={(e) => setSilabusLama(e.target.value)}
              placeholder="Ketik, tempel, atau unggah file silabus/dokumen materi lama di sini..."
              className="min-h-18 text-xs"
            />
          </Field>
        </div>

        {/* Loading Indicator */}
        {sedang && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-center gap-2.5">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
              <p className="text-xs font-semibold text-amber-900">{pesanProses}</p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <Btn variant="ghost" onClick={onClose} disabled={sedang}>
            Batal
          </Btn>
          <Btn variant="accent" onClick={handleGenerate} disabled={sedang || !mataKuliah.trim()}>
            {sedang ? 'Menyusun Otomatis…' : '✨ Mulai Susun dengan AI'}
          </Btn>
        </div>
      </div>
    </div>
  )
}

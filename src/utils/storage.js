// SEMUA baca/tulis data RPKPS lewat file ini.
// Data disimpan PER-AKUN di Supabase (tabel `rps_stores`, satu baris jsonb per dosen)
// sehingga tiap dosen hanya melihat RPKPS miliknya sendiri. Cache di localStorage
// agar cepat & tetap jalan offline. API tetap sinkron: data di-hydrate ke memori
// saat login, semua fungsi baca/tulis memori, penyimpanan ke server otomatis (debounce).
import { seedData } from '../data/seedData.js'
import { toRomawi } from './formatters.js'
import { supabase } from './supabase.js'

// MODE PERSONAL + SINKRON CLOUD (tanpa login): satu "kotak" data bersama di
// Supabase (owner tetap `personal`), cache di localStorage agar cepat & jalan
// offline. Buka di browser/perangkat mana pun → data yang sama muncul.
// ponytail: RLS terbuka untuk anon → siapa pun yang tahu URL + anon key bisa
// membaca/mengubah data ini. Cukup untuk pemakaian pribadi; ganti ke Supabase
// Auth + RLS per-akun saat pindah ke multi-user.
const OWNER = 'personal'
const CACHE_KEY = 'merps-data-local'
let state = null

export function uid() {
  return crypto.randomUUID()
}

// Muat data ke memori (dipanggil sekali sebelum halaman dirender).
export async function hydrate() {
  try {
    const { data } = await supabase.from('rps_stores').select('data').eq('owner_id', OWNER).single()
    if (data?.data) {
      state = data.data
      localStorage.setItem(CACHE_KEY, JSON.stringify(state))
      return
    }
  } catch { /* offline / baris belum ada → pakai cache atau seed */ }
  const raw = localStorage.getItem(CACHE_KEY)
  state = raw ? JSON.parse(raw) : seedData()
  persist() // simpan seed awal ke server
}

export function reset() {
  state = null
  pendingSave = false
  clearTimeout(saveTimer)
}

function load() {
  return state
}

let saveTimer = null
let pendingSave = false // true = tersimpan lokal tapi belum tersinkron ke server

function persist() {
  if (!state) return
  localStorage.setItem(CACHE_KEY, JSON.stringify(state)) // cadangan instan
  pendingSave = true
  clearTimeout(saveTimer)
  saveTimer = setTimeout(pushNow, 600)
}

function pushNow() {
  clearTimeout(saveTimer)
  if (!state) { pendingSave = false; return Promise.resolve() }
  return supabase
    .from('rps_stores')
    .upsert({ owner_id: OWNER, data: state, updated_at: new Date().toISOString() })
    .then(({ error }) => { if (!error) pendingSave = false }, () => {})
}

// Paksa sinkron ke server sekarang (dipakai sebelum menutup tab).
export function flush() {
  return pushNow()
}

// Ada perubahan yang belum tersinkron ke server?
export function hasPendingSave() {
  return pendingSave
}

// ---- CRUD generik koleksi master: 'katalog' | 'dosens' | 'prodis' | 'pustakas' ----
export function list(coll) {
  return load()[coll]
}

export function add(coll, item) {
  const data = load()
  const it = { id: uid(), ...item }
  data[coll].push(it)
  persist()
  return it
}

export function update(coll, id, patch) {
  const data = load()
  const i = data[coll].findIndex((x) => x.id === id)
  if (i < 0) return null
  data[coll][i] = { ...data[coll][i], ...patch }
  persist()
  return data[coll][i]
}

export function remove(coll, id) {
  const data = load()
  data[coll] = data[coll].filter((x) => x.id !== id)
  persist()
}

// ---- RPKPS ----
export function listRpkps() {
  return load().rpkpsList
}

export function getRpkps(id) {
  return load().rpkpsList.find((r) => r.id === id) || null
}

export function saveRpkps(rpkps) {
  const data = load()
  const stamped = { ...rpkps, diperbarui: new Date().toISOString() }
  const i = data.rpkpsList.findIndex((r) => r.id === stamped.id)
  if (i >= 0) data.rpkpsList[i] = stamped
  else data.rpkpsList.push(stamped)
  persist()
}

export function deleteRpkps(id) {
  const data = load()
  data.rpkpsList = data.rpkpsList.filter((r) => r.id !== id)
  persist()
}

export function duplicateRpkps(id) {
  const src = getRpkps(id)
  if (!src) return null
  const copy = JSON.parse(JSON.stringify(src))
  copy.id = uid()
  copy.mata_kuliah = `${src.mata_kuliah} (Salinan)`
  copy.status = 'draf'
  saveRpkps(copy)
  return copy
}

// ---- Objek RPKPS baru ----
export function emptyRkpbm(ke) {
  return {
    minggu_ke: toRomawi(ke),
    tujuan_khusus: '',
    pokok_bahasan: '',
    metoda_media: '',
    evaluasi_waktu: '',
    buku_sumber: '',
  }
}

export function newRpkps() {
  return {
    id: uid(),
    mata_kuliah: '',
    kode_mk: '',
    sks: 0,
    jam_per_minggu: 0,
    semester: 'Ganjil',
    semester_angka: '',
    semester_kelas: '',
    kelas: '',
    program_studi_id: '',
    prasyarat: '',
    perkiraan_peserta: '',
    deskripsi_singkat: '',
    tujuan_umum: '',
    tujuan_khusus: [''],
    jam: {
      perkuliahan_jam: 0, perkuliahan_minggu: 0,
      latihan_jam: 0, latihan_minggu: 0,
      praktikum_jam: 0, praktikum_minggu: 0,
      ujian_jam: 0,
    },
    pustaka_utama_ids: [],
    pustaka_pendukung_ids: [],
    penilaian: {
      uts: 0, uas: 0, nkp: 0, nkpr: 0,
      hasil_belajar_harian: { sikap: '', latihan_kuis: '', tugas: '' },
      etika: { kerapian: 0, kerja_sama: 0, kedisiplinan: 0, ketelitian: 0 },
    },
    rkpbm: Array.from({ length: 16 }, (_, i) => emptyRkpbm(i + 1)),
    pengesahan: { dosen_pengampu_ids: [], ka_prodi_id: '', ketua_jurusan_id: '', kota: 'Bengkalis', tanggal: '' },
    status: 'draf',
  }
}

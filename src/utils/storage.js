// SEMUA baca/tulis data RPKPS lewat file ini.
// Data disimpan PER-AKUN di Supabase (tabel `rps_stores`, satu baris jsonb per dosen)
// sehingga tiap dosen hanya melihat RPKPS miliknya sendiri. Cache di localStorage
// agar cepat & tetap jalan offline. API tetap sinkron: data di-hydrate ke memori
// saat login, semua fungsi baca/tulis memori, penyimpanan ke server otomatis (debounce).
import { seedData } from '../data/seedData.js'
import { toRomawi } from './formatters.js'
import { supabase } from './supabase.js'

let state = null // data akun aktif di memori
let ownerId = null
const cacheKey = (id) => `merps-data-${id}`

export function uid() {
  return crypto.randomUUID()
}

// Muat data akun (dipanggil sekali setelah login, sebelum halaman dirender).
export async function hydrate(id) {
  ownerId = id
  try {
    const { data } = await supabase.from('rps_stores').select('data').eq('owner_id', id).single()
    if (data?.data) {
      state = data.data
      localStorage.setItem(cacheKey(id), JSON.stringify(state))
      return
    }
  } catch { /* offline / baris belum ada → pakai cache atau seed */ }
  const raw = localStorage.getItem(cacheKey(id))
  state = raw ? JSON.parse(raw) : seedData()
  persist() // simpan seed awal ke server untuk akun baru
}

export function reset() {
  state = null
  ownerId = null
  pendingSave = false
  clearTimeout(saveTimer)
}

function load() {
  return state
}

// ponytail: tulis debounce & fire-and-forget (satu editor per akun, tak ada
// penanganan konflik). Tambah optimistic-lock kalau nanti 1 akun diedit di banyak
// perangkat bersamaan.
let saveTimer = null
let pendingSave = false // true = sudah tersimpan lokal tapi belum tersinkron ke server

function persist() {
  if (!ownerId || !state) return
  localStorage.setItem(cacheKey(ownerId), JSON.stringify(state)) // cadangan instan, tak hilang
  pendingSave = true
  clearTimeout(saveTimer)
  saveTimer = setTimeout(pushNow, 600)
}

function pushNow() {
  clearTimeout(saveTimer)
  if (!ownerId || !state) { pendingSave = false; return Promise.resolve() }
  return supabase
    .from('rps_stores')
    .upsert({ owner_id: ownerId, data: state, updated_at: new Date().toISOString() })
    .then(({ error }) => { if (!error) pendingSave = false }, () => {})
}

// Paksa sinkron ke server sekarang (dipakai sebelum keluar/tutup tab).
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

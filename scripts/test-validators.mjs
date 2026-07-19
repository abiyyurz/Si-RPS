// Cek cepat logika validasi RPKPS: node scripts/test-validators.mjs
import assert from 'assert'
import { validateRpkps, isReady, totalPenilaian } from '../src/utils/validators.js'
import { seedData } from '../src/data/seedData.js'

const rpkps = seedData().rpkpsList[0]

// RPKPS contoh harus valid
assert.strictEqual(totalPenilaian(rpkps), 100)
assert.deepStrictEqual(validateRpkps(rpkps), [], 'RPKPS contoh seharusnya lolos semua validasi')
assert.ok(isReady(rpkps))

// Total penilaian salah → error
const rusak1 = structuredClone(rpkps)
rusak1.penilaian.uts = 10
assert.ok(validateRpkps(rusak1).some((e) => e.includes('kontrak penilaian')), 'total penilaian ≠ 100 harus ditolak')

// Tujuan khusus kosong → error
const rusak2 = structuredClone(rpkps)
rusak2.tujuan_khusus = ['']
assert.ok(validateRpkps(rusak2).some((e) => e.includes('Tujuan Pembelajaran Khusus')), 'tujuan khusus kosong harus ditolak')

// Buku utama kosong → error
const rusak3 = structuredClone(rpkps)
rusak3.pustaka_utama_ids = []
assert.ok(validateRpkps(rusak3).some((e) => e.includes('buku bacaan utama')), 'tanpa buku utama harus ditolak')

// RKPBM minggu non-ujian kosong → error
const rusak4 = structuredClone(rpkps)
rusak4.rkpbm[0].tujuan_khusus = ''
assert.ok(validateRpkps(rusak4).some((e) => e.includes('RKPBM minggu 1')), 'RKPBM kosong harus ditolak')

// Ketua jurusan belum dipilih → error
const rusak5 = structuredClone(rpkps)
rusak5.pengesahan.ketua_jurusan_id = ''
assert.ok(validateRpkps(rusak5).some((e) => e.includes('Ketua Jurusan')), 'tanpa ketua jurusan harus ditolak')

// SKS 0 → error
const rusak6 = structuredClone(rpkps)
rusak6.sks = 0
assert.ok(validateRpkps(rusak6).some((e) => e.includes('SKS')), 'SKS 0 harus ditolak')

console.log('Semua tes validator RPKPS lolos ✓')

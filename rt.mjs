import fs from 'fs'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'

const buf = fs.readFileSync('src/assets/template-merps.docx')
const zip = new PizZip(buf)
const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })

const rkpbm = Array.from({length:16}, (_,i)=>{
  const ke=i+1, ujian = ke===8||ke===16
  return { minggu:['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI'][i],
    ujian, label: ke===8?'UJIAN TENGAH SEMESTER (UTS)':ke===16?'UJIAN AKHIR SEMESTER (UAS)':'',
    tujuan:`Tujuan minggu ${ke}`, pokok:`Pokok ${ke}`, metoda:'Ceramah & Diskusi',
    evaluasi:'4 x 50’', buku:'Holman Bab '+ke }
})
const data = {
  mata_kuliah:'Perpindahan Kalor', mata_kuliah_upper:'PERPINDAHAN KALOR',
  kode_mk:'KBPP 2152', sks:'2', jam_per_minggu:'4', semester_kelas:'VI (Kelas 3A)',
  prasyarat:'Termodinamika', perkiraan_peserta:'30 Orang',
  deskripsi_singkat:'Deskripsi singkat mata kuliah ini.', tujuan_umum:'Tujuan umum pembelajaran.',
  tujuan_khusus:[{teks:'Tujuan khusus 1'},{teks:'Tujuan khusus 2'},{teks:'Tujuan khusus 3'}],
  perkuliahan_jam:'36', perkuliahan_minggu:'9', latihan_jam:'8', latihan_minggu:'2',
  praktikum_jam:'12', praktikum_minggu:'3', ujian_jam:'4', total_jam:'60',
  buku_utama:[{teks:'Holman, J.P. 1997. Perpindahan Kalor.'},{teks:'Buku utama kedua.'}],
  buku_pendukung:[{teks:'Mahmudi, Ali. 2005. Modul.'}],
  uts:'30', uas:'40', nkp:'20', nkpr:'10',
  hbh_sikap:'10', hbh_latihan_kuis:'5', hbh_tugas:'5',
  etika_kerapian:'2,5', etika_kerja_sama:'2,5', etika_kedisiplinan:'2,5', etika_ketelitian:'2,5',
  rkpbm, kota:'Bengkalis', tanggal:'17 Juli 2026',
  dosen_utama_nama:'Syahrizal, ST., MT.', dosen_utama_nomor:'NIP. 197310142021211005',
  ka_prodi_nama:'Bambang DH, ST., MT.', ka_prodi_nomor:'NIP. 197801302021211004',
  ketua_jurusan_nama:'Ibnu Hajar, ST., MT.', ketua_jurusan_nomor:'NIP. 197108102021211001',
}
try {
  doc.render(data)
} catch(e){
  console.log('RENDER ERROR:', JSON.stringify(e.properties?.errors?.map(x=>x.properties)||e.message,null,2))
  process.exit(1)
}
const out = doc.getZip().generate({type:'nodebuffer'})
fs.writeFileSync('/tmp/rendered.docx', out)

// ekstrak teks
const rzip = new PizZip(out)
const xml = rzip.file('word/document.xml').asText()
const text = xml.replace(/<w:p\b[^>]*>/g,'\n').replace(/<[^>]+>/g,'')
  .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
const leftover = [...xml.matchAll(/\{[#/^]?[a-z_]+\}/g)].map(m=>m[0])
console.log('LEFTOVER TAGS:', leftover.length? [...new Set(leftover)] : 'NONE')
const checks = {
  'mata_kuliah_upper':/PERPINDAHAN KALOR/, 'kode':/KBPP 2152/, 'UTS label':/UJIAN TENGAH SEMESTER \(UTS\)/,
  'UAS label':/UJIAN AKHIR SEMESTER \(UAS\)/, 'minggu XVI':/XVI/, 'tujuan khusus 3':/Tujuan khusus 3/,
  'buku pendukung':/Mahmudi/, 'dosen nomor':/197310142021211005/, 'total jam':/60 Jam/,
  'tujuan minggu 7':/Tujuan minggu 7/, 'nkp':/20 %/,
}
for(const [k,re_] of Object.entries(checks)) console.log((re_.test(text)?'  OK  ':'  MISS'), k)
// hitung baris tabel rkpbm hasil render
const rkTbl = xml.split('<w:tbl>').find(b=>b.includes('Minggu Ke'))
const nrows = (rkTbl.match(/<w:tr\b/g)||[]).length
console.log('RKPBM rendered rows (incl header):', nrows, '(harusnya 17: 1 header + 16 minggu)')

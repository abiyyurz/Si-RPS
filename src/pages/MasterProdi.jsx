import Crud from '../components/common/Crud.jsx'

export default function MasterProdi() {
  return (
    <div className="space-y-6">
      <Crud
        title="Program Studi / Kelas"
        coll="prodis"
        fields={[
          { key: 'kode_kelas', label: 'Kode kelas (mis. D3TM)' },
          { key: 'nama_prodi', label: 'Nama program studi' },
          { key: 'jurusan', label: 'Jurusan', default: 'Teknik Mesin' },
          { key: 'institusi', label: 'Institusi', default: 'Politeknik Negeri Bengkalis' },
        ]}
      />
      <Crud
        title="Master Pustaka / Buku Bacaan"
        coll="pustakas"
        fields={[
          { key: 'jenis', label: 'Jenis', type: 'select', options: ['utama', 'pendukung'] },
          { key: 'penulis', label: 'Penulis' },
          { key: 'tahun', label: 'Tahun' },
          { key: 'judul', label: 'Judul' },
          { key: 'penerbit', label: 'Penerbit' },
        ]}
      />
    </div>
  )
}

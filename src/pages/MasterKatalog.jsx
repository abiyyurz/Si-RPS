import Crud from '../components/common/Crud.jsx'
import * as storage from '../utils/storage.js'

export default function MasterKatalog() {
  const kelasOpsi = storage.list('prodis').map((p) => p.kode_kelas)
  return (
    <Crud
      title="Katalog Mata Kuliah"
      coll="katalog"
      fields={[
        { key: 'nama', label: 'Nama mata kuliah' },
        { key: 'kelas', label: 'Kelas / Prodi', type: 'select', options: kelasOpsi },
        { key: 'semester', label: 'Semester', type: 'select', options: ['Ganjil', 'Genap'] },
      ]}
    />
  )
}

import Crud from '../components/common/Crud.jsx'

export default function MasterDosen() {
  return (
    <Crud
      title="Master Dosen"
      coll="dosens"
      fields={[
        { key: 'nama', label: 'Nama lengkap + gelar' },
        { key: 'jenis_nomor', label: 'Jenis nomor induk', type: 'select', options: ['NP', 'NIP', 'NIPPPK'] },
        { key: 'nomor_induk', label: 'Nomor induk' },
        { key: 'peran', label: 'Peran', type: 'select', options: ['pengampu', 'koordinator prodi', 'ketua jurusan'] },
      ]}
    />
  )
}

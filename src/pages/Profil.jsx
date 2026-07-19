// Ubah nama & password akun sendiri.
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Btn, Card, Field, Input } from '../components/common/ui.jsx'

function Pesan({ ok, err }) {
  if (err) return <p className="rounded bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">{err}</p>
  if (ok) return <p className="rounded bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">{ok}</p>
  return null
}

export default function Profil() {
  const { currentUser, updateProfile, changePassword } = useAuth()

  const [firstName, setFirstName] = useState(currentUser?.first_name || '')
  const [lastName, setLastName] = useState(currentUser?.last_name || '')
  const [nameOk, setNameOk] = useState(''); const [nameErr, setNameErr] = useState(''); const [savingName, setSavingName] = useState(false)

  const [oldPass, setOldPass] = useState(''); const [newPass, setNewPass] = useState(''); const [confPass, setConfPass] = useState('')
  const [passOk, setPassOk] = useState(''); const [passErr, setPassErr] = useState(''); const [savingPass, setSavingPass] = useState(false)

  const simpanNama = async (e) => {
    e.preventDefault(); setNameOk(''); setNameErr(''); setSavingName(true)
    try {
      if (!firstName.trim() && !lastName.trim()) throw new Error('Nama tidak boleh kosong.')
      await updateProfile({ first_name: firstName.trim(), last_name: lastName.trim() })
      setNameOk('Nama berhasil diperbarui.')
    } catch (err) { setNameErr(err.message) } finally { setSavingName(false) }
  }

  const gantiPassword = async (e) => {
    e.preventDefault(); setPassOk(''); setPassErr(''); setSavingPass(true)
    try {
      if (newPass.length < 8) throw new Error('Password baru minimal 8 karakter.')
      if (newPass !== confPass) throw new Error('Konfirmasi password tidak cocok.')
      await changePassword(oldPass, newPass)
      setPassOk('Password berhasil diganti.')
      setOldPass(''); setNewPass(''); setConfPass('')
    } catch (err) { setPassErr(err.message) } finally { setSavingPass(false) }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card title="Profil Akun">
        <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
          <div><span className="text-slate-500">Username:</span> <span className="font-medium">{currentUser?.username}</span></div>
          <div><span className="text-slate-500">Email:</span> <span className="font-medium">{currentUser?.email || '(belum diisi)'}</span></div>
        </div>
      </Card>

      <Card title="Ubah Nama">
        <form onSubmit={simpanNama} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nama Depan"><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Field>
            <Field label="Nama Belakang"><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></Field>
          </div>
          <Pesan ok={nameOk} err={nameErr} />
          <Btn type="submit" disabled={savingName}>{savingName ? 'Menyimpan…' : 'Simpan Nama'}</Btn>
        </form>
      </Card>

      <Card title="Ganti Password">
        <form onSubmit={gantiPassword} className="space-y-3">
          <Field label="Password Lama"><Input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} required /></Field>
          <Field label="Password Baru (minimal 8 karakter)"><Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required minLength={8} /></Field>
          <Field label="Ulangi Password Baru"><Input type="password" value={confPass} onChange={(e) => setConfPass(e.target.value)} required /></Field>
          <Pesan ok={passOk} err={passErr} />
          <Btn type="submit" disabled={savingPass}>{savingPass ? 'Menyimpan…' : 'Ganti Password'}</Btn>
        </form>
      </Card>
    </div>
  )
}

// Halaman masuk / daftar / lupa password. Tiap dosen punya akun & data RPKPS sendiri.
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import gedung from '../assets/gedung1.jpg'
import logo from '../assets/logo_polbeng.png'

// Ikon mata (inline, tanpa library) untuk toggle tampil/sembunyi password.
const EyeIcon = ({ off }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {off ? (
      <>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18 18 0 0 1-2.16 3.19M6.61 6.61A18 18 0 0 0 2 12s3 8 10 8a9 9 0 0 0 5.39-1.61" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </>
    ) : (
      <>
        <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
)

export default function Login() {
  const { loginWithCredentials, registerNewAccount, resetPasswordByEmail } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'reset'
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Login
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Register
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  // Reset
  const [resetUsername, setResetUsername] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [resetNewPassword, setResetNewPassword] = useState('')

  const switchMode = (next) => { setMode(next); setError(''); setSuccess('') }

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setSubmitting(true)
    try {
      await loginWithCredentials(username, password, rememberMe)
    } catch (err) {
      setError(err.message || 'Gagal masuk. Periksa kembali username dan password.')
    } finally { setSubmitting(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault(); setError(''); setSubmitting(true)
    try {
      if (!firstName.trim() || !lastName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
        throw new Error('Semua field pendaftaran wajib diisi.')
      }
      if (regPassword.length < 8) throw new Error('Password minimal 8 karakter.')
      await registerNewAccount({
        first_name: firstName, last_name: lastName,
        username: regUsername, email: regEmail, password: regPassword,
      })
      setSuccess(`Akun "${regUsername}" berhasil dibuat. Silakan masuk.`)
      setUsername(regUsername); setPassword('')
      setMode('login')
      setFirstName(''); setLastName(''); setRegUsername(''); setRegEmail(''); setRegPassword('')
    } catch (err) { setError(err.message) } finally { setSubmitting(false) }
  }

  const handleReset = async (e) => {
    e.preventDefault(); setError(''); setSubmitting(true)
    try {
      if (!resetUsername.trim() || !resetEmail.trim() || !resetNewPassword.trim()) {
        throw new Error('Semua field wajib diisi.')
      }
      if (resetNewPassword.length < 8) throw new Error('Password baru minimal 8 karakter.')
      await resetPasswordByEmail({ username: resetUsername, email: resetEmail, newPassword: resetNewPassword })
      setSuccess('Password berhasil diubah. Silakan masuk dengan password baru Anda.')
      setUsername(resetUsername); setPassword('')
      setMode('login')
      setResetUsername(''); setResetEmail(''); setResetNewPassword('')
    } catch (err) { setError(err.message) } finally { setSubmitting(false) }
  }

  const field = 'w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Foto gedung */}
        <div className="hidden lg:block lg:col-span-6">
          <div className="relative h-full min-h-[480px] rounded-3xl overflow-hidden shadow-2xl">
            <img src={gedung} alt="Politeknik Negeri Bengkalis" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 space-y-1">
              <h1 className="text-4xl font-black text-white leading-tight tracking-tight">Si-RPS</h1>
              <p className="text-slate-100 text-sm font-semibold">Sistem Informasi Rencana Pembelajaran Semester</p>
              <p className="text-slate-300 text-xs">Politeknik Negeri Bengkalis</p>
            </div>
          </div>
        </div>

        {/* Kartu login / daftar */}
        <div className="lg:col-span-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xl space-y-6">

            <div className="flex flex-col items-center gap-2">
              <img src={logo} alt="Logo Politeknik Negeri Bengkalis" className="w-16 h-16 object-contain" />
            </div>

            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button type="button" onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${mode !== 'register' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                Masuk Akun
              </button>
              <button type="button" onClick={() => switchMode('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${mode === 'register' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                Daftar Akun Baru
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {mode === 'register' ? 'Registrasi Dosen Baru' : mode === 'reset' ? 'Reset Password' : 'Masuk ke Aplikasi Si-RPS'}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'register'
                  ? 'Isi nama, username, email, dan password untuk mendaftar akun.'
                  : mode === 'reset'
                  ? 'Masukkan username dan email terdaftar, lalu buat password baru.'
                  : 'Gunakan username dan password Anda untuk masuk.'}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{error}</div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-medium">{success}</div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className={field} placeholder="username akun Anda" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className={field + ' pr-10'} placeholder="password" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <EyeIcon off={showPassword} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-600 select-none">
                      <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-900" />
                      <span>Ingat saya</span>
                    </label>
                    <button type="button" onClick={() => switchMode('reset')} className="text-[11px] font-bold text-blue-900 hover:underline">Lupa kata sandi?</button>
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm transition-all shadow-md disabled:opacity-60">
                  {submitting ? 'Memproses…' : 'Masuk Aplikasi'}
                </button>
              </form>
            ) : mode === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Depan *</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={field} placeholder="Budi" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Belakang *</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={field} placeholder="Santoso" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username Unik *</label>
                  <input type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required className={field} placeholder="budi_santoso" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                  <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required className={field} placeholder="nama@email.com" />
                  <p className="text-[10px] text-slate-400 mt-1">Dipakai untuk reset password jika Anda lupa kata sandi.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password * <span className="font-normal text-slate-400">(minimal 8 karakter)</span></label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={8} className={field + ' pr-10'} placeholder="password" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <EyeIcon off={showPassword} />
                    </button>
                  </div>
                  {regPassword.length > 0 && regPassword.length < 8 && (
                    <p className="text-[10px] text-rose-600 font-semibold mt-1">Password kurang dari 8 karakter ({regPassword.length}/8)</p>
                  )}
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-blue-950 font-bold text-sm transition-all shadow-md disabled:opacity-60">
                  {submitting ? 'Memproses…' : 'Daftarkan Akun'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                  <input type="text" value={resetUsername} onChange={(e) => setResetUsername(e.target.value)} required className={field} placeholder="username akun Anda" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Terdaftar *</label>
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required className={field} placeholder="email saat mendaftar" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password Baru * <span className="font-normal text-slate-400">(minimal 8 karakter)</span></label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)} required minLength={8} className={field + ' pr-10'} placeholder="password baru" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <EyeIcon off={showPassword} />
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-blue-950 font-bold text-sm transition-all shadow-md disabled:opacity-60">
                  {submitting ? 'Memproses…' : 'Reset Password Sekarang'}
                </button>
                <button type="button" onClick={() => switchMode('login')} className="w-full text-[11px] font-bold text-slate-500 hover:text-slate-800 py-1">
                  Kembali ke halaman masuk
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}

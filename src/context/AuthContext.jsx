// Login, sesi, registrasi, dan lupa-password. Akun disimpan di tabel Supabase `users`.
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase.js'
import { verifyPassword, isHashed } from '../utils/password.js'
import { getUserByUsername, getUserById, registerUser, setUserPassword, updateUser } from '../utils/auth.js'

const AuthContext = createContext(null)
const SESSION_KEY = 'merps_auth_session'
const IDLE_LIMIT_MS = 5 * 60 * 1000 // sesi tanpa "Ingat saya" hangus jika ditinggal >5 menit

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        try {
          const s = JSON.parse(raw)
          if (!s.remember && Date.now() - (s.lastSeen || 0) > IDLE_LIMIT_MS) throw new Error('expired')
          const user = await getUserById(s.id)
          if (user && user.is_active) setCurrentUser(user)
          else localStorage.removeItem(SESSION_KEY)
        } catch {
          localStorage.removeItem(SESSION_KEY)
        }
      }
      setLoading(false)
    })()
  }, [])

  // Perbarui stempel "terakhir terlihat" untuk sesi non-"Ingat saya".
  useEffect(() => {
    if (!currentUser) return
    const touch = () => {
      try {
        const s = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}')
        if (s.remember || !s.id) return
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ...s, lastSeen: Date.now() }))
      } catch {}
    }
    touch()
    const iv = setInterval(touch, 30 * 1000)
    window.addEventListener('beforeunload', touch)
    document.addEventListener('visibilitychange', touch)
    return () => {
      clearInterval(iv)
      window.removeEventListener('beforeunload', touch)
      document.removeEventListener('visibilitychange', touch)
    }
  }, [currentUser])

  const loginWithCredentials = async (username, password, rememberMe = false) => {
    const user = await getUserByUsername(username)
    if (!user) throw new Error('Username tidak ditemukan. Silakan daftarkan akun terlebih dahulu.')
    if (!(await verifyPassword(password, user.password))) throw new Error('Password yang Anda masukkan salah.')
    if (!user.is_active) throw new Error('Akun ini telah dinonaktifkan oleh administrator.')
    if (user.password && !isHashed(user.password)) await setUserPassword(user.id, password)
    setCurrentUser(user)
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, remember: !!rememberMe, lastSeen: Date.now() }))
    return user
  }

  const registerNewAccount = async ({ first_name, last_name, username, email, password }) => {
    if ((password || '').length < 8) throw new Error('Password minimal 8 karakter.')
    return registerUser({ first_name, last_name, username, email, password })
  }

  const resetPasswordByEmail = async ({ username, email, newPassword }) => {
    if ((newPassword || '').length < 8) throw new Error('Password baru minimal 8 karakter.')
    const user = await getUserByUsername(username)
    if (!user) throw new Error('Username tidak ditemukan.')
    if (!user.email || user.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
      throw new Error('Email tidak cocok dengan email yang terdaftar pada akun ini.')
    }
    if (!user.is_active) throw new Error('Akun ini telah dinonaktifkan oleh administrator.')
    await setUserPassword(user.id, newPassword)
    return user
  }

  const updateProfile = async ({ first_name, last_name }) => {
    if (!currentUser) throw new Error('Tidak ada sesi aktif.')
    const name = `${first_name || ''} ${last_name || ''}`.trim() || currentUser.username
    await updateUser(currentUser.id, { first_name, last_name, name })
    setCurrentUser({ ...currentUser, first_name, last_name, name })
  }

  const changePassword = async (oldPassword, newPassword) => {
    if (!currentUser) throw new Error('Tidak ada sesi aktif.')
    if ((newPassword || '').length < 8) throw new Error('Password baru minimal 8 karakter.')
    if (!(await verifyPassword(oldPassword, currentUser.password))) {
      throw new Error('Password lama yang Anda masukkan salah.')
    }
    const hash = await setUserPassword(currentUser.id, newPassword)
    setCurrentUser({ ...currentUser, password: hash })
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, loading, loginWithCredentials, registerNewAccount, resetPasswordByEmail, updateProfile, changePassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}

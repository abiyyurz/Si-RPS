// Akun & login lewat tabel Supabase `users` (project Supabase TERPISAH khusus RPS,
// tidak bercampur dengan Si-BHP). Password selalu di-hash.
import { supabase } from './supabase.js'
import { hashPassword, isHashed } from './password.js'

export async function getUserByUsername(username) {
  const { data } = await supabase
    .from('users').select('*').eq('username', username.trim().toLowerCase()).single()
  return data || null
}

export async function getUserById(id) {
  const { data } = await supabase.from('users').select('*').eq('id', id).single()
  return data || null
}

export async function registerUser({ first_name, last_name, username, email, password }) {
  const hashed = await hashPassword(password)
  const newUser = {
    id: `usr-${Date.now()}`,
    first_name,
    last_name,
    name: `${first_name || ''} ${last_name || ''}`.trim() || username,
    username: username.trim().toLowerCase(),
    email: email?.trim().toLowerCase(),
    password: hashed,
    role: 'user',
    user_type: 'dosen',
    is_active: true,
  }
  const { error } = await supabase.from('users').insert(newUser)
  if (error?.message?.includes('users_username_key')) {
    throw new Error('Username ini sudah digunakan. Silakan pilih username lain.')
  }
  if (error) throw new Error(error.message)
  return newUser
}

export async function setUserPassword(userId, newPassword) {
  const password = isHashed(newPassword) ? newPassword : await hashPassword(newPassword)
  const { error } = await supabase.from('users').update({ password }).eq('id', userId)
  if (error) throw new Error(error.message)
  return password // hash tersimpan, agar sesi lokal bisa diperbarui
}

export async function updateUser(userId, patch) {
  const { error } = await supabase.from('users').update(patch).eq('id', userId)
  if (error) throw new Error(error.message)
  return patch
}

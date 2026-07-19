// CRUD generik untuk semua halaman master (CPL, Dosen, Prodi, Pustaka).
// fields: [{ key, label, type?: 'text'|'number'|'select'|'textarea', options?, default? }]
import { useState } from 'react'
import * as storage from '../../utils/storage.js'
import { Btn, Card, Field, Input, Select, Textarea } from './ui.jsx'

export default function Crud({ title, coll, fields }) {
  const [items, setItems] = useState(() => storage.list(coll))
  const emptyForm = Object.fromEntries(fields.map((f) => [f.key, f.default ?? '']))
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)

  const refresh = () => setItems(storage.list(coll))

  const submit = (e) => {
    e.preventDefault()
    for (const f of fields) {
      if (f.type === 'number' && +form[f.key] < 0) return alert(`${f.label} tidak boleh negatif.`)
      if (!f.optional && String(form[f.key]).trim() === '') return alert(`${f.label} wajib diisi.`)
    }
    if (editId) storage.update(coll, editId, form)
    else storage.add(coll, form)
    setForm(emptyForm)
    setEditId(null)
    refresh()
  }

  const startEdit = (it) => {
    setEditId(it.id)
    setForm(Object.fromEntries(fields.map((f) => [f.key, it[f.key] ?? ''])))
  }

  const del = (it) => {
    if (!window.confirm(`Hapus data ini dari ${title}?`)) return
    storage.remove(coll, it.id)
    if (editId === it.id) { setEditId(null); setForm(emptyForm) }
    refresh()
  }

  const renderInput = (f) => {
    const val = form[f.key]
    const set = (v) => setForm((s) => ({ ...s, [f.key]: v }))
    if (f.type === 'select')
      return (
        <Select value={val} onChange={(e) => set(e.target.value)}>
          <option value="">(pilih)</option>
          {f.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </Select>
      )
    if (f.type === 'textarea') return <Textarea value={val} onChange={(e) => set(e.target.value)} />
    return <Input type={f.type || 'text'} min={f.type === 'number' ? 0 : undefined} value={val} onChange={(e) => set(e.target.value)} />
  }

  return (
    <Card title={title}>
      <form onSubmit={submit} className="mb-4 grid grid-cols-1 gap-3 rounded border border-slate-200 bg-slate-50 p-3 md:grid-cols-3">
        {fields.map((f) => (
          <Field key={f.key} label={f.label} className={f.type === 'textarea' ? 'md:col-span-3' : ''}>
            {renderInput(f)}
          </Field>
        ))}
        <div className="flex items-end gap-2 md:col-span-3">
          <Btn type="submit">{editId ? 'Simpan Perubahan' : 'Tambah'}</Btn>
          {editId && (
            <Btn type="button" variant="ghost" onClick={() => { setEditId(null); setForm(emptyForm) }}>
              Batal
            </Btn>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-slate-600">
              {fields.map((f) => (
                <th key={f.key} className="px-2 py-2 font-medium">{f.label}</th>
              ))}
              <th className="px-2 py-2 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={fields.length + 1} className="px-2 py-4 text-center text-slate-400">Belum ada data.</td></tr>
            )}
            {items.map((it) => (
              <tr key={it.id} className="border-b border-slate-100 align-top hover:bg-slate-50">
                {fields.map((f) => (
                  <td key={f.key} className="px-2 py-2">{String(it[f.key] ?? '')}</td>
                ))}
                <td className="px-2 py-2 whitespace-nowrap">
                  <Btn variant="ghost" className="mr-1" onClick={() => startEdit(it)}>Edit</Btn>
                  <Btn variant="danger" onClick={() => del(it)}>Hapus</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

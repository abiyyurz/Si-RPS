// Primitif UI berulang: tombol, field form, badge status.

export const inputCls =
  'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/40'

export function Btn({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-blue-900 text-white hover:bg-blue-800',
    accent: 'bg-amber-400 text-blue-950 hover:bg-amber-300 font-semibold',
    ghost: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50',
    danger: 'bg-white border border-red-300 text-red-700 hover:bg-red-50',
  }
  return (
    <button
      className={`rounded px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
      {...props}
    />
  )
}

export function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  )
}

export function Input(props) {
  return <input className={inputCls} {...props} />
}

export function Textarea({ className = 'min-h-20', ...props }) {
  return <textarea className={`${inputCls} ${className}`} {...props} />
}

export function Select({ children, ...props }) {
  return (
    <select className={inputCls} {...props}>
      {children}
    </select>
  )
}

export function StatusBadge({ status }) {
  const siap = status === 'siap_ekspor'
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        siap ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
      }`}
    >
      {siap ? 'Siap Ekspor' : 'Draf'}
    </span>
  )
}

export function Card({ title, children, actions }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-blue-950">{title}</h2>
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}

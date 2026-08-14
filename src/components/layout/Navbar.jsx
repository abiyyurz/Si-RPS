import logo from '../../assets/logo_polbeng.png'

const MENU = [
  ['dashboard', 'Dashboard'],
  ['katalog', 'Katalog MK'],
  ['dosen', 'Master Dosen'],
  ['prodi', 'Prodi & Pustaka'],
]

export default function Navbar({ page, go }) {
  return (
    <header className="bg-blue-950 text-white shadow">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-2">
        <button onClick={() => go('dashboard')} className="flex items-center gap-2">
          <img src={logo} alt="Logo Polbeng" className="h-9 w-9 rounded-full bg-white object-contain p-0.5" />
          <div className="text-left leading-tight">
            <div className="font-bold tracking-wide">Si-RPS</div>
            <div className="text-[10px] text-blue-200">Penyusun RPS • Teknik Mesin Polbeng</div>
          </div>
        </button>
        <nav className="ml-auto flex flex-wrap items-center gap-1">
          {MENU.map(([key, label]) => (
            <button
              key={key}
              onClick={() => go(key)}
              className={`rounded px-3 py-1.5 text-sm ${
                page === key ? 'bg-amber-400 font-semibold text-blue-950' : 'text-blue-100 hover:bg-blue-900'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

// State RPKPS yang sedang disusun di wizard + autosave ke storage tiap perubahan.
import { createContext, useContext, useEffect, useState } from 'react'
import * as storage from '../utils/storage.js'
import { isReady } from '../utils/validators.js'

const Ctx = createContext(null)

export function RpsProvider({ rpsId, children }) {
  const [rps, setRps] = useState(() => storage.getRpkps(rpsId) || storage.newRpkps())

  // Simpan otomatis; status dihitung ulang dari validator.
  useEffect(() => {
    const status = isReady(rps) ? 'siap_ekspor' : 'draf'
    storage.saveRpkps(rps.status === status ? rps : { ...rps, status })
  }, [rps])

  const patch = (obj) => setRps((r) => ({ ...r, ...obj }))

  return <Ctx.Provider value={{ rps, setRps, patch }}>{children}</Ctx.Provider>
}

export const useRps = () => useContext(Ctx)

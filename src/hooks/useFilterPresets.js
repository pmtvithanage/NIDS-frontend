import { useCallback, useState } from 'react'

const STORAGE_KEY = 'nids_alert_filter_presets'

function readPresets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writePresets(presets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
  } catch {
    // Storage unavailable (privacy mode); presets stay in memory only.
  }
}

/**
 * Saved alert-filter presets persisted to localStorage.
 * @returns {{presets: Array<{name: string, filters: object}>,
 *   savePreset: (name: string, filters: object) => void,
 *   removePreset: (name: string) => void}}
 */
export function useFilterPresets() {
  const [presets, setPresets] = useState(readPresets)

  const savePreset = useCallback((name, filters) => {
    const trimmed = String(name).trim()
    if (!trimmed) return
    setPresets((current) => {
      const next = [...current.filter((preset) => preset.name !== trimmed), { name: trimmed, filters }]
      writePresets(next)
      return next
    })
  }, [])

  const removePreset = useCallback((name) => {
    setPresets((current) => {
      const next = current.filter((preset) => preset.name !== name)
      writePresets(next)
      return next
    })
  }, [])

  return { presets, savePreset, removePreset }
}

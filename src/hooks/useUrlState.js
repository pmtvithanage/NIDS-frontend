import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

function coerce(raw, fallback) {
  if (Array.isArray(fallback)) return raw.split(',').filter(Boolean)
  if (typeof fallback === 'number') {
    const num = Number(raw)
    return Number.isNaN(num) ? fallback : num
  }
  if (typeof fallback === 'boolean') return raw === 'true'
  return raw
}

function serialize(value) {
  if (Array.isArray(value)) return value.length ? value.join(',') : null
  if (value == null || value === '') return null
  return String(value)
}

/**
 * Sync a filter object with the URL query string.
 * @param {Record<string, any>} defaults Default values (also define types).
 * @returns {[Record<string, any>, (patch: object, opts?: {replace?: boolean}) => void, () => void]}
 *   The current state, an updater, and a reset function.
 */
export function useUrlState(defaults = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultKeys = useMemo(() => Object.keys(defaults), [defaults])

  const state = useMemo(() => {
    const result = { ...defaults }
    for (const key of defaultKeys) {
      const raw = searchParams.get(key)
      if (raw == null) continue
      result[key] = coerce(raw, defaults[key])
    }
    return result
  }, [searchParams, defaults, defaultKeys])

  const setState = useCallback(
    (patch, opts = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(patch)) {
            const serialized = serialize(value)
            if (serialized == null) next.delete(key)
            else next.set(key, serialized)
          }
          return next
        },
        { replace: opts.replace ?? true },
      )
    },
    [setSearchParams],
  )

  const reset = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  return [state, setState, reset]
}

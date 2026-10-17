import { useCallback, useState } from 'react'

/**
 * Row selection state for the alerts table (a Set of alert ids).
 * @returns {{selectedIds: Set<string>, count: number,
 *   isSelected: (id: string) => boolean,
 *   toggle: (id: string, checked?: boolean) => void,
 *   setMany: (ids: string[], checked: boolean) => void,
 *   clear: () => void}}
 */
export function useAlertSelection() {
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const toggle = useCallback((id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      const on = checked ?? !next.has(id)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const setMany = useCallback((ids, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const id of ids) {
        if (checked) next.add(id)
        else next.delete(id)
      }
      return next
    })
  }, [])

  const clear = useCallback(() => setSelectedIds(new Set()), [])

  const isSelected = useCallback((id) => selectedIds.has(id), [selectedIds])

  return { selectedIds, count: selectedIds.size, isSelected, toggle, setMany, clear }
}

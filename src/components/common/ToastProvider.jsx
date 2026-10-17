import { useCallback, useMemo, useRef, useState } from 'react'

import Toast from './Toast.jsx'
import { ToastContext } from '../../hooks/useToast.js'

const DEFAULT_DURATION = 4000

/**
 * Provides the toast API and renders the notification stack.
 * @param {{children: import('react').ReactNode}} props
 */
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((item) => item.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const toast = useCallback(
    (message, options = {}) => {
      const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      setToasts((current) => [
        ...current,
        { id, message, title: options.title, variant: options.variant ?? 'info' },
      ])
      const timer = setTimeout(() => dismiss(id), options.duration ?? DEFAULT_DURATION)
      timers.current.set(id, timer)
      return id
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((item) => (
          <Toast key={item.id} toast={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider

import { createContext, useContext } from 'react'

/** React context carrying the toast API. */
export const ToastContext = createContext(null)

/**
 * Access the toast API.
 * @returns {{toast: (message: string, options?: object) => string, dismiss: (id: string) => void}}
 */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

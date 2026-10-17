import { createContext, useContext } from 'react'

/** React context carrying theme state. */
export const ThemeContext = createContext(null)

/**
 * Access the current theme and controls.
 * @returns {{theme: string, isDark: boolean, setTheme: (t: string) => void, toggleTheme: () => void}}
 */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}

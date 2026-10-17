import { useCallback, useEffect, useMemo, useState } from 'react'

import { DEFAULT_THEME, THEME, THEME_STORAGE_KEY } from '../../constants/theme.js'
import { ThemeContext } from '../../hooks/useTheme.js'

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === THEME.DARK || stored === THEME.LIGHT) return stored
  } catch {
    // localStorage unavailable; fall through to OS preference.
  }
  try {
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return THEME.LIGHT
  } catch {
    // matchMedia unavailable; fall through to default.
  }
  return DEFAULT_THEME
}

/**
 * Provides theme state, applies the `dark` class to <html> and persists choice.
 * @param {{children: import('react').ReactNode}} props
 */
function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === THEME.DARK)
    root.style.colorScheme = theme
  }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Persisting failed; keep the in-memory value.
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === THEME.DARK ? THEME.LIGHT : THEME.DARK)
  }, [theme, setTheme])

  const value = useMemo(
    () => ({ theme, isDark: theme === THEME.DARK, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider

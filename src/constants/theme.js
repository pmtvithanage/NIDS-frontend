/**
 * Theme constants.
 * @module constants/theme
 */

/** localStorage key used to persist the theme. */
export const THEME_STORAGE_KEY = 'nids_theme'

/** Available themes. */
export const THEME = Object.freeze({
  DARK: 'dark',
  LIGHT: 'light',
})

/** Theme used when nothing is stored and the OS has no preference. */
export const DEFAULT_THEME = THEME.DARK

import { useEffect } from 'react'

const TYPING_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA'])

function isTyping(el) {
  return Boolean(el) && (TYPING_TAGS.has(el.tagName) || el.isContentEditable)
}

/**
 * Global keyboard shortcuts for the alerts page.
 *
 * j/k move the focused row, Enter opens it, a acknowledges, f marks a false
 * positive, / focuses search and ? opens the shortcuts help. Typing in a form
 * field suppresses the single-letter shortcuts.
 *
 * @param {{enabled?: boolean, onMove?: (delta: number) => void, onOpen?: () => void,
 *   onAcknowledge?: () => void, onFalsePositive?: () => void, onHelp?: () => void,
 *   onFocusSearch?: () => void}} handlers
 */
export function useAlertsKeyboard(handlers) {
  const {
    enabled = true,
    onMove,
    onOpen,
    onAcknowledge,
    onFalsePositive,
    onHelp,
    onFocusSearch,
  } = handlers

  useEffect(() => {
    if (!enabled) return undefined

    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const typing = isTyping(document.activeElement)

      if (event.key === '/') {
        if (typing) return
        event.preventDefault()
        onFocusSearch?.()
        return
      }
      if (event.key === '?') {
        event.preventDefault()
        onHelp?.()
        return
      }
      if (typing) return

      switch (event.key) {
        case 'j':
          event.preventDefault()
          onMove?.(1)
          break
        case 'k':
          event.preventDefault()
          onMove?.(-1)
          break
        case 'Enter':
          event.preventDefault()
          onOpen?.()
          break
        case 'a':
          event.preventDefault()
          onAcknowledge?.()
          break
        case 'f':
          event.preventDefault()
          onFalsePositive?.()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, onMove, onOpen, onAcknowledge, onFalsePositive, onHelp, onFocusSearch])
}

import { useEffect } from 'react'

/**
 * Closes a popup when the user clicks outside, presses Escape, scrolls, or
 * resizes the window. Used by every dismissible popup in the grid
 * (column action menus, primitive cell menus, column filters).
 *
 * Listeners are only attached while `active` is true, so the cost is paid
 * only by popups that are currently open.
 */
export function useDismissOnOutside(active: boolean, onDismiss: () => void) {
  useEffect(() => {
    if (!active) return
    const close = () => onDismiss()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('mousedown', close)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      window.removeEventListener('mousedown', close)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [active, onDismiss])
}

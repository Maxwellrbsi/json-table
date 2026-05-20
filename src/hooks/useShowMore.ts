import { useState } from 'react'
import { ROW_CAP } from '../config'

interface ShowMore<T> {
  /** Items currently visible (capped at the running window). */
  visible: T[]
  /** How many items lie beyond the cap. */
  remaining: number
  /** Extends the cap by one chunk (ROW_CAP). */
  showMore: () => void
}

/**
 * Paginates a list one ROW_CAP-sized chunk at a time. Used by the array and
 * records tables to keep the DOM small on huge JSONs while still letting the
 * user reveal more rows on demand.
 */
export function useShowMore<T>(rows: T[]): ShowMore<T> {
  const [cap, setCap] = useState(ROW_CAP)
  const visible = rows.slice(0, cap)
  return {
    visible,
    remaining: rows.length - visible.length,
    showMore: () => setCap((c) => c + ROW_CAP),
  }
}

import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

/** Smallest width a column can be dragged to. */
const MIN_COLUMN_WIDTH = 48

export interface ColumnResize {
  /** Pinned column widths (px) keyed by column id, or null before the first resize. */
  widths: Map<string, number> | null
  /** Total table width once resized, or undefined while still content-sized. */
  totalWidth: number | undefined
  /** mousedown handler for a column's resize handle. */
  beginResize: (e: ReactMouseEvent, columnId: string) => void
}

/**
 * Excel-like manual column resizing. On the first drag every column's current
 * width is measured and pinned; the table then switches to a fixed layout
 * (`.is-resized` + an explicit width) so columns honor their exact widths and
 * can shrink with an ellipsis. State is per-instance, so nested tables resize
 * independently.
 *
 * `columnIds` lists the column ids left-to-right, matching the table's cells.
 */
export function useColumnResize(columnIds: string[]): ColumnResize {
  const [widths, setWidths] = useState<Map<string, number> | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Drop any drag listeners if the table unmounts mid-drag (live JSON edits).
  useEffect(() => () => cleanupRef.current?.(), [])

  // Reset pinned widths when the column set changes (e.g. JSON keys edited).
  const columnsKey = JSON.stringify(columnIds)
  useEffect(() => {
    setWidths(null)
  }, [columnsKey])

  const beginResize = useCallback(
    (e: ReactMouseEvent, columnId: string) => {
      e.preventDefault()
      e.stopPropagation()
      const table = (e.currentTarget as HTMLElement).closest('table')
      if (table === null) return

      // Base widths: clone the pinned map, or measure every column on first drag.
      let base: Map<string, number>
      if (widths !== null) {
        base = new Map(widths)
      } else {
        const cells = table.rows[0]?.cells
        if (cells === undefined) return
        base = new Map()
        for (let i = 0; i < columnIds.length && i < cells.length; i++) {
          base.set(columnIds[i], Math.round(cells[i].getBoundingClientRect().width))
        }
      }

      const startX = e.clientX
      const startWidth = base.get(columnId) ?? MIN_COLUMN_WIDTH

      const apply = (clientX: number) => {
        const next = Math.max(
          MIN_COLUMN_WIDTH,
          Math.round(startWidth + clientX - startX),
        )
        setWidths(new Map(base).set(columnId, next))
      }
      const onMove = (ev: MouseEvent) => apply(ev.clientX)
      const cleanup = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', cleanup)
        document.body.classList.remove('resizing-col')
        cleanupRef.current = null
      }

      cleanupRef.current = cleanup
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', cleanup)
      document.body.classList.add('resizing-col')
      apply(e.clientX) // pin every column at its current width, no visual jump
    },
    [widths, columnIds],
  )

  const totalWidth =
    widths === null
      ? undefined
      : [...widths.values()].reduce((sum, w) => sum + w, 0)

  return { widths, totalWidth, beginResize }
}

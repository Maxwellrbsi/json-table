import { useEffect, useState, type MouseEvent } from 'react'
import type { FilterOption } from '../../lib/columnFilter'
import { keyLabel } from '../../lib/columnFilter'

interface Props {
  column: string
  options: FilterOption[]
  /** Currently committed selection for this column. */
  selected: Set<string>
  /** Commits a new selection; an empty set clears the column filter. */
  onChange: (next: Set<string>) => void
}

interface PopPos {
  x: number
  y: number
}

const POP_WIDTH = 256
const POP_HEIGHT = 360

/** Filter button + dropdown for one column: search, checkbox list and chips. */
export function ColumnFilter({ column, options, selected, onChange }: Props) {
  const [open, setOpen] = useState<PopPos | null>(null)
  const [draft, setDraft] = useState<Set<string>>(() => new Set(selected))
  const [query, setQuery] = useState('')
  const active = selected.size > 0

  useEffect(() => {
    if (open === null) return
    const close = () => setOpen(null)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
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
  }, [open])

  const openPop = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(8, Math.min(rect.left, window.innerWidth - POP_WIDTH - 8))
    const y = Math.max(
      8,
      Math.min(rect.bottom + 4, window.innerHeight - POP_HEIGHT - 8),
    )
    setDraft(new Set(selected))
    setQuery('')
    setOpen({ x, y })
  }

  const toggle = (key: string) => {
    setDraft((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const apply = () => {
    onChange(draft)
    setOpen(null)
  }

  const needle = query.trim().toLowerCase()
  const visibleOptions = needle
    ? options.filter((o) => o.label.toLowerCase().includes(needle))
    : options

  const labelFor = (key: string) =>
    options.find((o) => o.key === key)?.label ?? keyLabel(key)

  return (
    <>
      <button
        type="button"
        className={`col-filter-btn${active ? ' is-active' : ''}`}
        onClick={openPop}
        title={`Filtrar "${column}"`}
        aria-label={`Filtrar coluna ${column}`}
      >
        <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
          <path d="M2 3 H14 L9.5 8.5 V13 H6.5 V8.5 Z" fill="currentColor" />
        </svg>
        {active && <span className="col-filter-badge">{selected.size}</span>}
      </button>

      {open !== null && (
        <div
          className="col-filter-pop"
          style={{ left: open.x, top: open.y }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="col-filter-search">
            <input
              type="text"
              autoFocus
              placeholder="Filtrar valores..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          {draft.size > 0 && (
            <div className="col-filter-applied">
              <div className="col-filter-chips">
                {[...draft].map((key) => (
                  <span key={key} className="col-filter-chip">
                    <span className="col-filter-chip-text">{labelFor(key)}</span>
                    <button
                      type="button"
                      className="col-filter-chip-x"
                      onClick={() => toggle(key)}
                      aria-label={`Remover ${labelFor(key)}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="col-filter-list">
            {visibleOptions.map((opt) => (
              <label key={opt.key} className="col-filter-item">
                <input
                  type="checkbox"
                  checked={draft.has(opt.key)}
                  onChange={() => toggle(opt.key)}
                />
                <span className="col-filter-label">{opt.label}</span>
                <span className="col-filter-count">{opt.count}</span>
              </label>
            ))}
            {visibleOptions.length === 0 && (
              <div className="col-filter-empty">nenhum valor</div>
            )}
          </div>

          <div className="col-filter-actions">
            <button
              type="button"
              className="col-filter-link"
              onClick={() =>
                setDraft(
                  (prev) =>
                    new Set([...prev, ...visibleOptions.map((o) => o.key)]),
                )
              }
            >
              Selecionar todos
            </button>
            <button
              type="button"
              className="col-filter-link"
              onClick={() => setDraft(new Set())}
            >
              Limpar
            </button>
            <button type="button" className="col-filter-apply" onClick={apply}>
              Aplicar
            </button>
          </div>
        </div>
      )}
    </>
  )
}

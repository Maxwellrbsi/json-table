import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import type { JsonObject } from '../../types'
import { recordColumns } from '../../lib/classifyNode'
import { childPath, toCopyPath } from '../../lib/jsonPath'
import { isRevealed } from '../../lib/search'
import { columnOptions, valueKey, type FilterOption } from '../../lib/columnFilter'
import { ROW_CAP } from '../../config'
import { useCopy } from '../../hooks/useCopy'
import { useColumnResize } from '../../hooks/useColumnResize'
import { useGrid } from './gridContext'
import { JsonNode } from './JsonNode'
import { NodeHeader } from './NodeHeader'
import { ColumnFilter } from './ColumnFilter'
import { ActionMenu } from './ActionMenu'
import { MenuPopup, type MenuItem } from './MenuPopup'
import { ConfirmDialog } from './ConfirmDialog'
import { Highlight } from '../Highlight'

interface Props {
  value: JsonObject[]
  path: string
  depth: number
}

/** Resize id for the index column. */
const INDEX_KEY = 'idx'
/** Resize id for a data column (prefixed so it cannot collide with INDEX_KEY). */
const dataKey = (col: string) => `col:${col}`
/** Shared empty set so unfiltered columns keep a stable ColumnFilter prop. */
const EMPTY_SET: Set<string> = new Set()

/** What is currently selected (and has its action menu open). */
type Selection =
  | { kind: 'col'; col: string; x: number; y: number }
  | { kind: 'row'; index: number; x: number; y: number }

/** A pending delete awaiting confirmation. */
type ConfirmTarget = { kind: 'col'; col: string } | { kind: 'row'; index: number }

/** Renders an array of objects as a columnar table, one row per element. */
export const RecordsTable = memo(function RecordsTable({ value, path, depth }: Props) {
  const { search, editValue } = useGrid()
  const copy = useCopy()
  const tableRef = useRef<HTMLTableElement>(null)
  const [cap, setCap] = useState(ROW_CAP)
  const [filters, setFilters] = useState<Record<string, Set<string>>>({})
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(() => new Set())
  const [hiddenRows, setHiddenRows] = useState<Set<number>>(() => new Set())
  const [frozenCount, setFrozenCount] = useState(0)
  const [frozenLefts, setFrozenLefts] = useState<number[]>([])
  const [selection, setSelection] = useState<Selection | null>(null)
  const [confirm, setConfirm] = useState<ConfirmTarget | null>(null)

  const columns = useMemo(() => recordColumns(value), [value])
  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenCols.has(c)),
    [columns, hiddenCols],
  )
  const columnIds = useMemo(
    () => [INDEX_KEY, ...visibleColumns.map(dataKey)],
    [visibleColumns],
  )
  const { widths, totalWidth, beginResize } = useColumnResize(columnIds)
  const filtering = search.hasQuery
  const effectiveFrozen = Math.min(frozenCount, visibleColumns.length)

  // Row indices shift when rows are deleted, so drop hidden rows on data change.
  useEffect(() => {
    setHiddenRows((prev) => (prev.size === 0 ? prev : new Set()))
  }, [value])

  // Cumulative left offsets for the frozen (sticky) columns. Frozen cells stick
  // to the scroller's content-box left edge — .grid-area has no horizontal
  // padding (the gutter lives on .grid-root), so the first offset is just 0
  // and the rest accumulate cell widths.
  const measureFrozen = useCallback(() => {
    const headRow = tableRef.current?.rows[0]
    if (!headRow) return
    let acc = 0
    const lefts: number[] = []
    const count = Math.min(1 + effectiveFrozen, headRow.cells.length)
    for (let i = 0; i < count; i++) {
      lefts.push(acc)
      acc += headRow.cells[i].getBoundingClientRect().width
    }
    setFrozenLefts(lefts)
  }, [effectiveFrozen])

  useLayoutEffect(() => {
    if (effectiveFrozen === 0) {
      setFrozenLefts((prev) => (prev.length === 0 ? prev : []))
      return
    }
    measureFrozen()
  }, [effectiveFrozen, widths, visibleColumns, value, measureFrozen])

  useEffect(() => {
    const table = tableRef.current
    if (effectiveFrozen === 0 || table === null) return
    const observer = new ResizeObserver(() => measureFrozen())
    observer.observe(table)
    const root = table.closest('.grid-root')
    if (root instanceof HTMLElement) observer.observe(root)
    window.addEventListener('resize', measureFrozen)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measureFrozen)
    }
  }, [effectiveFrozen, measureFrozen])

  const optionsByColumn = useMemo(() => {
    const map: Record<string, FilterOption[]> = {}
    for (const col of columns) map[col] = columnOptions(value, col)
    return map
  }, [value, columns])

  const activeFilterCols = useMemo(
    () => visibleColumns.filter((col) => (filters[col]?.size ?? 0) > 0),
    [visibleColumns, filters],
  )
  const isFiltered = filtering || activeFilterCols.length > 0
  const trimmed = isFiltered || hiddenRows.size > 0
  const hasHidden = hiddenCols.size > 0 || hiddenRows.size > 0

  const rows = value
    .map((obj, index) => ({ obj, index, rowPath: childPath(path, index) }))
    .filter((row) => !hiddenRows.has(row.index))
    .filter((row) => !filtering || isRevealed(search, row.rowPath))
    .filter((row) =>
      activeFilterCols.every((col) => filters[col].has(valueKey(row.obj[col]))),
    )

  const visible = rows.slice(0, cap)
  const remaining = rows.length - visible.length
  const note = trimmed ? `${rows.length} de ${value.length}` : undefined

  const setColumnFilter = useCallback((col: string, next: Set<string>) => {
    setFilters((prev) => {
      const updated = { ...prev }
      if (next.size === 0) delete updated[col]
      else updated[col] = next
      return updated
    })
  }, [])

  const closeMenu = useCallback(() => setSelection(null), [])
  const selectColumn = useCallback((e: ReactMouseEvent, col: string) => {
    setConfirm(null)
    setSelection({ kind: 'col', col, x: e.clientX, y: e.clientY + 6 })
  }, [])
  const selectRow = useCallback((e: ReactMouseEvent, index: number) => {
    setConfirm(null)
    setSelection({ kind: 'row', index, x: e.clientX, y: e.clientY + 6 })
  }, [])

  const hideColumn = useCallback((col: string) => {
    setHiddenCols((prev) => new Set(prev).add(col))
  }, [])
  const showColumn = useCallback((col: string) => {
    setHiddenCols((prev) => {
      const next = new Set(prev)
      next.delete(col)
      return next
    })
  }, [])
  const hideRow = useCallback((index: number) => {
    setHiddenRows((prev) => new Set(prev).add(index))
  }, [])
  const showRow = useCallback((index: number) => {
    setHiddenRows((prev) => {
      const next = new Set(prev)
      next.delete(index)
      return next
    })
  }, [])
  const showAll = useCallback(() => {
    setHiddenCols(new Set())
    setHiddenRows(new Set())
  }, [])
  const deleteColumn = useCallback(
    (col: string) => {
      editValue(
        value,
        value
          .map((obj) => {
            const next = { ...obj }
            delete next[col]
            return next
          })
          .filter((obj) => Object.keys(obj).length > 0),
      )
    },
    [editValue, value],
  )
  const deleteRow = useCallback(
    (index: number) => {
      editValue(
        value,
        value.filter((_, i) => i !== index),
      )
    },
    [editValue, value],
  )
  const toggleFreeze = useCallback((visibleIndex: number) => {
    setFrozenCount((fc) => (fc >= visibleIndex + 1 ? 0 : visibleIndex + 1))
  }, [])

  const highlightCol =
    selection?.kind === 'col'
      ? selection.col
      : confirm?.kind === 'col'
        ? confirm.col
        : null
  const highlightRow =
    selection?.kind === 'row'
      ? selection.index
      : confirm?.kind === 'row'
        ? confirm.index
        : null

  let menuItems: MenuItem[] = []
  if (selection?.kind === 'col') {
    const col = selection.col
    const vi = visibleColumns.indexOf(col)
    const frozen = vi >= 0 && vi < effectiveFrozen
    menuItems = [
      { label: 'Ocultar coluna', onSelect: () => hideColumn(col) },
      {
        label: frozen ? 'Descongelar' : 'Congelar até esta coluna',
        onSelect: () => toggleFreeze(vi),
      },
      {
        label: 'Excluir coluna',
        danger: true,
        onSelect: () => setConfirm({ kind: 'col', col }),
      },
    ]
  } else if (selection?.kind === 'row') {
    const index = selection.index
    const rowPath = childPath(path, index)
    menuItems = [
      {
        label: 'Copiar caminho',
        onSelect: () => copy(toCopyPath(rowPath), 'Caminho copiado'),
      },
      { label: 'Ocultar linha', onSelect: () => hideRow(index) },
      {
        label: 'Excluir linha',
        danger: true,
        onSelect: () => setConfirm({ kind: 'row', index }),
      },
    ]
  }

  const hiddenTotal = hiddenCols.size + hiddenRows.size
  const hiddenSummary =
    [
      hiddenCols.size > 0
        ? `${hiddenCols.size} ${hiddenCols.size === 1 ? 'coluna' : 'colunas'}`
        : null,
      hiddenRows.size > 0
        ? `${hiddenRows.size} ${hiddenRows.size === 1 ? 'linha' : 'linhas'}`
        : null,
    ]
      .filter(Boolean)
      .join(' e ') + (hiddenTotal === 1 ? ' oculta' : ' ocultas')

  const hiddenItems: MenuItem[] = [
    ...[...hiddenCols].map((col) => ({
      label: `Coluna: ${col}`,
      onSelect: () => showColumn(col),
    })),
    ...[...hiddenRows]
      .sort((a, b) => a - b)
      .map((i) => ({ label: `Linha ${i}`, onSelect: () => showRow(i) })),
    { label: 'Reexibir tudo', onSelect: showAll },
  ]

  const columnDeleteDetail = (col: string): string => {
    const emptied = value.filter((o) => {
      const k = Object.keys(o)
      return k.length === 1 && k[0] === col
    }).length
    const base = 'Esta ação altera o JSON de origem.'
    if (emptied === 0) return base
    return `${base} ${emptied} ${
      emptied === 1
        ? 'linha ficará vazia e será removida'
        : 'linhas ficarão vazias e serão removidas'
    }.`
  }

  return (
    <div className="node" data-depth={Math.min(depth, 4)}>
      <NodeHeader variant="records" count={value.length} path={path} note={note} />
      {hasHidden && (
        <ActionMenu
          triggerClassName="hidden-bar"
          ariaLabel="Reexibir itens ocultos"
          items={hiddenItems}
        >
          <span className="hidden-bar-icon" aria-hidden="true">
            ⊘
          </span>
          {hiddenSummary} · reexibir
        </ActionMenu>
      )}
      <div className="table-scroll">
        <table
          ref={tableRef}
          className={`grid-table records-table${widths ? ' is-resized' : ''}`}
          style={{ width: totalWidth }}
        >
          <colgroup>
            <col style={{ width: widths?.get(INDEX_KEY) }} />
            {visibleColumns.map((col) => (
              <col key={col} style={{ width: widths?.get(dataKey(col)) }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th
                className={`index-col${effectiveFrozen > 0 ? ' frozen-col' : ''}`}
                style={effectiveFrozen > 0 ? { left: frozenLefts[0] ?? 0 } : undefined}
              >
                #
                <span
                  className="col-resizer"
                  onMouseDown={(e) => beginResize(e, INDEX_KEY)}
                  onClick={(e) => e.stopPropagation()}
                />
              </th>
              {visibleColumns.map((col, vi) => {
                const frozen = vi < effectiveFrozen
                return (
                  <th
                    key={col}
                    className={
                      'column-head' +
                      (frozen ? ' frozen-col' : '') +
                      (frozen && vi === effectiveFrozen - 1 ? ' frozen-col-edge' : '') +
                      (highlightCol === col ? ' is-selected-col' : '')
                    }
                    style={frozen ? { left: frozenLefts[vi + 1] ?? 0 } : undefined}
                    onClick={(e) => selectColumn(e, col)}
                    title="Selecionar coluna"
                  >
                    <div className="col-head-inner">
                      <span className="col-head-text">
                        <Highlight text={col} query={search.query} />
                      </span>
                      <ColumnFilter
                        column={col}
                        options={optionsByColumn[col]}
                        selected={filters[col] ?? EMPTY_SET}
                        onChange={(next) => setColumnFilter(col, next)}
                      />
                    </div>
                    <span
                      className="col-resizer"
                      onMouseDown={(e) => beginResize(e, dataKey(col))}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map(({ obj, index, rowPath }) => (
              <tr
                key={rowPath}
                className={highlightRow === index ? 'is-selected-row' : undefined}
              >
                <th
                  className={`index-cell${effectiveFrozen > 0 ? ' frozen-col' : ''}`}
                  style={
                    effectiveFrozen > 0 ? { left: frozenLefts[0] ?? 0 } : undefined
                  }
                  onClick={(e) => selectRow(e, index)}
                  title="Selecionar linha"
                >
                  {index}
                </th>
                {visibleColumns.map((col, vi) => {
                  const present = Object.prototype.hasOwnProperty.call(obj, col)
                  const frozen = vi < effectiveFrozen
                  return (
                    <td
                      key={col}
                      className={
                        'value-cell' +
                        (frozen ? ' frozen-col' : '') +
                        (frozen && vi === effectiveFrozen - 1
                          ? ' frozen-col-edge'
                          : '') +
                        (highlightCol === col ? ' is-selected-col' : '')
                      }
                      style={
                        frozen ? { left: frozenLefts[vi + 1] ?? 0 } : undefined
                      }
                    >
                      {present ? (
                        <JsonNode
                          value={obj[col]}
                          path={childPath(rowPath, col)}
                          depth={depth + 1}
                        />
                      ) : (
                        <span className="cell-missing" title="chave ausente">
                          —
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
            {trimmed && rows.length === 0 && (
              <tr>
                <td className="no-rows" colSpan={visibleColumns.length + 1}>
                  sem correspondências
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {remaining > 0 && (
        <button
          type="button"
          className="show-more"
          onClick={() => setCap((c) => c + ROW_CAP)}
        >
          Mostrar mais {Math.min(ROW_CAP, remaining)} de {remaining} linhas
        </button>
      )}
      {selection !== null && confirm === null && (
        <MenuPopup
          items={menuItems}
          x={selection.x}
          y={selection.y}
          onClose={closeMenu}
        />
      )}
      {confirm !== null && (
        <ConfirmDialog
          message={
            confirm.kind === 'col'
              ? `Excluir a coluna "${confirm.col}"?`
              : `Excluir a linha ${confirm.index}?`
          }
          detail={
            confirm.kind === 'col'
              ? columnDeleteDetail(confirm.col)
              : 'Esta ação altera o JSON de origem.'
          }
          confirmLabel="Excluir"
          onConfirm={() => {
            if (confirm.kind === 'col') deleteColumn(confirm.col)
            else deleteRow(confirm.index)
            setConfirm(null)
            setSelection(null)
          }}
          onCancel={() => {
            setConfirm(null)
            setSelection(null)
          }}
        />
      )}
    </div>
  )
})

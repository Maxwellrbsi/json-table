import { memo, type ReactNode, type Ref } from 'react'
import { NodeHeader } from './NodeHeader'

type Variant = 'object' | 'array' | 'records'

interface Props {
  variant: Variant
  count: number
  path: string
  depth: number
  /** Optional secondary text shown in NodeHeader (e.g. "5 de 17"). */
  note?: string
  /** Bar listing hidden columns/rows (records-table only). */
  hiddenBar?: ReactNode
  /** Pinned column widths from useColumnResize; null before first resize. */
  widths: Map<string, number> | null
  /** Total fixed width once any column was resized. */
  totalWidth?: number
  /** Column ids in left-to-right order — drives the colgroup. */
  colIds: readonly string[]
  /** Ref to the underlying <table> (records-table needs it for measuring). */
  tableRef?: Ref<HTMLTableElement>
  /** Optional thead block (only records-table renders one). */
  thead?: ReactNode
  /** Tbody rows. */
  children: ReactNode
  /** When true, render the "sem correspondências" fallback row. */
  showEmpty?: boolean
  /** Footer below the table (show-more button, popups, etc.). */
  footer?: ReactNode
}

/** Shared chrome for every grid table: container, header, colgroup, body. */
export const TableShell = memo(function TableShell({
  variant,
  count,
  path,
  depth,
  note,
  hiddenBar,
  widths,
  totalWidth,
  colIds,
  tableRef,
  thead,
  children,
  showEmpty,
  footer,
}: Props) {
  return (
    <div className="node" data-depth={Math.min(depth, 4)}>
      <NodeHeader variant={variant} count={count} path={path} note={note} />
      {hiddenBar}
      <table
        ref={tableRef}
        className={`grid-table ${variant}-table${widths ? ' is-resized' : ''}`}
        style={{ width: totalWidth }}
      >
        <colgroup>
          {colIds.map((id) => (
            <col key={id} style={{ width: widths?.get(id) }} />
          ))}
        </colgroup>
        {thead}
        <tbody>
          {children}
          {showEmpty && (
            <tr>
              <td className="no-rows" colSpan={colIds.length}>
                sem correspondências
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {footer}
    </div>
  )
})

import { memo, useMemo } from 'react'
import type { JsonArray } from '../../types'
import { childPath, toCopyPath } from '../../lib/jsonPath'
import { isRevealed } from '../../lib/search'
import { ROW_CAP } from '../../config'
import { useCopy } from '../../hooks/useCopy'
import { useColumnResize } from '../../hooks/useColumnResize'
import { useShowMore } from '../../hooks/useShowMore'
import { useGrid } from './gridContext'
import { JsonNode } from './JsonNode'
import { NodeHeader } from './NodeHeader'

interface Props {
  value: JsonArray
  path: string
  depth: number
}

/** Column ids left-to-right; only the index column carries a resize handle. */
const INDEX_COL = 'index'
const VALUE_COL = 'value'
const ARR_COLUMNS = [INDEX_COL, VALUE_COL]

/** Renders an array of primitives / mixed items as an index/value table. */
export const ArrayTable = memo(function ArrayTable({ value, path, depth }: Props) {
  const { search } = useGrid()
  const copy = useCopy()
  const { widths, totalWidth, beginResize } = useColumnResize(ARR_COLUMNS)
  const filtering = search.hasQuery

  const rows = useMemo(
    () =>
      value
        .map((item, index) => ({ item, index, rowPath: childPath(path, index) }))
        .filter((row) => !filtering || isRevealed(search, row.rowPath)),
    [value, path, filtering, search],
  )

  const { visible, remaining, showMore } = useShowMore(rows)

  return (
    <div className="node" data-depth={Math.min(depth, 4)}>
      <NodeHeader variant="array" count={value.length} path={path} />
      <table
        className={`grid-table array-table${widths ? ' is-resized' : ''}`}
        style={{ width: totalWidth }}
      >
        <colgroup>
          <col style={{ width: widths?.get(INDEX_COL) }} />
          <col style={{ width: widths?.get(VALUE_COL) }} />
        </colgroup>
        <tbody>
          {visible.map(({ item, index, rowPath }) => (
            <tr key={rowPath}>
              <th
                className="index-cell"
                onClick={() => copy(toCopyPath(rowPath), 'Caminho copiado')}
                title="Copiar caminho"
              >
                {index}
                <span
                  className="col-resizer"
                  onMouseDown={(e) => beginResize(e, INDEX_COL)}
                  onClick={(e) => e.stopPropagation()}
                />
              </th>
              <td className="value-cell">
                <JsonNode value={item} path={rowPath} depth={depth + 1} />
              </td>
            </tr>
          ))}
          {filtering && rows.length === 0 && (
            <tr>
              <td className="no-rows" colSpan={2}>
                sem correspondências
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {remaining > 0 && (
        <button type="button" className="show-more" onClick={showMore}>
          Mostrar mais {Math.min(ROW_CAP, remaining)} de {remaining} itens
        </button>
      )}
    </div>
  )
})

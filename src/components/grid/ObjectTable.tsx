import { memo, useMemo } from 'react'
import type { JsonObject } from '../../types'
import { childPath, toCopyPath } from '../../lib/jsonPath'
import { isRevealed } from '../../lib/search'
import { useCopy } from '../../hooks/useCopy'
import { useColumnResize } from '../../hooks/useColumnResize'
import { useGrid } from './gridContext'
import { JsonNode } from './JsonNode'
import { NodeHeader } from './NodeHeader'
import { Highlight } from '../Highlight'

interface Props {
  value: JsonObject
  path: string
  depth: number
}

/** Column ids left-to-right; only the key column carries a resize handle. */
const KEY_COL = 'key'
const VALUE_COL = 'value'
const OBJ_COLUMNS = [KEY_COL, VALUE_COL]

/** Renders an object as a two-column key/value table. */
export const ObjectTable = memo(function ObjectTable({ value, path, depth }: Props) {
  const { search } = useGrid()
  const copy = useCopy()
  const { widths, totalWidth, beginResize } = useColumnResize(OBJ_COLUMNS)
  const entries = useMemo(() => Object.entries(value), [value])
  const filtering = search.hasQuery

  const rows = useMemo(
    () =>
      filtering
        ? entries.filter(([key]) => isRevealed(search, childPath(path, key)))
        : entries,
    [filtering, entries, search, path],
  )

  return (
    <div className="node" data-depth={Math.min(depth, 4)}>
      <NodeHeader variant="object" count={entries.length} path={path} />
      <table
        className={`grid-table object-table${widths ? ' is-resized' : ''}`}
        style={{ width: totalWidth }}
      >
        <colgroup>
          <col style={{ width: widths?.get(KEY_COL) }} />
          <col style={{ width: widths?.get(VALUE_COL) }} />
        </colgroup>
        <tbody>
          {rows.map(([key, child]) => {
            const cellPath = childPath(path, key)
            return (
              <tr key={cellPath}>
                <th
                  className="key-cell"
                  onClick={() => copy(toCopyPath(cellPath), 'Caminho copiado')}
                  title="Copiar caminho"
                >
                  <span className="cell-key-text">
                    <Highlight text={key} query={search.query} />
                  </span>
                  <span
                    className="col-resizer"
                    onMouseDown={(e) => beginResize(e, KEY_COL)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </th>
                <td className="value-cell">
                  <JsonNode value={child} path={cellPath} depth={depth + 1} />
                </td>
              </tr>
            )
          })}
          {filtering && rows.length === 0 && (
            <tr>
              <td className="no-rows" colSpan={2}>
                sem correspondências
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
})

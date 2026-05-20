import { memo, useMemo } from 'react'
import type { JsonObject } from '../../types'
import { childPath, toCopyPath } from '../../lib/jsonPath'
import { isRevealed } from '../../lib/search'
import { useCopy } from '../../hooks/useCopy'
import { useColumnResize } from '../../hooks/useColumnResize'
import { useGrid } from './gridContext'
import { JsonNode } from './JsonNode'
import { TableShell } from './TableShell'
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
    <TableShell
      variant="object"
      count={entries.length}
      path={path}
      depth={depth}
      colIds={OBJ_COLUMNS}
      widths={widths}
      totalWidth={totalWidth}
      showEmpty={filtering && rows.length === 0}
    >
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
    </TableShell>
  )
})

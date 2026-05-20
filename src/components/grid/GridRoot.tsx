import { useMemo } from 'react'
import type { JsonValue } from '../../types'
import type { SearchResult } from '../../lib/search'
import { ROOT_PATH } from '../../lib/jsonPath'
import { GridContext } from './gridContext'
import type { GridApi } from './gridContext'
import { JsonNode } from './JsonNode'

interface Props {
  data: JsonValue
  collapsedPaths: Set<string>
  onTogglePath: (path: string) => void
  search: SearchResult
  editValue: (target: JsonValue, replacement: JsonValue) => void
}

export function GridRoot({
  data,
  collapsedPaths,
  onTogglePath,
  search,
  editValue,
}: Props) {
  const api = useMemo<GridApi>(
    () => ({ collapsedPaths, togglePath: onTogglePath, search, editValue }),
    [collapsedPaths, onTogglePath, search, editValue],
  )
  return (
    <GridContext.Provider value={api}>
      <div className="grid-root">
        <JsonNode value={data} path={ROOT_PATH} depth={0} />
      </div>
    </GridContext.Provider>
  )
}

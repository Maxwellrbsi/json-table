import { createContext, useContext } from 'react'
import type { JsonValue } from '../../types'
import type { SearchResult } from '../../lib/search'

export interface GridApi {
  collapsedPaths: Set<string>
  togglePath: (path: string) => void
  search: SearchResult
  /** Replaces a node in the source JSON and rewrites the editor text. */
  editValue: (target: JsonValue, replacement: JsonValue) => void
}

export const GridContext = createContext<GridApi | null>(null)

export function useGrid(): GridApi {
  const ctx = useContext(GridContext)
  if (ctx === null) {
    throw new Error('useGrid deve ser usado dentro de GridRoot')
  }
  return ctx
}

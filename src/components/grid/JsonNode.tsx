import { memo } from 'react'
import type { JsonArray, JsonObject, JsonValue } from '../../types'
import { classify } from '../../lib/classifyNode'
import { isRevealed } from '../../lib/search'
import { useGrid } from './gridContext'
import { PrimitiveCell } from './PrimitiveCell'
import { ObjectTable } from './ObjectTable'
import { RecordsTable } from './RecordsTable'
import { ArrayTable } from './ArrayTable'
import { CollapsedChip } from './CollapsedChip'

interface Props {
  value: JsonValue
  path: string
  depth: number
}

/** Dispatches a JSON value to the matching renderer; handles the collapse gate. */
export const JsonNode = memo(function JsonNode({ value, path, depth }: Props) {
  const { collapsedPaths, search } = useGrid()
  const kind = classify(value)

  if (kind === 'primitive') {
    return <PrimitiveCell value={value} path={path} />
  }
  if (kind === 'empty-object') {
    return <CollapsedChip variant="object" count={0} path={path} isStatic />
  }
  if (kind === 'empty-array') {
    return <CollapsedChip variant="array" count={0} path={path} isStatic />
  }

  const isArray = Array.isArray(value)
  const count = isArray
    ? (value as JsonArray).length
    : Object.keys(value as JsonObject).length

  const collapsedManually = collapsedPaths.has(path)
  const forcedOpen = search.hasQuery && isRevealed(search, path)
  if (collapsedManually && !forcedOpen) {
    return (
      <CollapsedChip variant={isArray ? 'array' : 'object'} count={count} path={path} />
    )
  }

  if (kind === 'object') {
    return <ObjectTable value={value as JsonObject} path={path} depth={depth} />
  }
  if (kind === 'records') {
    return <RecordsTable value={value as JsonObject[]} path={path} depth={depth} />
  }
  return <ArrayTable value={value as JsonArray} path={path} depth={depth} />
})

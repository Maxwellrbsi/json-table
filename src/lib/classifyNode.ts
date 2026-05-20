import type { JsonObject, JsonValue } from '../types'

export type NodeKind =
  | 'primitive'
  | 'object'
  | 'records'
  | 'array'
  | 'empty-object'
  | 'empty-array'

export type PrimitiveType = 'string' | 'number' | 'boolean' | 'null'

/** Classifies a JSON value to decide which renderer it gets. */
export function classify(value: JsonValue): NodeKind {
  if (value === null || typeof value !== 'object') return 'primitive'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'empty-array'
    const allObjects = value.every(
      (el) => el !== null && typeof el === 'object' && !Array.isArray(el),
    )
    return allObjects ? 'records' : 'array'
  }
  return Object.keys(value).length === 0 ? 'empty-object' : 'object'
}

export function primitiveType(value: JsonValue): PrimitiveType {
  if (value === null) return 'null'
  const t = typeof value
  if (t === 'number') return 'number'
  if (t === 'boolean') return 'boolean'
  return 'string'
}

/** Union of every key across the records, in first-seen order. */
export function recordColumns(rows: JsonObject[]): string[] {
  const seen = new Set<string>()
  const columns: string[] = []
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key)
        columns.push(key)
      }
    }
  }
  return columns
}

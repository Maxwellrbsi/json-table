import type { JsonObject, JsonValue } from '../types'

export interface FilterOption {
  /** Canonical key used for matching. */
  key: string
  /** Human-readable label shown in the dropdown. */
  label: string
  /** How many records carry this value. */
  count: number
}

/**
 * Canonical filter key for one cell value (`undefined` means the key is absent).
 * Keys are type-tagged so a string `"1"` and a number `1` never collide, and so
 * no real value can collide with the missing/object/array sentinels.
 */
export function valueKey(value: JsonValue | undefined): string {
  if (value === undefined) return 'm' // missing key
  if (value === null) return 'x' // null
  if (Array.isArray(value)) return 'a' // array
  if (typeof value === 'object') return 'o' // object
  if (typeof value === 'number') return `n:${value}`
  if (typeof value === 'boolean') return `b:${value}`
  return `s:${value}` // string
}

/** Human-readable label for a filter key produced by `valueKey`. */
export function keyLabel(key: string): string {
  if (key === 'm') return '(ausente)'
  if (key === 'x') return 'null'
  if (key === 'a') return '(lista)'
  if (key === 'o') return '(objeto)'
  const body = key.slice(2) // strip the "s:" / "n:" / "b:" tag
  if (key.startsWith('s:') && body === '') return '(vazio)'
  return body
}

/** Distinct filterable options for a column across every record, sorted by label. */
export function columnOptions(rows: JsonObject[], column: string): FilterOption[] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const key = valueKey(row[column])
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: keyLabel(key), count }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

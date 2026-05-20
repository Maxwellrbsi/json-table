import type { JsonValue } from '../types'
import { childPath, ROOT_PATH } from './jsonPath'

export interface SearchResult {
  query: string
  hasQuery: boolean
  /** Paths of nodes whose key or value directly matches the query. */
  matchPaths: Set<string>
  /** Ancestor container paths of every match (force-expanded while searching). */
  revealPaths: Set<string>
}

export const EMPTY_SEARCH: SearchResult = {
  query: '',
  hasQuery: false,
  matchPaths: new Set(),
  revealPaths: new Set(),
}

function primitiveText(value: JsonValue): string {
  if (value === null) return 'null'
  return String(value)
}

function walkSearch(
  value: JsonValue,
  path: string,
  key: string | null,
  needle: string,
  ancestors: string[],
  matchPaths: Set<string>,
  revealPaths: Set<string>,
): void {
  const isObject = value !== null && typeof value === 'object'
  const keyHit = key !== null && key.toLowerCase().includes(needle)
  const valueHit = !isObject && primitiveText(value).toLowerCase().includes(needle)
  if (keyHit || valueHit) {
    matchPaths.add(path)
    for (const ancestor of ancestors) revealPaths.add(ancestor)
  }
  if (!isObject) return
  const nextAncestors = [...ancestors, path]
  if (Array.isArray(value)) {
    value.forEach((child, i) =>
      walkSearch(child, childPath(path, i), null, needle, nextAncestors, matchPaths, revealPaths),
    )
  } else {
    for (const [childKey, child] of Object.entries(value)) {
      walkSearch(
        child,
        childPath(path, childKey),
        childKey,
        needle,
        nextAncestors,
        matchPaths,
        revealPaths,
      )
    }
  }
}

export function runSearch(root: JsonValue | undefined, query: string): SearchResult {
  const needle = query.trim().toLowerCase()
  if (needle === '' || root === undefined) {
    return { ...EMPTY_SEARCH, query }
  }
  const matchPaths = new Set<string>()
  const revealPaths = new Set<string>()
  walkSearch(root, ROOT_PATH, null, needle, [], matchPaths, revealPaths)
  return { query, hasQuery: true, matchPaths, revealPaths }
}

/** True when this path matches, or its subtree contains a match. */
export function isRevealed(search: SearchResult, path: string): boolean {
  return search.matchPaths.has(path) || search.revealPaths.has(path)
}

export interface HighlightPart {
  text: string
  hit: boolean
}

/** Splits text into matched / unmatched segments for highlighting. */
export function highlightParts(text: string, query: string): HighlightPart[] {
  const needle = query.trim().toLowerCase()
  if (needle === '') return [{ text, hit: false }]
  const lower = text.toLowerCase()
  const parts: HighlightPart[] = []
  let cursor = 0
  for (;;) {
    const idx = lower.indexOf(needle, cursor)
    if (idx === -1) {
      if (cursor < text.length) parts.push({ text: text.slice(cursor), hit: false })
      break
    }
    if (idx > cursor) parts.push({ text: text.slice(cursor, idx), hit: false })
    parts.push({ text: text.slice(idx, idx + needle.length), hit: true })
    cursor = idx + needle.length
  }
  return parts.length > 0 ? parts : [{ text, hit: false }]
}

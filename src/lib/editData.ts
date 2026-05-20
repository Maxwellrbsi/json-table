import type { JsonObject, JsonValue } from '../types'

/**
 * Returns a new tree where the node strictly equal to `target` is replaced by
 * `replacement`; subtrees that don't contain `target` keep their identity.
 * Values from `JSON.parse` never share references, so the match is unambiguous.
 */
export function replaceByRef(
  node: JsonValue,
  target: JsonValue,
  replacement: JsonValue,
): JsonValue {
  if (node === target) return replacement
  if (Array.isArray(node)) {
    let changed = false
    const next = node.map((child) => {
      const r = replaceByRef(child, target, replacement)
      if (r !== child) changed = true
      return r
    })
    return changed ? next : node
  }
  if (node !== null && typeof node === 'object') {
    let changed = false
    const next: JsonObject = {}
    for (const key of Object.keys(node)) {
      const r = replaceByRef(node[key], target, replacement)
      if (r !== node[key]) changed = true
      next[key] = r
    }
    return changed ? next : node
  }
  return node
}

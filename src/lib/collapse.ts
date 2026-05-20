import type { JsonValue } from '../types'
import { childPath, ROOT_PATH } from './jsonPath'

function walkContainers(
  value: JsonValue,
  path: string,
  depth: number,
  shouldInclude: (depth: number) => boolean,
  out: string[],
): void {
  if (value === null || typeof value !== 'object') return
  const isEmpty = Array.isArray(value)
    ? value.length === 0
    : Object.keys(value).length === 0
  if (isEmpty) return
  if (shouldInclude(depth)) out.push(path)
  if (Array.isArray(value)) {
    value.forEach((child, i) =>
      walkContainers(child, childPath(path, i), depth + 1, shouldInclude, out),
    )
  } else {
    for (const [key, child] of Object.entries(value)) {
      walkContainers(child, childPath(path, key), depth + 1, shouldInclude, out)
    }
  }
}

/** Every non-empty container path in the tree (used by "collapse all"). */
export function collectAllContainerPaths(root: JsonValue): string[] {
  const out: string[] = []
  walkContainers(root, ROOT_PATH, 0, () => true, out)
  return out
}

/** Container paths at `minDepth` or deeper (used for initial auto-collapse). */
export function collectDeepPaths(root: JsonValue, minDepth: number): string[] {
  const out: string[] = []
  walkContainers(root, ROOT_PATH, 0, (depth) => depth >= minDepth, out)
  return out
}

export const ROOT_PATH = '$'

const PLAIN_KEY = /^[A-Za-z_$][\w$]*$/

/**
 * Builds the canonical path of a child node. Plain keys use dot notation
 * (`parent.key`); keys with special characters use bracket-string notation
 * (`parent["weird.key"]`); array elements use index notation (`parent[0]`).
 */
export function childPath(parentPath: string, key: string | number): string {
  if (typeof key === 'number') return `${parentPath}[${key}]`
  if (PLAIN_KEY.test(key)) return `${parentPath}.${key}`
  const escaped = key.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `${parentPath}["${escaped}"]`
}

/** Strips the leading root marker so a path reads naturally when copied. */
export function toCopyPath(path: string): string {
  if (path === ROOT_PATH) return ROOT_PATH
  if (path.startsWith('$.')) return path.slice(2)
  return path.slice(1)
}

import type { JsonObject, JsonValue } from '../types'
import { classify, recordColumns } from './classifyNode'
import { childPath, ROOT_PATH, toCopyPath } from './jsonPath'

/** UTF-8 byte-order mark so Excel reads accented characters correctly. */
const BOM = String.fromCharCode(0xfeff)

function escapeField(field: string): string {
  if (/[",\r\n]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

function cellText(value: JsonValue): string {
  if (value === null) return 'null'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function rowsToCsv(rows: string[][]): string {
  return BOM + rows.map((row) => row.map(escapeField).join(',')).join('\r\n') + '\r\n'
}

/** Walks a nested value yielding [dotted-path, leafValue] pairs. */
function flattenLeaves(root: JsonValue): Array<[string, JsonValue]> {
  const out: Array<[string, JsonValue]> = []
  const visit = (value: JsonValue, path: string): void => {
    if (value === null || typeof value !== 'object') {
      out.push([toCopyPath(path), value])
      return
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        out.push([toCopyPath(path), value])
        return
      }
      value.forEach((child, i) => visit(child, childPath(path, i)))
    } else {
      const keys = Object.keys(value)
      if (keys.length === 0) {
        out.push([toCopyPath(path), value])
        return
      }
      for (const key of keys) visit(value[key], childPath(path, key))
    }
  }
  visit(root, ROOT_PATH)
  return out
}

/** Converts a JSON value to CSV, picking a layout based on the root shape. */
export function toCsv(data: JsonValue): string {
  const kind = classify(data)

  if (kind === 'records') {
    const rows = data as JsonObject[]
    const columns = recordColumns(rows)
    const csvRows: string[][] = [columns]
    for (const row of rows) {
      csvRows.push(columns.map((col) => (col in row ? cellText(row[col]) : '')))
    }
    return rowsToCsv(csvRows)
  }

  if (kind === 'object') {
    const obj = data as JsonObject
    const allPrimitive = Object.values(obj).every(
      (v) => v === null || typeof v !== 'object',
    )
    if (allPrimitive) {
      const csvRows: string[][] = [['chave', 'valor']]
      for (const [key, value] of Object.entries(obj)) {
        csvRows.push([key, cellText(value)])
      }
      return rowsToCsv(csvRows)
    }
    const csvRows: string[][] = [['caminho', 'valor']]
    for (const [path, value] of flattenLeaves(obj)) {
      csvRows.push([path, cellText(value)])
    }
    return rowsToCsv(csvRows)
  }

  if (kind === 'array') {
    const arr = data as JsonValue[]
    const csvRows: string[][] = [['indice', 'valor']]
    arr.forEach((value, i) => csvRows.push([String(i), cellText(value)]))
    return rowsToCsv(csvRows)
  }

  return rowsToCsv([['valor'], [cellText(data)]])
}

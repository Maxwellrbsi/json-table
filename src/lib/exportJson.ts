import type { JsonValue } from '../types'

export function formatJson(data: JsonValue): string {
  return JSON.stringify(data, null, 2)
}

/** Triggers a browser download of in-memory content. */
export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

import { useMemo, useRef } from 'react'
import type { JsonValue, ParseResult } from '../types'
import { DEBOUNCE_MS } from '../config'
import { useDebouncedValue } from './useDebouncedValue'

/**
 * Parses JSON text in real time. While the text is invalid it keeps returning
 * the last successfully parsed value so the grid stays visible.
 */
export function useJsonParser(text: string): ParseResult {
  const debounced = useDebouncedValue(text, DEBOUNCE_MS)
  const lastValid = useRef<JsonValue | undefined>(undefined)

  return useMemo<ParseResult>(() => {
    const trimmed = debounced.trim()
    if (trimmed === '') {
      return { data: undefined, error: null, isEmpty: true, stale: false }
    }
    try {
      const parsed = JSON.parse(trimmed) as JsonValue
      lastValid.current = parsed
      return { data: parsed, error: null, isEmpty: false, stale: false }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'JSON inválido'
      return { data: lastValid.current, error: message, isEmpty: false, stale: true }
    }
  }, [debounced])
}

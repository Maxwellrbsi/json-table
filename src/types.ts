export type JsonPrimitive = string | number | boolean | null

export interface JsonObject {
  [key: string]: JsonValue
}

export type JsonArray = JsonValue[]

export type JsonValue = JsonPrimitive | JsonObject | JsonArray

export type View = 'home' | 'grid'

export interface ParseResult {
  /** Parsed value, or the last valid value when the current text is invalid. */
  data: JsonValue | undefined
  /** Parse error message for the current text, or null when valid. */
  error: string | null
  /** True when the input is empty/whitespace. */
  isEmpty: boolean
  /** True when `data` comes from a previous valid parse (current text is invalid). */
  stale: boolean
}

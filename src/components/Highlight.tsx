import { highlightParts } from '../lib/search'

interface Props {
  text: string
  query: string
}

/** Renders text with query matches wrapped in <mark>. */
export function Highlight({ text, query }: Props) {
  if (query.trim() === '') return <>{text}</>
  const parts = highlightParts(text, query)
  if (parts.length === 1 && !parts[0].hit) return <>{text}</>
  return (
    <>
      {parts.map((part, i) =>
        part.hit ? (
          <mark key={i} className="hl">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  )
}

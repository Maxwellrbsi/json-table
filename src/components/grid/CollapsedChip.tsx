import { memo } from 'react'
import { useGrid } from './gridContext'

interface Props {
  variant: 'object' | 'array'
  count: number
  path: string
  isStatic?: boolean
}

/** Compact summary shown in place of a collapsed (or empty) container. */
export const CollapsedChip = memo(function CollapsedChip({
  variant,
  count,
  path,
  isStatic = false,
}: Props) {
  const { togglePath } = useGrid()
  const glyph = variant === 'object' ? '{ }' : '[ ]'
  const noun =
    variant === 'object'
      ? count === 1
        ? 'chave'
        : 'chaves'
      : count === 1
        ? 'item'
        : 'itens'
  const label = `${glyph} ${count} ${noun}`

  if (isStatic) {
    return <span className="chip chip-static">{label}</span>
  }
  return (
    <button
      type="button"
      className="chip"
      onClick={() => togglePath(path)}
      title="Expandir"
    >
      <span>{label}</span>
      <span className="chip-plus" aria-hidden="true">
        +
      </span>
    </button>
  )
})

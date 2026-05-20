import { memo } from 'react'
import { toCopyPath } from '../../lib/jsonPath'
import { useCopy } from '../../hooks/useCopy'
import { useGrid } from './gridContext'

type Variant = 'object' | 'records' | 'array'

interface Props {
  variant: Variant
  count: number
  path: string
  note?: string
}

const META: Record<Variant, { glyph: string; noun: (n: number) => string }> = {
  object: { glyph: '{ }', noun: (n) => (n === 1 ? 'campo' : 'campos') },
  records: { glyph: '[ ]', noun: (n) => (n === 1 ? 'registro' : 'registros') },
  array: { glyph: '[ ]', noun: (n) => (n === 1 ? 'item' : 'itens') },
}

/** Thin strip above a container table: collapse toggle, meta, copy-path. */
export const NodeHeader = memo(function NodeHeader({ variant, count, path, note }: Props) {
  const { togglePath } = useGrid()
  const copy = useCopy()
  const meta = META[variant]

  return (
    <div className="node-header">
      <button
        type="button"
        className="node-toggle"
        onClick={() => togglePath(path)}
        title="Recolher"
        aria-label="Recolher"
      >
        <span className="node-chevron" aria-hidden="true">
          ▾
        </span>
      </button>
      <span className="node-glyph" aria-hidden="true">
        {meta.glyph}
      </span>
      <span className="node-count">
        {count} {meta.noun(count)}
      </span>
      {note !== undefined && <span className="node-note">{note}</span>}
      <button
        type="button"
        className="node-copy"
        onClick={() => copy(toCopyPath(path), 'Caminho copiado')}
        title="Copiar caminho deste nó"
      >
        caminho
      </button>
    </div>
  )
})

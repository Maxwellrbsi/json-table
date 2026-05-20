import { memo, useCallback, useState } from 'react'
import type { JsonValue } from '../../types'
import { primitiveType } from '../../lib/classifyNode'
import { toCopyPath } from '../../lib/jsonPath'
import { useCopy } from '../../hooks/useCopy'
import { useDismissOnOutside } from '../../hooks/useDismissOnOutside'
import { useGrid } from './gridContext'
import { Highlight } from '../Highlight'

interface Props {
  value: JsonValue
  path: string
}

interface MenuPos {
  x: number
  y: number
}

function asText(value: JsonValue): string {
  return value === null ? 'null' : String(value)
}

/** A leaf value, color-coded by type, with a click menu to copy value/path. */
export const PrimitiveCell = memo(function PrimitiveCell({ value, path }: Props) {
  const { search } = useGrid()
  const copy = useCopy()
  const [menu, setMenu] = useState<MenuPos | null>(null)

  const type = primitiveType(value)
  const text = asText(value)
  const isEmptyString = type === 'string' && text === ''

  const closeMenu = useCallback(() => setMenu(null), [])
  useDismissOnOutside(menu !== null, closeMenu)

  return (
    <>
      <span
        className={`cell-primitive type-${type}${isEmptyString ? ' cell-empty-string' : ''}`}
        title={isEmptyString ? 'string vazia' : text}
        onClick={(e) => {
          e.stopPropagation()
          setMenu({
            x: Math.min(e.clientX, window.innerWidth - 172),
            y: Math.min(e.clientY, window.innerHeight - 88),
          })
        }}
      >
        {isEmptyString ? '""' : <Highlight text={text} query={search.query} />}
      </span>
      {menu !== null && (
        <div
          className="cell-menu"
          style={{ left: menu.x, top: menu.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="cell-menu-item"
            onClick={() => {
              copy(asText(value), 'Valor copiado')
              setMenu(null)
            }}
          >
            Copiar valor
          </button>
          <button
            type="button"
            className="cell-menu-item"
            onClick={() => {
              copy(toCopyPath(path), 'Caminho copiado')
              setMenu(null)
            }}
          >
            Copiar caminho
          </button>
        </div>
      )}
    </>
  )
})

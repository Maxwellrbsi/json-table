import { useDismissOnOutside } from '../../hooks/useDismissOnOutside'

export interface MenuItem {
  label: string
  onSelect: () => void
  /** Renders the item in a destructive (red) style. */
  danger?: boolean
}

interface Props {
  items: MenuItem[]
  /** Anchor point in viewport coords; the popup is clamped to stay on screen. */
  x: number
  y: number
  onClose: () => void
}

const POP_WIDTH = 190
const ITEM_HEIGHT = 32

/** A positioned, dismissible popup list of actions. */
export function MenuPopup({ items, x, y, onClose }: Props) {
  useDismissOnOutside(true, onClose)

  const left = Math.max(8, Math.min(x, window.innerWidth - POP_WIDTH - 8))
  const height = items.length * ITEM_HEIGHT + 8
  const top = Math.max(8, Math.min(y, window.innerHeight - height - 8))

  return (
    <div
      className="action-menu"
      style={{ left, top }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          className={`action-menu-item${item.danger ? ' is-danger' : ''}`}
          onClick={() => {
            item.onSelect()
            onClose()
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

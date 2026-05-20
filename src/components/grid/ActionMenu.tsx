import { useCallback, useState, type MouseEvent, type ReactNode } from 'react'
import { MenuPopup, type MenuItem } from './MenuPopup'

interface Props {
  items: MenuItem[]
  ariaLabel: string
  /** Class applied to the trigger button. */
  triggerClassName: string
  /** Trigger content (icon or text). */
  children: ReactNode
}

/** A trigger button that opens a dismissible popup of actions. */
export function ActionMenu({ items, ariaLabel, triggerClassName, children }: Props) {
  const [open, setOpen] = useState<{ x: number; y: number } | null>(null)
  const close = useCallback(() => setOpen(null), [])

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        aria-label={ariaLabel}
        title={ariaLabel}
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation()
          const r = e.currentTarget.getBoundingClientRect()
          setOpen({ x: r.left, y: r.bottom + 4 })
        }}
      >
        {children}
      </button>
      {open !== null && (
        <MenuPopup items={items} x={open.x} y={open.y} onClose={close} />
      )}
    </>
  )
}

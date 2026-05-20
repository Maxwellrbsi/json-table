import { useEffect } from 'react'

interface Props {
  message: string
  detail?: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/** A small modal that asks the user to confirm a destructive action. */
export function ConfirmDialog({
  message,
  detail,
  confirmLabel,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="confirm-backdrop" onMouseDown={onCancel}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <p className="confirm-message">{message}</p>
        {detail !== undefined && <p className="confirm-detail">{detail}</p>}
        <div className="confirm-actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="confirm-delete" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

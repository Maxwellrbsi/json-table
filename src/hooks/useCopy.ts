import { useCallback } from 'react'
import { useToast } from '../context/ToastContext'
import { copyText } from '../lib/clipboard'

/** Returns a function that copies text and shows a confirmation toast. */
export function useCopy(): (text: string, successMessage: string) => void {
  const { showToast } = useToast()
  return useCallback(
    (text: string, successMessage: string) => {
      void copyText(text).then((ok) => {
        showToast(ok ? successMessage : 'Falha ao copiar')
      })
    },
    [showToast],
  )
}

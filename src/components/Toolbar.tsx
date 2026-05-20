import type { JsonValue } from '../types'
import { useToast } from '../context/ToastContext'
import { useCopy } from '../hooks/useCopy'
import { downloadFile, formatJson } from '../lib/exportJson'
import { toCsv } from '../lib/exportCsv'
import { SearchBox } from './SearchBox'

interface Props {
  data: JsonValue | undefined
  searchQuery: string
  onSearchChange: (value: string) => void
  matchCount: number
  onExpandAll: () => void
  onCollapseAll: () => void
}

export function Toolbar({
  data,
  searchQuery,
  onSearchChange,
  matchCount,
  onExpandAll,
  onCollapseAll,
}: Props) {
  const copy = useCopy()
  const { showToast } = useToast()
  const ready = data !== undefined

  const copyJson = () => {
    if (data === undefined) return
    copy(formatJson(data), 'JSON copiado')
  }

  const downloadJson = () => {
    if (data === undefined) return
    downloadFile('json-table.json', formatJson(data), 'application/json')
    showToast('JSON baixado')
  }

  const exportCsv = () => {
    if (data === undefined) return
    downloadFile('json-table.csv', toCsv(data), 'text/csv;charset=utf-8')
    showToast('CSV exportado')
  }

  return (
    <div className="toolbar">
      <SearchBox value={searchQuery} onChange={onSearchChange} matchCount={matchCount} />
      <div className="toolbar-group">
        <button type="button" className="btn" onClick={onExpandAll} disabled={!ready}>
          Expandir tudo
        </button>
        <button type="button" className="btn" onClick={onCollapseAll} disabled={!ready}>
          Recolher tudo
        </button>
      </div>
      <div className="toolbar-group">
        <button type="button" className="btn" onClick={copyJson} disabled={!ready}>
          Copiar JSON
        </button>
        <button type="button" className="btn" onClick={downloadJson} disabled={!ready}>
          Baixar JSON
        </button>
        <button type="button" className="btn btn-accent" onClick={exportCsv} disabled={!ready}>
          Exportar CSV
        </button>
      </div>
    </div>
  )
}

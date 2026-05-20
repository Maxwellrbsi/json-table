import { useCallback, useMemo, useState } from 'react'
import type { JsonValue } from '../types'
import { AUTO_COLLAPSE_DEPTH } from '../config'
import { useJsonParser } from '../hooks/useJsonParser'
import { collectAllContainerPaths, collectDeepPaths } from '../lib/collapse'
import { replaceByRef } from '../lib/editData'
import { formatJson } from '../lib/exportJson'
import { runSearch } from '../lib/search'
import { useToast } from '../context/ToastContext'
import { JsonEditor } from '../components/JsonEditor'
import { Toolbar } from '../components/Toolbar'
import { EmptyState } from '../components/EmptyState'
import { GridRoot } from '../components/grid/GridRoot'

interface Props {
  jsonText: string
  onChangeJson: (text: string) => void
  onHome: () => void
}

/** The exploration workspace: collapsible JSON panel + the live grid. */
export function GridView({ jsonText, onChangeJson, onHome }: Props) {
  const parse = useJsonParser(jsonText)
  const { showToast } = useToast()
  const [editorCollapsed, setEditorCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(() => {
    try {
      const initial = JSON.parse(jsonText.trim())
      return new Set(collectDeepPaths(initial, AUTO_COLLAPSE_DEPTH))
    } catch {
      return new Set<string>()
    }
  })

  const search = useMemo(
    () => runSearch(parse.data, searchQuery),
    [parse.data, searchQuery],
  )

  const togglePath = useCallback((path: string) => {
    setCollapsedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const expandAll = useCallback(() => setCollapsedPaths(new Set<string>()), [])

  const collapseAll = useCallback(() => {
    if (parse.data !== undefined) {
      setCollapsedPaths(new Set(collectAllContainerPaths(parse.data)))
    }
  }, [parse.data])

  const editValue = useCallback(
    (target: JsonValue, replacement: JsonValue) => {
      if (parse.data === undefined || parse.stale) {
        showToast('Corrija o JSON para poder editar a tabela')
        return
      }
      onChangeJson(formatJson(replaceByRef(parse.data, target, replacement)))
    },
    [parse.data, parse.stale, onChangeJson, showToast],
  )

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="brand" onClick={onHome} title="Voltar ao início">
          <span className="brand-mark" aria-hidden="true">
            ▦
          </span>
          <span className="brand-name">JSON Table</span>
        </button>
        <Toolbar
          data={parse.data}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          matchCount={search.matchPaths.size}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
        />
      </header>

      <div className={`workspace${editorCollapsed ? ' editor-is-collapsed' : ''}`}>
        <JsonEditor
          value={jsonText}
          onChange={onChangeJson}
          error={parse.error}
          collapsed={editorCollapsed}
          onToggleCollapse={() => setEditorCollapsed((c) => !c)}
        />
        <main className="grid-area">
          {parse.isEmpty ? (
            <EmptyState variant="empty" />
          ) : parse.data === undefined ? (
            <EmptyState variant="waiting" />
          ) : (
            <GridRoot
              data={parse.data}
              collapsedPaths={collapsedPaths}
              onTogglePath={togglePath}
              search={search}
              editValue={editValue}
            />
          )}
        </main>
      </div>
    </div>
  )
}

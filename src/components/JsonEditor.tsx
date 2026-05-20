import { ErrorBanner } from './ErrorBanner'

interface Props {
  value: string
  onChange: (value: string) => void
  error: string | null
  collapsed: boolean
  onToggleCollapse: () => void
}

/** The collapsible left "JSON bar": a styled textarea plus parse error. */
export function JsonEditor({ value, onChange, error, collapsed, onToggleCollapse }: Props) {
  if (collapsed) {
    return (
      <div className="editor-pane editor-rail">
        <button
          type="button"
          className="rail-toggle"
          onClick={onToggleCollapse}
          title="Mostrar painel JSON"
        >
          <span className="rail-chevron" aria-hidden="true">
            ›
          </span>
          <span className="rail-label">JSON</span>
        </button>
      </div>
    )
  }

  const lineCount = value === '' ? 0 : value.split('\n').length

  return (
    <div className="editor-pane">
      <div className="editor-header">
        <span className="editor-title">JSON</span>
        <span className="editor-meta">
          {lineCount} {lineCount === 1 ? 'linha' : 'linhas'} · {value.length} car.
        </span>
        <button
          type="button"
          className="editor-collapse"
          onClick={onToggleCollapse}
          title="Ocultar painel JSON"
          aria-label="Ocultar painel JSON"
        >
          ‹
        </button>
      </div>
      <textarea
        className="editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        placeholder="Cole ou edite o JSON aqui..."
      />
      {error !== null && <ErrorBanner message={error} />}
    </div>
  )
}

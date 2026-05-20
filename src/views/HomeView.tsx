import { useMemo, useState, type KeyboardEvent } from 'react'

interface Props {
  initialText: string
  onSubmit: (text: string) => void
}

type Validity = 'idle' | 'valid' | 'invalid'

/** ChatGPT-style landing page: one large centered JSON input. */
export function HomeView({ initialText, onSubmit }: Props) {
  const [text, setText] = useState(initialText)
  const trimmed = text.trim()
  const canSubmit = trimmed !== ''

  const validity = useMemo<Validity>(() => {
    if (trimmed === '') return 'idle'
    try {
      JSON.parse(trimmed)
      return 'valid'
    } catch {
      return 'invalid'
    }
  }, [trimmed])

  const submit = () => {
    if (canSubmit) onSubmit(text)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="home">
      <div className="home-inner">
        <div className="home-brand">
          <span className="home-mark" aria-hidden="true">
            ▦
          </span>
          <h1 className="home-title">JSON Table</h1>
        </div>
        <p className="home-subtitle">
          Cole um JSON e explore-o como uma tabela interativa.
        </p>

        <div className={`home-box validity-${validity}`}>
          <textarea
            className="home-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={'{\n  "exemplo": [\n    { "id": 1, "nome": "Ana" }\n  ]\n}'}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoFocus
          />
          <div className="home-box-footer">
            <span className={`home-validity validity-${validity}`}>
              {validity === 'valid' && '● JSON válido'}
              {validity === 'invalid' && '● JSON inválido'}
            </span>
            <button
              type="button"
              className="btn-primary"
              onClick={submit}
              disabled={!canSubmit}
            >
              Explorar
            </button>
          </div>
        </div>

        <p className="home-hint">
          <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Enter</kbd> para explorar
        </p>
      </div>
    </div>
  )
}

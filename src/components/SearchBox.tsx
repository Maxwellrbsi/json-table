interface Props {
  value: string
  onChange: (value: string) => void
  matchCount: number
}

export function SearchBox({ value, onChange, matchCount }: Props) {
  const active = value.trim() !== ''
  return (
    <div className={`search-box${active ? ' is-active' : ''}`}>
      <span className="search-icon" aria-hidden="true">
        ⌕
      </span>
      <input
        type="text"
        className="search-input"
        placeholder="Buscar chaves e valores..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
      />
      {active && (
        <span className={`search-count${matchCount === 0 ? ' is-none' : ''}`}>
          {matchCount === 0 ? 'nenhum' : `${matchCount}`}
        </span>
      )}
      {active && (
        <button
          type="button"
          className="search-clear"
          onClick={() => onChange('')}
          title="Limpar busca"
          aria-label="Limpar busca"
        >
          ✕
        </button>
      )}
    </div>
  )
}

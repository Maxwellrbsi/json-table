interface Props {
  variant: 'empty' | 'waiting'
}

export function EmptyState({ variant }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-glyph" aria-hidden="true">
        {variant === 'empty' ? '{ }' : '⋯'}
      </div>
      <p className="empty-text">
        {variant === 'empty'
          ? 'Cole um JSON no painel à esquerda para ver a tabela.'
          : 'Aguardando um JSON válido...'}
      </p>
    </div>
  )
}

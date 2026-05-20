interface Props {
  message: string
}

export function ErrorBanner({ message }: Props) {
  return (
    <div className="error-banner" role="alert">
      <span className="error-mark" aria-hidden="true">
        !
      </span>
      <span className="error-text">{message}</span>
    </div>
  )
}

export function LoadingState({ label = 'Chargement du dossier…' }: { label?: string }) {
  return (
    <div className="state state--loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state state--error" role="alert">
      <p className="state__title">Données inaccessibles</p>
      <p className="state__message">{message}</p>
      {onRetry ? (
        <button type="button" className="button button--ghost" onClick={onRetry}>
          Réessayer
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="state state--empty">
      <p className="state__title">{title}</p>
      {message ? <p className="state__message">{message}</p> : null}
    </div>
  );
}

import { fetchContradictions, fetchDocuments } from '../api/client';
import { SeverityBadge } from '../components/Badge';
import { Panel } from '../components/Panel';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { useAsync } from '../hooks/useAsync';
import { severityRank } from '../utils/format';
import { navigate } from '../utils/router';

export function ContradictionsPage() {
  const contradictions = useAsync(fetchContradictions, 'contradictions');
  const documents = useAsync(() => fetchDocuments(''), 'contradictions-documents');

  const titleById = new Map(
    (documents.data?.documents ?? []).map((item) => [item.documentId, item.title]),
  );

  const ordered = [...(contradictions.data?.contradictions ?? [])].sort(
    (a, b) => severityRank(a.severity) - severityRank(b.severity) || a.id.localeCompare(b.id),
  );

  return (
    <div>
      <div className="page-head">
        <span className="page-head__eyebrow">Analyse</span>
        <h1 className="page-head__title">Contradictions détectées</h1>
        <p className="page-head__lead">
          Le laboratoire compare les faits déclarés dans chaque pièce. Chaque contradiction est
          adossée à ses extraits sources exacts.
        </p>
      </div>

      {contradictions.loading && !contradictions.data ? (
        <LoadingState label="Analyse des pièces…" />
      ) : null}
      {contradictions.error ? (
        <ErrorState message={contradictions.error} onRetry={contradictions.reload} />
      ) : null}
      {contradictions.data && ordered.length === 0 ? (
        <Panel>
          <EmptyState
            title="Aucune contradiction détectée"
            message="Les pièces du dossier sont cohérentes."
          />
        </Panel>
      ) : null}

      {ordered.length > 0 ? (
        <div className="contradiction-list">
          {ordered.map((contradiction) => (
            <article key={contradiction.id} className="contradiction">
              <div className="contradiction__head">
                <SeverityBadge severity={contradiction.severity} />
                <span className="badge badge--quiet">{contradiction.attributeLabel}</span>
                <span className="contradiction__subject">{contradiction.subject}</span>
              </div>
              <h2 className="contradiction__title">{contradiction.title}</h2>
              <p className="contradiction__explanation">{contradiction.explanation}</p>

              <div className="excerpt-list">
                {contradiction.extraits.map((excerpt) => (
                  <div key={`${excerpt.documentId}-${excerpt.startIndex}`} className="excerpt">
                    <div className="excerpt__doc">
                      <span>{titleById.get(excerpt.documentId) ?? excerpt.documentId}</span>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() =>
                          navigate({
                            name: 'document',
                            id: excerpt.documentId,
                            query: null,
                            focus: excerpt.excerpt,
                          })
                        }
                      >
                        Ouvrir la source
                      </button>
                    </div>
                    <blockquote className="excerpt__text">« {excerpt.excerpt} »</blockquote>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

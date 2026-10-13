import type { Contradiction, SearchResult } from '@trace/core';
import { fetchContradictions, fetchDocuments } from '../api/client';
import type { CaseOverview } from '../api/types';
import { Badge, SeverityBadge } from '../components/Badge';
import { Panel } from '../components/Panel';
import { StatCard } from '../components/StatCard';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { useAsync } from '../hooks/useAsync';
import { formatDate, severityRank } from '../utils/format';
import { navigate } from '../utils/router';

function byDateDescending(a: SearchResult, b: SearchResult): number {
  if (a.date !== b.date) {
    return a.date < b.date ? 1 : -1;
  }
  return a.documentId < b.documentId ? -1 : 1;
}

export function OverviewPage({ caseData }: { caseData: CaseOverview }) {
  const documents = useAsync(() => fetchDocuments(''), 'overview-documents');
  const contradictions = useAsync(fetchContradictions, 'overview-contradictions');

  const priority: Contradiction[] = [...(contradictions.data?.contradictions ?? [])]
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity) || a.id.localeCompare(b.id))
    .slice(0, 3);

  const recentDocuments: SearchResult[] = [...(documents.data?.documents ?? [])]
    .sort(byDateDescending)
    .slice(0, 4);

  return (
    <div>
      <section className="hero">
        <span className="hero__eyebrow">Dossier {caseData.id}</span>
        <h1 className="hero__title">{caseData.name}</h1>
        <p className="hero__synopsis">{caseData.synopsis}</p>
        <div className="tag-row">
          <Badge tone="amber">Enquête en cours</Badge>
          <Badge>
            {caseData.counts.contradictions} contradiction
            {caseData.counts.contradictions > 1 ? 's' : ''} à instruire
          </Badge>
          <Badge tone="quiet">{caseData.counts.facts} faits sourcés</Badge>
        </div>
      </section>

      <div className="overview-grid">
        <Panel title="Le dossier en chiffres" subtitle="Éléments indexés par le laboratoire">
          <div className="stat-grid">
            <StatCard value={caseData.counts.documents} label="Documents" />
            <StatCard value={caseData.counts.events} label="Évènements" />
            <StatCard value={caseData.counts.people} label="Personnes" />
            <StatCard value={caseData.counts.places} label="Lieux" />
            <StatCard value={caseData.counts.contradictions} label="Contradictions" />
          </div>
        </Panel>

        <div className="split-2">
          <Panel title="À examiner en priorité" subtitle="Contradictions les plus lourdes">
            {contradictions.loading && !contradictions.data ? <LoadingState /> : null}
            {contradictions.error ? (
              <ErrorState message={contradictions.error} onRetry={contradictions.reload} />
            ) : null}
            {contradictions.data && priority.length === 0 ? (
              <EmptyState title="Aucune contradiction détectée" />
            ) : null}
            {priority.length > 0 ? (
              <ul className="mini-list">
                {priority.map((contradiction) => (
                  <li key={contradiction.id} className="mini-item">
                    <div className="meta-line">
                      <SeverityBadge severity={contradiction.severity} />
                    </div>
                    <button
                      type="button"
                      className="link-button mini-item__title"
                      onClick={() => navigate({ name: 'contradictions' })}
                    >
                      {contradiction.title}
                    </button>
                    <span className="mini-item__meta">{contradiction.subject}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </Panel>

          <Panel title="Derniers documents" subtitle="Par date de rédaction">
            {documents.loading && !documents.data ? <LoadingState /> : null}
            {documents.error ? (
              <ErrorState message={documents.error} onRetry={documents.reload} />
            ) : null}
            {documents.data && recentDocuments.length === 0 ? (
              <EmptyState title="Aucun document" />
            ) : null}
            {recentDocuments.length > 0 ? (
              <ul className="mini-list">
                {recentDocuments.map((document) => (
                  <li key={document.documentId} className="mini-item">
                    <button
                      type="button"
                      className="link-button mini-item__title"
                      onClick={() =>
                        navigate({
                          name: 'document',
                          id: document.documentId,
                          query: null,
                          focus: null,
                        })
                      }
                    >
                      {document.title}
                    </button>
                    <span className="mini-item__meta">
                      {document.kind} · {formatDate(document.date)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </Panel>
        </div>
      </div>
    </div>
  );
}

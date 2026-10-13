import { useEffect, useRef, useState } from 'react';
import { fetchDocument, fetchDocuments } from '../api/client';
import type { CaseOverview } from '../api/types';
import { Badge } from '../components/Badge';
import { HighlightedText } from '../components/HighlightedText';
import { Panel } from '../components/Panel';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { useAsync } from '../hooks/useAsync';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { formatDate } from '../utils/format';
import { queryTerms, substringRange, termRanges } from '../utils/highlight';
import type { TextRange } from '../utils/highlight';
import { navigate } from '../utils/router';
import type { Route } from '../utils/router';

interface DocumentsPageProps {
  route: Route;
  caseData: CaseOverview;
}

export function DocumentsPage({ route, caseData }: DocumentsPageProps) {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 220);

  const activeId = route.name === 'document' ? route.id : null;
  const focus = route.name === 'document' ? route.focus : null;

  useEffect(() => {
    if (route.name === 'document') {
      setQuery(route.query ?? '');
    }
  }, [route]);

  const list = useAsync(() => fetchDocuments(debounced), `documents:${debounced}`);
  const detail = useAsync(
    () => (activeId ? fetchDocument(activeId) : Promise.resolve(null)),
    activeId ? `document:${activeId}` : 'document:none',
  );

  const terms = queryTerms(debounced);
  const doc = detail.data && detail.data.id === activeId ? detail.data : null;
  const focusRange = doc && focus ? substringRange(doc.content, focus) : null;
  const contentRanges: TextRange[] = doc
    ? [...termRanges(doc.content, terms), ...(focusRange ? [focusRange] : [])]
    : [];
  const titleRanges = doc ? termRanges(doc.title, terms) : [];

  const contentRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!focus || !doc) {
      return;
    }
    contentRef.current?.querySelector('.hl--focus')?.scrollIntoView?.({ block: 'center' });
  }, [focus, doc]);

  function authorName(authorId: string | undefined): string | null {
    if (!authorId) {
      return null;
    }
    return caseData.people.find((person) => person.id === authorId)?.name ?? null;
  }

  function placeName(placeId: string | undefined): string | null {
    if (!placeId) {
      return null;
    }
    return caseData.places.find((place) => place.id === placeId)?.name ?? null;
  }

  const documentCount = list.data?.count ?? 0;

  return (
    <div>
      <div className="page-head">
        <span className="page-head__eyebrow">Pièces du dossier</span>
        <h1 className="page-head__title">Documents</h1>
        <p className="page-head__lead">
          Consultez les pièces versées au dossier, recherchez un terme et ouvrez le document
          complet. Les occurrences recherchées sont surlignées.
        </p>
      </div>

      <div className="doc-layout">
        <Panel
          title="Inventaire"
          subtitle={`${documentCount} pièce${documentCount > 1 ? 's' : ''} affichée${documentCount > 1 ? 's' : ''}`}
        >
          <div className="field">
            <label className="field__label" htmlFor="document-search">
              Rechercher
            </label>
            <input
              id="document-search"
              className="input"
              type="search"
              value={query}
              placeholder="coton, scellé, Mercier…"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="divider" />

          {list.loading && !list.data ? <LoadingState /> : null}
          {list.error ? <ErrorState message={list.error} onRetry={list.reload} /> : null}
          {list.data && list.data.documents.length === 0 ? (
            <EmptyState
              title="Aucun document ne correspond"
              message="Essayez un autre terme de recherche."
            />
          ) : null}
          {list.data && list.data.documents.length > 0 ? (
            <ul className="doc-list">
              {list.data.documents.map((item) => {
                const active = item.documentId === activeId;
                return (
                  <li key={item.documentId}>
                    <button
                      type="button"
                      className={
                        active ? 'doc-list__item doc-list__item--active' : 'doc-list__item'
                      }
                      onClick={() =>
                        navigate({
                          name: 'document',
                          id: item.documentId,
                          query: debounced,
                          focus: null,
                        })
                      }
                    >
                      <span className="doc-list__title">
                        <HighlightedText text={item.title} ranges={termRanges(item.title, terms)} />
                      </span>
                      <span className="doc-list__meta">
                        <span>{item.kind}</span>
                        <span>{formatDate(item.date)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </Panel>

        <Panel title="Lecture" subtitle={doc ? doc.kind : 'Aucune sélection'}>
          {!activeId ? (
            <EmptyState
              title="Sélectionnez un document"
              message="Choisissez une pièce dans l'inventaire."
            />
          ) : null}
          {activeId && detail.loading && !doc ? (
            <LoadingState label="Ouverture du document…" />
          ) : null}
          {activeId && detail.error ? (
            <ErrorState message={detail.error} onRetry={detail.reload} />
          ) : null}
          {doc ? (
            <article>
              <div className="doc-viewer__head">
                <h2 className="doc-viewer__title">
                  <HighlightedText text={doc.title} ranges={titleRanges} />
                </h2>
                <div className="doc-viewer__meta">
                  <span>{doc.kind}</span>
                  <span>{formatDate(doc.date)}</span>
                  {authorName(doc.authorId) ? <span>{authorName(doc.authorId)}</span> : null}
                  {placeName(doc.placeId) ? <span>{placeName(doc.placeId)}</span> : null}
                </div>
                {focus ? (
                  <div className="tag-row">
                    <Badge tone="amber">Extrait cité</Badge>
                  </div>
                ) : null}
              </div>
              <div className="doc-viewer__content" ref={contentRef}>
                <HighlightedText
                  text={doc.content}
                  ranges={contentRanges}
                  focusRange={focusRange}
                />
              </div>
              {doc.tags.length > 0 ? (
                <div className="tag-row">
                  {doc.tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}

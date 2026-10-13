import { useState } from 'react';
import type { CaseEvent } from '@trace/core';
import { fetchEvents } from '../api/client';
import type { CaseOverview } from '../api/types';
import { Badge } from '../components/Badge';
import { Panel } from '../components/Panel';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { useAsync } from '../hooks/useAsync';
import { formatDate, formatTime } from '../utils/format';
import { navigate } from '../utils/router';

interface ChronologyPageProps {
  caseData: CaseOverview;
}

interface Filters {
  person: string;
  place: string;
  kind: string;
}

const EMPTY_FILTERS: Filters = { person: '', place: '', kind: '' };

export function ChronologyPage({ caseData }: ChronologyPageProps) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allEvents = useAsync(() => fetchEvents({}), 'events-all');
  const events = useAsync(
    () => fetchEvents({ person: filters.person, place: filters.place, kind: filters.kind }),
    `events:${filters.person}|${filters.place}|${filters.kind}`,
  );

  const kinds = [...new Set((allEvents.data?.events ?? []).map((event) => event.kind))].sort();

  const personName = (id: string): string =>
    caseData.people.find((person) => person.id === id)?.name ?? id;
  const placeName = (id: string): string =>
    caseData.places.find((place) => place.id === id)?.name ?? id;

  const groups = new Map<string, CaseEvent[]>();
  for (const event of events.data?.events ?? []) {
    const bucket = groups.get(event.date) ?? [];
    bucket.push(event);
    groups.set(event.date, bucket);
  }
  const days = [...groups.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

  const hasFilter = filters.person !== '' || filters.place !== '' || filters.kind !== '';

  function toggle(id: string): void {
    setSelectedId((current) => (current === id ? null : id));
  }

  return (
    <div>
      <div className="page-head">
        <span className="page-head__eyebrow">Reconstitution</span>
        <h1 className="page-head__title">Chronologie</h1>
        <p className="page-head__lead">
          Les évènements du dossier, du départ d’Anvers à l’alerte à la douane. Filtrez par
          personne, lieu ou nature d’évènement.
        </p>
      </div>

      <Panel title="Filtres" subtitle="Croisez les faits selon leur contexte">
        <div className="filters">
          <div className="field">
            <label className="field__label" htmlFor="filter-person">
              Personne
            </label>
            <select
              id="filter-person"
              className="select"
              value={filters.person}
              onChange={(event) =>
                setFilters((current) => ({ ...current, person: event.target.value }))
              }
            >
              <option value="">Toutes</option>
              {caseData.people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="filter-place">
              Lieu
            </label>
            <select
              id="filter-place"
              className="select"
              value={filters.place}
              onChange={(event) =>
                setFilters((current) => ({ ...current, place: event.target.value }))
              }
            >
              <option value="">Tous</option>
              {caseData.places.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="filter-kind">
              Nature
            </label>
            <select
              id="filter-kind"
              className="select"
              value={filters.kind}
              onChange={(event) =>
                setFilters((current) => ({ ...current, kind: event.target.value }))
              }
            >
              <option value="">Toutes</option>
              {kinds.map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <span className="field__label">&nbsp;</span>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setFilters(EMPTY_FILTERS)}
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </Panel>

      <div className="divider" />

      {events.loading && !events.data ? (
        <LoadingState label="Chargement de la chronologie…" />
      ) : null}
      {events.error ? <ErrorState message={events.error} onRetry={events.reload} /> : null}
      {events.data && events.data.count === 0 ? (
        <EmptyState
          title="Aucun évènement pour ces filtres"
          message={hasFilter ? 'Élargissez la sélection pour retrouver des évènements.' : undefined}
        />
      ) : null}

      {events.data && events.data.count > 0 ? (
        <div className="timeline">
          {days.map(([date, dayEvents]) => (
            <section key={date}>
              <div className="timeline__date">{formatDate(date)}</div>
              <div className="timeline__events">
                {dayEvents.map((event) => {
                  const active = event.id === selectedId;
                  const time = formatTime(event.time);
                  return (
                    <article
                      key={event.id}
                      className={active ? 'event-card event-card--active' : 'event-card'}
                      role="button"
                      tabIndex={0}
                      aria-expanded={active}
                      onClick={() => toggle(event.id)}
                      onKeyDown={(keyEvent) => {
                        if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                          keyEvent.preventDefault();
                          toggle(event.id);
                        }
                      }}
                    >
                      <div className="event-card__time">{time ?? '—'}</div>
                      <div>
                        <h3 className="event-card__title">{event.title}</h3>
                        <div className="event-card__meta">
                          <Badge>{event.kind}</Badge>
                          <span>{placeName(event.placeId)}</span>
                          <span>{event.participantIds.map((id) => personName(id)).join(', ')}</span>
                        </div>
                        {active ? (
                          <div className="event-card__body">
                            <p className="event-card__desc">{event.description}</p>
                            <div className="chip-list">
                              <button
                                type="button"
                                className="chip"
                                onClick={(clickEvent) => {
                                  clickEvent.stopPropagation();
                                  navigate({ name: 'graph', focus: event.id });
                                }}
                              >
                                Voir dans le graphe
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}

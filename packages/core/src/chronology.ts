import type { CaseEvent } from './types';

export interface ChronologyFilters {
  personId?: string;
  placeId?: string;
  kind?: string;
}

export function timeToMinutes(time: string | undefined): number | null {
  if (!time) {
    return null;
  }
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) {
    return null;
  }
  const hours = Number.parseInt(match[1] ?? '', 10);
  const minutes = Number.parseInt(match[2] ?? '', 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes > 59 || hours > 23) {
    return null;
  }
  return hours * 60 + minutes;
}

export function compareEvents(a: CaseEvent, b: CaseEvent): number {
  if (a.date !== b.date) {
    return a.date < b.date ? -1 : 1;
  }
  const aMinutes = timeToMinutes(a.time);
  const bMinutes = timeToMinutes(b.time);
  if (aMinutes !== bMinutes) {
    if (aMinutes === null) {
      return -1;
    }
    if (bMinutes === null) {
      return 1;
    }
    return aMinutes < bMinutes ? -1 : 1;
  }
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

function matchesFilters(event: CaseEvent, filters: ChronologyFilters): boolean {
  if (filters.personId && !event.participantIds.includes(filters.personId)) {
    return false;
  }
  if (filters.placeId && event.placeId !== filters.placeId) {
    return false;
  }
  if (filters.kind && event.kind !== filters.kind) {
    return false;
  }
  return true;
}

export function buildChronology(events: CaseEvent[], filters: ChronologyFilters = {}): CaseEvent[] {
  return events.filter((event) => matchesFilters(event, filters)).sort(compareEvents);
}

export function listEventKinds(events: CaseEvent[]): string[] {
  return [...new Set(events.map((event) => event.kind))].sort();
}

import type { CaseEvent, CasePerson, CasePlace, Contradiction, SearchResult } from '@trace/core';

export interface CaseCounts {
  documents: number;
  people: number;
  places: number;
  events: number;
  facts: number;
  contradictions: number;
}

export interface CaseOverview {
  id: string;
  name: string;
  synopsis: string;
  counts: CaseCounts;
  people: CasePerson[];
  places: CasePlace[];
}

export interface DocumentsResponse {
  query: string;
  count: number;
  documents: SearchResult[];
}

export interface AppliedFilters {
  person: string | null;
  place: string | null;
  kind: string | null;
}

export interface EventsResponse {
  count: number;
  events: CaseEvent[];
  filters: AppliedFilters;
}

export interface ContradictionsResponse {
  count: number;
  contradictions: Contradiction[];
}

export type { CaseEvent, CasePerson, CasePlace, Contradiction, SearchResult };

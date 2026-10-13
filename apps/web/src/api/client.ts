import type { CaseDocument, Graph } from '@trace/core';
import type {
  CaseOverview,
  ContradictionsResponse,
  DocumentsResponse,
  EventsResponse,
} from './types';

const DEFAULT_BASE_URL = 'http://localhost:3000';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function apiBaseUrl(): string {
  const raw: unknown = import.meta.env.VITE_API_URL;
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim().replace(/\/+$/, '');
  }
  return DEFAULT_BASE_URL;
}

function withQuery(path: string, params: Record<string, string | null | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && value.trim().length > 0) {
      search.set(key, value.trim());
    }
  }
  const query = search.toString();
  return query.length > 0 ? `${path}?${query}` : path;
}

async function request<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, { headers: { accept: 'application/json' } });
  } catch {
    throw new ApiError(
      0,
      'network_error',
      "Impossible de joindre l'API TRACE. Vérifiez qu'elle est démarrée (npm run dev -w @trace/api).",
    );
  }

  if (!response.ok) {
    let code = 'http_error';
    let message = `La requête a échoué (${response.status}).`;
    try {
      const body = (await response.json()) as { error?: { code?: string; message?: string } };
      code = body.error?.code ?? code;
      message = body.error?.message ?? message;
    } catch {
      // corps non JSON : on garde le message générique
    }
    throw new ApiError(response.status, code, message);
  }

  return (await response.json()) as T;
}

export function fetchCase(): Promise<CaseOverview> {
  return request<CaseOverview>('/api/case');
}

export function fetchDocuments(query = ''): Promise<DocumentsResponse> {
  return request<DocumentsResponse>(withQuery('/api/documents', { q: query }));
}

export function fetchDocument(id: string): Promise<CaseDocument> {
  return request<CaseDocument>(`/api/documents/${encodeURIComponent(id)}`);
}

export function fetchEvents(
  filters: {
    person?: string | null;
    place?: string | null;
    kind?: string | null;
  } = {},
): Promise<EventsResponse> {
  return request<EventsResponse>(
    withQuery('/api/events', {
      person: filters.person,
      place: filters.place,
      kind: filters.kind,
    }),
  );
}

export function fetchGraph(): Promise<Graph> {
  return request<Graph>('/api/graph');
}

export function fetchContradictions(): Promise<ContradictionsResponse> {
  return request<ContradictionsResponse>('/api/contradictions');
}

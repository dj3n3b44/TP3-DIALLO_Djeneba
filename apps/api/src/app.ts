import {
  buildChronology,
  buildGraph,
  detectContradictions,
  getQuai7Case,
  listEventKinds,
  searchDocuments,
  validateId,
  validateOptionalFilter,
  validateQuery,
} from '@trace/core';
import type { CaseData } from '@trace/core';
import type { IncomingMessage, ServerResponse } from 'node:http';

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export type RequestListener = (request: IncomingMessage, response: ServerResponse) => void;

type RouteHandler = (response: ServerResponse, segments: string[], params: URLSearchParams) => void;

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
} as const;

const CORS_PREFLIGHT_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'content-type',
} as const;

const NOT_FOUND = 'Ressource introuvable.';

function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, JSON_HEADERS);
  response.end(JSON.stringify(payload));
}

function sendError(response: ServerResponse, status: number, code: string, message: string): void {
  const body: ApiErrorBody = { error: { code, message } };
  sendJson(response, status, body);
}

export function createApp(caseData: CaseData = getQuai7Case()): RequestListener {
  const documentById = new Map(caseData.documents.map((document) => [document.id, document]));
  const personIds = new Set(caseData.people.map((person) => person.id));
  const placeIds = new Set(caseData.places.map((place) => place.id));
  const eventKinds = listEventKinds(caseData.events);

  function handleHealth(response: ServerResponse, segments: string[]): void {
    if (segments.length !== 2) {
      sendError(response, 404, 'not_found', NOT_FOUND);
      return;
    }
    sendJson(response, 200, { status: 'ok' });
  }

  function handleDocuments(
    response: ServerResponse,
    segments: string[],
    params: URLSearchParams,
  ): void {
    if (segments.length === 2) {
      const query = validateQuery(params.get('q'));
      if (!query.ok) {
        sendError(response, 400, 'bad_request', query.reason);
        return;
      }
      const documents = searchDocuments(caseData.documents, query.value);
      sendJson(response, 200, { query: query.value, count: documents.length, documents });
      return;
    }

    if (segments.length === 3) {
      const id = validateId(segments[2]);
      if (!id.ok) {
        sendError(response, 400, 'bad_request', id.reason);
        return;
      }
      const document = documentById.get(id.value);
      if (document === undefined) {
        sendError(response, 404, 'not_found', `Document « ${id.value} » introuvable.`);
        return;
      }
      sendJson(response, 200, document);
      return;
    }

    sendError(response, 404, 'not_found', NOT_FOUND);
  }

  function handleEvents(
    response: ServerResponse,
    segments: string[],
    params: URLSearchParams,
  ): void {
    if (segments.length !== 2) {
      sendError(response, 404, 'not_found', NOT_FOUND);
      return;
    }

    const rawPerson = params.get('person');
    const rawPlace = params.get('place');
    const rawKind = params.get('kind');

    let personId: string | undefined;
    if (rawPerson !== null) {
      const parsed = validateId(rawPerson);
      if (!parsed.ok) {
        sendError(response, 400, 'bad_request', parsed.reason);
        return;
      }
      if (!personIds.has(parsed.value)) {
        sendError(response, 404, 'not_found', `Personne « ${parsed.value} » introuvable.`);
        return;
      }
      personId = parsed.value;
    }

    let placeId: string | undefined;
    if (rawPlace !== null) {
      const parsed = validateId(rawPlace);
      if (!parsed.ok) {
        sendError(response, 400, 'bad_request', parsed.reason);
        return;
      }
      if (!placeIds.has(parsed.value)) {
        sendError(response, 404, 'not_found', `Lieu « ${parsed.value} » introuvable.`);
        return;
      }
      placeId = parsed.value;
    }

    let kind: string | undefined;
    if (rawKind !== null) {
      const parsed = validateOptionalFilter(rawKind, eventKinds);
      if (!parsed.ok) {
        sendError(response, 400, 'bad_request', parsed.reason);
        return;
      }
      kind = parsed.value;
    }

    const events = buildChronology(caseData.events, { personId, placeId, kind });
    sendJson(response, 200, {
      count: events.length,
      events,
      filters: {
        person: personId ?? null,
        place: placeId ?? null,
        kind: kind ?? null,
      },
    });
  }

  function handleGraph(response: ServerResponse, segments: string[]): void {
    if (segments.length !== 2) {
      sendError(response, 404, 'not_found', NOT_FOUND);
      return;
    }
    sendJson(response, 200, buildGraph(caseData));
  }

  function handleContradictions(response: ServerResponse, segments: string[]): void {
    if (segments.length !== 2) {
      sendError(response, 404, 'not_found', NOT_FOUND);
      return;
    }
    const contradictions = detectContradictions(caseData);
    sendJson(response, 200, { count: contradictions.length, contradictions });
  }

  function handleCase(response: ServerResponse, segments: string[]): void {
    if (segments.length !== 2) {
      sendError(response, 404, 'not_found', NOT_FOUND);
      return;
    }
    sendJson(response, 200, {
      id: caseData.id,
      name: caseData.name,
      synopsis: caseData.synopsis,
      counts: {
        documents: caseData.documents.length,
        people: caseData.people.length,
        places: caseData.places.length,
        events: caseData.events.length,
        facts: caseData.facts.length,
        contradictions: detectContradictions(caseData).length,
      },
      people: caseData.people,
      places: caseData.places,
    });
  }

  const routes: Record<string, RouteHandler> = {
    case: (response, segments) => handleCase(response, segments),
    health: (response, segments) => handleHealth(response, segments),
    documents: (response, segments, params) => handleDocuments(response, segments, params),
    events: (response, segments, params) => handleEvents(response, segments, params),
    graph: (response, segments) => handleGraph(response, segments),
    contradictions: (response, segments) => handleContradictions(response, segments),
  };

  function dispatch(request: IncomingMessage, response: ServerResponse): void {
    if (request.method === 'OPTIONS') {
      response.writeHead(204, CORS_PREFLIGHT_HEADERS);
      response.end();
      return;
    }

    const url = new URL(request.url ?? '/', 'http://localhost');
    const segments = url.pathname.split('/').filter((segment) => segment.length > 0);

    const route = segments[0] === 'api' ? segments[1] : undefined;
    const handler = route === undefined ? undefined : routes[route];
    if (handler === undefined) {
      sendError(response, 404, 'not_found', NOT_FOUND);
      return;
    }

    if (request.method !== 'GET') {
      response.setHeader('allow', 'GET, OPTIONS');
      sendError(
        response,
        405,
        'method_not_allowed',
        `Méthode ${request.method ?? 'inconnue'} non prise en charge.`,
      );
      return;
    }

    handler(response, segments, url.searchParams);
  }

  return (request, response) => {
    try {
      dispatch(request, response);
    } catch (error) {
      console.error('[api] erreur interne lors du traitement de la requête', error);
      if (response.headersSent) {
        response.end();
      } else {
        sendError(response, 500, 'internal_error', 'Erreur interne du serveur.');
      }
    }
  };
}

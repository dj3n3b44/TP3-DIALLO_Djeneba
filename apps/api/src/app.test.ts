import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { IncomingMessage, Server, ServerResponse } from 'node:http';
import { createApp } from './app';
import type { ApiErrorBody } from './app';
import { createTraceServer } from './server';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = createTraceServer();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('Adresse serveur de test invalide');
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

function get(path: string): Promise<Response> {
  return fetch(`${baseUrl}${path}`);
}

describe('GET /api/health', () => {
  it('répond 200 avec un statut ok et du JSON', async () => {
    const response = await get('/api/health');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });
});

describe('GET /api/documents', () => {
  it('liste les 7 documents du dossier quand aucune requête n’est fournie', async () => {
    const response = await get('/api/documents');
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      query: string;
      count: number;
      documents: Array<{ documentId: string; title: string; kind: string; date: string }>;
    };
    expect(body.query).toBe('');
    expect(body.count).toBe(7);
    expect(body.documents).toHaveLength(7);
    expect(body.documents[0]).toMatchObject({
      documentId: expect.any(String),
      title: expect.any(String),
      kind: expect.any(String),
      date: expect.any(String),
    });
  });

  it('recherche « coton » et renvoie les documents pertinents', async () => {
    const response = await get('/api/documents?q=coton');
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      count: number;
      documents: Array<{ documentId: string }>;
    };
    expect(body.count).toBe(4);
    expect(body.documents.map((document) => document.documentId).sort()).toEqual([
      'connaissement',
      'manifeste-nordlys',
      'note-vigneau',
      'rapport-douane',
    ]);
  });

  it('renvoie une liste vide pour une recherche sans correspondance', async () => {
    const response = await get('/api/documents?q=zzz-introuvable');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      query: 'zzz-introuvable',
      count: 0,
      documents: [],
    });
  });

  it('rejette une requête trop longue avec une erreur 400', async () => {
    const response = await get(`/api/documents?q=${'a'.repeat(201)}`);
    expect(response.status).toBe(400);
    const body = (await response.json()) as ApiErrorBody;
    expect(body.error.code).toBe('bad_request');
    expect(body.error.message).toContain('200');
  });

  it('renvoie un document complet par identifiant', async () => {
    const response = await get('/api/documents/rapport-douane');
    expect(response.status).toBe(200);
    const document = (await response.json()) as {
      id: string;
      kind: string;
      content: string;
    };
    expect(document.id).toBe('rapport-douane');
    expect(document.kind).toBe('rapport');
    expect(document.content).toContain('XM-433');
  });

  it('renvoie 404 pour un identifiant de document inconnu', async () => {
    const response = await get('/api/documents/document-absent');
    expect(response.status).toBe(404);
    const body = (await response.json()) as ApiErrorBody;
    expect(body.error.code).toBe('not_found');
  });

  it('rejette un identifiant mal formé avec une erreur 400', async () => {
    const response = await get('/api/documents/Quai_7');
    expect(response.status).toBe(400);
    const body = (await response.json()) as ApiErrorBody;
    expect(body.error.code).toBe('bad_request');
  });
});

describe('GET /api/events', () => {
  it('liste les 10 évènements chronologiques sans filtre', async () => {
    const response = await get('/api/events');
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      count: number;
      events: Array<{ id: string; date: string }>;
      filters: { person: string | null; place: string | null; kind: string | null };
    };
    expect(body.count).toBe(10);
    expect(body.events).toHaveLength(10);
    expect(body.filters).toEqual({ person: null, place: null, kind: null });
  });

  it('filtre par personne et ne garde que les évènements concernés', async () => {
    const response = await get('/api/events?person=mercier');
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      count: number;
      events: Array<{ participantIds: string[] }>;
    };
    expect(body.count).toBe(4);
    for (const event of body.events) {
      expect(event.participantIds).toContain('mercier');
    }
  });

  it('renvoie une liste vide pour un filtre valide sans évènement', async () => {
    const response = await get('/api/events?person=lefevre');
    expect(response.status).toBe(200);
    const body = (await response.json()) as { count: number; events: unknown[] };
    expect(body.count).toBe(0);
    expect(body.events).toEqual([]);
  });

  it('filtre par lieu', async () => {
    const response = await get('/api/events?place=hangar-12');
    expect(response.status).toBe(200);
    const body = (await response.json()) as { count: number; events: Array<{ placeId: string }> };
    expect(body.count).toBe(2);
    for (const event of body.events) {
      expect(event.placeId).toBe('hangar-12');
    }
  });

  it('filtre par type d’évènement', async () => {
    const response = await get(`/api/events?kind=${encodeURIComponent('contrôle')}`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { count: number; events: Array<{ kind: string }> };
    expect(body.count).toBe(2);
    for (const event of body.events) {
      expect(event.kind).toBe('contrôle');
    }
  });

  it('renvoie 404 pour une personne inconnue', async () => {
    const response = await get('/api/events?person=inconnu');
    expect(response.status).toBe(404);
    const body = (await response.json()) as ApiErrorBody;
    expect(body.error.code).toBe('not_found');
  });

  it('renvoie 404 pour un lieu inconnu', async () => {
    const response = await get('/api/events?place=lieu-absent');
    expect(response.status).toBe(404);
  });

  it('rejette un identifiant de personne mal formé avec une erreur 400', async () => {
    const response = await get('/api/events?person=Mercier');
    expect(response.status).toBe(400);
    const body = (await response.json()) as ApiErrorBody;
    expect(body.error.code).toBe('bad_request');
  });

  it('rejette un type d’évènement inconnu avec une erreur 400', async () => {
    const response = await get('/api/events?kind=sabotage');
    expect(response.status).toBe(400);
    const body = (await response.json()) as ApiErrorBody;
    expect(body.error.code).toBe('bad_request');
  });
});

describe('GET /api/graph', () => {
  it('renvoie un graphe déterministe avec tous les nœuds', async () => {
    const first = await get('/api/graph');
    const second = await get('/api/graph');
    expect(first.status).toBe(200);
    const graph = (await first.json()) as { nodes: unknown[]; edges: unknown[] };
    expect(graph.nodes).toHaveLength(22);
    expect(graph.edges.length).toBeGreaterThan(0);
    const again = (await second.json()) as { nodes: unknown[]; edges: unknown[] };
    expect(again).toEqual(graph);
  });
});

describe('GET /api/contradictions', () => {
  it('expose exactement les 4 contradictions attendues', async () => {
    const response = await get('/api/contradictions');
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      count: number;
      contradictions: Array<{ id: string; extraits: unknown[] }>;
    };
    expect(body.count).toBe(4);
    expect(body.contradictions.map((contradiction) => contradiction.id).sort()).toEqual([
      'contradiction-event-dechargement-heureDebut',
      'contradiction-event-depart-anvers-date',
      'contradiction-object-caisse-q7-scelle',
      'contradiction-person-mercier-position',
    ]);
    for (const contradiction of body.contradictions) {
      expect(contradiction.extraits.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('GET /api/case', () => {
  it('expose les métadonnées du dossier et les compteurs', async () => {
    const response = await get('/api/case');
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      id: string;
      name: string;
      synopsis: string;
      counts: Record<string, number>;
      people: unknown[];
      places: unknown[];
    };
    expect(body.id).toBe('quai7');
    expect(body.name).toBe("L'affaire du quai 7");
    expect(body.synopsis.length).toBeGreaterThan(0);
    expect(body.counts).toEqual({
      documents: 7,
      people: 6,
      places: 6,
      events: 10,
      facts: 34,
      contradictions: 4,
    });
    expect(body.people).toHaveLength(6);
    expect(body.places).toHaveLength(6);
  });
});

describe('routage et erreurs', () => {
  it('renvoie 404 sur une route API inconnue', async () => {
    const response = await get('/api/inconnu');
    expect(response.status).toBe(404);
    const body = (await response.json()) as ApiErrorBody;
    expect(body.error.code).toBe('not_found');
  });

  it('renvoie 404 hors du préfixe /api', async () => {
    const response = await get('/sante');
    expect(response.status).toBe(404);
  });

  it('renvoie 405 avec l’en-tête Allow pour une méthode non prise en charge', async () => {
    const response = await fetch(`${baseUrl}/api/documents`, { method: 'POST' });
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toContain('GET');
    const body = (await response.json()) as ApiErrorBody;
    expect(body.error.code).toBe('method_not_allowed');
  });

  it('répond 204 au préflight CORS', async () => {
    const response = await fetch(`${baseUrl}/api/documents`, { method: 'OPTIONS' });
    expect(response.status).toBe(204);
  });

  it('structure les erreurs en JSON sans trace ni chemin interne', async () => {
    const response = await get('/api/inconnu');
    const text = await response.text();
    expect(text).not.toContain('at ');
    expect(text).not.toContain('node_modules');
    const body = JSON.parse(text) as Record<string, unknown>;
    expect(Object.keys(body)).toEqual(['error']);
    expect(Object.keys(body.error as Record<string, unknown>)).toEqual(['code', 'message']);
  });

  it('renvoie une erreur 500 JSON sans trace quand le traitement échoue', () => {
    const app = createApp();
    const state = { statusCode: 0, body: '' };
    let headersSent = false;
    const response = {
      get headersSent(): boolean {
        return headersSent;
      },
      writeHead(status: number): void {
        state.statusCode = status;
        headersSent = true;
      },
      setHeader(): void {
        /* ignored */
      },
      end(chunk?: string): void {
        if (chunk) {
          state.body += chunk;
        }
      },
    };
    const request = { method: 'GET', url: 'http://[' } as IncomingMessage;

    app(request, response as unknown as ServerResponse);

    expect(state.statusCode).toBe(500);
    expect(state.body).not.toContain('at ');
    expect(JSON.parse(state.body)).toEqual({
      error: { code: 'internal_error', message: 'Erreur interne du serveur.' },
    });
  });
});

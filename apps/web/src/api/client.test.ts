import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiBaseUrl, fetchCase, fetchDocuments, fetchEvents } from './client';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiBaseUrl', () => {
  it("utilise l'URL locale par défaut", () => {
    expect(apiBaseUrl()).toBe('http://localhost:3000');
  });
});

describe('fetchDocuments', () => {
  it('interroge /api/documents sans paramètre quand la requête est vide', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ query: '', count: 0, documents: [] }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchDocuments('');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:3000/api/documents');
  });

  it('transmet le terme de recherche encodé', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ query: 'coté', count: 0, documents: [] }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchDocuments('coté');

    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:3000/api/documents?q=cot%C3%A9');
  });
});

describe('fetchEvents', () => {
  it('compose les filtres présents', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ count: 0, events: [], filters: {} }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchEvents({ person: 'mercier', kind: 'contrôle' });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'http://localhost:3000/api/events?person=mercier&kind=contr%C3%B4le',
    );
  });
});

describe('gestion des erreurs', () => {
  it("transforme une réponse d'erreur en ApiError", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ error: { code: 'not_found', message: 'Document absent.' } }, 404),
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchCase()).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 'not_found',
      message: 'Document absent.',
    });
  });

  it('signale une erreur réseau', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('network down'));
    vi.stubGlobal('fetch', fetchMock);

    const error = await fetchCase().catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, code: 'network_error' });
  });

  it("garde un message générique si le corps n'est pas du JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('oops', { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchCase()).rejects.toMatchObject({ status: 500, code: 'http_error' });
  });
});

import { describe, expect, it } from 'vitest';
import type { CaseData } from '@trace/core';
import { createTraceServer } from './server';

const emptyCase: CaseData = {
  id: 'vide',
  name: 'Dossier vide',
  synopsis: '',
  documents: [],
  people: [],
  places: [],
  events: [],
  facts: [],
  contradictionNotes: {},
};

async function withServer(
  run: (baseUrl: string) => Promise<void>,
  caseData?: CaseData,
): Promise<void> {
  const server = createTraceServer(caseData);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    if (address === null || typeof address === 'string') {
      throw new Error('Adresse serveur de test invalide');
    }
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

describe('createTraceServer', () => {
  it('sert le dossier du quai 7 par défaut', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/documents`);
      expect(response.status).toBe(200);
      const body = (await response.json()) as { count: number };
      expect(body.count).toBe(7);
    });
  });

  it('injecte un dossier personnalisé', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/documents`);
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ query: '', count: 0, documents: [] });

      const contradictions = await fetch(`${baseUrl}/api/contradictions`);
      await expect(contradictions.json()).resolves.toEqual({ count: 0, contradictions: [] });
    }, emptyCase);
  });
});

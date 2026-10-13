import { describe, expect, it } from 'vitest';
import { normalizeText, searchDocuments } from './search';
import type { CaseDocument } from './types';

const documents: CaseDocument[] = [
  {
    id: 'a',
    title: 'Rapport café',
    kind: 'rapport',
    date: '2026-01-01',
    tags: [],
    content: "Le café L'Ancre est plein. Café animé.",
  },
  {
    id: 'b',
    title: 'Manifeste cargo',
    kind: 'manifeste',
    date: '2026-01-02',
    tags: [],
    content: 'Coton égyptien et café.',
  },
  {
    id: 'c',
    title: 'Note',
    kind: 'note',
    date: '2026-01-03',
    tags: [],
    content: 'Rien à voir.',
  },
];

describe('normalizeText', () => {
  it('retire les accents et met en minuscules', () => {
    expect(normalizeText('Élévation Café')).toBe('elevation cafe');
  });

  it('décompose les ligatures', () => {
    expect(normalizeText('Cœur')).toBe('coeur');
    expect(normalizeText('Ex æquo')).toBe('ex aequo');
  });
});

describe('searchDocuments', () => {
  it('accepte une requête vide : tous les documents, triés par date', () => {
    expect(searchDocuments(documents, '').map((result) => result.documentId)).toEqual([
      'a',
      'b',
      'c',
    ]);
    expect(searchDocuments(documents, '   ').map((result) => result.documentId)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('ignore la casse et les accents', () => {
    const withAccent = searchDocuments(documents, 'café');
    const withoutAccent = searchDocuments(documents, 'cafe');
    expect(withAccent.map((result) => result.documentId)).toEqual(['a', 'b']);
    expect(withoutAccent.map((result) => result.documentId)).toEqual(['a', 'b']);
  });

  it('classe un titre au-dessus du contenu', () => {
    const results = searchDocuments(documents, 'café');
    expect(results[0]?.documentId).toBe('a');
    expect(results[0]?.score).toBeGreaterThan(results[1]?.score ?? 0);
  });

  it('exige tous les termes (ET)', () => {
    expect(searchDocuments(documents, 'café coton').map((result) => result.documentId)).toEqual([
      'b',
    ]);
  });

  it('renvoie une liste vide sans correspondance', () => {
    expect(searchDocuments(documents, 'zzz')).toEqual([]);
    expect(searchDocuments(documents, 'café zzz')).toEqual([]);
  });

  it('est déterministe', () => {
    expect(searchDocuments(documents, 'café')).toEqual(searchDocuments(documents, 'café'));
  });

  it('normalise les espaces multiples', () => {
    expect(
      searchDocuments(documents, '  café    coton ').map((result) => result.documentId),
    ).toEqual(['b']);
  });
});

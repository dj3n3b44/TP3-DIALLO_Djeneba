import { describe, expect, it } from 'vitest';
import { parseHash, routeToHash } from './router';

describe('parseHash', () => {
  it('route la racine vers la vue d’ensemble', () => {
    expect(parseHash('')).toEqual({ name: 'overview' });
    expect(parseHash('#/')).toEqual({ name: 'overview' });
  });

  it('route la liste des documents', () => {
    expect(parseHash('#/documents')).toEqual({ name: 'documents' });
  });

  it('route un document avec ses paramètres', () => {
    expect(parseHash('#/documents/rapport-douane')).toEqual({
      name: 'document',
      id: 'rapport-douane',
      query: null,
      focus: null,
    });
    expect(parseHash('#/documents/rapport-douane?q=coton&focus=XM-433')).toEqual({
      name: 'document',
      id: 'rapport-douane',
      query: 'coton',
      focus: 'XM-433',
    });
  });

  it('route la chronologie, le graphe et les contradictions', () => {
    expect(parseHash('#/chronologie')).toEqual({ name: 'chronology' });
    expect(parseHash('#/graphe?node=mercier')).toEqual({ name: 'graph', focus: 'mercier' });
    expect(parseHash('#/contradictions')).toEqual({ name: 'contradictions' });
  });

  it('retombe sur la vue d’ensemble pour une route inconnue', () => {
    expect(parseHash('#/inconnu')).toEqual({ name: 'overview' });
  });
});

describe('routeToHash', () => {
  it('construit les liens de navigation', () => {
    expect(routeToHash({ name: 'documents' })).toBe('#/documents');
    expect(routeToHash({ name: 'chronology' })).toBe('#/chronologie');
    expect(routeToHash({ name: 'contradictions' })).toBe('#/contradictions');
    expect(routeToHash({ name: 'graph', focus: null })).toBe('#/graphe');
    expect(routeToHash({ name: 'graph', focus: 'mercier' })).toBe('#/graphe?node=mercier');
  });

  it('encode les identifiants et les extraits', () => {
    const hash = routeToHash({
      name: 'document',
      id: 'rapport-douane',
      query: 'coton',
      focus: 'XM-433',
    });
    expect(hash).toBe('#/documents/rapport-douane?q=coton&focus=XM-433');
  });

  it('fait l’aller-retour avec parseHash', () => {
    const routes = [
      { name: 'overview' as const },
      { name: 'document' as const, id: 'note-vigneau', query: 'scellé', focus: 'balles de coton' },
      { name: 'graph' as const, focus: 'hangar-12' },
    ];
    for (const route of routes) {
      expect(parseHash(routeToHash(route))).toEqual(route);
    }
  });
});

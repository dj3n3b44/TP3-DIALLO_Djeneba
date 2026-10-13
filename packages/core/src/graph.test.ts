import { describe, expect, it } from 'vitest';
import { buildGraph } from './graph';
import { quai7 } from './data/quai7';
import type { CaseData } from './types';

const emptyCase: CaseData = {
  id: 'vide',
  name: 'Vide',
  synopsis: '',
  documents: [],
  people: [],
  places: [],
  events: [],
  facts: [],
  contradictionNotes: {},
};

describe('buildGraph', () => {
  it('crée un nœud par personne, lieu et évènement', () => {
    const graph = buildGraph(quai7);
    expect(graph.nodes).toHaveLength(
      quai7.people.length + quai7.places.length + quai7.events.length,
    );
  });

  it('n’a pas de nœuds en double', () => {
    const graph = buildGraph(quai7);
    const ids = graph.nodes.map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ne trace que des arêtes entre nœuds existants, sans boucle', () => {
    const graph = buildGraph(quai7);
    const ids = new Set(graph.nodes.map((node) => node.id));
    for (const edge of graph.edges) {
      expect(ids.has(edge.source)).toBe(true);
      expect(ids.has(edge.target)).toBe(true);
      expect(edge.source).not.toBe(edge.target);
    }
  });

  it('n’a pas d’arête symétrique en double', () => {
    const graph = buildGraph(quai7);
    const keys = new Set(graph.edges.map((edge) => `${edge.type}:${edge.source}->${edge.target}`));
    for (const edge of graph.edges) {
      expect(keys.has(`${edge.type}:${edge.target}->${edge.source}`)).toBe(false);
    }
    const plain = graph.edges.map((edge) => `${edge.source}->${edge.target}`);
    expect(new Set(plain).size).toBe(plain.length);
  });

  it('relie les personnes à leur position déclarée', () => {
    const graph = buildGraph(quai7);
    const present = graph.edges.filter((edge) => edge.type === 'PRESENT');
    expect(present.length).toBeGreaterThan(0);
    expect(present.some((edge) => edge.source === 'mercier' && edge.target === 'cafe-lancre')).toBe(
      true,
    );
    expect(present.some((edge) => edge.source === 'mercier' && edge.target === 'quai7')).toBe(true);
  });

  it('place tous les nœuds dans le cadre demandé', () => {
    const graph = buildGraph(quai7, { width: 800, height: 600 });
    for (const node of graph.nodes) {
      expect(Number.isFinite(node.x)).toBe(true);
      expect(Number.isFinite(node.y)).toBe(true);
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.x).toBeLessThanOrEqual(800);
      expect(node.y).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeLessThanOrEqual(600);
    }
  });

  it('produit un résultat déterministe', () => {
    expect(JSON.stringify(buildGraph(quai7))).toBe(JSON.stringify(buildGraph(quai7)));
  });

  it('reste identique quel que soit l’ordre des entrées', () => {
    const shuffled: CaseData = {
      ...quai7,
      people: [...quai7.people].reverse(),
      places: [...quai7.places].reverse(),
      events: [...quai7.events].reverse(),
      facts: [...quai7.facts].reverse(),
    };
    expect(JSON.stringify(buildGraph(shuffled))).toBe(JSON.stringify(buildGraph(quai7)));
  });

  it('ne superpose pas deux nœuds évènement', () => {
    const graph = buildGraph(quai7);
    const positions = graph.nodes
      .filter((node) => node.type === 'event')
      .map((node) => `${node.x.toFixed(6)},${node.y.toFixed(6)}`);
    expect(new Set(positions).size).toBe(positions.length);
  });

  it('ignore les arêtes vers des nœuds inexistants et les positions vides', () => {
    const orphan: CaseData = {
      id: 'orpheline',
      name: 'Orpheline',
      synopsis: '',
      documents: [],
      people: [{ id: 'p', name: 'P', role: 'r', description: '' }],
      places: [],
      events: [
        {
          id: 'e',
          title: 'E',
          date: '2026-01-01',
          kind: 'k',
          placeId: 'manquant',
          participantIds: ['fantome'],
          description: '',
        },
      ],
      facts: [
        {
          id: 'f',
          documentId: 'd',
          subject: { type: 'person', id: 'p' },
          attribute: 'position',
          value: '   ',
          excerptStart: 0,
          excerptEnd: 1,
        },
      ],
      contradictionNotes: {},
    };
    const graph = buildGraph(orphan);
    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toEqual([]);
  });

  it('gère une affaire vide', () => {
    expect(buildGraph(emptyCase)).toEqual({ nodes: [], edges: [] });
  });
});

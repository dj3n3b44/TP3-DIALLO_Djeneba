import { describe, expect, it } from 'vitest';
import { detectContradictions } from './detector';
import { quai7 } from './data/quai7';
import type { CaseData, CaseDocument, Fact } from './types';

const document1: CaseDocument = {
  id: 'd1',
  title: 'D1',
  kind: 'note',
  date: '2026-01-01',
  tags: [],
  content: 'Le quai 7 est calme.',
};

const document2: CaseDocument = {
  id: 'd2',
  title: 'D2',
  kind: 'note',
  date: '2026-01-02',
  tags: [],
  content: 'Le quai 7 reste calme.',
};

function caseWith(documents: CaseDocument[], facts: Fact[]): CaseData {
  return {
    id: 'synthetique',
    name: 'Synthétique',
    synopsis: '',
    documents,
    people: [],
    places: [],
    events: [],
    facts,
    contradictionNotes: {},
  };
}

function fact(id: string, documentId: string, value: string, excerpt: [number, number]): Fact {
  return {
    id,
    documentId,
    subject: { type: 'object', id: 'o', label: 'objet' },
    attribute: 'position',
    value,
    excerptStart: excerpt[0],
    excerptEnd: excerpt[1],
  };
}

const expectedIds = [
  'contradiction-event-dechargement-heureDebut',
  'contradiction-event-depart-anvers-date',
  'contradiction-object-caisse-q7-scelle',
  'contradiction-person-mercier-position',
];

describe('detectContradictions — affaire du quai 7', () => {
  it('détecte exactement les 4 contradictions attendues, sans faux positif', () => {
    const ids = detectContradictions(quai7).map((contradiction) => contradiction.id);
    expect([...ids].sort()).toEqual([...expectedIds].sort());
  });

  it('justifie chaque contradiction par au moins 2 extraits de documents distincts', () => {
    const documents = new Map(quai7.documents.map((document) => [document.id, document]));
    for (const contradiction of detectContradictions(quai7)) {
      expect(contradiction.extraits.length).toBeGreaterThanOrEqual(2);
      const documentIds = new Set(contradiction.extraits.map((extrait) => extrait.documentId));
      expect(documentIds.size).toBeGreaterThanOrEqual(2);
      for (const extrait of contradiction.extraits) {
        const document = documents.get(extrait.documentId);
        expect(document).toBeDefined();
        expect(extrait.excerpt.length).toBeGreaterThan(0);
        expect(
          document?.content.slice(extrait.startIndex, extrait.startIndex + extrait.excerpt.length),
        ).toBe(extrait.excerpt);
      }
    }
  });

  it('est déterministe', () => {
    expect(JSON.stringify(detectContradictions(quai7))).toBe(
      JSON.stringify(detectContradictions(quai7)),
    );
  });

  it('reste identique quel que soit l’ordre des faits et documents', () => {
    const shuffled: CaseData = {
      ...quai7,
      documents: [...quai7.documents].reverse(),
      facts: [...quai7.facts].reverse(),
    };
    expect(JSON.stringify(detectContradictions(shuffled))).toBe(
      JSON.stringify(detectContradictions(quai7)),
    );
  });
});

describe('detectContradictions — robustesse', () => {
  it('n’invente aucune contradiction quand les valeurs concordent', () => {
    const data = caseWith(
      [document1, document2],
      [fact('a', 'd1', 'quai 7', [0, 6]), fact('b', 'd2', 'quai 7', [0, 6])],
    );
    expect(detectContradictions(data)).toEqual([]);
  });

  it('ne signale rien pour un fait isolé', () => {
    const data = caseWith([document1], [fact('a', 'd1', 'quai 7', [0, 6])]);
    expect(detectContradictions(data)).toEqual([]);
  });

  it('signale un conflit de valeurs entre deux documents', () => {
    const data = caseWith(
      [document1, document2],
      [fact('a', 'd1', 'quai 7', [0, 6]), fact('b', 'd2', 'douane', [0, 6])],
    );
    const contradictions = detectContradictions(data);
    expect(contradictions).toHaveLength(1);
    expect(contradictions[0]?.extraits).toHaveLength(2);
    expect(contradictions[0]?.severity).toBe('majeure');
  });

  it('exige deux documents distincts pour conclure à une contradiction', () => {
    const data = caseWith(
      [document1],
      [fact('a', 'd1', 'quai 7', [0, 6]), fact('b', 'd1', 'douane', [0, 6])],
    );
    expect(detectContradictions(data)).toEqual([]);
  });

  it('compare les valeurs en ignorant espaces et accents', () => {
    const data = caseWith(
      [document1, document2],
      [fact('a', 'd1', 'Quai  7', [0, 6]), fact('b', 'd2', 'quai 7', [0, 6])],
    );
    expect(detectContradictions(data)).toEqual([]);
  });

  it('ne fusionne pas deux attributs distincts (déclaré vs constaté)', () => {
    const declared: Fact = {
      id: 'a',
      documentId: 'd1',
      subject: { type: 'object', id: 'caisse', label: 'la caisse' },
      attribute: 'contenuDeclare',
      value: 'montres',
      excerptStart: 0,
      excerptEnd: 6,
    };
    const observed: Fact = {
      id: 'b',
      documentId: 'd2',
      subject: { type: 'object', id: 'caisse', label: 'la caisse' },
      attribute: 'constatContenu',
      value: 'coton',
      excerptStart: 0,
      excerptEnd: 6,
    };
    expect(detectContradictions(caseWith([document1, document2], [declared, observed]))).toEqual(
      [],
    );
  });

  it('ignore un extrait qui démarre avant le document', () => {
    const data = caseWith([document1], [fact('a', 'd1', 'quai 7', [-5, 3])]);
    expect(detectContradictions(data)).toEqual([]);
  });

  it('ignore un extrait de plage nulle ou inversée', () => {
    const data = caseWith([document1], [fact('a', 'd1', 'quai 7', [6, 6])]);
    expect(detectContradictions(data)).toEqual([]);
  });

  it('ignore un fait qui référence un document inconnu', () => {
    const data = caseWith(
      [document1],
      [fact('a', 'd1', 'quai 7', [0, 6]), fact('b', 'inconnu', 'douane', [0, 6])],
    );
    expect(detectContradictions(data)).toEqual([]);
  });

  it('ignore un extrait hors bornes sans planter', () => {
    const data = caseWith([document1], [fact('a', 'd1', 'quai 7', [999, 1005])]);
    expect(detectContradictions(data)).toEqual([]);
  });

  it('gère une affaire sans aucun fait', () => {
    expect(detectContradictions(caseWith([], []))).toEqual([]);
  });
});

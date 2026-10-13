import { describe, expect, it } from 'vitest';
import { detectContradictions } from '../detector';
import { quai7 } from './quai7';
import { subjectKey } from '../types';
import type { CaseDocument, Fact } from '../types';

const documents = new Map<string, CaseDocument>(
  quai7.documents.map((document) => [document.id, document]),
);

const expectedConflictKeys = [
  'event:dechargement:heureDebut',
  'event:depart-anvers:date',
  'object:caisse-q7:scelle',
  'person:mercier:position',
];

const expectedFactExcerpts: Record<string, string> = {
  'f-rapport-dechargement': 'à 19 h 30',
  'f-mercier-dechargement': 'le déchargement était déjà terminé',
  'f-mercier-position': "je n'ai pas quitté le quai de toute la soirée",
  'f-martin-position-mercier': "j'ai vu Mercier au café L'Ancre",
  'f-rapport-scelle': 'XM-433',
  'f-manifeste-scelle': 'caisse scellée n° XM-443',
  'f-manifeste-depart': 'quitté Anvers le 27 février 2026',
  'f-bord-depart': "1er mars 2026 : départ d'Anvers",
};

const expectedContradictionExcerpts: Record<string, string[]> = {
  'contradiction-event-dechargement-heureDebut': [
    'à 19 h 30',
    'le déchargement était déjà terminé',
  ],
  'contradiction-person-mercier-position': [
    "je n'ai pas quitté le quai de toute la soirée",
    "j'ai vu Mercier au café L'Ancre",
  ],
  'contradiction-object-caisse-q7-scelle': ['XM-433', 'caisse scellée n° XM-443'],
  'contradiction-event-depart-anvers-date': [
    'quitté Anvers le 27 février 2026',
    "1er mars 2026 : départ d'Anvers",
  ],
};

function conflictingKeys(facts: Fact[]): string[] {
  const groups = new Map<string, Set<string>>();
  for (const fact of facts) {
    const key = `${subjectKey(fact.subject)}:${fact.attribute}`;
    const values = groups.get(key) ?? new Set<string>();
    values.add(fact.value);
    groups.set(key, values);
  }
  return [...groups.entries()]
    .filter(([, values]) => values.size >= 2)
    .map(([key]) => key)
    .sort();
}

describe('données de l’affaire du quai 7', () => {
  it('a les volumes annoncés', () => {
    expect(quai7.documents).toHaveLength(7);
    expect(quai7.people).toHaveLength(6);
    expect(quai7.places).toHaveLength(6);
    expect(quai7.events).toHaveLength(10);
  });

  it('a des identifiants uniques dans chaque collection', () => {
    for (const collection of [
      quai7.documents,
      quai7.people,
      quai7.places,
      quai7.events,
      quai7.facts,
    ]) {
      const ids = collection.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('référence des lieux et participants existants', () => {
    const placeIds = new Set(quai7.places.map((place) => place.id));
    const personIds = new Set(quai7.people.map((person) => person.id));
    const documentIds = new Set(quai7.documents.map((document) => document.id));

    for (const event of quai7.events) {
      expect(placeIds.has(event.placeId)).toBe(true);
      for (const participantId of event.participantIds) {
        expect(personIds.has(participantId)).toBe(true);
      }
    }
    for (const document of quai7.documents) {
      if (document.authorId) {
        expect(personIds.has(document.authorId)).toBe(true);
      }
      if (document.placeId) {
        expect(placeIds.has(document.placeId)).toBe(true);
      }
    }
    for (const fact of quai7.facts) {
      expect(documentIds.has(fact.documentId)).toBe(true);
      if (fact.subject.type === 'person') {
        expect(personIds.has(fact.subject.id)).toBe(true);
      }
      if (fact.subject.type === 'place') {
        expect(placeIds.has(fact.subject.id)).toBe(true);
      }
      if (fact.subject.type === 'event') {
        expect(quai7.events.some((event) => event.id === fact.subject.id)).toBe(true);
      }
    }
  });

  it('a des extraits de faits valides et non vides', () => {
    for (const fact of quai7.facts) {
      const document = documents.get(fact.documentId);
      expect(document).toBeDefined();
      if (!document) {
        continue;
      }
      expect(fact.excerptStart).toBeGreaterThanOrEqual(0);
      expect(fact.excerptStart).toBeLessThan(fact.excerptEnd);
      expect(fact.excerptEnd).toBeLessThanOrEqual(document.content.length);
      expect(document.content.slice(fact.excerptStart, fact.excerptEnd).length).toBeGreaterThan(0);
    }
  });

  it('expose exactement les 4 conflits attendus, ni plus ni moins', () => {
    expect(conflictingKeys(quai7.facts)).toEqual(expectedConflictKeys);
  });

  it('a des extraits sources exacts pour les faits clés', () => {
    for (const [factId, excerpt] of Object.entries(expectedFactExcerpts)) {
      const fact = quai7.facts.find((candidate) => candidate.id === factId);
      expect(fact).toBeDefined();
      if (!fact) {
        continue;
      }
      const document = documents.get(fact.documentId);
      expect(document).toBeDefined();
      if (!document) {
        continue;
      }
      expect(document.content.slice(fact.excerptStart, fact.excerptEnd)).toBe(excerpt);
    }
  });

  it('ne définit de note que pour les conflits réellement détectés', () => {
    expect(Object.keys(quai7.contradictionNotes).sort()).toEqual(expectedConflictKeys);
  });
});

describe('détection sur l’affaire du quai 7', () => {
  it('produit les contradictions attendues avec leurs extraits exacts', () => {
    const contradictions = detectContradictions(quai7);
    expect(contradictions.map((contradiction) => contradiction.id).sort()).toEqual(
      Object.keys(expectedContradictionExcerpts).sort(),
    );

    for (const contradiction of contradictions) {
      const expected = expectedContradictionExcerpts[contradiction.id];
      expect(expected).toBeDefined();
      const excerpts = new Set(contradiction.extraits.map((extrait) => extrait.excerpt));
      for (const excerpt of expected ?? []) {
        expect(excerpts.has(excerpt)).toBe(true);
      }
      expect(['majeure', 'critique']).toContain(contradiction.severity);
      expect(contradiction.title.length).toBeGreaterThan(0);
      expect(contradiction.explanation.length).toBeGreaterThan(0);
    }
  });
});

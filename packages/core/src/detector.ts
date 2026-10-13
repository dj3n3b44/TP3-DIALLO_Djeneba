import { normalizeText } from './search';
import { subjectKey } from './types';
import type {
  CaseData,
  CaseDocument,
  Contradiction,
  Fact,
  FactSubject,
  SourceExcerpt,
} from './types';

const ATTRIBUTE_LABELS: Record<string, string> = {
  heureDebut: 'heure de début',
  heureFin: 'heure de fin',
  heureArrivee: 'heure d’arrivée',
  heureSignature: 'heure de signature',
  heurePoste: 'heure de prise de poste',
  heure: 'heure',
  position: 'position',
  scelle: 'numéro de scellé',
  date: 'date',
  role: 'rôle',
  fonction: 'fonction',
  titre: 'titre',
  poste: 'poste',
  tache: 'tâche',
  activite: 'activité',
  affluence: 'affluence',
  stockage: 'stockage',
  constat: 'constat',
  constatContenu: 'contenu constaté',
  contenuDeclare: 'contenu déclaré',
};

export function attributeLabel(attribute: string): string {
  return ATTRIBUTE_LABELS[attribute] ?? attribute;
}

function normalizeValue(value: string): string {
  return normalizeText(value).replace(/\s+/g, ' ').trim();
}

function subjectLabel(subject: FactSubject, caseData: CaseData): string {
  switch (subject.type) {
    case 'person':
      return caseData.people.find((person) => person.id === subject.id)?.name ?? subject.id;
    case 'place':
      return caseData.places.find((place) => place.id === subject.id)?.name ?? subject.id;
    case 'event':
      return caseData.events.find((event) => event.id === subject.id)?.title ?? subject.id;
    case 'object':
      return subject.label;
  }
}

export function contradictionId(subject: FactSubject, attribute: string): string {
  const base = subject.type === 'object' ? `object-${subject.id}` : `${subject.type}-${subject.id}`;
  return `contradiction-${base}-${attribute}`;
}

interface PreparedFact {
  fact: Fact;
  documentId: string;
  excerpt: string;
}

interface FactGroup {
  key: string;
  subject: FactSubject;
  attribute: string;
  entries: PreparedFact[];
}

function prepareFact(fact: Fact, documentById: Map<string, CaseDocument>): PreparedFact | null {
  const document = documentById.get(fact.documentId);
  if (!document) {
    return null;
  }
  if (
    fact.excerptStart < 0 ||
    fact.excerptEnd <= fact.excerptStart ||
    fact.excerptEnd > document.content.length
  ) {
    return null;
  }
  const excerpt = document.content.slice(fact.excerptStart, fact.excerptEnd);
  if (excerpt.length === 0) {
    return null;
  }
  return { fact, documentId: fact.documentId, excerpt };
}

function sortEntries(entries: PreparedFact[]): PreparedFact[] {
  return [...entries].sort((a, b) => {
    if (a.documentId !== b.documentId) {
      return a.documentId < b.documentId ? -1 : 1;
    }
    return a.fact.excerptStart - b.fact.excerptStart;
  });
}

export function detectContradictions(caseData: CaseData): Contradiction[] {
  const documentById = new Map<string, CaseDocument>(
    caseData.documents.map((document) => [document.id, document]),
  );

  const groups = new Map<string, FactGroup>();

  for (const fact of caseData.facts) {
    const prepared = prepareFact(fact, documentById);
    if (!prepared) {
      continue;
    }
    const key = `${subjectKey(fact.subject)}:${fact.attribute}`;
    const group = groups.get(key) ?? {
      key,
      subject: fact.subject,
      attribute: fact.attribute,
      entries: [],
    };
    group.entries.push(prepared);
    groups.set(key, group);
  }

  const contradictions: Contradiction[] = [];

  for (const group of groups.values()) {
    const distinctValues = new Set(group.entries.map((entry) => normalizeValue(entry.fact.value)));
    const distinctDocuments = new Set(group.entries.map((entry) => entry.documentId));
    if (distinctValues.size < 2 || distinctDocuments.size < 2) {
      continue;
    }

    const extraits: SourceExcerpt[] = sortEntries(group.entries).map((entry) => ({
      documentId: entry.documentId,
      excerpt: entry.excerpt,
      startIndex: entry.fact.excerptStart,
    }));

    const note = caseData.contradictionNotes[group.key];
    const fallbackSubject = subjectLabel(group.subject, caseData);

    contradictions.push({
      id: contradictionId(group.subject, group.attribute),
      severity: note?.severity ?? 'majeure',
      subject: note?.subject ?? fallbackSubject,
      attribute: group.attribute,
      attributeLabel: attributeLabel(group.attribute),
      title:
        note?.title ?? `${fallbackSubject} : ${attributeLabel(group.attribute)} contradictoire`,
      explanation:
        note?.explanation ??
        `Des documents attribuent des valeurs différentes à ${attributeLabel(group.attribute)} pour ${fallbackSubject}.`,
      extraits,
    });
  }

  contradictions.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return contradictions;
}

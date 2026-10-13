export const SEVERITIES = ['mineure', 'majeure', 'critique'] as const;

export type Severity = (typeof SEVERITIES)[number];

export interface CaseDocument {
  id: string;
  title: string;
  kind: string;
  authorId?: string;
  placeId?: string;
  date: string;
  tags: string[];
  content: string;
}

export interface CasePerson {
  id: string;
  name: string;
  role: string;
  description: string;
}

export interface CasePlace {
  id: string;
  name: string;
  kind: string;
  description: string;
}

export interface CaseEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  kind: string;
  placeId: string;
  participantIds: string[];
  description: string;
}

export type FactSubject =
  | { type: 'person'; id: string }
  | { type: 'place'; id: string }
  | { type: 'event'; id: string }
  | { type: 'object'; id: string; label: string };

export interface Fact {
  id: string;
  documentId: string;
  subject: FactSubject;
  attribute: string;
  value: string;
  excerptStart: number;
  excerptEnd: number;
}

export interface SourceExcerpt {
  documentId: string;
  excerpt: string;
  startIndex: number;
}

export interface ContradictionNote {
  severity: Severity;
  title: string;
  subject: string;
  explanation: string;
}

export interface Contradiction {
  id: string;
  severity: Severity;
  subject: string;
  attribute: string;
  attributeLabel: string;
  title: string;
  explanation: string;
  extraits: SourceExcerpt[];
}

export type GraphNodeType = 'person' | 'place' | 'event';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  detail: string;
  x: number;
  y: number;
}

export type GraphEdgeType = 'PARTICIPE' | 'SE_DEROULER' | 'PRESENT';

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: GraphEdgeType;
  label: string;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface CaseData {
  id: string;
  name: string;
  synopsis: string;
  documents: CaseDocument[];
  people: CasePerson[];
  places: CasePlace[];
  events: CaseEvent[];
  facts: Fact[];
  contradictionNotes: Record<string, ContradictionNote>;
}

export function subjectKey(subject: FactSubject): string {
  if (subject.type === 'object') {
    return `object:${subject.id}`;
  }
  return `${subject.type}:${subject.id}`;
}

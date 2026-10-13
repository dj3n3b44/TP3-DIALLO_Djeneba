import { normalizeText } from './search';
import type {
  CaseData,
  CaseEvent,
  CasePerson,
  CasePlace,
  Graph,
  GraphEdge,
  GraphEdgeType,
  GraphNode,
} from './types';

export interface GraphOptions {
  width?: number;
  height?: number;
}

const EDGE_LABELS: Record<GraphEdgeType, string> = {
  PARTICIPE: 'participe',
  SE_DEROULER: 'se déroule à',
  PRESENT: 'sur place',
};

function arcAngles(count: number, fromDeg: number, toDeg: number): number[] {
  if (count <= 0) {
    return [];
  }
  if (count === 1) {
    return [(fromDeg + toDeg) / 2];
  }
  const step = (toDeg - fromDeg) / (count - 1);
  return Array.from({ length: count }, (_unused, index) => fromDeg + step * index);
}

function ringAngles(count: number, startDeg: number): number[] {
  if (count <= 0) {
    return [];
  }
  return Array.from({ length: count }, (_unused, index) => startDeg + (360 / count) * index);
}

function polar(cx: number, cy: number, radius: number, angleDeg: number): { x: number; y: number } {
  const angle = (angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

function personNode(person: CasePerson, position: { x: number; y: number }): GraphNode {
  return {
    id: person.id,
    type: 'person',
    label: person.name,
    detail: person.role,
    x: position.x,
    y: position.y,
  };
}

function placeNode(place: CasePlace, position: { x: number; y: number }): GraphNode {
  return {
    id: place.id,
    type: 'place',
    label: place.name,
    detail: place.kind,
    x: position.x,
    y: position.y,
  };
}

function eventNode(event: CaseEvent, position: { x: number; y: number }): GraphNode {
  return {
    id: event.id,
    type: 'event',
    label: event.title,
    detail: event.date,
    x: position.x,
    y: position.y,
  };
}

export function buildGraph(caseData: CaseData, options: GraphOptions = {}): Graph {
  const width = options.width ?? 960;
  const height = options.height ?? 640;
  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = Math.min(width, height) / 2 - 80;
  const innerRadius = outerRadius * 0.55;

  const people = [...caseData.people].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const places = [...caseData.places].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const events = [...caseData.events].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const nodes: GraphNode[] = [];

  arcAngles(people.length, 200, 340).forEach((angle, index) => {
    const person = people[index];
    if (person) {
      nodes.push(personNode(person, polar(cx, cy, outerRadius, angle)));
    }
  });

  arcAngles(places.length, 20, 160).forEach((angle, index) => {
    const place = places[index];
    if (place) {
      nodes.push(placeNode(place, polar(cx, cy, outerRadius, angle)));
    }
  });

  ringAngles(events.length, 0).forEach((angle, index) => {
    const event = events[index];
    if (event) {
      nodes.push(eventNode(event, polar(cx, cy, innerRadius, angle)));
    }
  });

  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();

  function addEdge(source: string, target: string, type: GraphEdgeType): void {
    if (source === target || !nodeIds.has(source) || !nodeIds.has(target)) {
      return;
    }
    const id = `${type}:${source}->${target}`;
    const reverse = `${type}:${target}->${source}`;
    if (seen.has(id) || seen.has(reverse)) {
      return;
    }
    seen.add(id);
    edges.push({ id, source, target, type, label: EDGE_LABELS[type] });
  }

  for (const event of events) {
    addEdge(event.id, event.placeId, 'SE_DEROULER');
    for (const participantId of event.participantIds) {
      addEdge(event.id, participantId, 'PARTICIPE');
    }
  }

  for (const fact of caseData.facts) {
    if (fact.subject.type !== 'person' || fact.attribute !== 'position') {
      continue;
    }
    const value = normalizeText(fact.value).trim();
    if (value.length === 0) {
      continue;
    }
    const matchedPlace = caseData.places.find((place) => {
      const name = normalizeText(place.name);
      return value.includes(name) || name.includes(value);
    });
    if (matchedPlace) {
      addEdge(fact.subject.id, matchedPlace.id, 'PRESENT');
    }
  }

  edges.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  return { nodes, edges };
}

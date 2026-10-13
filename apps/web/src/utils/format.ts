import type { GraphNodeType, Severity } from '@trace/core';

const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

export function toUpperCase(value: string): string {
  return value.toUpperCase();
}

export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    return iso;
  }
  const year = match[1];
  const month = match[2];
  const day = match[3];
  if (year === undefined || month === undefined || day === undefined) {
    return iso;
  }
  const monthLabel = MONTHS[Number.parseInt(month, 10) - 1];
  if (monthLabel === undefined) {
    return iso;
  }
  return `${Number.parseInt(day, 10)} ${monthLabel} ${year}`;
}

export function formatTime(time: string | undefined): string | null {
  if (time === undefined || time.trim().length === 0) {
    return null;
  }
  return time.replace(/\s*h\s*/i, 'h').trim();
}

export function severityRank(severity: Severity): number {
  switch (severity) {
    case 'critique':
      return 0;
    case 'majeure':
      return 1;
    case 'mineure':
      return 2;
  }
}

export function severityLabel(severity: Severity): string {
  switch (severity) {
    case 'critique':
      return 'Critique';
    case 'majeure':
      return 'Majeure';
    case 'mineure':
      return 'Mineure';
  }
}

export function nodeTypeLabel(type: GraphNodeType): string {
  switch (type) {
    case 'person':
      return 'Personne';
    case 'place':
      return 'Lieu';
    case 'event':
      return 'Évènement';
  }
}

export function edgeLabel(type: string): string {
  switch (type) {
    case 'PARTICIPE':
      return 'participe';
    case 'SE_DEROULER':
      return 'se déroule à';
    case 'PRESENT':
      return 'présent sur place';
    default:
      return type;
  }
}

import { describe, expect, it } from 'vitest';
import {
  edgeLabel,
  formatDate,
  formatTime,
  nodeTypeLabel,
  severityLabel,
  severityRank,
  toUpperCase,
} from './format';

describe('toUpperCase', () => {
  it('uppercases a string', () => {
    expect(toUpperCase('trace')).toBe('TRACE');
  });
});

describe('formatDate', () => {
  it('met en forme une date ISO en français', () => {
    expect(formatDate('2026-03-14')).toBe('14 mars 2026');
    expect(formatDate('2026-10-01')).toBe('1 octobre 2026');
  });

  it('renvoie la valeur brute si le format est inattendu', () => {
    expect(formatDate('hier')).toBe('hier');
    expect(formatDate('2026-13-01')).toBe('2026-13-01');
  });
});

describe('formatTime', () => {
  it('normalise le séparateur horaire', () => {
    expect(formatTime('21 h 05')).toBe('21h05');
    expect(formatTime('08h30')).toBe('08h30');
  });

  it('renvoie null pour une heure absente', () => {
    expect(formatTime(undefined)).toBeNull();
    expect(formatTime('   ')).toBeNull();
  });
});

describe('severityRank', () => {
  it('ordonne critique avant majeure avant mineure', () => {
    const sorted = (['mineure', 'critique', 'majeure'] as const)
      .slice()
      .sort((a, b) => severityRank(a) - severityRank(b));
    expect(sorted).toEqual(['critique', 'majeure', 'mineure']);
  });
});

describe('libellés', () => {
  it('traduit les niveaux de gravité', () => {
    expect(severityLabel('critique')).toBe('Critique');
    expect(severityLabel('majeure')).toBe('Majeure');
    expect(severityLabel('mineure')).toBe('Mineure');
  });

  it('traduit les types de nœud', () => {
    expect(nodeTypeLabel('person')).toBe('Personne');
    expect(nodeTypeLabel('place')).toBe('Lieu');
    expect(nodeTypeLabel('event')).toBe('Évènement');
  });

  it('traduit les relations du graphe', () => {
    expect(edgeLabel('PARTICIPE')).toBe('participe');
    expect(edgeLabel('INCONNU')).toBe('INCONNU');
  });
});

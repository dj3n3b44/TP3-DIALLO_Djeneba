import { describe, expect, it } from 'vitest';
import { buildChronology, compareEvents, listEventKinds } from './chronology';
import type { CaseEvent } from './types';

function makeEvent(overrides: Partial<CaseEvent> & Pick<CaseEvent, 'id'>): CaseEvent {
  return {
    title: overrides.id,
    date: '2026-03-02',
    kind: 'contrôle',
    placeId: 'quai7',
    participantIds: [],
    description: '',
    ...overrides,
  };
}

const events: CaseEvent[] = [
  makeEvent({ id: 'e-late', time: '21:30', kind: 'ronde', participantIds: ['martin'] }),
  makeEvent({ id: 'e-early', time: '19:00', placeId: 'douane', participantIds: ['avril'] }),
  makeEvent({ id: 'e-old', date: '2026-02-27', kind: 'départ', placeId: 'anvers' }),
  makeEvent({ id: 'e-tie', time: '19:00', placeId: 'douane', participantIds: ['mercier'] }),
];

describe('compareEvents', () => {
  it('trie par date puis heure puis identifiant', () => {
    const sorted = [...events].sort(compareEvents).map((event) => event.id);
    expect(sorted).toEqual(['e-old', 'e-early', 'e-tie', 'e-late']);
  });

  it('compare les heures par valeur, pas par texte', () => {
    const nine = makeEvent({ id: 'e-nine', time: '9:00' });
    const nineteen = makeEvent({ id: 'e-nineteen', time: '19:00' });
    expect(compareEvents(nine, nineteen)).toBeLessThan(0);
    expect([nineteen, nine].sort(compareEvents).map((event) => event.id)).toEqual([
      'e-nine',
      'e-nineteen',
    ]);
  });

  it('place les heures absentes ou invalides avant les heures valides', () => {
    const none = makeEvent({ id: 'e-none' });
    const invalid = makeEvent({ id: 'e-invalid', time: 'midi' });
    const valid = makeEvent({ id: 'e-valid', time: '08:00' });
    const sorted = [valid, none, invalid].sort(compareEvents).map((event) => event.id);
    expect(sorted[2]).toBe('e-valid');
    expect(sorted.slice(0, 2).sort()).toEqual(['e-invalid', 'e-none']);
  });
});

describe('buildChronology', () => {
  it('sans filtre, renvoie tous les évènements triés', () => {
    expect(buildChronology(events).map((event) => event.id)).toEqual([
      'e-old',
      'e-early',
      'e-tie',
      'e-late',
    ]);
  });

  it('ne mute pas le tableau source', () => {
    const before = events.map((event) => event.id);
    buildChronology(events);
    expect(events.map((event) => event.id)).toEqual(before);
  });

  it('filtre par personne', () => {
    expect(buildChronology(events, { personId: 'avril' }).map((event) => event.id)).toEqual([
      'e-early',
    ]);
  });

  it('filtre par lieu', () => {
    expect(buildChronology(events, { placeId: 'douane' }).map((event) => event.id)).toEqual([
      'e-early',
      'e-tie',
    ]);
  });

  it('filtre par type', () => {
    expect(buildChronology(events, { kind: 'contrôle' }).map((event) => event.id)).toEqual([
      'e-early',
      'e-tie',
    ]);
  });

  it('combine les filtres', () => {
    expect(buildChronology(events, { personId: 'avril', kind: 'ronde' })).toEqual([]);
  });

  it('renvoie une liste vide pour une valeur inconnue', () => {
    expect(buildChronology(events, { personId: 'inconnu' })).toEqual([]);
    expect(buildChronology([])).toEqual([]);
  });
});

describe('listEventKinds', () => {
  it('renvoie les types distincts, triés', () => {
    expect(listEventKinds(events)).toEqual(['contrôle', 'départ', 'ronde']);
  });
});

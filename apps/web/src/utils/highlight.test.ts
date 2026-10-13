import { describe, expect, it } from 'vitest';
import { queryTerms, splitByRanges, substringRange, termRanges } from './highlight';

describe('queryTerms', () => {
  it('normalise la casse et les accents', () => {
    expect(queryTerms('  Coton Égyptien ')).toEqual(['coton', 'egyptien']);
  });

  it('ne renvoie rien pour une requête vide', () => {
    expect(queryTerms('   ')).toEqual([]);
  });
});

describe('termRanges', () => {
  it('localise un terme simple', () => {
    const text = 'Le coton est arrivé';
    expect(termRanges(text, ['coton'])).toEqual([[3, 8]]);
  });

  it('surligne malgré les accents de la source', () => {
    const text = "Le café L'Ancre";
    const ranges = termRanges(text, queryTerms('cafe'));
    expect(ranges).toEqual([[3, 7]]);
    const segments = splitByRanges(text, ranges);
    expect(segments.some((segment) => segment.match && segment.text === 'café')).toBe(true);
  });

  it('gère les ligatures', () => {
    const text = 'le cœur du dossier';
    const ranges = termRanges(text, queryTerms('coeur'));
    const matched = splitByRanges(text, ranges).find((segment) => segment.match);
    expect(matched?.text).toBe('cœur');
  });

  it('trouve toutes les occurrences', () => {
    const text = 'coton, coton';
    expect(termRanges(text, ['coton'])).toEqual([
      [0, 5],
      [7, 12],
    ]);
  });
});

describe('substringRange', () => {
  it('localise un extrait exact', () => {
    const text = 'avant XM-433 après';
    expect(substringRange(text, 'XM-433')).toEqual([6, 12]);
  });

  it('renvoie null si absent', () => {
    expect(substringRange('abc', 'zzz')).toBeNull();
  });
});

describe('splitByRanges', () => {
  it('renvoie le texte entier sans correspondance', () => {
    expect(splitByRanges('abc', [])).toEqual([{ text: 'abc', match: false, start: 0, end: 3 }]);
  });

  it('fusionne les plages qui se chevauchent', () => {
    const segments = splitByRanges('abcde', [
      [0, 3],
      [2, 5],
    ]);
    expect(segments).toEqual([{ text: 'abcde', match: true, start: 0, end: 5 }]);
  });

  it('borne les plages hors du texte', () => {
    const segments = splitByRanges('abc', [[-5, 100]]);
    expect(segments).toEqual([{ text: 'abc', match: true, start: 0, end: 3 }]);
  });

  it('expose les positions des segments', () => {
    const segments = splitByRanges('le coton arrive', [[3, 8]]);
    expect(segments).toEqual([
      { text: 'le ', match: false, start: 0, end: 3 },
      { text: 'coton', match: true, start: 3, end: 8 },
      { text: ' arrive', match: false, start: 8, end: 15 },
    ]);
  });
});

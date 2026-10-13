import { describe, expect, it } from 'vitest';
import {
  MAX_ID_LENGTH,
  MAX_PAGE_SIZE,
  MAX_QUERY_LENGTH,
  validateId,
  validateOptionalFilter,
  validatePositiveInteger,
  validateQuery,
} from './validate';

describe('validateId', () => {
  it('accepte un identifiant en kebab-case', () => {
    expect(validateId('hangar-12')).toEqual({ ok: true, value: 'hangar-12' });
  });

  it('nettoie les espaces autour', () => {
    expect(validateId('  quai7  ')).toEqual({ ok: true, value: 'quai7' });
  });

  it('rejette tout ce qui n’est pas une chaîne', () => {
    for (const raw of [42, null, undefined, ['a'], {}, true]) {
      expect(validateId(raw).ok).toBe(false);
    }
  });

  it('rejette une valeur vide ou blanche', () => {
    expect(validateId('').ok).toBe(false);
    expect(validateId('   ').ok).toBe(false);
  });

  it('rejette une valeur trop longue', () => {
    expect(validateId('a'.repeat(MAX_ID_LENGTH)).ok).toBe(true);
    expect(validateId('a'.repeat(MAX_ID_LENGTH + 1)).ok).toBe(false);
  });

  it('rejette les caractères interdits', () => {
    for (const raw of [
      'Quai7',
      'quai 7',
      'quai.7',
      '../etc',
      'quai_7',
      'quai/7',
      'qué',
      '-',
      '--',
      '-quai',
      'quai-',
    ]) {
      expect(validateId(raw).ok).toBe(false);
    }
  });
});

describe('validateQuery', () => {
  it('accepte une requête absente ou vide', () => {
    expect(validateQuery(undefined)).toEqual({ ok: true, value: '' });
    expect(validateQuery(null)).toEqual({ ok: true, value: '' });
    expect(validateQuery('   ')).toEqual({ ok: true, value: '' });
  });

  it('compresse les espaces internes et externes', () => {
    expect(validateQuery('  quai    7  ')).toEqual({ ok: true, value: 'quai 7' });
  });

  it('accepte la longueur maximale, refuse au-delà', () => {
    expect(validateQuery('x'.repeat(MAX_QUERY_LENGTH)).ok).toBe(true);
    expect(validateQuery('x'.repeat(MAX_QUERY_LENGTH + 1)).ok).toBe(false);
  });

  it('rejette les types non textuels', () => {
    expect(validateQuery(['quai']).ok).toBe(false);
    expect(validateQuery(7).ok).toBe(false);
  });
});

describe('validateOptionalFilter', () => {
  const allowed = ['ronde', 'alerte'] as const;

  it('accepte une valeur absente', () => {
    expect(validateOptionalFilter(undefined, allowed)).toEqual({ ok: true, value: undefined });
    expect(validateOptionalFilter(null, allowed)).toEqual({ ok: true, value: undefined });
  });

  it('accepte une valeur autorisée, nettoie les espaces', () => {
    expect(validateOptionalFilter(' ronde ', allowed)).toEqual({ ok: true, value: 'ronde' });
  });

  it('refuse une valeur vide ou inconnue', () => {
    expect(validateOptionalFilter('', allowed).ok).toBe(false);
    expect(validateOptionalFilter('sabotage', allowed).ok).toBe(false);
  });

  it('refuse un type non textuel', () => {
    expect(validateOptionalFilter(3, allowed).ok).toBe(false);
  });
});

describe('validatePositiveInteger', () => {
  it('accepte un entier dans les bornes', () => {
    expect(validatePositiveInteger('3', 'page', 10)).toEqual({ ok: true, value: 3 });
    expect(validatePositiveInteger(MAX_PAGE_SIZE, 'taille', MAX_PAGE_SIZE)).toEqual({
      ok: true,
      value: MAX_PAGE_SIZE,
    });
  });

  it('refuse zéro, négatif, hors borne et non numérique', () => {
    expect(validatePositiveInteger('0', 'page', 10).ok).toBe(false);
    expect(validatePositiveInteger('-1', 'page', 10).ok).toBe(false);
    expect(validatePositiveInteger(String(MAX_PAGE_SIZE + 1), 'taille', MAX_PAGE_SIZE).ok).toBe(
      false,
    );
    expect(validatePositiveInteger('abc', 'page', 10).ok).toBe(false);
    expect(validatePositiveInteger('1.5', 'page', 10).ok).toBe(false);
  });

  it('refuse une valeur absente', () => {
    expect(validatePositiveInteger(undefined, 'page', 10).ok).toBe(false);
    expect(validatePositiveInteger(null, 'page', 10).ok).toBe(false);
  });
});

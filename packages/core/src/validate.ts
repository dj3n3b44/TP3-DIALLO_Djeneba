export const MAX_ID_LENGTH = 64;
export const MAX_QUERY_LENGTH = 200;
export const MAX_PAGE_SIZE = 100;

const ID_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export type Valid<T> = { ok: true; value: T };
export type Invalid = { ok: false; reason: string };
export type Result<T> = Valid<T> | Invalid;

export function ok<T>(value: T): Valid<T> {
  return { ok: true, value };
}

export function err(reason: string): Invalid {
  return { ok: false, reason };
}

export function validateId(raw: unknown): Result<string> {
  if (typeof raw !== 'string') {
    return err('identifiant : une chaîne de caractères est attendue');
  }
  const value = raw.trim();
  if (value.length === 0) {
    return err('identifiant : valeur vide');
  }
  if (value.length > MAX_ID_LENGTH) {
    return err(`identifiant : ${MAX_ID_LENGTH} caractères maximum`);
  }
  if (!ID_PATTERN.test(value)) {
    return err('identifiant : caractères autorisés [a-z0-9-] uniquement');
  }
  return ok(value);
}

export function validateQuery(raw: unknown): Result<string> {
  if (raw === undefined || raw === null) {
    return ok('');
  }
  if (typeof raw !== 'string') {
    return err('requête : une chaîne de caractères est attendue');
  }
  const value = raw.trim().replace(/\s+/g, ' ');
  if (value.length > MAX_QUERY_LENGTH) {
    return err(`requête : ${MAX_QUERY_LENGTH} caractères maximum`);
  }
  return ok(value);
}

export function validateOptionalFilter<T extends string>(
  raw: unknown,
  allowed: readonly T[],
): Result<T | undefined> {
  if (raw === undefined || raw === null) {
    return ok(undefined);
  }
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return err('filtre : une valeur non vide est attendue');
  }
  const value = raw.trim();
  if (!allowed.includes(value as T)) {
    return err(`filtre : valeur inconnue « ${value} »`);
  }
  return ok(value as T);
}

export function validatePositiveInteger(raw: unknown, name: string, max: number): Result<number> {
  if (raw === undefined || raw === null) {
    return err(`${name} : valeur manquante`);
  }
  const text = typeof raw === 'number' ? String(raw) : raw;
  if (typeof text !== 'string' || !/^\d+$/.test(text.trim())) {
    return err(`${name} : entier positif attendu`);
  }
  const value = Number.parseInt(text.trim(), 10);
  if (value < 1 || value > max) {
    return err(`${name} : doit être compris entre 1 et ${max}`);
  }
  return ok(value);
}

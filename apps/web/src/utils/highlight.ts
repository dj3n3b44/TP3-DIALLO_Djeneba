export interface TextSegment {
  text: string;
  match: boolean;
  start: number;
  end: number;
}

export type TextRange = readonly [number, number];

function stripDiacritics(input: string): string {
  return input
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function normalizeQuery(input: string): string {
  return stripDiacritics(input.trim().replace(/\s+/g, ' '));
}

export function queryTerms(query: string): string[] {
  const normalized = normalizeQuery(query);
  if (normalized.length === 0) {
    return [];
  }
  return [...new Set(normalized.split(' '))];
}

interface FoldedText {
  folded: string;
  indexMap: number[];
}

function foldWithMap(text: string): FoldedText {
  let folded = '';
  const indexMap: number[] = [];
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index] ?? '';
    const stripped = stripDiacritics(char);
    const produced = stripped.length > 0 ? stripped : ' ';
    for (const producedChar of produced) {
      folded += producedChar;
      indexMap.push(index);
    }
  }
  return { folded, indexMap };
}

export function termRanges(text: string, terms: string[]): TextRange[] {
  if (terms.length === 0 || text.length === 0) {
    return [];
  }
  const { folded, indexMap } = foldWithMap(text);
  const ranges: TextRange[] = [];
  for (const term of terms) {
    if (term.length === 0) {
      continue;
    }
    let from = 0;
    for (;;) {
      const found = folded.indexOf(term, from);
      if (found === -1) {
        break;
      }
      const startIndex = indexMap[found];
      const endIndex = indexMap[found + term.length - 1];
      if (startIndex !== undefined && endIndex !== undefined) {
        ranges.push([startIndex, endIndex + 1]);
      }
      from = found + term.length;
    }
  }
  return ranges;
}

export function substringRange(text: string, needle: string): TextRange | null {
  const trimmed = needle.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const index = text.indexOf(trimmed);
  return index === -1 ? null : [index, index + trimmed.length];
}

export function splitByRanges(text: string, ranges: TextRange[]): TextSegment[] {
  const cleaned = ranges
    .map(([start, end]) => [Math.max(0, start), Math.min(text.length, end)] as [number, number])
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const merged: Array<[number, number]> = [];
  for (const [start, end] of cleaned) {
    const last = merged[merged.length - 1];
    if (last !== undefined && start <= last[1]) {
      if (end > last[1]) {
        last[1] = end;
      }
    } else {
      merged.push([start, end]);
    }
  }

  const segments: TextSegment[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), match: false, start: cursor, end: start });
    }
    segments.push({ text: text.slice(start, end), match: true, start, end });
    cursor = end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), match: false, start: cursor, end: text.length });
  }

  return segments.length > 0 ? segments : [{ text, match: false, start: 0, end: text.length }];
}

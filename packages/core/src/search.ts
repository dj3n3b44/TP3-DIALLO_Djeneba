import type { CaseDocument } from './types';

export interface SearchResult {
  documentId: string;
  title: string;
  kind: string;
  date: string;
  score: number;
  matchCount: number;
}

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) {
    return 0;
  }
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

function byDateThenId(a: CaseDocument, b: CaseDocument): number {
  if (a.date !== b.date) {
    return a.date < b.date ? -1 : 1;
  }
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function searchDocuments(documents: CaseDocument[], query: string): SearchResult[] {
  const normalizedQuery = normalizeText(query.trim().replace(/\s+/g, ' '));
  const tokens = normalizedQuery.length === 0 ? [] : normalizedQuery.split(' ');

  const scored: Array<{ document: CaseDocument; score: number; matchCount: number }> = [];

  for (const document of documents) {
    const title = normalizeText(document.title);
    const content = normalizeText(document.content);

    if (tokens.length === 0) {
      scored.push({ document, score: 0, matchCount: 0 });
      continue;
    }

    let score = 0;
    let matchCount = 0;
    let matchesAllTokens = true;

    for (const token of tokens) {
      const titleHits = countOccurrences(title, token);
      const contentHits = countOccurrences(content, token);
      const hits = titleHits + contentHits;
      if (hits === 0) {
        matchesAllTokens = false;
        break;
      }
      score += titleHits * 2 + contentHits;
      matchCount += hits;
    }

    if (matchesAllTokens) {
      scored.push({ document, score, matchCount });
    }
  }

  scored.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    return byDateThenId(a.document, b.document);
  });

  return scored.map((entry) => ({
    documentId: entry.document.id,
    title: entry.document.title,
    kind: entry.document.kind,
    date: entry.document.date,
    score: entry.score,
    matchCount: entry.matchCount,
  }));
}

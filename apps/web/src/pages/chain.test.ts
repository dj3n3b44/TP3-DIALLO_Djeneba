import { describe, expect, it } from 'vitest';
import { detectContradictions, getQuai7Case } from '@trace/core';
import { substringRange } from '../utils/highlight';
import { parseHash, routeToHash } from '../utils/router';

const caseData = getQuai7Case();
const contradictions = detectContradictions(caseData);

describe('chaîne contradiction → document', () => {
  it('détecte les quatre contradictions attendues', () => {
    expect(contradictions).toHaveLength(4);
  });

  it('retrouve chaque extrait dans son document source', () => {
    for (const contradiction of contradictions) {
      expect(contradiction.extraits.length).toBeGreaterThan(0);
      for (const extrait of contradiction.extraits) {
        const document = caseData.documents.find((item) => item.id === extrait.documentId);
        expect(document, extrait.documentId).toBeDefined();
        if (document) {
          expect(substringRange(document.content, extrait.excerpt), extrait.excerpt).not.toBeNull();
        }
      }
    }
  });

  it('conserve l’extrait cité après un aller-retour par le hash', () => {
    for (const contradiction of contradictions) {
      for (const extrait of contradiction.extraits) {
        const route = {
          name: 'document' as const,
          id: extrait.documentId,
          query: null,
          focus: extrait.excerpt,
        };
        const parsed = parseHash(routeToHash(route));
        expect(parsed).toEqual(route);
        if (parsed.name === 'document') {
          const document = caseData.documents.find((item) => item.id === parsed.id);
          const range =
            document && parsed.focus ? substringRange(document.content, parsed.focus) : null;
          expect(range).not.toBeNull();
        }
      }
    }
  });
});

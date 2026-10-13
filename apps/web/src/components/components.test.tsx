import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import type { Graph } from '@trace/core';
import { substringRange, termRanges } from '../utils/highlight';
import { SeverityBadge } from './Badge';
import { HighlightedText } from './HighlightedText';
import { NodeGraph } from './NodeGraph';
import { Panel } from './Panel';
import { StatCard } from './StatCard';
import { EmptyState, ErrorState } from './StateViews';

describe('HighlightedText', () => {
  it('entoure les termes trouvés', () => {
    const html = renderToString(
      <HighlightedText text="Le coton arrive" ranges={termRanges('Le coton arrive', ['coton'])} />,
    );
    expect(html).toContain('<mark class="hl">coton</mark>');
  });

  it('distingue l’extrait focalisé', () => {
    const text = 'Le coton arrive au quai 7';
    const range = substringRange(text, 'quai 7');
    const html = renderToString(
      <HighlightedText
        text={text}
        ranges={[...termRanges(text, ['coton']), ...(range ? [range] : [])]}
        focusRange={range}
      />,
    );
    expect(html).toContain('hl hl--focus');
    expect(html).toContain('<mark class="hl">coton</mark>');
  });
});

describe('SeverityBadge', () => {
  it('affiche le niveau et la classe dédiée', () => {
    const html = renderToString(<SeverityBadge severity="critique" />);
    expect(html).toContain('Critique');
    expect(html).toContain('badge--critique');
  });
});

describe('Panel', () => {
  it('rend le titre et le contenu', () => {
    const html = renderToString(<Panel title="Titre">Contenu</Panel>);
    expect(html).toContain('panel__title');
    expect(html).toContain('Titre');
    expect(html).toContain('Contenu');
  });
});

describe('StatCard', () => {
  it('rend la valeur, le libellé et l’indice', () => {
    const html = renderToString(<StatCard value={7} label="Documents" hint="Indexés" />);
    expect(html).toContain('7');
    expect(html).toContain('Documents');
    expect(html).toContain('Indexés');
  });
});

describe('StateViews', () => {
  it('ErrorState expose le message et la reprise', () => {
    const html = renderToString(<ErrorState message="Panne réseau" onRetry={() => undefined} />);
    expect(html).toContain('Panne réseau');
    expect(html).toContain('Réessayer');
  });

  it('EmptyState affiche le titre', () => {
    expect(renderToString(<EmptyState title="Rien à examiner" />)).toContain('Rien à examiner');
  });
});

describe('NodeGraph', () => {
  const graph: Graph = {
    nodes: [
      { id: 'mercier', type: 'person', label: 'Jacques Mercier', detail: 'docker', x: 100, y: 100 },
      { id: 'quai7', type: 'place', label: 'Quai 7', detail: 'quai', x: 300, y: 120 },
    ],
    edges: [
      {
        id: 'PRESENT:mercier->quai7',
        source: 'mercier',
        target: 'quai7',
        type: 'PRESENT',
        label: 'présent sur place',
      },
    ],
  };

  it('rend les nœuds visibles, les arêtes et la sélection', () => {
    const html = renderToString(
      <NodeGraph
        graph={graph}
        visibleTypes={new Set(['person', 'place', 'event'] as const)}
        selectedId="mercier"
        onSelect={() => undefined}
      />,
    );
    expect(html).toContain('Jacques Mercier');
    expect(html).toContain('Quai 7');
    expect(html).toContain('node--selected');
    expect(html).toContain('<line');
  });

  it('masque les nœuds des types désactivés', () => {
    const html = renderToString(
      <NodeGraph
        graph={graph}
        visibleTypes={new Set(['place'] as const)}
        selectedId={null}
        onSelect={() => undefined}
      />,
    );
    expect(html).toContain('Quai 7');
    expect(html).not.toContain('Jacques Mercier');
  });

  it('expose les nœuds comme boutons accessibles au clavier', () => {
    const html = renderToString(
      <NodeGraph
        graph={graph}
        visibleTypes={new Set(['person', 'place', 'event'] as const)}
        selectedId={null}
        onSelect={() => undefined}
      />,
    );
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('role="button"');
    expect(html).toContain('aria-label="Personne : Jacques Mercier"');
    expect(html).toContain('aria-label="Lieu : Quai 7"');
  });
});

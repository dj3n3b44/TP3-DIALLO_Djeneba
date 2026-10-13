import { useEffect, useState } from 'react';
import type { GraphNodeType } from '@trace/core';
import { fetchGraph } from '../api/client';
import { Panel } from '../components/Panel';
import { NodeGraph } from '../components/NodeGraph';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { useAsync } from '../hooks/useAsync';
import { edgeLabel, nodeTypeLabel } from '../utils/format';

interface GraphPageProps {
  focusNode: string | null;
}

const ALL_TYPES: GraphNodeType[] = ['person', 'place', 'event'];

export function GraphPage({ focusNode }: GraphPageProps) {
  const graph = useAsync(fetchGraph, 'graph');
  const [selectedId, setSelectedId] = useState<string | null>(focusNode);
  const [visible, setVisible] = useState<Set<GraphNodeType>>(new Set(ALL_TYPES));

  useEffect(() => {
    setSelectedId(focusNode);
  }, [focusNode]);

  function toggleType(type: GraphNodeType): void {
    setVisible((current) => {
      const next = new Set(current);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  const data = graph.data;
  const selected =
    data && selectedId ? (data.nodes.find((node) => node.id === selectedId) ?? null) : null;
  const connections =
    data && selected
      ? data.edges
          .filter((edge) => edge.source === selected.id || edge.target === selected.id)
          .map((edge) => {
            const neighbourId = edge.source === selected.id ? edge.target : edge.source;
            const neighbour = data.nodes.find((node) => node.id === neighbourId);
            return { edge, neighbour };
          })
          .filter((entry) => entry.neighbour !== undefined)
      : [];

  return (
    <div>
      <div className="page-head">
        <span className="page-head__eyebrow">Relations</span>
        <h1 className="page-head__title">Graphe des relations</h1>
        <p className="page-head__lead">
          Personnes, lieux et évènements reliés entre eux. Sélectionnez un nœud pour consulter sa
          fiche et ses connexions.
        </p>
      </div>

      {graph.loading && !data ? <LoadingState label="Calcul du graphe…" /> : null}
      {graph.error ? <ErrorState message={graph.error} onRetry={graph.reload} /> : null}

      {data ? (
        <div className="graph-layout">
          <Panel
            title="Vue réseau"
            subtitle={`${data.nodes.length} nœuds · ${data.edges.length} relations`}
            actions={
              <div className="legend">
                {ALL_TYPES.map((type) => {
                  const off = !visible.has(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      className={off ? 'legend-item legend-item--off' : 'legend-item'}
                      aria-pressed={!off}
                      onClick={() => toggleType(type)}
                    >
                      <span className={`legend-swatch legend-swatch--${type}`} />
                      {nodeTypeLabel(type)}
                    </button>
                  );
                })}
              </div>
            }
          >
            {visible.size === 0 ? (
              <EmptyState
                title="Tous les calques sont masqués"
                message="Réactivez un type de nœud."
              />
            ) : (
              <NodeGraph
                graph={data}
                visibleTypes={visible}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            )}
          </Panel>

          <Panel
            title="Fiche"
            subtitle={selected ? nodeTypeLabel(selected.type) : 'Aucune sélection'}
          >
            {!selected ? (
              <EmptyState title="Sélectionnez un nœud" message="Cliquez sur un point du graphe." />
            ) : (
              <div className="stack">
                <div className="detail-list">
                  <div className="detail-row">
                    <span className="detail-label">Nom</span>
                    <p className="detail-value">{selected.label}</p>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Type</span>
                    <p className="detail-value">{nodeTypeLabel(selected.type)}</p>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Précision</span>
                    <p className="detail-value">{selected.detail}</p>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Connexions ({connections.length})</span>
                    {connections.length === 0 ? (
                      <p className="detail-value muted">Aucune relation directe.</p>
                    ) : (
                      <div className="chip-list">
                        {connections.map(({ edge, neighbour }) => (
                          <button
                            key={edge.id}
                            type="button"
                            className="chip"
                            title={edgeLabel(edge.type)}
                            onClick={() => neighbour && setSelectedId(neighbour.id)}
                          >
                            {neighbour ? neighbour.label : '?'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Panel>
        </div>
      ) : null}
    </div>
  );
}

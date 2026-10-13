import { useEffect, useRef, useState } from 'react';
import type { Graph, GraphNodeType } from '@trace/core';
import { nodeTypeLabel } from '../utils/format';

interface NodeGraphProps {
  graph: Graph;
  visibleTypes: ReadonlySet<GraphNodeType>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

interface View {
  x: number;
  y: number;
  width: number;
  height: number;
}

const BASE_WIDTH = 960;
const BASE_HEIGHT = 640;
const MIN_WIDTH = 280;
const MAX_WIDTH = 1500;
const BASE_VIEW: View = { x: 0, y: 0, width: BASE_WIDTH, height: BASE_HEIGHT };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function truncateLabel(value: string, max = 18): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function nodeRadius(type: GraphNodeType): number {
  return type === 'event' ? 12 : 16;
}

export function NodeGraph({ graph, visibleTypes, selectedId, onSelect }: NodeGraphProps) {
  const [view, setView] = useState<View>(BASE_VIEW);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ clientX: number; clientY: number; view: View } | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;

  const nodes = graph.nodes.filter((node) => visibleTypes.has(node.type));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = graph.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));

  function applyZoom(factor: number, pointer?: { x: number; y: number }): void {
    setView((current) => {
      const width = clamp(current.width * factor, MIN_WIDTH, MAX_WIDTH);
      const height = (width / BASE_WIDTH) * BASE_HEIGHT;
      const centerX = pointer ? pointer.x : current.x + current.width / 2;
      const centerY = pointer ? pointer.y : current.y + current.height / 2;
      const ratio = width / current.width;
      return {
        x: centerX - (centerX - current.x) * ratio,
        y: centerY - (centerY - current.y) * ratio,
        width,
        height,
      };
    });
  }

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) {
      return;
    }
    const element: SVGSVGElement = svg;
    function onWheel(event: WheelEvent): void {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const current = viewRef.current;
      const pointer =
        rect.width > 0 && rect.height > 0
          ? {
              x: current.x + ((event.clientX - rect.left) / rect.width) * current.width,
              y: current.y + ((event.clientY - rect.top) / rect.height) * current.height,
            }
          : undefined;
      setView((view) => {
        const width = clamp(view.width * (event.deltaY < 0 ? 0.86 : 1.16), MIN_WIDTH, MAX_WIDTH);
        const height = (width / BASE_WIDTH) * BASE_HEIGHT;
        const centerX = pointer ? pointer.x : view.x + view.width / 2;
        const centerY = pointer ? pointer.y : view.y + view.height / 2;
        const ratio = width / view.width;
        return {
          x: centerX - (centerX - view.x) * ratio,
          y: centerY - (centerY - view.y) * ratio,
          width,
          height,
        };
      });
    }
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, []);

  function onPointerDown(event: React.PointerEvent<SVGSVGElement>): void {
    if (event.button !== 0) {
      return;
    }
    dragRef.current = { clientX: event.clientX, clientY: event.clientY, view: viewRef.current };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<SVGSVGElement>): void {
    const drag = dragRef.current;
    const svg = svgRef.current;
    if (!drag || !svg) {
      return;
    }
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    const dx = ((event.clientX - drag.clientX) / rect.width) * drag.view.width;
    const dy = ((event.clientY - drag.clientY) / rect.height) * drag.view.height;
    setView({ ...drag.view, x: drag.view.x - dx, y: drag.view.y - dy });
  }

  function onPointerUp(event: React.PointerEvent<SVGSVGElement>): void {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div className="graph-panel">
      <svg
        ref={svgRef}
        className="graph"
        viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
        role="group"
        aria-label="Graphe des relations entre personnes, lieux et évènements"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <g>
          {edges.map((edge) => {
            const source = nodeById.get(edge.source);
            const target = nodeById.get(edge.target);
            if (!source || !target) {
              return null;
            }
            const active =
              selectedId !== null && (edge.source === selectedId || edge.target === selectedId);
            return (
              <line
                key={edge.id}
                className={active ? 'edge edge--active' : 'edge'}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
              />
            );
          })}
          {nodes.map((node) => {
            const radius = nodeRadius(node.type);
            const selected = node.id === selectedId;
            const classes = [`node`, `node--${node.type}`, selected ? 'node--selected' : '']
              .filter((value) => value.length > 0)
              .join(' ');
            return (
              <g
                key={node.id}
                className={classes}
                transform={`translate(${node.x} ${node.y})`}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                aria-label={`${nodeTypeLabel(node.type)} : ${node.label}`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onSelect(node.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(node.id);
                  }
                }}
              >
                <circle className="node__shape" r={radius} />
                <text className="node__label" y={radius + 16}>
                  {truncateLabel(node.label)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <div className="graph__controls">
        <button
          type="button"
          className="button button--icon"
          onClick={() => applyZoom(0.8)}
          aria-label="Zoom avant"
        >
          +
        </button>
        <button
          type="button"
          className="button button--icon"
          onClick={() => applyZoom(1.25)}
          aria-label="Zoom arrière"
        >
          −
        </button>
        <button
          type="button"
          className="button button--icon"
          onClick={() => setView(BASE_VIEW)}
          aria-label="Réinitialiser"
        >
          ⟲
        </button>
      </div>
      <span className="graph__hint">
        Molette : zoom · Glisser : déplacer · Cliquer : sélectionner
      </span>
    </div>
  );
}

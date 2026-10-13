import { navigate } from '../utils/router';
import type { Route } from '../utils/router';

interface NavBarProps {
  route: Route;
  caseName: string;
}

interface NavItem {
  key: string;
  label: string;
  target: Route;
  isActive: (route: Route) => boolean;
}

const NAV: NavItem[] = [
  {
    key: 'overview',
    label: "Vue d'ensemble",
    target: { name: 'overview' },
    isActive: (r) => r.name === 'overview',
  },
  {
    key: 'documents',
    label: 'Documents',
    target: { name: 'documents' },
    isActive: (r) => r.name === 'documents' || r.name === 'document',
  },
  {
    key: 'chronology',
    label: 'Chronologie',
    target: { name: 'chronology' },
    isActive: (r) => r.name === 'chronology',
  },
  {
    key: 'graph',
    label: 'Graphe',
    target: { name: 'graph', focus: null },
    isActive: (r) => r.name === 'graph',
  },
  {
    key: 'contradictions',
    label: 'Contradictions',
    target: { name: 'contradictions' },
    isActive: (r) => r.name === 'contradictions',
  },
];

export function NavBar({ route, caseName }: NavBarProps) {
  return (
    <>
      <header className="topbar">
        <button type="button" className="brand" onClick={() => navigate({ name: 'overview' })}>
          <span className="brand__mark">TR</span>
          <span className="brand__name">
            <span className="brand__title">TRACE</span>
            <span className="brand__sub">Investigation Lab</span>
          </span>
        </button>
        <div className="topbar__case">
          <span className="topbar__case-name">{caseName}</span>
          <span className="status-dot">Dossier ouvert</span>
        </div>
      </header>
      <nav className="nav" aria-label="Sections du dossier">
        {NAV.map((item) => {
          const active = item.isActive(route);
          return (
            <button
              key={item.key}
              type="button"
              className={active ? 'nav__item nav__item--active' : 'nav__item'}
              aria-current={active ? 'page' : undefined}
              onClick={() => navigate(item.target)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}

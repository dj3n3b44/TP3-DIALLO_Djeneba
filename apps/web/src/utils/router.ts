export type Route =
  | { name: 'overview' }
  | { name: 'documents' }
  | { name: 'document'; id: string; query: string | null; focus: string | null }
  | { name: 'chronology' }
  | { name: 'graph'; focus: string | null }
  | { name: 'contradictions' };

export function parseHash(hash: string): Route {
  const withoutHash = hash.startsWith('#') ? hash.slice(1) : hash;
  const [rawPath = '', rawQuery = ''] = withoutHash.split('?');
  const params = new URLSearchParams(rawQuery);
  const segments = rawPath.split('/').filter((segment) => segment.length > 0);

  const first = segments[0];
  if (first === 'documents') {
    const id = segments[1];
    if (id === undefined) {
      return { name: 'documents' };
    }
    return { name: 'document', id, query: params.get('q'), focus: params.get('focus') };
  }
  if (first === 'chronologie') {
    return { name: 'chronology' };
  }
  if (first === 'graphe') {
    return { name: 'graph', focus: params.get('node') };
  }
  if (first === 'contradictions') {
    return { name: 'contradictions' };
  }
  return { name: 'overview' };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'overview':
      return '#/';
    case 'documents':
      return '#/documents';
    case 'document': {
      const params = new URLSearchParams();
      if (route.query) {
        params.set('q', route.query);
      }
      if (route.focus) {
        params.set('focus', route.focus);
      }
      const query = params.toString();
      const base = `#/documents/${encodeURIComponent(route.id)}`;
      return query.length > 0 ? `${base}?${query}` : base;
    }
    case 'chronology':
      return '#/chronologie';
    case 'graph':
      return route.focus ? `#/graphe?node=${encodeURIComponent(route.focus)}` : '#/graphe';
    case 'contradictions':
      return '#/contradictions';
  }
}

export function navigate(route: Route): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.location.hash = routeToHash(route);
}

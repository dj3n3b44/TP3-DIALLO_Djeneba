import { useEffect, useState } from 'react';
import { parseHash } from '../utils/router';
import type { Route } from '../utils/router';

function readHash(): string {
  return typeof window === 'undefined' ? '' : window.location.hash;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(readHash()));

  useEffect(() => {
    function onChange(): void {
      setRoute(parseHash(window.location.hash));
    }
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

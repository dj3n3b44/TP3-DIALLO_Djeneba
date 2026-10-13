import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface InternalState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsync<T>(factory: () => Promise<T>, key: string): AsyncState<T> {
  const factoryRef = useRef(factory);
  factoryRef.current = factory;

  const [state, setState] = useState<InternalState<T>>({ data: null, loading: true, error: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setState((previous) => ({ data: previous.data, loading: true, error: null }));

    factoryRef
      .current()
      .then((data) => {
        if (active) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [key, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  return { data: state.data, loading: state.loading, error: state.error, reload };
}

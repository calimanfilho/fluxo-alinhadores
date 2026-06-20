import { useEffect, useState, type DependencyList } from 'react';

export function useEntityLoader<T>(loader: () => Promise<T>, deps: DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const next = await loader();
        if (active) {
          setData(next);
        }
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'Falha ao carregar registro.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

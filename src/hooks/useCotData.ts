import { useState, useEffect, useCallback } from 'react';
import {
  fetchCotData,
  type CotRecord,
  type CotAsset,
} from '../services/cftcApi';

interface UseCotResult {
  data: CotRecord[];
  latestRecord: CotRecord | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Hook to fetch CFTC COT data for a given asset */
export function useCotData(asset: CotAsset, rows = 52): UseCotResult {
  const [data, setData] = useState<CotRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchCotData(asset, rows);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [asset, rows]);

  useEffect(() => { load(); }, [load]);

  const latestRecord = data.at(-1) ?? null;

  return { data, latestRecord, isLoading, error, refetch: load };
}

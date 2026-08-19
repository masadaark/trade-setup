import { useState, useEffect, useCallback } from 'react';
import {
  fetchFedFundsRate,
  fetchYieldSpread,
  fetchCPI,
  fetchBalanceSheet,
  fetchLatestValue,
  type FredObservation,
} from '../services/fredApi';

type FredSeries = 'fedFunds' | 'yieldSpread' | 'cpi' | 'balanceSheet';

interface UseFredSeriesResult {
  data: FredObservation[];
  latestValue: number | null;
  prevValue: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const fetcherMap: Record<FredSeries, () => Promise<FredObservation[]>> = {
  fedFunds: fetchFedFundsRate,
  yieldSpread: fetchYieldSpread,
  cpi: fetchCPI,
  balanceSheet: fetchBalanceSheet,
};

/** Hook to fetch a FRED series with loading/error state */
export function useFredSeries(series: FredSeries): UseFredSeriesResult {
  const [data, setData] = useState<FredObservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetcher = fetcherMap[series];

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    load();
  }, [load]);

  const validValues = data
    .filter((o) => o.value !== '.')
    .map((o) => parseFloat(o.value));

  const latestValue = validValues.at(-1) ?? null;
  const prevValue = validValues.at(-2) ?? null;

  return { data, latestValue, prevValue, isLoading, error, refetch: load };
}

/** Hook to fetch the latest value of any FRED series by ID */
export function useFredLatest(seriesId: string): {
  value: number | null;
  isLoading: boolean;
  error: string | null;
} {
  const [value, setValue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchLatestValue(seriesId)
      .then((v) => { if (!cancelled) { setValue(v); setIsLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setIsLoading(false); } });
    return () => { cancelled = true; };
  }, [seriesId]);

  return { value, isLoading, error };
}

import { useState, useEffect, useCallback } from 'react';
import {
  fetchQuote,
  fetchBars,
  calcATR,
  calcVWAP,
  type YahooQuote,
  type YahooChartBar,
} from '../services/yahooFinanceApi';

interface UseQuoteResult {
  quote: YahooQuote | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Hook to fetch a real-time Yahoo Finance quote */
export function useQuote(symbol: string): UseQuoteResult {
  const [quote, setQuote] = useState<YahooQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchQuote(symbol);
      setQuote(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => { load(); }, [load]);

  return { quote, isLoading, error, refetch: load };
}

interface UseBarsResult {
  bars: YahooChartBar[];
  atr: number;
  vwap: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Hook to fetch OHLCV bars with pre-computed ATR and VWAP */
export function useBars(
  symbol: string,
  interval: '1d' | '1wk' | '1mo' = '1d',
  range: '1mo' | '3mo' | '6mo' | '1y' | '2y' = '1y'
): UseBarsResult {
  const [bars, setBars] = useState<YahooChartBar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBars(symbol, interval, range);
      setBars(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, interval, range]);

  useEffect(() => { load(); }, [load]);

  const atr = bars.length > 0 ? calcATR(bars) : 0;
  const vwap = bars.length > 0 ? calcVWAP(bars) : 0;

  return { bars, atr, vwap, isLoading, error, refetch: load };
}

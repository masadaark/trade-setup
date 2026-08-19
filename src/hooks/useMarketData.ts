import { useState, useEffect, useCallback } from 'react';
import {
  getMarketBars as fetchBars,
} from '../services/marketDataRouter';
import { useLivePrice } from './useLivePrice';
import {
  calcATR,
  calcVWAP,
  detectTrend,
  findSwingLevels,
  type YahooQuote,
  type YahooChartBar,
} from '../services/yahooFinanceApi';
import {
  buildTradeSetup,
  formatPrice,
  type TradeSetup,
  type TrendDirection,
  type StructureTimeframe,
  type CurrencyStrength,
} from '../services/marketAnalysis';
import { scanTradeSetups, scanStructureLiquidity } from '../services/setupScanner';

export type { TradeSetup, TrendDirection, StructureTimeframe, CurrencyStrength };
export { formatPrice };

interface UseQuoteResult {
  quote: YahooQuote | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useQuote(symbol: string): UseQuoteResult {
  const { quote, isLoading, error, refetch } = useLivePrice(symbol);
  return { quote, isLoading, error, refetch };
}

interface UseBarsResult {
  bars: YahooChartBar[];
  atr: number;
  vwap: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBars(
  symbol: string,
  interval: '1d' | '1wk' | '1mo' | '1h' = '1d',
  range: '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' = '1y'
): UseBarsResult {
  const [bars, setBars] = useState<YahooChartBar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setBars(await fetchBars(symbol, interval, range));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, interval, range]);

  useEffect(() => { load(); }, [load]);

  return {
    bars,
    atr: bars.length > 0 ? calcATR(bars) : 0,
    vwap: bars.length > 0 ? calcVWAP(bars) : 0,
    isLoading,
    error,
    refetch: load,
  };
}

interface UseTradeSetupsResult {
  setups: TradeSetup[];
  bestSetup: TradeSetup | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTradeSetups(): UseTradeSetupsResult {
  const [setups, setSetups] = useState<TradeSetup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setSetups(await scanTradeSetups());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { setups, bestSetup: setups[0] ?? null, isLoading, error, refetch: load };
}

const MTF_CONFIG = [
  { tf: 'Monthly', label: 'MN', interval: '1mo' as const, range: '2y' as const, lookback: 6 },
  { tf: 'Weekly', label: 'W1', interval: '1wk' as const, range: '2y' as const, lookback: 8 },
  { tf: 'Daily', label: 'D1', interval: '1d' as const, range: '6mo' as const, lookback: 20 },
  { tf: '4-Hour', label: 'H4', interval: '1h' as const, range: '1mo' as const, lookback: 30 },
  { tf: '1-Hour', label: 'H1', interval: '1h' as const, range: '5d' as const, lookback: 20 },
];

function structureDescription(symbol: string, trend: TrendDirection, bars: YahooChartBar[]): string {
  const { swingHigh, swingLow } = findSwingLevels(bars, 10);
  if (trend === 'Bullish') return `Higher High at ${formatPrice(symbol, swingHigh)}`;
  if (trend === 'Bearish') return `Lower Low at ${formatPrice(symbol, swingLow)}`;
  return 'Consolidating in narrow range';
}

function statusForTrend(trend: TrendDirection, tf: string): string {
  if (trend === 'Bullish') return tf === 'H4' || tf === 'H1' ? 'Ready to trade' : 'Aligned';
  if (trend === 'Neutral') return tf === 'H1' ? 'Waiting breakout' : 'Mixed';
  return 'Caution';
}

interface UseStructureAnalysisResult {
  timeframes: StructureTimeframe[];
  alignedCount: number;
  verdict: string;
  liquidity: {
    bsl: number;
    currentLow: number;
    currentHigh: number;
    demandLow: number;
    demandHigh: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStructureAnalysis(symbol = 'GC=F'): UseStructureAnalysisResult {
  const [timeframes, setTimeframes] = useState<StructureTimeframe[]>([]);
  const [liquidity, setLiquidity] = useState<UseStructureAnalysisResult['liquidity']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results: StructureTimeframe[] = [];
      for (const cfg of MTF_CONFIG) {
        const bars = await fetchBars(symbol, cfg.interval, cfg.range);
        const trend = detectTrend(bars, cfg.lookback);
        results.push({
          tf: cfg.tf,
          label: cfg.label,
          trend,
          structure: structureDescription(symbol, trend, bars),
          status: statusForTrend(trend, cfg.tf),
        });
      }
      setTimeframes(results);
      setLiquidity(await scanStructureLiquidity(symbol));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => { load(); }, [load]);

  const alignedCount = timeframes.filter((t) => t.trend === 'Bullish').length;
  const verdict =
    alignedCount >= 4
      ? 'Bullish Structure Aligned'
      : alignedCount <= 1
      ? 'Bearish Structure'
      : 'Mixed Structure — Wait for clarity';

  return { timeframes, alignedCount, verdict, liquidity, isLoading, error, refetch: load };
}

const CURRENCY_PAIRS: { symbol: string; currency: string; invert?: boolean }[] = [
  { symbol: 'AUDUSD=X', currency: 'AUD' },
  { symbol: 'NZDUSD=X', currency: 'NZD' },
  { symbol: 'USDCAD=X', currency: 'CAD', invert: true },
  { symbol: 'EURUSD=X', currency: 'EUR' },
  { symbol: 'GBPUSD=X', currency: 'GBP' },
  { symbol: 'USDCHF=X', currency: 'CHF', invert: true },
  { symbol: 'USDJPY=X', currency: 'JPY', invert: true },
];

interface UseCurrencyStrengthResult {
  currencies: CurrencyStrength[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCurrencyStrength(): UseCurrencyStrengthResult {
  const [currencies, setCurrencies] = useState<CurrencyStrength[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const valid: CurrencyStrength[] = [];
      for (const { symbol, currency, invert } of CURRENCY_PAIRS) {
        const bars = await fetchBars(symbol, '1d', '1mo');
        const last = bars.at(-1);
        const prev = bars.at(-2);
        if (!last || !prev) continue;
        let changeNum = ((last.close - prev.close) / prev.close) * 100;
        if (invert) changeNum = -changeNum;
        valid.push({
          symbol: currency,
          change: `${changeNum >= 0 ? '+' : ''}${changeNum.toFixed(2)}%`,
          changeNum,
          direction: changeNum >= 0 ? 'up' : 'down',
        });
      }

      const usdChange = -(valid.reduce((s, r) => s + r.changeNum, 0) / valid.length);
      valid.push({
        symbol: 'USD',
        change: `${usdChange >= 0 ? '+' : ''}${usdChange.toFixed(2)}%`,
        changeNum: usdChange,
        direction: usdChange >= 0 ? 'up' : 'down',
      });

      valid.sort((a, b) => b.changeNum - a.changeNum);
      setCurrencies(valid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { currencies, isLoading, error, refetch: load };
}

// Re-export for any direct usage
export { buildTradeSetup };

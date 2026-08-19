import env from '../config/env';
import { cachedFetch } from './cache';
import { enqueue } from './requestQueue';
import type { YahooChartBar } from './yahooFinanceApi';

export interface FredObservation {
  date: string;
  value: string;
}

export interface FredSeriesResponse {
  observations: FredObservation[];
}

/** Fetch the last N observations for a FRED series (uses Vite dev proxy /api/fred) */
export async function fetchSeries(
  series: string,
  limit = 24
): Promise<FredObservation[]> {
  const apiKey = env.thirdParty.fred.apiKey;
  if (!apiKey) throw new Error('FRED API key not configured (VITE_FRED_API_KEY)');

  const params = new URLSearchParams({
    series_id: series,
    api_key: apiKey,
    file_type: 'json',
    sort_order: 'desc',
    limit: String(limit),
  });

  const res = await enqueue('fred', () => fetch(`/api/fred/series/observations?${params}`));
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FRED ${series}: ${res.status} ${text.slice(0, 100)}`);
  }
  const data: FredSeriesResponse = await res.json();
  // Return in chronological order
  return [...data.observations].reverse();
}

/** Federal Funds Effective Rate (monthly) */
export async function fetchFedFundsRate(): Promise<FredObservation[]> {
  return fetchSeries('FEDFUNDS', 24);
}

/** 10-Year minus 2-Year Treasury Yield Spread (daily) */
export async function fetchYieldSpread(): Promise<FredObservation[]> {
  return fetchSeries('T10Y2Y', 90);
}

/** Consumer Price Index – All Urban Consumers (monthly, YoY change) */
export async function fetchCPI(): Promise<FredObservation[]> {
  return fetchSeries('CPIAUCSL', 24);
}

/** Fed Reserve Balance Sheet – Total Assets (weekly) */
export async function fetchBalanceSheet(): Promise<FredObservation[]> {
  return fetchSeries('WALCL', 52);
}

/** FRED series — DXY & S&P only (Gold uses Binance REST + WS) */
export const FRED_MARKET_SERIES: Record<string, string> = {
  'DX-Y.NYB': 'DTWEXBGS',
  'ES=F': 'SP500',
};

export function isFredSymbol(symbol: string): boolean {
  return symbol in FRED_MARKET_SERIES;
}

/** Daily price bars from a FRED series */
export async function fetchFredBars(seriesId: string, lookbackDays = 400): Promise<YahooChartBar[]> {
  const cacheKey = `fred:bars:${seriesId}:${lookbackDays}`;
  const limit = Math.min(lookbackDays + 10, 1000);

  return cachedFetch(cacheKey, async () => {
    const observations = await fetchSeries(seriesId, limit);
    const bars = observations
      .filter((o) => o.value !== '.')
      .map((o) => {
        const close = parseFloat(o.value);
        return {
          time: Math.floor(new Date(o.date).getTime() / 1000),
          open: close,
          high: close,
          low: close,
          close,
          volume: 0,
        };
      });
    if (bars.length === 0) throw new Error(`FRED ${seriesId}: no data`);
    return bars;
  }, 30 * 60 * 1000);
}

/** Latest single value from a FRED series */
export async function fetchLatestValue(series: string): Promise<number | null> {
  const observations = await fetchSeries(series, 2);
  const latest = observations.at(-1);
  if (!latest || latest.value === '.') return null;
  return parseFloat(latest.value);
}

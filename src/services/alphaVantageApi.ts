import { enqueue } from './requestQueue';
import env from '../config/env';

const BASE = '/api/alphavantage/query';
const API_KEY = env.thirdParty.alphaVantage.apiKey;

interface CacheEntry<T> { data: T; ts: number }
const cache = new Map<string, CacheEntry<unknown>>();
const TTL_MS = 30 * 60 * 1000;

async function cached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && Date.now() - hit.ts < TTL_MS) return hit.data;
  const data = await fetcher();
  cache.set(key, { data, ts: Date.now() });
  return data;
}

async function get(params: Record<string, string>): Promise<unknown> {
  return enqueue('alphavantage', async () => {
    const qs = new URLSearchParams({ ...params, apikey: API_KEY }).toString();
    const res = await fetch(`${BASE}?${qs}`);
    if (!res.ok) throw new Error(`Alpha Vantage ${res.status}: ${res.statusText}`);
    const json = await res.json() as Record<string, unknown>;
    if ('Information' in json) throw new Error(String(json['Information']));
    if ('Note' in json) throw new Error(`Rate limit reached: ${String(json['Note'])}`);
    if ('Error Message' in json) throw new Error(String(json['Error Message']));
    return json;
  });
}

export interface AVQuote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  latestTradingDay: string;
}

export interface AVBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Manual fallback only — not called automatically (25 req/day limit) */
export async function fetchGlobalQuote(symbol: string): Promise<AVQuote> {
  return cached(`quote:${symbol}`, async () => {
    const json = await get({ function: 'GLOBAL_QUOTE', symbol }) as Record<string, unknown>;
    const q = json['Global Quote'] as Record<string, string>;
    if (!q || !q['05. price']) throw new Error(`No quote data for ${symbol}`);
    return {
      symbol: q['01. symbol'],
      price: parseFloat(q['05. price']),
      change: parseFloat(q['09. change']),
      changePct: parseFloat(q['10. change percent'].replace('%', '')),
      open: parseFloat(q['02. open']),
      high: parseFloat(q['03. high']),
      low: parseFloat(q['04. low']),
      prevClose: parseFloat(q['08. previous close']),
      volume: parseInt(q['06. volume'], 10),
      latestTradingDay: q['07. latest trading day'],
    };
  });
}

export async function fetchFxDaily(
  from: string,
  to: string,
  outputsize: 'compact' | 'full' = 'compact'
): Promise<AVBar[]> {
  return cached(`fx_daily:${from}:${to}:${outputsize}`, async () => {
    const json = await get({
      function: 'FX_DAILY',
      from_symbol: from,
      to_symbol: to,
      outputsize,
    }) as Record<string, unknown>;

    const series = json['Time Series FX (Daily)'] as Record<string, Record<string, string>>;
    if (!series) throw new Error(`No FX_DAILY data for ${from}/${to}`);

    return Object.entries(series)
      .map(([date, v]) => ({
        date,
        open: parseFloat(v['1. open']),
        high: parseFloat(v['2. high']),
        low: parseFloat(v['3. low']),
        close: parseFloat(v['4. close']),
        volume: 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  });
}

export async function fetchEquityDaily(
  symbol: string,
  outputsize: 'compact' | 'full' = 'compact'
): Promise<AVBar[]> {
  return cached(`equity_daily:${symbol}:${outputsize}`, async () => {
    const json = await get({
      function: 'TIME_SERIES_DAILY',
      symbol,
      outputsize,
    }) as Record<string, unknown>;

    const series = json['Time Series (Daily)'] as Record<string, Record<string, string>>;
    if (!series) throw new Error(`No daily data for ${symbol}`);

    return Object.entries(series)
      .map(([date, v]) => ({
        date,
        open: parseFloat(v['1. open']),
        high: parseFloat(v['2. high']),
        low: parseFloat(v['3. low']),
        close: parseFloat(v['4. close']),
        volume: parseInt(v['5. volume'], 10),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  });
}

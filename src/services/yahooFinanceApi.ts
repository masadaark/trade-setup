/** Yahoo Finance v8 chart API (via Vite dev proxy /api/yahoo) */

import { cachedFetch } from './cache';
import { enqueue } from './requestQueue';

export interface YahooQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  longName?: string;
  shortName?: string;
}

export interface YahooChartBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartMeta {
  symbol: string;
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  previousClose?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  shortName?: string;
  longName?: string;
}

export interface ChartPayload {
  meta: ChartMeta;
  bars: YahooChartBar[];
}

export async function fetchYahooChart(
  symbol: string,
  interval: string,
  range: string
): Promise<ChartPayload> {
  const cacheKey = `yahoo:chart:${symbol}:${interval}:${range}`;

  return cachedFetch(cacheKey, async () => {
    return enqueue('yahoo', async () => {
      const params = new URLSearchParams({ interval, range });
      const url = `/api/yahoo/v8/finance/chart/${encodeURIComponent(symbol)}?${params}`;

      let lastError: Error | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 1500 * attempt));

        const res = await fetch(url);
        if (res.status === 429) {
          lastError = new Error(`Yahoo ${symbol}: rate limited — retrying…`);
          continue;
        }
        if (!res.ok) throw new Error(`Yahoo chart ${symbol}: ${res.status}`);

        const json = await res.json();
        const chart = json?.chart?.result?.[0];
        if (!chart) throw new Error(`No chart data for ${symbol}`);

        const meta = chart.meta as ChartMeta;
        const timestamps: number[] = chart.timestamp ?? [];
        const quote = chart.indicators?.quote?.[0] ?? {};

        const bars = timestamps
          .map((t, i) => ({
            time: t,
            open: quote.open?.[i] ?? 0,
            high: quote.high?.[i] ?? 0,
            low: quote.low?.[i] ?? 0,
            close: quote.close?.[i] ?? 0,
            volume: quote.volume?.[i] ?? 0,
          }))
          .filter((b) => b.close > 0);

        return { meta, bars };
      }

      throw lastError ?? new Error(`Yahoo chart ${symbol}: failed after retries`);
    });
  }, 30 * 60 * 1000);
}

/** @deprecated Use marketDataProvider.getMarketQuote — kept for direct Yahoo access */
export async function fetchQuote(symbol: string): Promise<YahooQuote> {
  const { meta } = await fetchYahooChart(symbol, '1d', '5d');
  if (!meta.regularMarketPrice) throw new Error(`No price for ${symbol}`);
  const price = meta.regularMarketPrice;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
  const change = price - prevClose;
  return {
    symbol: meta.symbol,
    regularMarketPrice: price,
    regularMarketChange: change,
    regularMarketChangePercent: prevClose > 0 ? (change / prevClose) * 100 : 0,
    regularMarketPreviousClose: prevClose,
    regularMarketOpen: prevClose,
    regularMarketDayHigh: meta.regularMarketDayHigh ?? price,
    regularMarketDayLow: meta.regularMarketDayLow ?? price,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? price,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? price,
    shortName: meta.shortName,
    longName: meta.longName,
  };
}

/** @deprecated Use marketDataProvider.getMarketBars */
export async function fetchBars(
  symbol: string,
  interval: '1d' | '1wk' | '1mo' | '1h' = '1d',
  range: '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' = '1y'
): Promise<YahooChartBar[]> {
  const { bars } = await fetchYahooChart(symbol, interval, range);
  if (bars.length === 0) throw new Error(`No bars for ${symbol}`);
  return bars;
}

/** Calculate ATR (14-period Wilder smoothing) */
export function calcATR(bars: YahooChartBar[], period = 14): number {
  if (bars.length < period + 1) return 0;
  const trs: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const prevClose = bars[i - 1].close;
    const { high: h, low: l } = bars[i];
    trs.push(Math.max(h - l, Math.abs(h - prevClose), Math.abs(l - prevClose)));
  }
  let atr = trs.slice(0, period).reduce((s, v) => s + v, 0) / period;
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
  }
  return atr;
}

export function calcVWAP(bars: YahooChartBar[]): number {
  const cumTPV = bars.reduce((s, b) => s + ((b.high + b.low + b.close) / 3) * (b.volume || 1), 0);
  const cumVol = bars.reduce((s, b) => s + (b.volume || 1), 0);
  return cumVol > 0 ? cumTPV / cumVol : 0;
}

export function findSwingLevels(
  bars: YahooChartBar[],
  lookback = 20
): { swingHigh: number; swingLow: number; nearestSupport: number; nearestResistance: number } {
  const recent = bars.slice(-lookback);
  const swingHigh = Math.max(...recent.map((b) => b.high));
  const swingLow = Math.min(...recent.map((b) => b.low));
  const range = swingHigh - swingLow;
  return {
    swingHigh,
    swingLow,
    nearestSupport: swingLow + range * 0.236,
    nearestResistance: swingLow + range * 0.786,
  };
}

export type TrendDirection = 'Bullish' | 'Bearish' | 'Neutral';

export function detectTrend(bars: YahooChartBar[], lookback = 10): TrendDirection {
  if (bars.length < lookback) return 'Neutral';
  const slice = bars.slice(-lookback);
  const first = slice[0].close;
  const last = slice[slice.length - 1].close;
  const change = (last - first) / first;
  if (change > 0.005) return 'Bullish';
  if (change < -0.005) return 'Bearish';
  return 'Neutral';
}

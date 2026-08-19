/**
 * Market data router — WebSocket-first for live quotes.
 * Historical bars: cached once per session (Binance REST / Frankfurter / FRED).
 */

import type { YahooChartBar, YahooQuote } from './yahooFinanceApi';
import {
  getMarketBars as getRestBars,
  getMarketQuote as getRestQuote,
  getDataSourceLabel,
} from './marketDataProvider';
import { liveMarketHub } from './websocket/liveMarketHub';
import { priceAggregator } from './priceAggregator';
import { hasWebSocketSource } from './websocket/symbolMap';
import type { LiveQuote } from './websocket/types';
import { cachedFetch } from './cache';

type Interval = '1d' | '1wk' | '1mo' | '1h';
type Range = '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y';

const WS_WAIT_MS = 4_000;
const HISTORICAL_TTL = 30 * 60 * 1000;

const bootstrapped = new Set<string>();

function liveToYahooQuote(live: LiveQuote): YahooQuote {
  return {
    symbol: live.symbol,
    regularMarketPrice: live.price,
    regularMarketChange: live.change,
    regularMarketChangePercent: live.changePercent,
    regularMarketPreviousClose: live.price - live.change,
    regularMarketOpen: live.open,
    regularMarketDayHigh: live.high,
    regularMarketDayLow: live.low,
    fiftyTwoWeekHigh: live.high,
    fiftyTwoWeekLow: live.low,
  };
}

function waitForLiveQuote(symbol: string, timeoutMs: number): Promise<LiveQuote | null> {
  const existing = liveMarketHub.getLiveQuote(symbol);
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      unsub();
      resolve(liveMarketHub.getLiveQuote(symbol));
    }, timeoutMs);

    const unsub = liveMarketHub.subscribe(symbol, (q) => {
      clearTimeout(timer);
      unsub();
      resolve(q);
    });
  });
}

/** Cached historical bars — fetched once per TTL, not on every panel mount */
async function getHistoricalBars(
  symbol: string,
  interval: Interval,
  range: Range
): Promise<YahooChartBar[]> {
  const key = `hist:${symbol}:${interval}:${range}`;
  return cachedFetch(key, () => getRestBars(symbol, interval, range), HISTORICAL_TTL);
}

/** One-time seed of aggregator from cached history (no quote REST) */
export async function bootstrapSymbolHistory(symbol: string): Promise<void> {
  if (bootstrapped.has(symbol)) return;
  try {
    const bars = await getHistoricalBars(symbol, '1d', '6mo');
    if (bars.length > 0) {
      priceAggregator.seedFromBars(symbol, bars, 'rest');
      bootstrapped.add(symbol);
    }
  } catch {
    // WS ticks will seed when connected
  }
}

/** Quote: WS only for WS-covered symbols — no REST polling */
export async function getMarketQuote(symbol: string): Promise<YahooQuote> {
  if (hasWebSocketSource(symbol)) {
    const live = await waitForLiveQuote(symbol, WS_WAIT_MS);
    if (live) return liveToYahooQuote(live);
    // WS timeout — use seeded aggregator or last historical close
    const seeded = priceAggregator.getLiveQuote(symbol);
    if (seeded) return liveToYahooQuote(seeded);
    await bootstrapSymbolHistory(symbol);
    const afterSeed = priceAggregator.getLiveQuote(symbol);
    if (afterSeed) return liveToYahooQuote(afterSeed);
  }
  return getRestQuote(symbol);
}

/** Bars: cached history + live WS merge — single fetch per session */
export async function getMarketBars(
  symbol: string,
  interval: Interval = '1d',
  range: Range = '1y'
): Promise<YahooChartBar[]> {
  const historical = await getHistoricalBars(symbol, interval, range);

  if (!hasWebSocketSource(symbol)) return historical;

  const live = liveMarketHub.getLiveQuote(symbol);
  const liveInterval: '1h' = '1h';
  const merged = priceAggregator.mergeWithHistorical(symbol, historical, liveInterval);

  if (live && merged.length > 0) {
    const last = merged[merged.length - 1];
    last.close = live.price;
    last.high = Math.max(last.high, live.price);
    last.low = Math.min(last.low, live.price);
  }

  return merged;
}

export async function getMarketQuoteAndBars(
  symbol: string,
  interval: Interval = '1d',
  range: Range = '6mo'
): Promise<{ quote: YahooQuote; bars: YahooChartBar[] }> {
  const [bars, quote] = await Promise.all([
    getMarketBars(symbol, interval, range),
    getMarketQuote(symbol),
  ]);
  return { quote, bars };
}

export function getSourceLabel(symbol: string): string {
  const live = liveMarketHub.getLiveQuote(symbol);
  if (live) return `${live.provider === 'binance' ? 'Binance' : 'Finnhub'} (live)`;
  return getDataSourceLabel(symbol);
}

export { liveMarketHub, priceAggregator };

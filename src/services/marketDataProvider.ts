/**
 * Multi-source market data router.
 * Priority: Frankfurter (FX) → FRED (macro assets) → Yahoo (last resort)
 *
 * Yahoo unofficial API rate-limits aggressively by IP — avoid for bulk dashboard loads.
 */

import type { YahooChartBar, YahooQuote } from './yahooFinanceApi';
import { fetchYahooChart } from './yahooFinanceApi';
import { fetchFxBars, FRANKFURTER_FX, isFrankfurterSymbol } from './frankfurterApi';
import { fetchFredBars, FRED_MARKET_SERIES, isFredSymbol } from './fredApi';
import { fetchBinanceBars, isBinanceRestSymbol, getBinancePair } from './binanceRestApi';
import { normalizeSymbol } from './websocket/symbolMap';

type Interval = '15m' | '1h' | '1d' | '1wk' | '1mo';
type Range = '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y';

const RANGE_DAYS: Record<Range, number> = {
  '5d': 10,
  '1mo': 35,
  '3mo': 100,
  '6mo': 200,
  '1y': 400,
  '2y': 800,
};

function metaToQuote(symbol: string, bars: YahooChartBar[]): YahooQuote {
  const last = bars.at(-1)!;
  const prev = bars.at(-2) ?? last;
  const change = last.close - prev.close;
  const changePct = prev.close > 0 ? (change / prev.close) * 100 : 0;
  const highs = bars.slice(-252).map((b) => b.high);
  const lows = bars.slice(-252).map((b) => b.low);

  return {
    symbol,
    regularMarketPrice: last.close,
    regularMarketChange: change,
    regularMarketChangePercent: changePct,
    regularMarketPreviousClose: prev.close,
    regularMarketOpen: last.open,
    regularMarketDayHigh: last.high,
    regularMarketDayLow: last.low,
    fiftyTwoWeekHigh: highs.length ? Math.max(...highs) : last.high,
    fiftyTwoWeekLow: lows.length ? Math.min(...lows) : last.low,
  };
}

function aggregateBars(bars: YahooChartBar[], mode: 'week' | 'month'): YahooChartBar[] {
  const groups = new Map<string, YahooChartBar[]>();

  for (const bar of bars) {
    const d = new Date(bar.time * 1000);
    const key =
      mode === 'week'
        ? `${d.getUTCFullYear()}-W${Math.ceil((d.getUTCDate() + 6) / 7)}-${d.getUTCMonth()}`
        : `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

    const list = groups.get(key) ?? [];
    list.push(bar);
    groups.set(key, list);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, chunk]) => ({
      time: chunk[0].time,
      open: chunk[0].open,
      high: Math.max(...chunk.map((b) => b.high)),
      low: Math.min(...chunk.map((b) => b.low)),
      close: chunk[chunk.length - 1].close,
      volume: chunk.reduce((s, b) => s + b.volume, 0),
    }));
}

async function fetchBaseBars(rawSymbol: string, interval: Interval, range: Range): Promise<YahooChartBar[]> {
  const symbol = normalizeSymbol(rawSymbol);
  const days = RANGE_DAYS[range];

  if (isFrankfurterSymbol(symbol)) {
    const { from, to } = FRANKFURTER_FX[symbol];
    return fetchFxBars(from, to, days);
  }

  if (isBinanceRestSymbol(symbol)) {
    const pair = getBinancePair(symbol);
    const binanceInterval = interval === '15m' ? '15m' : (interval === '1h' ? '1h' : '1d');
    const limit = interval === '15m' ? 1000 : (interval === '1h' ? 500 : Math.min(days + 10, 500));
    const all = await fetchBinanceBars(pair, binanceInterval, limit);
    if (interval === '1d') return all.slice(-Math.min(days + 10, all.length));
    return all;
  }

  if (isFredSymbol(symbol)) {
    try {
      return await fetchFredBars(FRED_MARKET_SERIES[symbol], days);
    } catch {
      // FRED unavailable (no API key) — fall through to Yahoo
    }
  }

  // Yahoo Finance doesn't support 15m easily without premium, fallback to 1h
  const yahooInterval = (interval === '15m' || interval === '1h') ? '1h' : '1d';
  const { bars } = await fetchYahooChart(symbol, yahooInterval, range);
  return bars;
}

/** Fetch OHLCV bars — routes to the best free provider for each symbol */
export async function getMarketBars(
  symbol: string,
  interval: Interval = '1d',
  range: Range = '1y'
): Promise<YahooChartBar[]> {
  const base = await fetchBaseBars(symbol, interval, range);

  if (interval === '1wk') return aggregateBars(base, 'week');
  if (interval === '1mo') return aggregateBars(base, 'month');
  return base;
}

/** Fetch quote — derived from latest bars (no extra API call) */
export async function getMarketQuote(symbol: string): Promise<YahooQuote> {
  const bars = await getMarketBars(symbol, '1d', '5d');
  return metaToQuote(symbol, bars);
}

/** Single fetch for quote + bars */
export async function getMarketQuoteAndBars(
  symbol: string,
  interval: Interval = '1d',
  range: Range = '6mo'
): Promise<{ quote: YahooQuote; bars: YahooChartBar[] }> {
  const bars = await getMarketBars(symbol, interval, range);
  return { quote: metaToQuote(symbol, bars), bars };
}

export function getDataSourceLabel(symbol: string): string {
  const norm = normalizeSymbol(symbol);
  if (isFrankfurterSymbol(norm)) return 'Frankfurter (ECB)';
  if (isFredSymbol(norm)) return 'FRED';
  if (isBinanceRestSymbol(norm)) return 'Binance (USD-M Futures)';
  return 'Yahoo Finance';
}

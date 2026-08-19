import { cachedFetch } from './cache';
import { enqueue } from './requestQueue';
import type { YahooChartBar } from './yahooFinanceApi';

interface BinanceKline {
  0: number;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
}

/** Free Binance USD-M Futures klines — XAUUSDT is futures-only (not on spot API) */
export async function fetchBinanceDailyBars(
  symbol = 'XAUUSDT',
  limit = 200
): Promise<YahooChartBar[]> {
  const cacheKey = `binance-futures:klines:${symbol}:${limit}`;

  return cachedFetch(cacheKey, async () => {
    const params = new URLSearchParams({ symbol, interval: '1d', limit: String(limit) });
    const res = await enqueue('binance', () =>
      fetch(`/api/binance-futures/fapi/v1/klines?${params}`)
    );
    if (!res.ok) throw new Error(`Binance klines ${symbol}: ${res.status}`);

    const json = (await res.json()) as BinanceKline[];
    return json.map((k) => ({
      time: Math.floor(k[0] / 1000),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));
  }, 30 * 60 * 1000);
}

/** Map dashboard symbol to Binance pair */
export function isBinanceRestSymbol(symbol: string): boolean {
  return symbol === 'GC=F';
}

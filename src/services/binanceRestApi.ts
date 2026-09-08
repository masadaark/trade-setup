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

const BINANCE_PAIR_MAP: Record<string, string> = {
  'GC=F': 'XAUUSDT',
  'XAUUSD': 'XAUUSDT',
  'BTC-USD': 'BTCUSDT',
  'BTCUSD': 'BTCUSDT',
};

/** Free Binance USD-M Futures klines — XAUUSDT & BTCUSDT */
export async function fetchBinanceBars(
  symbol = 'XAUUSDT',
  interval = '1d',
  limit = 200
): Promise<YahooChartBar[]> {
  const pair = BINANCE_PAIR_MAP[symbol] ?? symbol;
  const cacheKey = `binance-futures:klines:${pair}:${interval}:${limit}`;

  return cachedFetch(cacheKey, async () => {
    const params = new URLSearchParams({ symbol: pair, interval, limit: String(limit) });
    const res = await enqueue('binance', () =>
      fetch(`/api/binance-futures/fapi/v1/klines?${params}`)
    );
    if (!res.ok) throw new Error(`Binance klines ${pair}: ${res.status}`);

    const json = (await res.json()) as BinanceKline[];
    return json.map((k) => ({
      time: Math.floor(k[0] / 1000),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));
  }, interval === '1d' ? 30 * 60 * 1000 : 60 * 1000); // 1-min cache for intraday
}

/** Map dashboard symbol to Binance pair */
export function isBinanceRestSymbol(symbol: string): boolean {
  return symbol in BINANCE_PAIR_MAP;
}

export function getBinancePair(symbol: string): string {
  return BINANCE_PAIR_MAP[symbol] ?? 'XAUUSDT';
}


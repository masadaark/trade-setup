/** Yahoo Finance v8 chart API (via Vite dev proxy /api/yahoo) */

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
  time: number; // unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Fetch quote summary for a symbol */
export async function fetchQuote(symbol: string): Promise<YahooQuote> {
  const params = new URLSearchParams({
    symbols: symbol,
    fields: [
      'regularMarketPrice',
      'regularMarketChange',
      'regularMarketChangePercent',
      'regularMarketPreviousClose',
      'regularMarketOpen',
      'regularMarketDayHigh',
      'regularMarketDayLow',
      'fiftyTwoWeekHigh',
      'fiftyTwoWeekLow',
      'longName',
      'shortName',
    ].join(','),
  });

  const res = await fetch(`/api/yahoo/v7/finance/quote?${params}`);
  if (!res.ok) throw new Error(`Yahoo Finance ${symbol}: ${res.status}`);

  const json = await res.json();
  const result = json?.quoteResponse?.result?.[0];
  if (!result) throw new Error(`No data for ${symbol}`);
  return result as YahooQuote;
}

/** Fetch OHLCV bars for a symbol */
export async function fetchBars(
  symbol: string,
  interval: '1d' | '1wk' | '1mo' = '1d',
  range: '1mo' | '3mo' | '6mo' | '1y' | '2y' = '1y'
): Promise<YahooChartBar[]> {
  const params = new URLSearchParams({ interval, range });
  const res = await fetch(`/api/yahoo/v8/finance/chart/${encodeURIComponent(symbol)}?${params}`);
  if (!res.ok) throw new Error(`Yahoo chart ${symbol}: ${res.status}`);

  const json = await res.json();
  const chart = json?.chart?.result?.[0];
  if (!chart) throw new Error(`No chart data for ${symbol}`);

  const timestamps: number[] = chart.timestamp ?? [];
  const quote = chart.indicators?.quote?.[0] ?? {};

  return timestamps.map((t, i) => ({
    time: t,
    open: quote.open?.[i] ?? 0,
    high: quote.high?.[i] ?? 0,
    low: quote.low?.[i] ?? 0,
    close: quote.close?.[i] ?? 0,
    volume: quote.volume?.[i] ?? 0,
  }));
}

/** Calculate ATR (14-period Average True Range) from OHLCV bars */
export function calcATR(bars: YahooChartBar[], period = 14): number {
  if (bars.length < period + 1) return 0;
  const trs: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const prevClose = bars[i - 1].close;
    const { high: h, low: l } = bars[i];
    const tr = Math.max(h - l, Math.abs(h - prevClose), Math.abs(l - prevClose));
    trs.push(tr);
  }
  // Wilder smoothing
  let atr = trs.slice(0, period).reduce((s, v) => s + v, 0) / period;
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
  }
  return atr;
}


/** Calculate VWAP from bars (daily reset) */
export function calcVWAP(bars: YahooChartBar[]): number {
  const cumTPV = bars.reduce((s, b) => s + ((b.high + b.low + b.close) / 3) * b.volume, 0);
  const cumVol = bars.reduce((s, b) => s + b.volume, 0);
  return cumVol > 0 ? cumTPV / cumVol : 0;
}

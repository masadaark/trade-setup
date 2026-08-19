import { cachedFetch } from './cache';
import { enqueue } from './requestQueue';
import type { YahooChartBar } from './yahooFinanceApi';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function ratesToBars(rates: Record<string, Record<string, number>>, quoteCurrency: string): YahooChartBar[] {
  return Object.entries(rates)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, currencies]) => {
      const close = currencies[quoteCurrency];
      return {
        time: Math.floor(new Date(date).getTime() / 1000),
        open: close,
        high: close,
        low: close,
        close,
        volume: 0,
      };
    });
}

/** Free ECB FX rates — no API key, generous limits */
export async function fetchFxBars(
  from: string,
  to: string,
  lookbackDays = 365
): Promise<YahooChartBar[]> {
  const cacheKey = `frankfurter:${from}:${to}:${lookbackDays}`;
  const start = daysAgo(lookbackDays);
  const end = daysAgo(0);

  return cachedFetch(cacheKey, async () => {
    const url = `/api/frankfurter/${start}..${end}?from=${from}&to=${to}`;
    const res = await enqueue('frankfurter', () => fetch(url));
    if (!res.ok) throw new Error(`Frankfurter ${from}/${to}: ${res.status}`);

    const json = await res.json() as { rates: Record<string, Record<string, number>> };
    const bars = ratesToBars(json.rates ?? {}, to);
    if (bars.length === 0) throw new Error(`Frankfurter ${from}/${to}: no data`);
    return bars;
  }, 30 * 60 * 1000);
}

export const FRANKFURTER_FX: Record<string, { from: string; to: string }> = {
  'EURUSD=X': { from: 'EUR', to: 'USD' },
  'GBPUSD=X': { from: 'GBP', to: 'USD' },
  'GBPJPY=X': { from: 'GBP', to: 'JPY' },
  'USDJPY=X': { from: 'USD', to: 'JPY' },
  'AUDUSD=X': { from: 'AUD', to: 'USD' },
  'NZDUSD=X': { from: 'NZD', to: 'USD' },
  'USDCAD=X': { from: 'USD', to: 'CAD' },
  'USDCHF=X': { from: 'USD', to: 'CHF' },
};

export function isFrankfurterSymbol(symbol: string): boolean {
  return symbol in FRANKFURTER_FX;
}

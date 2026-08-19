import { cachedFetch } from './cache';
import { getMarketQuoteAndBars, getMarketBars } from './marketDataRouter';
import { calcATR, findSwingLevels } from './yahooFinanceApi';
import { buildTradeSetup, type TradeSetup } from './marketAnalysis';

const SCAN_SYMBOLS = [
  { symbol: 'GC=F', asset: 'XAU/USD (Gold)' },
  { symbol: 'EURUSD=X', asset: 'EUR/USD' },
  { symbol: 'GBPJPY=X', asset: 'GBP/JPY' },
] as const;

let inflight: Promise<TradeSetup[]> | null = null;

/** Shared scanner — deduplicates across PriceAction + Risk panels */
export async function scanTradeSetups(): Promise<TradeSetup[]> {
  return cachedFetch('scanner:setups', async () => {
    if (inflight) return inflight;

    inflight = (async () => {
      const results: TradeSetup[] = [];
      for (let i = 0; i < SCAN_SYMBOLS.length; i++) {
        const { symbol, asset } = SCAN_SYMBOLS[i];
        const { quote, bars } = await getMarketQuoteAndBars(symbol, '1d', '6mo');
        const price = quote.regularMarketPrice;
        const setup = buildTradeSetup(symbol, asset, bars, price, `SET-${String(i + 1).padStart(2, '0')}`);
        if (setup) results.push(setup);
      }
      results.sort((a, b) => b.rr - a.rr);
      return results;
    })().finally(() => {
      inflight = null;
    });

    return inflight;
  }, 5 * 60 * 1000);
}

export async function scanStructureLiquidity(symbol = 'GC=F') {
  return cachedFetch(`structure:liquidity:${symbol}`, async () => {
    const dailyBars = await getMarketBars(symbol, '1d', '6mo');
    const weeklyBars = await getMarketBars(symbol, '1wk', '1y');
    const { nearestSupport } = findSwingLevels(dailyBars);
    const price = dailyBars.at(-1)?.close ?? 0;
    const atr = calcATR(dailyBars);

    return {
      bsl: Math.max(...weeklyBars.slice(-4).map((b) => b.high)),
      currentLow: price - atr * 0.3,
      currentHigh: price + atr * 0.3,
      demandLow: nearestSupport - atr * 0.2,
      demandHigh: nearestSupport + atr * 0.2,
    };
  }, 5 * 60 * 1000);
}

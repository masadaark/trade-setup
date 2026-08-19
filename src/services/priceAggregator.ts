import type { PriceTick, LiveQuote, LiveQuoteListener } from './websocket/types';
import type { YahooChartBar } from './yahooFinanceApi';

interface SymbolState {
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
  provider: PriceTick['provider'];
  sessionOpen: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
}

interface BarBucket {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const BAR_INTERVALS = {
  '1m': 60,
  '5m': 300,
  '1h': 3600,
} as const;

export type BarInterval = keyof typeof BAR_INTERVALS;

/** Aggregates ticks into OHLCV bars and live quotes */
export class PriceAggregator {
  private states = new Map<string, SymbolState>();
  private bars = new Map<string, Map<BarInterval, BarBucket[]>>();
  private quoteListeners = new Map<string, Set<LiveQuoteListener>>();

  ingest(tick: PriceTick): LiveQuote {
    const prev = this.states.get(tick.symbol);
    const sessionOpen = prev?.sessionOpen ?? tick.open ?? tick.price;
    const dayOpen = tick.open ?? prev?.dayOpen ?? tick.price;
    const dayHigh = Math.max(tick.high ?? tick.price, prev?.dayHigh ?? tick.price);
    const dayLow = Math.min(tick.low ?? tick.price, prev?.dayLow ?? tick.price);

    const state: SymbolState = {
      price: tick.price,
      open: tick.open ?? prev?.open ?? tick.price,
      high: dayHigh,
      low: dayLow,
      volume: (prev?.volume ?? 0) + (tick.volume ?? 0),
      timestamp: tick.timestamp,
      provider: tick.provider,
      sessionOpen,
      dayOpen,
      dayHigh,
      dayLow,
    };
    this.states.set(tick.symbol, state);
    this.updateBars(tick);

    const quote = this.toLiveQuote(tick.symbol, state);
    this.emitQuote(tick.symbol, quote);
    return quote;
  }

  getLiveQuote(symbol: string): LiveQuote | null {
    const state = this.states.get(symbol);
    if (!state) return null;
    return this.toLiveQuote(symbol, state);
  }

  subscribe(symbol: string, listener: LiveQuoteListener): () => void {
    const set = this.quoteListeners.get(symbol) ?? new Set();
    set.add(listener);
    this.quoteListeners.set(symbol, set);

    const current = this.getLiveQuote(symbol);
    if (current) listener(current);

    return () => {
      set.delete(listener);
      if (set.size === 0) this.quoteListeners.delete(symbol);
    };
  }

  getBars(symbol: string, interval: BarInterval): YahooChartBar[] {
    const buckets = this.bars.get(symbol)?.get(interval) ?? [];
    return buckets.map((b) => ({ ...b }));
  }

  /** Merge REST historical daily bars with live intraday bucket */
  mergeWithHistorical(
    symbol: string,
    historical: YahooChartBar[],
    interval: BarInterval = '1h'
  ): YahooChartBar[] {
    const live = this.getBars(symbol, interval);
    if (live.length === 0) return historical;

    const merged = [...historical];
    const lastHist = merged.at(-1);
    const firstLive = live[0];

    if (lastHist && firstLive && this.isSameDay(lastHist.time, firstLive.time)) {
      merged[merged.length - 1] = {
        time: lastHist.time,
        open: lastHist.open,
        high: Math.max(lastHist.high, ...live.map((b) => b.high)),
        low: Math.min(lastHist.low, ...live.map((b) => b.low)),
        close: live.at(-1)!.close,
        volume: lastHist.volume + live.reduce((s, b) => s + b.volume, 0),
      };
      return [...merged, ...live.slice(1)];
    }

    return [...merged, ...live];
  }

  seedFromBars(symbol: string, bars: YahooChartBar[], provider: PriceTick['provider'] = 'rest'): void {
    if (bars.length === 0) return;
    const last = bars.at(-1)!;
    const prev = bars.at(-2);
    this.states.set(symbol, {
      price: last.close,
      open: last.open,
      high: last.high,
      low: last.low,
      volume: last.volume,
      timestamp: last.time * 1000,
      provider,
      sessionOpen: prev?.close ?? last.open,
      dayOpen: last.open,
      dayHigh: last.high,
      dayLow: last.low,
    });
  }

  private updateBars(tick: PriceTick): void {
    for (const [interval, seconds] of Object.entries(BAR_INTERVALS) as [BarInterval, number][]) {
      const bucketTime = Math.floor(tick.timestamp / 1000 / seconds) * seconds;
      const symbolBars = this.bars.get(tick.symbol) ?? new Map();
      const intervalBars = symbolBars.get(interval) ?? [];
      const last = intervalBars.at(-1);

      if (last && last.time === bucketTime) {
        last.high = Math.max(last.high, tick.price);
        last.low = Math.min(last.low, tick.price);
        last.close = tick.price;
        last.volume += tick.volume ?? 0;
      } else {
        intervalBars.push({
          time: bucketTime,
          open: tick.price,
          high: tick.price,
          low: tick.price,
          close: tick.price,
          volume: tick.volume ?? 0,
        });
        if (intervalBars.length > 500) intervalBars.shift();
      }

      symbolBars.set(interval, intervalBars);
      this.bars.set(tick.symbol, symbolBars);
    }
  }

  private toLiveQuote(symbol: string, state: SymbolState): LiveQuote {
    const change = state.price - state.sessionOpen;
    const changePercent =
      state.sessionOpen > 0 ? (change / state.sessionOpen) * 100 : 0;

    return {
      symbol,
      price: state.price,
      change,
      changePercent,
      open: state.dayOpen,
      high: state.dayHigh,
      low: state.dayLow,
      volume: state.volume,
      timestamp: state.timestamp,
      provider: state.provider,
      isLive: true,
    };
  }

  private emitQuote(symbol: string, quote: LiveQuote): void {
    const listeners = this.quoteListeners.get(symbol);
    if (!listeners) return;
    for (const listener of listeners) listener(quote);
  }

  private isSameDay(aSec: number, bSec: number): boolean {
    const a = new Date(aSec * 1000);
    const b = new Date(bSec * 1000);
    return (
      a.getUTCFullYear() === b.getUTCFullYear() &&
      a.getUTCMonth() === b.getUTCMonth() &&
      a.getUTCDate() === b.getUTCDate()
    );
  }
}

export const priceAggregator = new PriceAggregator();

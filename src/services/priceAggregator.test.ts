import { describe, it, expect } from 'vitest';
import { PriceAggregator } from './priceAggregator';
import type { PriceTick } from './websocket/types';

function tick(symbol: string, price: number, ts: number): PriceTick {
  return { symbol, price, timestamp: ts, provider: 'binance' };
}

describe('PriceAggregator', () => {
  it('builds live quote from ticks', () => {
    const agg = new PriceAggregator();
    agg.ingest(tick('GC=F', 2600, 1_000_000));
    const quote = agg.ingest(tick('GC=F', 2610, 2_000_000));

    expect(quote.price).toBe(2610);
    expect(quote.change).toBe(10);
    expect(quote.isLive).toBe(true);
  });

  it('creates 1m bars from ticks', () => {
    const agg = new PriceAggregator();
    const base = 1_700_000_000_000;
    agg.ingest(tick('GC=F', 100, base));
    agg.ingest(tick('GC=F', 105, base + 30_000));
    agg.ingest(tick('GC=F', 102, base + 60_000));

    const bars = agg.getBars('GC=F', '1m');
    expect(bars.length).toBeGreaterThanOrEqual(1);
    expect(bars[0].high).toBe(105);
    expect(bars[0].low).toBe(100);
  });

  it('merges historical bars with live bucket', () => {
    const agg = new PriceAggregator();
    const historical = [
      { time: 1_700_000_000, open: 100, high: 102, low: 99, close: 101, volume: 10 },
    ];
    agg.ingest(tick('GC=F', 103, 1_700_000_100_000));

    const merged = agg.mergeWithHistorical('GC=F', historical, '1h');
    expect(merged.length).toBeGreaterThanOrEqual(1);
    expect(merged.at(-1)?.close).toBe(103);
  });
});

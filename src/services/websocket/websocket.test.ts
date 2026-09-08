import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseBinanceMessage } from '../websocket/binance';
import { finnhubToCanonical } from '../websocket/symbolMap';

describe('binance parser', () => {
  it('parses direct miniTicker message for PAXGUSDT (Gold Spot)', () => {
    const raw = JSON.stringify({
      e: '24hrMiniTicker',
      s: 'PAXGUSDT',
      c: '4400.50',
      o: '4390.00',
      h: '4450.00',
      l: '4380.00',
      v: '1234.5',
      E: 1_700_000_000_000,
    });

    const tick = parseBinanceMessage(raw);
    expect(tick?.symbol).toBe('GC=F');
    expect(tick?.price).toBe(4400.5);
    expect(tick?.provider).toBe('binance');
  });

  it('parses direct miniTicker message for XAUUSDT', () => {
    const raw = JSON.stringify({
      e: '24hrMiniTicker',
      s: 'XAUUSDT',
      c: '2650.50',
      o: '2640.00',
      h: '2660.00',
      l: '2635.00',
      v: '1234.5',
      E: 1_700_000_000_000,
    });

    const tick = parseBinanceMessage(raw);
    expect(tick?.symbol).toBe('GC=F');
    expect(tick?.price).toBe(2650.5);
    expect(tick?.provider).toBe('binance');
  });

  it('parses direct miniTicker message for BTCUSDT', () => {
    const raw = JSON.stringify({
      e: '24hrMiniTicker',
      s: 'BTCUSDT',
      c: '68450.25',
      o: '67000.00',
      h: '69000.00',
      l: '66500.00',
      v: '5432.1',
      E: 1_700_000_000_000,
    });

    const tick = parseBinanceMessage(raw);
    expect(tick?.symbol).toBe('BTC-USD');
    expect(tick?.price).toBe(68450.25);
    expect(tick?.provider).toBe('binance');
  });

  it('parses combined stream envelope message', () => {
    const raw = JSON.stringify({
      stream: 'btcusdt@miniTicker',
      data: {
        e: '24hrMiniTicker',
        s: 'BTCUSDT',
        c: '68500.00',
        o: '67000.00',
        h: '69000.00',
        l: '66500.00',
        v: '5432.1',
        E: 1_700_000_000_000,
      },
    });

    const tick = parseBinanceMessage(raw);
    expect(tick?.symbol).toBe('BTC-USD');
    expect(tick?.price).toBe(68500.0);
  });
});

describe('symbolMap', () => {
  it('maps finnhub stream to canonical symbol', () => {
    expect(finnhubToCanonical('OANDA:EUR_USD')).toBe('EURUSD=X');
    expect(finnhubToCanonical('SPY')).toBe('ES=F');
  });

  it('normalizes common trader aliases to canonical symbols', async () => {
    const { normalizeSymbol } = await import('../websocket/symbolMap');
    expect(normalizeSymbol('XAUUSD')).toBe('GC=F');
    expect(normalizeSymbol('BTCUSD')).toBe('BTC-USD');
    expect(normalizeSymbol('USOUSD')).toBe('CL=F');
    expect(normalizeSymbol('USOIL')).toBe('CL=F');
  });
});

describe('ConnectionManager state', () => {
  class MockWebSocket {
    static OPEN = 1;
    readyState = 0;
    onopen: (() => void) | null = null;
    onmessage: ((e: { data: string }) => void) | null = null;
    onerror: (() => void) | null = null;
    onclose: (() => void) | null = null;

    constructor(public url: string) {
      MockWebSocket.instances.push(this);
      queueMicrotask(() => {
        this.readyState = MockWebSocket.OPEN;
        this.onopen?.();
      });
    }

    static instances: MockWebSocket[] = [];
    send = vi.fn();
    close = vi.fn(() => this.onclose?.());
  }

  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal('WebSocket', MockWebSocket);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('transitions to open on connect', async () => {
    const { ConnectionManager } = await import('../websocket/connectionManager');
    const states: string[] = [];
    const mgr = new ConnectionManager({
      name: 'test',
      url: 'wss://test.example/ws',
      onMessage: () => {},
    });
    mgr.onStateChange((s) => states.push(s));
    mgr.connect();
    await new Promise((r) => setTimeout(r, 10));
    expect(states).toContain('connecting');
    expect(states).toContain('open');
    mgr.disconnect();
  });
});

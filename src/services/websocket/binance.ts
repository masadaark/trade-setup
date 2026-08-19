import type { PriceTick } from './types';

interface BinanceMiniTicker {
  e: string;
  s: string;
  c: string;
  o: string;
  h: string;
  l: string;
  v: string;
  E: number;
}

const STREAM_TO_SYMBOL: Record<string, string> = {
  XAUUSDT: 'GC=F',
};

export function parseBinanceMessage(raw: string, fallbackSymbol = 'GC=F'): PriceTick | null {
  try {
    const msg = JSON.parse(raw) as BinanceMiniTicker;
    if (msg.e !== '24hrMiniTicker' || !msg.c) return null;
    const symbol = STREAM_TO_SYMBOL[msg.s] ?? fallbackSymbol;
    return {
      symbol,
      price: parseFloat(msg.c),
      timestamp: msg.E ?? Date.now(),
      provider: 'binance',
      volume: parseFloat(msg.v),
      open: parseFloat(msg.o),
      high: parseFloat(msg.h),
      low: parseFloat(msg.l),
    };
  } catch {
    return null;
  }
}

export function createBinanceWsUrl(stream: string): string {
  // XAUUSDT trades on USD-M futures — not Binance spot
  if (stream.toLowerCase().startsWith('xau')) {
    return `wss://fstream.binance.com/ws/${stream}`;
  }
  return `wss://stream.binance.com:9443/ws/${stream}`;
}

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
  PAXGUSDT: 'GC=F',
  XAUUSDT: 'GC=F',
  BTCUSDT: 'BTC-USD',
};

interface BinanceCombinedPayload {
  stream?: string;
  data?: BinanceMiniTicker;
}

export function parseBinanceMessage(raw: string, fallbackSymbol = 'GC=F'): PriceTick | null {
  try {
    const parsed = JSON.parse(raw) as BinanceMiniTicker & BinanceCombinedPayload;
    const msg = parsed.data ?? parsed;
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

export function createBinanceWsUrl(streams: string | readonly string[]): string {
  const streamList = Array.isArray(streams) ? streams : [streams];
  if (streamList.length === 0) {
    return 'wss://stream.binance.com:9443/ws/paxgusdt@miniTicker';
  }
  if (streamList.length === 1) {
    return `wss://stream.binance.com:9443/ws/${streamList[0]}`;
  }
  return `wss://stream.binance.com:9443/stream?streams=${streamList.join('/')}`;
}


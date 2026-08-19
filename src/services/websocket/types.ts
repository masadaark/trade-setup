/** WebSocket connection lifecycle */
export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'open'
  | 'reconnecting'
  | 'closed'
  | 'error';

export type PriceProvider = 'binance' | 'finnhub' | 'rest';

/** Normalized tick from any provider */
export interface PriceTick {
  symbol: string;
  price: number;
  timestamp: number;
  provider: PriceProvider;
  volume?: number;
  open?: number;
  high?: number;
  low?: number;
}

/** Live quote derived from ticks + session reference */
export interface LiveQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
  provider: PriceProvider;
  isLive: true;
}

export type LiveQuoteListener = (quote: LiveQuote) => void;
export type ConnectionStateListener = (state: ConnectionState, error?: string) => void;

export interface ConnectionManagerConfig {
  name: string;
  url: string | (() => string);
  heartbeatMs?: number;
  heartbeatCheck?: (lastMessageAt: number) => boolean;
  maxReconnectAttempts?: number;
  baseReconnectMs?: number;
  maxReconnectMs?: number;
  onOpen?: (ws: WebSocket) => void;
  onMessage: (raw: string) => void;
}

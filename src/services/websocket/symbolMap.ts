/** Canonical dashboard symbol ↔ provider stream identifiers */

export const BINANCE_STREAMS: Record<string, string> = {
  'GC=F': 'paxgusdt@miniTicker',
  'BTC-USD': 'btcusdt@miniTicker',
};

/** Finnhub uses OANDA forex + stock tickers as proxies */
export const FINNHUB_STREAMS: Record<string, string> = {
  'EURUSD=X': 'OANDA:EUR_USD',
  'GBPUSD=X': 'OANDA:GBP_USD',
  'GBPJPY=X': 'OANDA:GBP_JPY',
  'USDJPY=X': 'OANDA:USD_JPY',
  'AUDUSD=X': 'OANDA:AUD_USD',
  'NZDUSD=X': 'OANDA:NZD_USD',
  'USDCAD=X': 'OANDA:USD_CAD',
  'USDCHF=X': 'OANDA:USD_CHF',
  'ES=F': 'SPY',
};

const finnhubReverse = new Map(
  Object.entries(FINNHUB_STREAMS).map(([canonical, stream]) => [stream, canonical])
);

export function isBinanceSymbol(symbol: string): boolean {
  return symbol in BINANCE_STREAMS;
}

export function isFinnhubSymbol(symbol: string): boolean {
  return symbol in FINNHUB_STREAMS;
}

export function hasWebSocketSource(symbol: string): boolean {
  return isBinanceSymbol(symbol) || isFinnhubSymbol(symbol);
}

export function finnhubToCanonical(streamSymbol: string): string | undefined {
  return finnhubReverse.get(streamSymbol);
}

/** Active real-time WebSocket stream symbols (Binance Futures) */
export const DEFAULT_WS_SYMBOLS = [
  'GC=F',
  'BTC-USD',
] as const;

/** Canonical normalization helper for common trader aliases */
export function normalizeSymbol(symbol: string): string {
  const upper = symbol.trim().toUpperCase();
  if (upper === 'XAUUSD' || upper === 'GOLD' || upper === 'XAUUSDT') return 'GC=F';
  if (upper === 'BTCUSD' || upper === 'BTC' || upper === 'BTCUSDT') return 'BTC-USD';
  if (upper === 'USOUSD' || upper === 'USOIL' || upper === 'OIL' || upper === 'CRUDE' || upper === 'WTI') return 'CL=F';
  return symbol;
}


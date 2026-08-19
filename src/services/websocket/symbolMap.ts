/** Canonical dashboard symbol ↔ provider stream identifiers */

export const BINANCE_STREAMS: Record<string, string> = {
  'GC=F': 'xauusdt@miniTicker',
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

/** All symbols the live hub should subscribe to on startup */
export const DEFAULT_WS_SYMBOLS = [
  'GC=F',
  'EURUSD=X',
  'GBPUSD=X',
  'GBPJPY=X',
  'ES=F',
] as const;

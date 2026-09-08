import { useState, useEffect, useCallback } from 'react';
import { liveMarketHub } from '../services/websocket/liveMarketHub';
import { getMarketQuote } from '../services/marketDataRouter';
import { hasWebSocketSource } from '../services/websocket/symbolMap';
import type { LiveQuote } from '../services/websocket/types';
import type { ConnectionState } from '../services/websocket/types';
import type { YahooQuote } from '../services/yahooFinanceApi';

export interface UseLivePriceResult {
  liveQuote: LiveQuote | null;
  quote: YahooQuote | null;
  isLoading: boolean;
  error: string | null;
  isLive: boolean;
  connectionState: { binance: ConnectionState; finnhub: ConnectionState };
  refetch: () => void;
}

function liveToYahoo(live: LiveQuote): YahooQuote {
  return {
    symbol: live.symbol,
    regularMarketPrice: live.price,
    regularMarketChange: live.change,
    regularMarketChangePercent: live.changePercent,
    regularMarketPreviousClose: live.price - live.change,
    regularMarketOpen: live.open,
    regularMarketDayHigh: live.high,
    regularMarketDayLow: live.low,
    fiftyTwoWeekHigh: live.high,
    fiftyTwoWeekLow: live.low,
  };
}

/** WebSocket-first price hook — REST only for non-WS symbols or WS timeout */
export function useLivePrice(symbol: string): UseLivePriceResult {
  const [liveQuote, setLiveQuote] = useState<LiveQuote | null>(
    () => liveMarketHub.getLiveQuote(symbol)
  );
  const [restQuote, setRestQuote] = useState<YahooQuote | null>(null);
  const [isLoading, setIsLoading] = useState(!liveMarketHub.getLiveQuote(symbol));
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState(liveMarketHub.getConnectionState());

  const isWsSymbol = hasWebSocketSource(symbol);

  const loadRestFallback = useCallback(async () => {
    if (isWsSymbol && liveMarketHub.getLiveQuote(symbol)) return;
    try {
      const q = await getMarketQuote(symbol);
      if (!liveMarketHub.getLiveQuote(symbol)) {
        setRestQuote(q);
      }
      setError(null);
    } catch (err) {
      if (!liveMarketHub.getLiveQuote(symbol)) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [symbol, isWsSymbol]);

  useEffect(() => {
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const unsubPrice = liveMarketHub.subscribe(symbol, (q) => {
      setLiveQuote(q);
      setIsLoading(false);
      setError(null);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    });

    const unsubHub = liveMarketHub.onHubStateChange(() => {
      setConnectionState(liveMarketHub.getConnectionState());
    });

    if (isWsSymbol) {
      // WS symbols: wait for stream, REST fallback after 1.5s if stream delayed
      if (!liveMarketHub.getLiveQuote(symbol)) {
        fallbackTimer = setTimeout(() => {
          if (!liveMarketHub.getLiveQuote(symbol)) {
            loadRestFallback();
          } else {
            setIsLoading(false);
          }
        }, 1500);
      } else {
        setIsLoading(false);
      }
    } else {
      loadRestFallback();
    }

    return () => {
      unsubPrice();
      unsubHub();
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [symbol, isWsSymbol, loadRestFallback]);

  const quote = liveQuote ? liveToYahoo(liveQuote) : restQuote;

  return {
    liveQuote,
    quote,
    isLoading,
    error,
    isLive: liveQuote !== null,
    connectionState,
    refetch: loadRestFallback,
  };
}

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { liveMarketHub } from '../services/websocket/liveMarketHub';
import { DEFAULT_WS_SYMBOLS } from '../services/websocket/symbolMap';
import { bootstrapSymbolHistory } from '../services/marketDataRouter';
import type { ConnectionState } from '../services/websocket/types';

interface LiveMarketContextValue {
  connectionState: { binance: ConnectionState; finnhub: ConnectionState };
}

const LiveMarketContext = createContext<LiveMarketContextValue>({
  connectionState: { binance: 'idle', finnhub: 'idle' },
});

export function LiveMarketProvider({ children }: { children: ReactNode }) {
  const [connectionState, setConnectionState] = useState(liveMarketHub.getConnectionState());

  useEffect(() => {
    liveMarketHub.start(DEFAULT_WS_SYMBOLS);

    // Bootstrap historical bars once (cached 30 min) — not on every panel
    for (const symbol of DEFAULT_WS_SYMBOLS) {
      void bootstrapSymbolHistory(symbol);
    }

    const unsub = liveMarketHub.onHubStateChange(() => {
      setConnectionState(liveMarketHub.getConnectionState());
    });

    return () => {
      unsub();
      liveMarketHub.stop();
    };
  }, []);

  return (
    <LiveMarketContext.Provider value={{ connectionState }}>
      {children}
    </LiveMarketContext.Provider>
  );
}

export function useLiveMarketContext(): LiveMarketContextValue {
  return useContext(LiveMarketContext);
}

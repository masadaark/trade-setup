import { ConnectionManager } from './connectionManager';
import { createBinanceWsUrl, parseBinanceMessage } from './binance';
import {
  buildFinnhubSubscribeMessages,
  createFinnhubWsUrl,
  parseFinnhubMessage,
} from './finnhub';
import {
  BINANCE_STREAMS,
  DEFAULT_WS_SYMBOLS,
  FINNHUB_STREAMS,
  isBinanceSymbol,
  isFinnhubSymbol,
} from './symbolMap';
import type { ConnectionState, LiveQuote, LiveQuoteListener } from './types';
import { priceAggregator } from '../priceAggregator';
import env from '../../config/env';

type HubStateListener = (state: ConnectionState, provider: 'binance' | 'finnhub', error?: string) => void;

/** Singleton orchestrator for Binance + Finnhub live streams */
class LiveMarketHub {
  private binance: ConnectionManager | null = null;
  private finnhub: ConnectionManager | null = null;
  private started = false;
  private refCount = 0;
  private hubListeners = new Set<HubStateListener>();

  start(symbols: readonly string[] = DEFAULT_WS_SYMBOLS): void {
    this.refCount += 1;
    if (this.started) return;
    this.started = true;

    const binanceSymbols = symbols.filter(isBinanceSymbol);
    const finnhubSymbols = symbols.filter(isFinnhubSymbol);

    if (binanceSymbols.length > 0) {
      const stream = BINANCE_STREAMS[binanceSymbols[0]];
      this.binance = new ConnectionManager({
        name: 'binance',
        url: createBinanceWsUrl(stream),
        onMessage: (raw) => {
          const tick = parseBinanceMessage(raw);
          if (tick) priceAggregator.ingest(tick);
        },
      });
      this.binance.onStateChange((state, error) => {
        this.notifyHub('binance', state, error);
      });
      this.binance.connect();
    }

    if (finnhubSymbols.length > 0 && env.thirdParty.finnhub.apiKey) {
      const streamIds = finnhubSymbols.map((s) => FINNHUB_STREAMS[s]);
      this.finnhub = new ConnectionManager({
        name: 'finnhub',
        url: createFinnhubWsUrl,
        onOpen: (ws) => {
          for (const msg of buildFinnhubSubscribeMessages(streamIds)) {
            ws.send(msg);
          }
        },
        onMessage: (raw) => {
          for (const tick of parseFinnhubMessage(raw)) {
            priceAggregator.ingest(tick);
          }
        },
      });
      this.finnhub.onStateChange((state, error) => {
        this.notifyHub('finnhub', state, error);
      });
      this.finnhub.connect();
    }
  }

  stop(): void {
    this.refCount = Math.max(0, this.refCount - 1);
    if (this.refCount > 0) return;
    this.binance?.disconnect();
    this.finnhub?.disconnect();
    this.binance = null;
    this.finnhub = null;
    this.started = false;
  }

  getLiveQuote(symbol: string): LiveQuote | null {
    return priceAggregator.getLiveQuote(symbol);
  }

  subscribe(symbol: string, listener: LiveQuoteListener): () => void {
    return priceAggregator.subscribe(symbol, listener);
  }

  onHubStateChange(listener: HubStateListener): () => void {
    this.hubListeners.add(listener);
    return () => this.hubListeners.delete(listener);
  }

  getConnectionState(): { binance: ConnectionState; finnhub: ConnectionState } {
    return {
      binance: this.binance?.getState() ?? 'idle',
      finnhub: this.finnhub?.getState() ?? 'idle',
    };
  }

  isLive(symbol: string): boolean {
    return priceAggregator.getLiveQuote(symbol) !== null;
  }

  private notifyHub(
    provider: 'binance' | 'finnhub',
    state: ConnectionState,
    error?: string
  ): void {
    for (const listener of this.hubListeners) listener(state, provider, error);
  }
}

export const liveMarketHub = new LiveMarketHub();

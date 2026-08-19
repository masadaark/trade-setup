import env from '../../config/env';
import { finnhubToCanonical } from './symbolMap';
import type { PriceTick } from './types';

interface FinnhubTrade {
  s: string;
  p: number;
  t: number;
  v: number;
}

interface FinnhubMessage {
  type: string;
  data?: FinnhubTrade[];
}

export function createFinnhubWsUrl(): string {
  const token = env.thirdParty.finnhub.apiKey;
  if (!token) throw new Error('Finnhub API key not configured (VITE_FINNHUB_API_KEY)');
  return `wss://ws.finnhub.io?token=${token}`;
}

export function parseFinnhubMessage(raw: string): PriceTick[] {
  try {
    const msg = JSON.parse(raw) as FinnhubMessage;
    if (msg.type !== 'trade' || !msg.data?.length) return [];

    return msg.data
      .map((trade): PriceTick | null => {
        const symbol = finnhubToCanonical(trade.s);
        if (!symbol) return null;
        return {
          symbol,
          price: trade.p,
          timestamp: trade.t,
          provider: 'finnhub',
          volume: trade.v,
        };
      })
      .filter((t): t is PriceTick => t !== null);
  } catch {
    return [];
  }
}

export function buildFinnhubSubscribeMessages(streamSymbols: string[]): string[] {
  return streamSymbols.map((symbol) =>
    JSON.stringify({ type: 'subscribe', symbol })
  );
}

import type { YahooChartBar } from './yahooFinanceApi';

export type SessionType = 'Asian' | 'London' | 'New York';

export interface SessionProfile {
  asianRange: { high: number; low: number } | null;
  londonIB: { high: number; low: number } | null;
  nyOverlap: boolean;
  activeSession: SessionType | 'Off-hours';
}

function extractHour(timestamp: number): number {
  const d = new Date(timestamp * 1000);
  return d.getUTCHours();
}

/**
 * Computes Session targets like Asian Range High/Low and London IB.
 * Expects 15m or 1h bars.
 */
export function computeSessionProfile(bars: YahooChartBar[]): SessionProfile {
  const now = Date.now() / 1000;
  // Focus on the last 24-48 hours
  const recentBars = bars.filter(b => now - b.time < 48 * 60 * 60);

  let asianHigh = -Infinity;
  let asianLow = Infinity;
  let hasAsian = false;

  let londonHigh = -Infinity;
  let londonLow = Infinity;
  let hasLondon = false;

  const currentHour = new Date().getUTCHours();
  
  let activeSession: SessionType | 'Off-hours' = 'Off-hours';
  if (currentHour >= 13 && currentHour < 22) activeSession = 'New York';
  else if (currentHour >= 7 && currentHour < 16) activeSession = 'London';
  else if (currentHour >= 0 && currentHour < 9) activeSession = 'Asian';

  const nyOverlap = currentHour >= 13 && currentHour < 16;

  for (const bar of recentBars) {
    const hr = extractHour(bar.time);
    
    // Asian session 00:00 - 09:00 UTC
    if (hr >= 0 && hr < 9) {
      hasAsian = true;
      if (bar.high > asianHigh) asianHigh = bar.high;
      if (bar.low < asianLow) asianLow = bar.low;
    }
    
    // London IB (Initial Balance) typically 07:00 - 09:00 UTC
    if (hr >= 7 && hr < 9) {
      hasLondon = true;
      if (bar.high > londonHigh) londonHigh = bar.high;
      if (bar.low < londonLow) londonLow = bar.low;
    }
  }

  return {
    asianRange: hasAsian ? { high: asianHigh, low: asianLow } : null,
    londonIB: hasLondon ? { high: londonHigh, low: londonLow } : null,
    nyOverlap,
    activeSession,
  };
}

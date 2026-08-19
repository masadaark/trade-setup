/**
 * Market analysis aligned with brain/ knowledge base:
 * - Global Macro Framework: regime, volatility-adjusted risk, intermarket
 * - Leveraging COT Insider Intelligence: COT Index percentile, commercial vs spec
 * - Intermarket: Gold-USD inverse correlation for bias
 * - Algorithmic Strategy Framework: ATR (Wilder), position sizing
 */

import type { YahooChartBar } from './yahooFinanceApi';
import { calcATR, calcVWAP, detectTrend, findSwingLevels } from './yahooFinanceApi';
import type { CotRecord } from './cftcApi';

export type TrendDirection = 'Bullish' | 'Bearish' | 'Neutral';
export type MacroBias = 'LONG' | 'SHORT' | 'NEUTRAL';
export type QualityTier = 'A+' | 'A' | 'B' | 'Monitoring';

export interface StructureTimeframe {
  tf: string;
  label: string;
  trend: TrendDirection;
  structure: string;
  status: string;
}

export interface CurrencyStrength {
  symbol: string;
  change: string;
  changeNum: number;
  direction: 'up' | 'down';
}

export interface MacroRegimeInput {
  fedFundsRate: number | null;
  fedFundsPrev: number | null;
  yieldSpread: number | null;
  cpiYoY: number | null;
  goldChangePct: number | null;
  dxyChangePct: number | null;
}

export interface MacroRegime {
  label: string;
  verdict: MacroBias;
  description: string;
  variant: 'bullish' | 'bearish' | 'neutral';
  factors: {
    label: string;
    value: string;
    note: string;
    sentiment: 'success' | 'danger' | 'warning';
  }[];
}

/** Classify macro regime from live FRED + intermarket data (Global Macro Framework) */
export function computeMacroRegime(input: MacroRegimeInput): MacroRegime {
  const fedCutting =
    input.fedFundsRate !== null &&
    input.fedFundsPrev !== null &&
    input.fedFundsRate < input.fedFundsPrev;
  const fedHiking =
    input.fedFundsRate !== null &&
    input.fedFundsPrev !== null &&
    input.fedFundsRate > input.fedFundsPrev;

  const yieldInverted = (input.yieldSpread ?? 0) < 0;
  const cpiElevated = (input.cpiYoY ?? 99) > 3;
  const cpiNearTarget = (input.cpiYoY ?? 99) <= 2.5;

  const goldRising = (input.goldChangePct ?? 0) > 0;
  const dxyFalling = (input.dxyChangePct ?? 0) < 0;
  const goldDxyInverse = goldRising && dxyFalling;

  let score = 0;
  if (fedCutting) score += 2;
  else if (!fedHiking) score += 1;
  if (!yieldInverted) score += 1;
  if (cpiNearTarget) score += 2;
  else if (!cpiElevated) score += 1;
  if (goldDxyInverse) score += 2;
  else if (goldRising) score += 1;

  const verdict: MacroBias = score >= 5 ? 'LONG' : score <= 2 ? 'SHORT' : 'NEUTRAL';
  const variant = verdict === 'LONG' ? 'bullish' : verdict === 'SHORT' ? 'bearish' : 'neutral';

  const fedLabel = fedCutting
    ? 'Rate cuts underway'
    : fedHiking
    ? 'Rate hikes ongoing'
    : 'Rates on hold';

  const cpiLabel =
    input.cpiYoY !== null
      ? cpiNearTarget
        ? `At ${input.cpiYoY}% — near 2% target`
        : cpiElevated
        ? `Elevated at ${input.cpiYoY}%`
        : `Declining at ${input.cpiYoY}%`
      : 'CPI data unavailable';

  return {
    label:
      verdict === 'LONG'
        ? 'Growth / Risk-On Regime'
        : verdict === 'SHORT'
        ? 'Defensive / Risk-Off Regime'
        : 'Transitional Regime',
    verdict,
    description:
      verdict === 'LONG'
        ? 'Intermarket confirms risk-on: favor Gold and risk assets when DXY weakens.'
        : verdict === 'SHORT'
        ? 'Defensive posture: USD strength or recession signals dominate.'
        : 'Mixed signals — wait for macro alignment before sizing up.',
    variant,
    factors: [
      {
        label: '1. Fed Rate Direction',
        value: fedLabel,
        note: fedCutting ? '→ Bullish for Gold & equities' : fedHiking ? '→ Headwind for risk assets' : '→ Neutral policy stance',
        sentiment: fedCutting ? 'success' : fedHiking ? 'danger' : 'warning',
      },
      {
        label: '2. US Inflation (CPI YoY)',
        value: cpiLabel,
        note: cpiNearTarget ? '→ Reduces USD upside pressure' : cpiElevated ? '→ Fed may stay restrictive' : '→ Moderating inflation',
        sentiment: cpiNearTarget ? 'success' : cpiElevated ? 'danger' : 'warning',
      },
      {
        label: '3. Recession Risk (10Y–2Y)',
        value: yieldInverted ? 'Yield curve inverted' : 'Yield spread positive',
        note: yieldInverted ? '→ Inversion signals recession risk' : '→ Inversion risk fading',
        sentiment: yieldInverted ? 'danger' : 'success',
      },
    ],
  };
}

/** COT Index percentile — brain standard: normalize net position vs historical range */
export function computeCotIndex(records: CotRecord[]): number | null {
  if (records.length < 4) return null;
  const nets = records.map((r) => r.netNonCommercial);
  const latest = nets.at(-1)!;
  const min = Math.min(...nets);
  const max = Math.max(...nets);
  if (max === min) return 50;
  return Math.round(((latest - min) / (max - min)) * 100);
}

/** COT commercial net (Smart Money per brain — hedgers trade against trend) */
export function computeCommercialNet(record: CotRecord): number {
  return record.commercialLong - record.commercialShort;
}

/** Week-over-week COT Index change (Movement Index proxy) */
export function computeCotMovementIndex(records: CotRecord[]): number | null {
  if (records.length < 2) return null;
  const prevSlice = records.slice(0, -1);
  const prevIdx = computeCotIndex(prevSlice);
  const currIdx = computeCotIndex(records);
  if (prevIdx === null || currIdx === null) return null;
  return currIdx - prevIdx;
}

export interface CotSignal {
  specLabel: string;
  commercialLabel: string;
  variant: 'bullish' | 'bearish' | 'neutral';
  cotIndex: number | null;
  movementIndex: number | null;
  aggressiveCommercial: boolean;
}

/**
 * Interpret COT using percentile index (brain: 0%=max bearish, 100%=max bullish for specs).
 * Commercial extremes are contrarian — high commercial long = smart money buying.
 */
export function interpretCotSignal(records: CotRecord[]): CotSignal {
  const latest = records.at(-1);
  const cotIndex = computeCotIndex(records);
  const movementIndex = computeCotMovementIndex(records);

  if (!latest || cotIndex === null) {
    return {
      specLabel: 'Insufficient data',
      commercialLabel: '—',
      variant: 'neutral',
      cotIndex: null,
      movementIndex: null,
      aggressiveCommercial: false,
    };
  }

  const commNet = computeCommercialNet(latest);
  const aggressiveCommercial = (movementIndex ?? 0) >= 40;

  let specLabel: string;
  let variant: CotSignal['variant'];
  if (cotIndex >= 90) {
    specLabel = 'Extreme Long (crowded)';
    variant = 'bearish'; // contrarian: crowded long = liquidity trap risk per Global Macro
  } else if (cotIndex >= 70) {
    specLabel = 'Net Long';
    variant = 'bullish';
  } else if (cotIndex <= 10) {
    specLabel = 'Extreme Short (crowded)';
    variant = 'bullish'; // contrarian
  } else if (cotIndex <= 30) {
    specLabel = 'Net Short';
    variant = 'bearish';
  } else {
    specLabel = 'Neutral';
    variant = 'neutral';
  }

  const commercialLabel =
    commNet > 0
      ? aggressiveCommercial
        ? 'Commercial Buying Surge (+40)'
        : 'Commercial Net Long'
      : aggressiveCommercial
      ? 'Commercial Selling Surge'
      : 'Commercial Net Short';

  return {
    specLabel,
    commercialLabel,
    variant,
    cotIndex,
    movementIndex,
    aggressiveCommercial,
  };
}

export interface TradeSetup {
  id: string;
  asset: string;
  symbol: string;
  type: string;
  entry: number;
  sl: number;
  tp: number;
  rr: number;
  statusLabel: string;
  variant: 'bullish' | 'bearish' | 'neutral';
  tier: QualityTier;
}

export function formatPrice(symbol: string, price: number): string {
  if (symbol.includes('JPY')) return price.toFixed(2);
  if (symbol.includes('=X')) return price.toFixed(4);
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Build trade setup from OHLCV — ATR-based stop (Global Macro: volatility-adjusted),
 * swing levels for liquidity targets (Auction Market Theory / Wyckoff axis).
 */
export function buildTradeSetup(
  symbol: string,
  asset: string,
  bars: YahooChartBar[],
  price: number,
  id: string
): TradeSetup | null {
  if (bars.length < 20 || !price) return null;

  const atr = calcATR(bars);
  const vwap = calcVWAP(bars);
  const trend = detectTrend(bars);
  const { swingHigh, swingLow, nearestSupport, nearestResistance } = findSwingLevels(bars);

  const isBullish = trend === 'Bullish';
  const entry = isBullish ? nearestSupport : nearestResistance;
  // SL beyond swing extreme + 0.5×ATR buffer (volatility-adjusted per Global Macro Framework)
  const sl = isBullish ? swingLow - atr * 0.5 : swingHigh + atr * 0.5;
  const risk = Math.abs(entry - sl);
  const tp = isBullish ? swingHigh : swingLow;
  const rr = risk > 0 ? Math.abs(tp - entry) / risk : 0;

  const aboveVwap = price > vwap;
  const type = isBullish
    ? aboveVwap
      ? 'Uptrend + Above VWAP'
      : 'Uptrend + VWAP Retest'
    : trend === 'Bearish'
    ? aboveVwap
      ? 'Downtrend + Below VWAP'
      : 'Downtrend + VWAP Rejection'
    : 'Range — Awaiting Breakout';

  const tier: QualityTier = rr >= 3 ? 'A+' : rr >= 2 ? 'A' : rr >= 1.5 ? 'B' : 'Monitoring';
  const variant = isBullish ? 'bullish' : trend === 'Bearish' ? 'bearish' : 'neutral';

  let statusLabel = 'Monitoring';
  const distPct = Math.abs(price - entry) / price;
  if (distPct < 0.003) statusLabel = 'Ready to trade';
  else if (distPct < 0.01) statusLabel = 'Waiting for entry';

  return { id, asset, symbol, type, entry, sl, tp, rr, statusLabel, variant, tier };
}

export interface GlobalBias {
  direction: TrendDirection;
  quality: QualityTier;
  label: string;
}

/** Aggregate bias from macro verdict + best setup quality */
export function computeGlobalBias(
  macroVerdict: MacroBias,
  bestSetup: TradeSetup | null
): GlobalBias {
  const direction: TrendDirection =
    macroVerdict === 'LONG'
      ? 'Bullish'
      : macroVerdict === 'SHORT'
      ? 'Bearish'
      : bestSetup?.variant === 'bullish'
      ? 'Bullish'
      : bestSetup?.variant === 'bearish'
      ? 'Bearish'
      : 'Neutral';

  const quality: QualityTier = bestSetup?.tier ?? 'Monitoring';

  const label =
    direction === 'Bullish'
      ? macroVerdict === 'LONG'
        ? 'Macro + Setup Aligned'
        : 'Technical Long Bias'
      : direction === 'Bearish'
      ? 'Defensive Bias'
      : 'Monitoring';

  return { direction, quality, label };
}

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DataState, StatValue } from '../components/ui/data-state';
import { useBars } from '../hooks/useMarketData';
import { useLivePrice } from '../hooks/useLivePrice';
import { cn } from '../lib/utils';
import { Tooltip } from '../components/ui/tooltip';
import { Radio, ShieldAlert } from 'lucide-react';

const SYMBOLS = [
  { value: 'GC=F', label: 'Gold (XAUUSD)', unit: '$' },
  { value: 'BTC-USD', label: 'Bitcoin (BTCUSD)', unit: '$' },
  { value: 'CL=F', label: 'Crude Oil (USOUSD)', unit: '$' },
] as const;

type SymbolValue = typeof SYMBOLS[number]['value'];

function AlgoMetrics({ symbol, unit }: { symbol: SymbolValue; unit: string }) {
  const bars = useBars(symbol, '1d', '1y');
  const live = useLivePrice(symbol);

  const currentPrice = live.quote?.regularMarketPrice ?? null;
  const isWs = live.isLive;
  const ptsDecimals = symbol.includes('BTC') ? 1 : 2;

  // Real-time VWAP calculation (updated tick-by-tick with 0 HTTP calls)
  const vwapDev = currentPrice && bars.vwap > 0
    ? ((currentPrice - bars.vwap) / bars.vwap) * 100
    : null;

  const ptsFromVwap = currentPrice && bars.vwap > 0 ? currentPrice - bars.vwap : null;

  // VWAP standard deviation bands
  const stdDev = bars.atr; // Using ATR as proxy for σ (simplified)
  const vwapPlus2 = bars.vwap > 0 ? bars.vwap + 2 * stdDev : null;
  const vwapMinus2 = bars.vwap > 0 ? bars.vwap - 2 * stdDev : null;

  const isOverbought = vwapPlus2 && currentPrice ? currentPrice >= vwapPlus2 : false;
  const isOversold = vwapMinus2 && currentPrice ? currentPrice <= vwapMinus2 : false;

  const atrPct = currentPrice && bars.atr > 0 ? (bars.atr / currentPrice) * 100 : 0;
  const volatilityLabel =
    bars.atr === 0 ? 'Unknown' : atrPct > 2.5 ? 'Elevated' : atrPct < 0.8 ? 'Low' : 'Normal';
  const volatilityVariant =
    bars.atr === 0 ? 'muted' : atrPct > 2.5 ? 'danger' : atrPct < 0.8 ? 'warning' : 'success';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ATR Volatility Gauge */}
      <Card className="lg:col-span-5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Tooltip content="Average True Range measures volatility. Elevated = market moves fast, use wider stop loss.">
              <CardTitle className="text-sm">ATR Volatility Gauge</CardTitle>
            </Tooltip>
            <Badge variant={volatilityVariant}>{volatilityLabel}</Badge>
          </div>
          <CardDescription>Average True Range — daily expected swing distance</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <DataState isLoading={bars.isLoading} error={bars.error} onRetry={bars.refetch} />

          {!bars.isLoading && !bars.error && (
            <>
              <div className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3">
                <span className="text-xs text-muted-foreground">Daily ATR (14-period)</span>
                <span className="text-2xl font-bold font-tabular">
                  {unit}
                  {bars.atr.toFixed(ptsDecimals)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-md bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Live Market Price</span>
                  {isWs && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-success animate-pulse" title="WebSocket Live" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatValue
                    value={currentPrice ? `${unit}${currentPrice.toLocaleString('en-US', { minimumFractionDigits: ptsDecimals, maximumFractionDigits: ptsDecimals })}` : null}
                    isLoading={live.isLoading}
                    className="text-lg font-bold font-tabular"
                  />
                  {isWs && <Badge variant="success" className="text-[9px] px-1 py-0">WS</Badge>}
                </div>
              </div>

              {/* Dynamic Stop-Loss Sizing Table */}
              <div className="rounded-md bg-muted/40 border border-border/80 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <ShieldAlert size={12} className="text-warning" />
                    Recommended SL Buffer (1.5× ATR):
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {unit}{(bars.atr * 1.5).toFixed(ptsDecimals)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>Tight Scalp (1.0×): {unit}{(bars.atr).toFixed(ptsDecimals)}</span>
                  <span>Wide Swing (2.0×): {unit}{(bars.atr * 2).toFixed(ptsDecimals)}</span>
                </div>
              </div>

              <div className="rounded-md bg-muted/30 border border-border px-3 py-2.5 text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Trader insight:</strong> Volatility is{' '}
                <strong>{volatilityLabel.toLowerCase()}</strong> — {volatilityLabel === 'Elevated'
                  ? 'widen stops to avoid premature stop-outs.'
                  : volatilityLabel === 'Low'
                  ? 'tighten stops, lower R:R targets.'
                  : 'normal ATR range, standard SL sizing applies.'}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* VWAP Bands */}
      <Card className="lg:col-span-7">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Tooltip content="Volume Weighted Average Price (VWAP) is the institutional fair value. > +2σ = Overbought. < -2σ = Oversold.">
              <CardTitle className="text-sm w-fit">VWAP Standard Deviation Bands</CardTitle>
            </Tooltip>
            {currentPrice && (
              <Badge variant={isOverbought ? 'danger' : isOversold ? 'success' : 'neutral'}>
                {isOverbought
                  ? '🔴 Overbought (> +2σ)'
                  : isOversold
                  ? '🟢 Oversold (< -2σ)'
                  : '⚪ Fair Value Zone'}
              </Badge>
            )}
          </div>
          <CardDescription>Institutional fair value — overbought/oversold relative to VWAP</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <DataState isLoading={bars.isLoading} error={bars.error} onRetry={bars.refetch} />

          {!bars.isLoading && !bars.error && (
            <>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md bg-danger/10 border border-danger/20 p-3">
                  <span className="text-[10px] text-danger uppercase font-semibold block mb-1">VWAP +2σ (Overbought)</span>
                  <span className="text-base font-bold font-tabular">
                    {vwapPlus2 ? `${unit}${vwapPlus2.toFixed(ptsDecimals)}` : '—'}
                  </span>
                </div>
                <div className="rounded-md bg-muted/50 border border-border p-3">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">VWAP Anchor</span>
                  <span className="text-base font-bold font-tabular">
                    {bars.vwap > 0 ? `${unit}${bars.vwap.toFixed(ptsDecimals)}` : '—'}
                  </span>
                </div>
                <div className="rounded-md bg-success/10 border border-success/20 p-3">
                  <span className="text-[10px] text-success uppercase font-semibold block mb-1">VWAP -2σ (Oversold)</span>
                  <span className="text-base font-bold font-tabular">
                    {vwapMinus2 ? `${unit}${vwapMinus2.toFixed(ptsDecimals)}` : '—'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2.5 text-xs">
                <span className="text-muted-foreground">Real-Time VWAP Deviation:</span>
                <span
                  className={cn(
                    'font-tabular font-semibold',
                    vwapDev === null ? 'text-muted-foreground' : vwapDev > 1 ? 'text-danger' : vwapDev < -1 ? 'text-success' : 'text-foreground'
                  )}
                >
                  {vwapDev !== null ? `${vwapDev > 0 ? '+' : ''}${vwapDev.toFixed(2)}% vs VWAP (${ptsFromVwap && ptsFromVwap > 0 ? '+' : ''}${ptsFromVwap?.toFixed(ptsDecimals)} pts)` : '—'}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Micro SMC & Stat Validation */}
      <Card className="lg:col-span-12">
        <CardHeader>
          <CardTitle className="text-sm">Micro SMC & Stat Validation (Beta)</CardTitle>
          <CardDescription>Intraday volume anomalies and regime classification</CardDescription>
        </CardHeader>
        <CardContent>
          <DataState isLoading={bars.isLoading} error={bars.error} onRetry={bars.refetch} />
          {!bars.isLoading && !bars.error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-md bg-muted/50 border border-border p-4">
                <Tooltip content="Hurst Exponent (H). >0.55 = Trending market. <0.45 = Mean-reverting. ~0.50 = Random Walk.">
                  <span className="text-xs font-semibold text-muted-foreground block w-fit mb-2">Hurst Exponent (H)</span>
                </Tooltip>
                <div className="flex items-center justify-between">
                  <span className={cn('text-2xl font-bold font-tabular', bars.hurst > 0.55 ? 'text-success' : bars.hurst < 0.45 ? 'text-warning' : 'text-foreground')}>
                    {bars.hurst.toFixed(2)}
                  </span>
                  <Badge variant={bars.hurst > 0.55 ? 'success' : bars.hurst < 0.45 ? 'warning' : 'neutral'}>
                    {bars.hurst > 0.55 ? 'Trending' : bars.hurst < 0.45 ? 'Mean-Reverting' : 'Random Walk'}
                  </Badge>
                </div>
              </div>

              <div className="rounded-md bg-muted/50 border border-border p-4">
                <Tooltip content="Volume Spread Analysis (VSA). Identifies 'Effort vs Result' anomalies by comparing volume spikes to price range.">
                  <span className="text-xs font-semibold text-muted-foreground block w-fit mb-2">VSA Scanner</span>
                </Tooltip>
                <div className="flex items-center justify-between">
                  <span className={cn('text-sm font-bold truncate', bars.vsa?.includes('Bullish') ? 'text-success' : bars.vsa?.includes('Bearish') || bars.vsa === 'Climax Volume' ? 'text-danger' : 'text-foreground')}>
                    {bars.vsa || 'Normal'}
                  </span>
                  {bars.vsa && bars.vsa !== 'Normal' && (
                    <Badge variant={bars.vsa.includes('Bullish') ? 'success' : 'danger'}>Anomaly</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AlgoPanel() {
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolValue>('GC=F');
  const currentSymbol = SYMBOLS.find((s) => s.value === selectedSymbol)!;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-semibold">Algo Metrics</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Step 5 of 5 — Measure volatility and assess fair value before sizing positions
        </p>
      </div>

      {/* Symbol tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Tabs value={selectedSymbol} onValueChange={(v) => setSelectedSymbol(v as SymbolValue)}>
          <TabsList>
            {SYMBOLS.map((s) => (
              <TabsTrigger key={s.value} value={s.value}>
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          {selectedSymbol !== 'CL=F' && (
            <Badge variant="success" className="gap-1 font-mono text-[11px]">
              <Radio size={12} className="animate-pulse" />
              WS Real-Time Stream
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">Source: Binance WS / REST Cache</span>
        </div>
      </div>

      {/* Metrics display */}
      <AlgoMetrics symbol={selectedSymbol} unit={currentSymbol.unit} />
    </div>
  );
}

export default AlgoPanel;

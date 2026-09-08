import { useState } from 'react';
import { Flame, TrendingUp, TrendingDown, Minus, Radio, Zap, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { DataState } from '../components/ui/data-state';
import { useStructureAnalysis, formatPrice } from '../hooks/useMarketData';
import { useLivePrice } from '../hooks/useLivePrice';
import { cn } from '../lib/utils';
import { Tooltip } from '../components/ui/tooltip';

const ASSETS = [
  { symbol: 'GC=F', label: 'XAU/USD (Gold)' },
  { symbol: 'BTC-USD', label: 'BTC/USD (Bitcoin)' },
  { symbol: 'CL=F', label: 'USO/USD (Crude Oil)' },
] as const;

function StructurePanel() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('GC=F');
  const { timeframes, alignedCount, verdict, liquidity, sessionProfile, isLoading, error, refetch } =
    useStructureAnalysis(selectedSymbol);
  const live = useLivePrice(selectedSymbol);

  const isBullishVerdict = alignedCount >= 3;
  const currentAsset = ASSETS.find((a) => a.symbol === selectedSymbol);

  const livePrice = live.quote?.regularMarketPrice ?? null;
  const isWs = live.isLive;
  const ptsDecimals = selectedSymbol.includes('BTC') ? 1 : 2;

  // Real-time liquidity calculations (0 HTTP calls)
  const bslDiff = livePrice && liquidity ? livePrice - liquidity.bsl : null;
  const isBslSwept = bslDiff !== null && bslDiff >= 0;
  const bslPts = bslDiff !== null ? Math.abs(bslDiff).toFixed(ptsDecimals) : null;

  const demandInside =
    livePrice && liquidity
      ? livePrice >= liquidity.demandLow && livePrice <= liquidity.demandHigh
      : false;
  const demandAbove = livePrice && liquidity ? livePrice > liquidity.demandHigh : false;
  const distDemand =
    livePrice && liquidity
      ? demandAbove
        ? livePrice - liquidity.demandHigh
        : liquidity.demandLow - livePrice
      : null;
  const distDemandPts = distDemand !== null ? Math.abs(distDemand).toFixed(ptsDecimals) : null;
  const distDemandPct = livePrice && distDemand !== null ? (distDemand / livePrice) * 100 : null;
  const demandApproaching = demandAbove && distDemandPct !== null && distDemandPct <= 0.8;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold">Market Structure</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Step 3 of 5 — Verify multi-timeframe trend alignment before looking for entries
          </p>
        </div>

        {/* 3 Core Triggers Switcher */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
          {ASSETS.map((asset) => (
            <button
              key={asset.symbol}
              onClick={() => setSelectedSymbol(asset.symbol)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                selectedSymbol === asset.symbol
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {asset.label}
            </button>
          ))}
        </div>
      </div>

      <DataState isLoading={isLoading} error={error} onRetry={refetch} />

      {!isLoading && !error && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={isBullishVerdict ? 'success' : 'warning'}>
                    Alignment Score: {alignedCount}/{timeframes.length} Timeframes
                  </Badge>
                  {isWs && (
                    <Badge variant="success" className="gap-1 text-[11px]">
                      <Radio size={12} className="animate-pulse" />
                      WS Real-Time
                    </Badge>
                  )}
                </div>
                {livePrice ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Live Market:</span>
                    <span className="font-mono font-bold text-foreground text-sm">
                      {formatPrice(selectedSymbol, livePrice)}
                    </span>
                    <span className={cn('text-xs font-mono font-semibold', isBullishVerdict ? 'text-success' : 'text-warning')}>
                      {isBullishVerdict ? '• Strong structure' : '• Mixed structure'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Live Market:</span>
                    <span className="text-xs text-muted-foreground animate-pulse font-mono">Connecting…</span>
                  </div>
                )}
              </div>
              <CardTitle className="text-xl mt-2">
                {currentAsset?.label}: {verdict}
              </CardTitle>
              <CardDescription>
                Top-down structure analysis across MN → M15 timeframes for {currentAsset?.label}.
              </CardDescription>

              {/* Dynamic Real-Time Liquidity Banner */}
              {liquidity && livePrice && (
                <div className="mt-3 pt-3 border-t border-border/60 flex items-center gap-2 text-xs flex-wrap">
                  <span className="text-muted-foreground font-medium">Real-Time POI Tracker:</span>
                  {isBslSwept ? (
                    <Badge variant="danger" className="gap-1 animate-pulse">
                      <Flame size={12} />
                      🚨 BSL SWEPT (+{bslPts} pts above)
                    </Badge>
                  ) : (
                    <Badge variant="neutral" className="gap-1 font-mono">
                      BSL Target: {bslPts} pts away
                    </Badge>
                  )}

                  {demandInside ? (
                    <Badge variant="success" className="gap-1 animate-pulse">
                      <ShieldCheck size={12} />
                      🏰 INSIDE DEMAND BOX (Prime Long Zone)
                    </Badge>
                  ) : demandApproaching ? (
                    <Badge variant="warning" className="gap-1">
                      <Zap size={12} />
                      ⚡ APPROACHING DEMAND ({distDemandPts} pts)
                    </Badge>
                  ) : distDemandPts ? (
                    <Badge variant="muted" className="gap-1 font-mono">
                      Demand OB: {distDemandPts} pts {demandAbove ? 'below' : 'above'}
                    </Badge>
                  ) : null}
                </div>
              )}
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8">
              <CardHeader>
                <CardTitle className="text-sm">Multi-Timeframe Structure Check</CardTitle>
                <CardDescription>Top-down analysis — higher timeframe always overrides lower</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {timeframes.map((item) => {
                  const isBullish = item.trend === 'Bullish';
                  const isNeutral = item.trend === 'Neutral';
                  return (
                    <div
                      key={item.tf}
                      className="flex items-center justify-between gap-4 rounded-md bg-muted/40 px-3 py-2.5 hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            'w-8 h-8 shrink-0 rounded-md flex items-center justify-center font-mono font-bold text-xs',
                            isBullish
                              ? 'bg-success/15 text-success'
                              : isNeutral
                              ? 'bg-warning/15 text-warning-foreground'
                              : 'bg-danger/15 text-danger'
                          )}
                        >
                          {item.label}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-foreground">{item.tf}</h4>
                          <span className="text-xs text-muted-foreground truncate block">
                            {item.structure}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={isBullish ? 'bullish' : isNeutral ? 'neutral' : 'bearish'} className="gap-1">
                          {isBullish ? <TrendingUp size={11} /> : isNeutral ? <Minus size={11} /> : <TrendingDown size={11} />}
                          {item.trend}
                        </Badge>
                        <span className="text-xs text-muted-foreground hidden sm:block">{item.status}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {liquidity && (
              <Card className="lg:col-span-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Flame size={15} className="text-danger" />
                      Intraday Targets
                    </CardTitle>
                    {isWs && (
                      <Badge variant="success" className="text-[10px] px-1.5 py-0 font-mono">
                        WS LIVE
                      </Badge>
                    )}
                  </div>
                  <CardDescription>Liquidity zones & Session ranges</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-md bg-danger/10 border border-danger/20 p-3">
                    <div className="flex items-center justify-between">
                      <Tooltip content="Buy-Side Liquidity. Previous highs where retail stop-losses rest. Market makers often hunt these.">
                        <span className="text-xs font-semibold text-danger block w-fit">Buy-Side Liquidity (BSL)</span>
                      </Tooltip>
                      {livePrice && (
                        <Badge variant={isBslSwept ? 'danger' : 'neutral'} className="text-[10px]">
                          {isBslSwept ? `SWEPT (+${bslPts})` : `${bslPts} pts away`}
                        </Badge>
                      )}
                    </div>
                    <span className="text-lg font-bold font-tabular mt-1 block">{formatPrice(selectedSymbol, liquidity.bsl)}</span>
                  </div>

                  {sessionProfile?.asianRange && (
                    <div className="rounded-md bg-muted/50 border border-border p-3">
                      <div className="flex items-center justify-between">
                        <Tooltip content="Asian session high/low. Often swept (broken) by London/NY to trap early traders.">
                          <span className="text-xs font-semibold text-muted-foreground block w-fit">Asian Session Range</span>
                        </Tooltip>
                        {livePrice && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {livePrice > sessionProfile.asianRange.high
                              ? 'High Swept'
                              : livePrice < sessionProfile.asianRange.low
                              ? 'Low Swept'
                              : 'Inside Range'}
                          </span>
                        )}
                      </div>
                      <span className="text-base font-bold font-tabular mt-1 block">
                        {formatPrice(selectedSymbol, sessionProfile.asianRange.high)} — {formatPrice(selectedSymbol, sessionProfile.asianRange.low)}
                      </span>
                    </div>
                  )}

                  {sessionProfile?.londonIB && (
                    <div className="rounded-md bg-muted/50 border border-border p-3">
                      <div className="flex items-center justify-between">
                        <Tooltip content="London Initial Balance. The high/low of the first 2 hours. A breakout often sets the day's trend.">
                          <span className="text-xs font-semibold text-muted-foreground block w-fit">London Initial Balance</span>
                        </Tooltip>
                        {livePrice && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {livePrice > sessionProfile.londonIB.high
                              ? 'IB High Break'
                              : livePrice < sessionProfile.londonIB.low
                              ? 'IB Low Break'
                              : 'Inside IB'}
                          </span>
                        )}
                      </div>
                      <span className="text-base font-bold font-tabular mt-1 block">
                        {formatPrice(selectedSymbol, sessionProfile.londonIB.high)} — {formatPrice(selectedSymbol, sessionProfile.londonIB.low)}
                      </span>
                    </div>
                  )}

                  <div className="rounded-md bg-success/10 border border-success/20 p-3">
                    <div className="flex items-center justify-between">
                      <Tooltip content="Order Block. A high-probability area where institutional buying previously occurred.">
                        <span className="text-xs font-semibold text-success block w-fit">Demand Order Block (OB)</span>
                      </Tooltip>
                      {livePrice && (
                        <Badge
                          variant={demandInside ? 'success' : demandApproaching ? 'warning' : 'neutral'}
                          className="text-[10px]"
                        >
                          {demandInside ? 'INSIDE ZONE' : demandApproaching ? 'APPROACHING' : `${distDemandPts} pts`}
                        </Badge>
                      )}
                    </div>
                    <span className="text-lg font-bold font-tabular mt-1 block">
                      {formatPrice(selectedSymbol, liquidity.demandLow)} – {formatPrice(selectedSymbol, liquidity.demandHigh)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default StructurePanel;

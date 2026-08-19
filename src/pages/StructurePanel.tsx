import { Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { DataState } from '../components/ui/data-state';
import { useStructureAnalysis, formatPrice } from '../hooks/useMarketData';
import { cn } from '../lib/utils';

function StructurePanel() {
  const { timeframes, alignedCount, verdict, liquidity, isLoading, error, refetch } =
    useStructureAnalysis('GC=F');

  const isBullishVerdict = alignedCount >= 3;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Market Structure</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Step 3 of 6 — Verify multi-timeframe trend alignment before looking for entries
        </p>
      </div>

      <DataState isLoading={isLoading} error={error} onRetry={refetch} />

      {!isLoading && !error && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge variant={isBullishVerdict ? 'success' : 'warning'}>
                  Alignment Score: {alignedCount}/{timeframes.length} Timeframes
                </Badge>
                <span className={cn('text-xs font-mono font-semibold', isBullishVerdict ? 'text-success' : 'text-warning')}>
                  {isBullishVerdict ? 'Strong structure' : 'Mixed structure'}
                </span>
              </div>
              <CardTitle className="text-xl mt-2">
                HTF Verdict: {verdict}
              </CardTitle>
              <CardDescription>
                Computed from live Yahoo Finance OHLCV across MN → H1 timeframes for Gold (GC=F).
              </CardDescription>
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
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Flame size={15} className="text-danger" />
                    Liquidity Targets
                  </CardTitle>
                  <CardDescription>Derived from weekly high and daily swing levels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-md bg-danger/10 border border-danger/20 p-3">
                    <span className="text-xs font-semibold text-danger block">Buy-Side Liquidity (BSL)</span>
                    <span className="text-lg font-bold font-tabular">{formatPrice('GC=F', liquidity.bsl)}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Prior week High — target for long trades
                    </p>
                  </div>

                  <div className="rounded-md bg-muted/50 border border-border p-3">
                    <span className="text-xs font-semibold text-muted-foreground block">Current Price Zone</span>
                    <span className="text-lg font-bold font-tabular">
                      {formatPrice('GC=F', liquidity.currentLow)} – {formatPrice('GC=F', liquidity.currentHigh)}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">±0.3×ATR around last close</p>
                  </div>

                  <div className="rounded-md bg-success/10 border border-success/20 p-3">
                    <span className="text-xs font-semibold text-success block">Demand Order Block (OB)</span>
                    <span className="text-lg font-bold font-tabular">
                      {formatPrice('GC=F', liquidity.demandLow)} – {formatPrice('GC=F', liquidity.demandHigh)}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Nearest support zone — entry area
                    </p>
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

import { Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

const timeframes = [
  { tf: 'Monthly', label: 'MN', trend: 'Bullish', structure: 'Break of Structure (BOS) above $2,550', status: 'Aligned' },
  { tf: 'Weekly', label: 'W1', trend: 'Bullish', structure: 'Higher High at $2,620', status: 'Aligned' },
  { tf: 'Daily', label: 'D1', trend: 'Bullish', structure: 'ChoCH retest at $2,635', status: 'Aligned' },
  { tf: '4-Hour', label: 'H4', trend: 'Bullish', structure: 'Demand Order Block touch at $2,640', status: 'Ready to trade' },
  { tf: '1-Hour', label: 'H1', trend: 'Neutral', structure: 'Consolidating in narrow range', status: 'Waiting breakout' },
];

const alignedCount = timeframes.filter((t) => t.trend === 'Bullish').length;

function StructurePanel() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-semibold">Market Structure</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Step 3 of 6 — Verify multi-timeframe trend alignment before looking for entries
        </p>
      </div>

      {/* Alignment summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Badge variant="success">
              Alignment Score: {alignedCount}/{timeframes.length} Timeframes
            </Badge>
            <span className="text-xs font-mono text-success font-semibold">
              Strong structure
            </span>
          </div>
          <CardTitle className="text-xl mt-2">
            HTF Verdict: Bullish Structure Aligned
          </CardTitle>
          <CardDescription>
            Monthly, Weekly, Daily and H4 all confirm bullish Break of Structure (BOS). Safe to seek long entries on LTF.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* MTF Table + Liquidity */}
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

        {/* Liquidity targets */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame size={15} className="text-danger" />
              Liquidity Targets
            </CardTitle>
            <CardDescription>Price tends to sweep these levels to clear resting orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md bg-danger/10 border border-danger/20 p-3">
              <span className="text-xs font-semibold text-danger block">Buy-Side Liquidity (BSL)</span>
              <span className="text-lg font-bold font-tabular">$2,670.50</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Prior week High — target for long trades
              </p>
            </div>

            <div className="rounded-md bg-muted/50 border border-border p-3">
              <span className="text-xs font-semibold text-muted-foreground block">Current Price Zone</span>
              <span className="text-lg font-bold font-tabular">$2,641 – $2,643</span>
              <p className="text-xs text-muted-foreground mt-0.5">Inside H4 Order Block</p>
            </div>

            <div className="rounded-md bg-success/10 border border-success/20 p-3">
              <span className="text-xs font-semibold text-success block">Demand Order Block (OB)</span>
              <span className="text-lg font-bold font-tabular">$2,638.00 – $2,642.50</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Institutional demand zone — entry area
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default StructurePanel;

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { DataState } from '../components/ui/data-state';
import { useTradeSetups, formatPrice } from '../hooks/useMarketData';
import { cn } from '../lib/utils';

function PriceActionPanel() {
  const { setups, bestSetup, isLoading, error, refetch } = useTradeSetups();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Price Action</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Step 4 of 6 — Find high-probability SMC entries with verified Risk-to-Reward
        </p>
      </div>

      <DataState isLoading={isLoading} error={error} onRetry={refetch} />

      {!isLoading && !error && bestSetup && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge variant={bestSetup.tier === 'A+' ? 'bullish' : 'neutral'}>
                  {bestSetup.tier} Grade Setup Detected
                </Badge>
                <Badge variant="muted">SMC Methodology</Badge>
              </div>
              <CardTitle className="text-xl mt-2">
                {bestSetup.asset} — {bestSetup.type}
              </CardTitle>
              <CardDescription>
                Computed from live OHLCV: entry near {formatPrice(bestSetup.symbol, bestSetup.entry)},
                stop beyond swing low + 0.5×ATR, target at recent swing high.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Entry (Limit)', value: formatPrice(bestSetup.symbol, bestSetup.entry), color: 'text-foreground' },
                  { label: 'Stop Loss', value: formatPrice(bestSetup.symbol, bestSetup.sl), color: 'text-danger' },
                  { label: 'Take Profit', value: formatPrice(bestSetup.symbol, bestSetup.tp), color: 'text-success' },
                  { label: 'Risk:Reward', value: `1:${bestSetup.rr.toFixed(2)}`, color: 'text-primary' },
                ].map((item) => (
                  <div key={item.label} className="rounded-md bg-muted/50 p-3 space-y-1">
                    <span className="text-xs text-muted-foreground block">{item.label}</span>
                    <span className={cn('text-xl font-bold font-tabular block', item.color)}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Scanned Setups</CardTitle>
              <CardDescription>Ranked by R:R — live scan of Gold, EUR/USD, GBP/JPY</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left">
                      {['ID', 'Asset', 'Pattern', 'Entry', 'SL', 'TP', 'R:R', 'Status'].map((h) => (
                        <th key={h} className="pb-2.5 pr-4 font-semibold text-muted-foreground whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {setups.map((row) => (
                      <tr key={row.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 pr-4 font-mono text-muted-foreground">{row.id}</td>
                        <td className="py-3 pr-4 font-semibold text-foreground whitespace-nowrap">{row.asset}</td>
                        <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">{row.type}</td>
                        <td className="py-3 pr-4 font-tabular font-medium">{formatPrice(row.symbol, row.entry)}</td>
                        <td className="py-3 pr-4 font-tabular text-danger">{formatPrice(row.symbol, row.sl)}</td>
                        <td className="py-3 pr-4 font-tabular text-success">{formatPrice(row.symbol, row.tp)}</td>
                        <td className="py-3 pr-4">
                          <Badge variant="secondary" className="font-mono">1:{row.rr.toFixed(2)}</Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant={row.variant}>{row.statusLabel}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default PriceActionPanel;

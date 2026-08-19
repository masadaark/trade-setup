import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

const setups = [
  {
    id: 'SET-01',
    asset: 'XAU/USD (Gold)',
    type: 'Bullish FVG + OB',
    entry: '$2,641.50',
    sl: '$2,633.00',
    tp: '$2,670.00',
    rr: '1:3.35',
    statusLabel: 'Ready to trade',
    variant: 'bullish' as const,
    tier: 'A+',
  },
  {
    id: 'SET-02',
    asset: 'EUR/USD',
    type: 'Liquidity Sweep + ChoCH',
    entry: '1.1120',
    sl: '1.1090',
    tp: '1.1210',
    rr: '1:3.00',
    statusLabel: 'Waiting for entry',
    variant: 'neutral' as const,
    tier: 'A',
  },
  {
    id: 'SET-03',
    asset: 'GBP/JPY',
    type: 'Bearish Mitigation Block',
    entry: '192.40',
    sl: '193.10',
    tp: '190.20',
    rr: '1:3.14',
    statusLabel: 'Monitoring',
    variant: 'neutral' as const,
    tier: 'B',
  },
];

function PriceActionPanel() {
  const bestSetup = setups[0];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-semibold">Price Action</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Step 4 of 6 — Find high-probability SMC entries with verified Risk-to-Reward
        </p>
      </div>

      {/* Featured A+ setup */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Badge variant="bullish">A+ Grade Setup Detected</Badge>
            <Badge variant="muted">SMC Methodology</Badge>
          </div>
          <CardTitle className="text-xl mt-2">
            Gold (XAU/USD) — H1 Bullish Fair Value Gap Entry
          </CardTitle>
          <CardDescription>
            Price retraced into a Fair Value Gap ($2,640.50–$2,642.80) coinciding with the H4 Demand Order Block.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Entry (Limit)', value: bestSetup.entry, color: 'text-foreground' },
              { label: 'Stop Loss', value: bestSetup.sl, color: 'text-danger' },
              { label: 'Take Profit', value: bestSetup.tp, color: 'text-success' },
              { label: 'Risk:Reward', value: bestSetup.rr, color: 'text-primary' },
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

      {/* Setup scanner table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Scanned Setups</CardTitle>
          <CardDescription>Ranked by signal quality — A+ through B tier</CardDescription>
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
                    <td className="py-3 pr-4 font-tabular font-medium">{row.entry}</td>
                    <td className="py-3 pr-4 font-tabular text-danger">{row.sl}</td>
                    <td className="py-3 pr-4 font-tabular text-success">{row.tp}</td>
                    <td className="py-3 pr-4">
                      <Badge variant="secondary" className="font-mono">{row.rr}</Badge>
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
    </div>
  );
}

export default PriceActionPanel;

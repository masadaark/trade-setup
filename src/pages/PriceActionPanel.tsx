import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { DataState } from '../components/ui/data-state';
import { useTradeSetups, formatPrice } from '../hooks/useMarketData';
import { useLivePrice } from '../hooks/useLivePrice';
import type { TradeSetup } from '../services/marketAnalysis';
import { cn } from '../lib/utils';
import { Radio } from 'lucide-react';

function SetupRow({ row }: { row: TradeSetup }) {
  const live = useLivePrice(row.symbol);
  const currentPrice = live.quote?.regularMarketPrice ?? row.entry;
  const isWs = live.isLive;

  // Real-time live proximity calculation (0 HTTP calls)
  const dist = Math.abs(currentPrice - row.entry);
  const distPct = currentPrice > 0 ? (dist / currentPrice) * 100 : 999;
  const distPoints = dist.toFixed(row.symbol.includes('BTC') ? 1 : 2);

  let liveStatus = row.statusLabel;
  let liveVariant = row.variant;

  if (distPct < 0.15) {
    liveStatus = '🎯 AT ENTRY / TRIGGER READY';
    liveVariant = 'bullish';
  } else if (distPct < 0.6) {
    liveStatus = `⚡ APPROACHING (${distPoints} pts)`;
    liveVariant = 'neutral';
  } else {
    liveStatus = `⏳ MONITORING (${distPoints} pts)`;
  }

  return (
    <tr className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
      <td className="py-3 pr-4 font-mono text-muted-foreground">{row.id}</td>
      <td className="py-3 pr-4 font-semibold text-foreground whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span>{row.asset}</span>
          {isWs && (
            <span className="flex h-1.5 w-1.5 rounded-full bg-success animate-pulse" title="WebSocket Live" />
          )}
        </div>
      </td>
      <td className="py-3 pr-4 font-mono font-semibold whitespace-nowrap">
        <span className="text-foreground">{formatPrice(row.symbol, currentPrice)}</span>
        {isWs && <Badge variant="success" className="ml-1.5 text-[9px] px-1 py-0">WS</Badge>}
      </td>
      <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">{row.type}</td>
      <td className="py-3 pr-4 font-tabular font-medium">{formatPrice(row.symbol, row.entry)}</td>
      <td className="py-3 pr-4 font-tabular text-danger">{formatPrice(row.symbol, row.sl)}</td>
      <td className="py-3 pr-4 font-tabular text-success">{formatPrice(row.symbol, row.tp)}</td>
      <td className="py-3 pr-4">
        <Badge variant="secondary" className="font-mono">1:{row.rr.toFixed(2)}</Badge>
      </td>
      <td className="py-3 whitespace-nowrap">
        <Badge variant={liveVariant}>{liveStatus}</Badge>
      </td>
    </tr>
  );
}

function BestSetupLiveCard({ setup }: { setup: TradeSetup }) {
  const live = useLivePrice(setup.symbol);
  const currentPrice = live.quote?.regularMarketPrice ?? setup.entry;
  const isWs = live.isLive;

  const dist = Math.abs(currentPrice - setup.entry);
  const distPct = currentPrice > 0 ? (dist / currentPrice) * 100 : 999;
  const distPoints = dist.toFixed(setup.symbol.includes('BTC') ? 1 : 2);

  const atEntry = distPct < 0.15;
  const approaching = distPct < 0.6;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={setup.tier === 'A+' ? 'bullish' : 'neutral'}>
              {setup.tier} Grade Setup Detected
            </Badge>
            <Badge variant="muted">SMC Methodology</Badge>
          </div>
          <div className="flex items-center gap-2">
            {isWs && (
              <Badge variant="success" className="gap-1 text-[11px]">
                <Radio size={12} className="animate-pulse" />
                WebSocket Real-Time
              </Badge>
            )}
            <Badge variant={atEntry ? 'success' : approaching ? 'warning' : 'neutral'}>
              {atEntry ? '🎯 AT ENTRY' : approaching ? `⚡ ${distPoints} PTS TO POI` : '⏳ MONITORING'}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-xl mt-2">
          {setup.asset} — {setup.type}
        </CardTitle>
        <CardDescription>
          Live Market: <strong className="text-foreground font-mono">{formatPrice(setup.symbol, currentPrice)}</strong> • 
          Entry Limit at <strong className="text-foreground font-mono">{formatPrice(setup.symbol, setup.entry)}</strong> • 
          Distance: <span className="font-mono text-primary font-semibold">{distPoints} points</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Live Price', value: formatPrice(setup.symbol, currentPrice), color: 'text-primary' },
            { label: 'Entry (Limit)', value: formatPrice(setup.symbol, setup.entry), color: 'text-foreground' },
            { label: 'Stop Loss', value: formatPrice(setup.symbol, setup.sl), color: 'text-danger' },
            { label: 'Take Profit', value: formatPrice(setup.symbol, setup.tp), color: 'text-success' },
            { label: 'Risk:Reward', value: `1:${setup.rr.toFixed(2)}`, color: 'text-foreground' },
          ].map((item) => (
            <div key={item.label} className="rounded-md bg-muted/50 p-3 space-y-1">
              <span className="text-xs text-muted-foreground block">{item.label}</span>
              <span className={cn('text-lg font-bold font-tabular block', item.color)}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PriceActionPanel() {
  const { setups, bestSetup, isLoading, error, refetch } = useTradeSetups();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold">Price Action</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Step 4 of 5 — Real-time SMC trigger monitoring & entry execution
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/60 px-2.5 py-1 rounded-md border border-border">
          <Radio size={13} className="text-success animate-pulse" />
          <span>WebSocket Live Engine</span>
        </div>
      </div>

      <DataState isLoading={isLoading} error={error} onRetry={refetch} />

      {!isLoading && !error && bestSetup && (
        <>
          <BestSetupLiveCard setup={bestSetup} />

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Scanned Setups (Live Tracking)</CardTitle>
              <CardDescription>
                WebSocket-driven real-time tracking across Gold (XAUUSD), Bitcoin (BTCUSD), and Crude Oil (USOUSD)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left">
                      {['ID', 'Asset', 'Live Price', 'Pattern', 'Entry', 'SL', 'TP', 'R:R', 'Trigger Status'].map((h) => (
                        <th key={h} className="pb-2.5 pr-4 font-semibold text-muted-foreground whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {setups.map((row) => (
                      <SetupRow key={row.id} row={row} />
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


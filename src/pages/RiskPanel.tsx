import { useState } from 'react';
import { Calculator, DollarSign, Percent, ShieldCheck, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

function RiskPanel() {
  const [accountBalance, setAccountBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1.0);
  const [entryPrice, setEntryPrice] = useState(2641.50);
  const [stopLossPrice, setStopLossPrice] = useState(2633.00);
  const [takeProfitPrice, setTakeProfitPrice] = useState(2670.00);

  // Position sizing calculations
  const riskAmount = (accountBalance * riskPercent) / 100;
  const stopLossDistance = Math.abs(entryPrice - stopLossPrice);
  const takeProfitDistance = Math.abs(takeProfitPrice - entryPrice);
  const positionUnits = stopLossDistance > 0 ? riskAmount / stopLossDistance : 0;
  const lotSize = (positionUnits / 100).toFixed(2);
  const rr = stopLossDistance > 0 ? (takeProfitDistance / stopLossDistance).toFixed(2) : '—';
  const potentialProfit = positionUnits * takeProfitDistance;

  // Risk gate checks
  const rrNumeric = parseFloat(rr);
  const checks = [
    {
      label: 'Risk-to-Reward ≥ 1:2.5',
      pass: rrNumeric >= 2.5,
      value: `1:${rr}`,
    },
    {
      label: 'Risk per trade ≤ 2%',
      pass: riskPercent <= 2,
      value: `${riskPercent.toFixed(1)}%`,
    },
    {
      label: 'Stop Loss distance > 0',
      pass: stopLossDistance > 0,
      value: `${stopLossDistance.toFixed(2)} pts`,
    },
  ];

  const allPassed = checks.every((c) => c.pass);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-semibold">Risk Gate</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Step 6 of 6 — Calculate exact position size and get final trade approval
        </p>
      </div>

      {/* Overall gate status */}
      <div
        className={cn(
          'rounded-md border px-4 py-3 flex items-center justify-between gap-3',
          allPassed
            ? 'border-success/30 bg-success/5'
            : 'border-danger/30 bg-danger/5'
        )}
      >
        <div>
          <p className={cn('font-semibold text-sm', allPassed ? 'text-success' : 'text-danger')}>
            Risk Gate: {allPassed ? 'APPROVED — Safe to execute' : 'BLOCKED — Adjust parameters'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {allPassed
              ? 'All risk checks passed. Your position sizing is within safe limits.'
              : 'One or more risk checks failed. Do not enter this trade.'}
          </p>
        </div>
        <Badge variant={allPassed ? 'success' : 'danger'} className="shrink-0">
          {allPassed ? 'Pass' : 'Fail'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calculator */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calculator size={15} />
                Position Size Calculator
              </CardTitle>
              <Badge variant="muted">Forex / CFD</Badge>
            </div>
            <CardDescription>
              Enter your account details and trade levels to calculate the safe lot size
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Inputs */}
            <div className="grid grid-cols-2 gap-4">
              {/* Account Balance */}
              <div className="space-y-1.5">
                <label htmlFor="account-balance" className="text-xs font-medium text-muted-foreground">
                  Account Balance ($)
                </label>
                <div className="relative">
                  <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="account-balance"
                    type="number"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(Number(e.target.value))}
                    className={cn(
                      'w-full rounded-md border border-input bg-background',
                      'pl-8 pr-3 py-2 text-sm font-tabular',
                      'focus:outline-none focus:ring-2 focus:ring-ring'
                    )}
                  />
                </div>
              </div>

              {/* Risk % */}
              <div className="space-y-1.5">
                <label htmlFor="risk-percent" className="text-xs font-medium text-muted-foreground">
                  Risk per Trade (%)
                </label>
                <div className="relative">
                  <Percent size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="risk-percent"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="5"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(Number(e.target.value))}
                    className={cn(
                      'w-full rounded-md border border-input bg-background',
                      'pl-8 pr-3 py-2 text-sm font-tabular',
                      'focus:outline-none focus:ring-2 focus:ring-ring'
                    )}
                  />
                </div>
              </div>

              {/* Entry */}
              <div className="space-y-1.5">
                <label htmlFor="entry-price" className="text-xs font-medium text-muted-foreground">
                  Entry Price ($)
                </label>
                <input
                  id="entry-price"
                  type="number"
                  step="0.1"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(Number(e.target.value))}
                  className={cn(
                    'w-full rounded-md border border-input bg-background',
                    'px-3 py-2 text-sm font-tabular',
                    'focus:outline-none focus:ring-2 focus:ring-ring'
                  )}
                />
              </div>

              {/* Stop Loss */}
              <div className="space-y-1.5">
                <label htmlFor="stop-loss" className="text-xs font-medium text-muted-foreground">
                  Stop Loss ($)
                </label>
                <input
                  id="stop-loss"
                  type="number"
                  step="0.1"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(Number(e.target.value))}
                  className={cn(
                    'w-full rounded-md border border-input bg-background',
                    'px-3 py-2 text-sm font-tabular',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    'border-danger/40 focus:ring-danger/30'
                  )}
                />
              </div>

              {/* Take Profit */}
              <div className="space-y-1.5 col-span-2">
                <label htmlFor="take-profit" className="text-xs font-medium text-muted-foreground">
                  Take Profit ($)
                </label>
                <input
                  id="take-profit"
                  type="number"
                  step="0.1"
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(Number(e.target.value))}
                  className={cn(
                    'w-full rounded-md border border-input bg-background',
                    'px-3 py-2 text-sm font-tabular',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    'border-success/40 focus:ring-success/30'
                  )}
                />
              </div>
            </div>

            {/* Result */}
            <div className="rounded-md bg-muted/50 border border-border p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">Recommended Lot Size</span>
                <span className="text-3xl font-bold font-tabular text-foreground">
                  {lotSize}
                  <span className="text-sm font-normal text-muted-foreground ml-1">Lots</span>
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">Max loss</span>
                  <p className="text-sm font-bold font-tabular text-danger">
                    ${riskAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Target profit</span>
                  <p className="text-sm font-bold font-tabular text-success">
                    ${potentialProfit.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">R:R ratio</span>
                  <p className="text-sm font-bold font-tabular">1:{rr}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldCheck size={15} />
                Pre-Trade Checklist
              </CardTitle>
              <Badge variant={allPassed ? 'success' : 'danger'}>
                {allPassed ? 'All Pass' : 'Blocked'}
              </Badge>
            </div>
            <CardDescription>Automated safety checks before order execution</CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            {checks.map((check) => (
              <div
                key={check.label}
                className={cn(
                  'flex items-center justify-between rounded-md border px-3 py-2.5 text-xs font-medium',
                  check.pass
                    ? 'border-success/25 bg-success/8 text-success'
                    : 'border-danger/25 bg-danger/8 text-danger'
                )}
              >
                <div className="flex items-center gap-2">
                  {check.pass ? <ShieldCheck size={13} /> : <X size={13} />}
                  <span>{check.label}</span>
                </div>
                <span className="font-tabular font-bold">{check.value}</span>
              </div>
            ))}

            <div className="rounded-md bg-muted/40 border border-border px-3 py-2.5 text-xs text-muted-foreground mt-3 leading-relaxed">
              <strong className="text-foreground">System verdict:</strong>{' '}
              {allPassed
                ? `All checks passed. Execute BUY at $${entryPrice} with ${lotSize} lots. Max drawdown: $${riskAmount.toFixed(2)}.`
                : 'Adjust your trade parameters until all checks pass before executing.'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RiskPanel;

import { Activity, AlertCircle, Globe, Zap } from 'lucide-react';

function MacroPanel() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Globe className="text-indigo-400" />
          Macro Regime & Intermarket
        </h1>
        <p className="text-slate-400 text-sm mt-1">Establish the daily directional bias before any chart analysis.</p>
      </div>

      <div className="dashboard-grid">
        {/* Work Package 2.1 — Regime Indicator Widget */}
        <div className="col-span-4 glass-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Current Regime</h3>
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-md">
                GROWTH
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Equities favored. Central banks prioritizing independent policy over fixed FX.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3 text-xs text-slate-500 font-mono">
            <Activity size={14} className="text-indigo-400" />
            Agent Analysis Active
          </div>
        </div>

        {/* Work Package 2.2 — Gold-Dollar Correlation */}
        <div className="col-span-8 glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Gold-USD Correlation</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-emerald-400 font-medium">Normal Inverse (-0.82)</span>
            </div>
          </div>
          <div className="h-40 border border-white/5 rounded-lg bg-black/20 flex items-center justify-center text-slate-600">
            [Chart Area: GC=F vs DX-Y]
          </div>
        </div>

        {/* Work Package 2.3 — Currency Heatmap */}
        <div className="col-span-full glass-panel p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Currency Strength vs Gold</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {['AUD', 'CAD', 'NZD', 'EUR', 'GBP', 'JPY', 'CHF', 'USD'].map((ccy, i) => (
              <div key={ccy} className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1 ${
                i === 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 
                i === 7 ? 'bg-rose-500/10 border-rose-500/30' : 
                'bg-white/5 border-white/10'
              }`}>
                <span className="text-sm font-bold text-white">{ccy}</span>
                <span className={`text-xs font-mono ${
                  i === 0 ? 'text-emerald-400' : 
                  i === 7 ? 'text-rose-400' : 
                  'text-slate-400'
                }`}>
                  {i === 0 ? '+1.2%' : i === 7 ? '-0.8%' : '+0.1%'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MacroPanel;

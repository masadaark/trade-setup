import { Activity, BarChart2, Cpu, Globe, Settings, ShieldAlert, TrendingUp, Layers } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

const navItems = [
  {
    path: '/',
    icon: Globe,
    label: 'Macro Regime',
    desc: 'Intermarket & Fed',
  },
  {
    path: '/cot',
    icon: BarChart2,
    label: 'COT Intelligence',
    desc: 'Institutional Positioning',
  },
  {
    path: '/structure',
    icon: Layers,
    label: 'Market Structure',
    desc: 'HTF Trend & Liquidity',
  },
  {
    path: '/price-action',
    icon: TrendingUp,
    label: 'Price Action',
    desc: 'SMC Setups & FVG',
  },
  {
    path: '/algo',
    icon: Cpu,
    label: 'Algo Metrics',
    desc: 'ATR & VWAP',
  },
  {
    path: '/risk',
    icon: ShieldAlert,
    label: 'Risk Gate',
    desc: 'Position Sizing',
  },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside
      id="app-sidebar"
      className="w-60 shrink-0 flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
    >
      {/* Brand */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-sidebar-primary flex items-center justify-center">
            <Activity size={16} className="text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">TradeSetup</h1>
            <p className="text-[10px] text-sidebar-foreground/50 leading-tight mt-0.5">
              Trading Analysis Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-2 pb-2 text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest">
          Workflow
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'group flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              )}
            >
              <Icon
                size={16}
                className={cn(
                  'shrink-0 transition-colors',
                  isActive
                    ? 'text-sidebar-primary'
                    : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80'
                )}
              />
              <div className="flex flex-col min-w-0">
                <span className="truncate text-xs font-medium leading-tight">{item.label}</span>
                <span className="truncate text-[10px] text-sidebar-foreground/40 leading-tight mt-0.5">
                  {item.desc}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          className={cn(
            'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md',
            'text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground',
            'hover:bg-sidebar-accent/60 transition-colors'
          )}
        >
          <Settings size={14} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

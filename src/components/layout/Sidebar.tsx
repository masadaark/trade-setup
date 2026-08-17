import { 
  Activity, 
  BarChart2, 
  Cpu, 
  Globe, 
  Settings,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: Globe, label: 'Macro Regime', desc: 'Panel 1' },
  { path: '/cot', icon: BarChart2, label: 'COT Intel', desc: 'Panel 2' },
  { path: '/structure', icon: Activity, label: 'Market Structure', desc: 'Panel 3' },
  { path: '/price-action', icon: TrendingUp, label: 'Price Action', desc: 'Panel 4' },
  { path: '/algo', icon: Cpu, label: 'Algo Metrics', desc: 'Panel 5' },
  { path: '/risk', icon: ShieldAlert, label: 'Risk Gate', desc: 'Panel 6' },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-[280px] h-full flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border-light)]">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gradient flex items-center gap-2">
          <Activity className="text-indigo-500" />
          TradeSetup
        </h1>
        <p className="text-xs mt-1 text-[var(--text-muted)]">Professional Dashboard</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-indigo-500/10 border border-indigo-500/30 text-[var(--text-primary)]' 
                  : 'hover:bg-white/5 border border-transparent text-[var(--text-secondary)]'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
              <div className="flex flex-col">
                <span className="font-medium text-sm">{item.label}</span>
                <span className="text-[10px] text-[var(--text-muted)]">{item.desc}</span>
              </div>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border-light)]">
        <button className="flex items-center gap-3 w-full px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-[var(--text-secondary)]">
          <Settings size={18} />
          Settings
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

import { Bell, Search, AlertTriangle } from 'lucide-react';

function Header() {
  return (
    <header className="h-[70px] w-full flex items-center justify-between px-6 glass-panel border-x-0 border-t-0 rounded-none z-30 relative">
      <div className="flex items-center gap-4">
        {/* Global Two Big Questions Status */}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Direction:</span>
            <span className="text-sm font-medium text-emerald-400 flex items-center gap-1">
              Up (Initiating)
            </span>
          </div>
          <div className="w-px h-4 bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Quality:</span>
            <span className="text-sm font-medium text-emerald-400 flex items-center gap-1">
              Good (High Vol)
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search symbol..." 
            className="bg-slate-900/50 border border-slate-700/50 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-indigo-500/50 text-white placeholder:text-slate-500 w-48 transition-all focus:w-64"
          />
        </div>
        
        <button className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
            TS
          </div>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-sm font-medium leading-none">Trader 01</span>
            <span className="text-[10px] text-emerald-400 font-mono mt-1">Live Mode</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

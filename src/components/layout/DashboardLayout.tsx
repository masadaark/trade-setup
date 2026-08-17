import { Outlet } from 'react-router-dom';

import Header from './Header';
import Sidebar from './Sidebar';

function DashboardLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[var(--bg-base)] to-[var(--bg-base)]">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
        
        <Header />
        
        <main className="scrollable-content relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;

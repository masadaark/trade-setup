import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { LiveMarketProvider } from '../../context/LiveMarketProvider';

function DashboardLayout() {
  return (
    <LiveMarketProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </LiveMarketProvider>
  );
}

export default DashboardLayout;

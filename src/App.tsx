import { Route, Routes } from 'react-router-dom';

import DashboardLayout from './components/layout/DashboardLayout';
import MacroPanel from './pages/MacroPanel';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<MacroPanel />} />
        {/* Placeholders for other panels */}
        <Route path="cot" element={<div className="p-8 text-white">COT Intel Panel (In Progress)</div>} />
        <Route path="structure" element={<div className="p-8 text-white">Market Structure Panel (In Progress)</div>} />
        <Route path="price-action" element={<div className="p-8 text-white">Price Action Panel (In Progress)</div>} />
        <Route path="algo" element={<div className="p-8 text-white">Algo Metrics Panel (In Progress)</div>} />
        <Route path="risk" element={<div className="p-8 text-white">Risk Gate Panel (In Progress)</div>} />
      </Route>
    </Routes>
  );
}

export default App;

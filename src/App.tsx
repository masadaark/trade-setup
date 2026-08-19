import { Route, Routes } from 'react-router-dom';

import DashboardLayout from './components/layout/DashboardLayout';
import MacroPanel from './pages/MacroPanel';
import CotPanel from './pages/CotPanel';
import StructurePanel from './pages/StructurePanel';
import PriceActionPanel from './pages/PriceActionPanel';
import AlgoPanel from './pages/AlgoPanel';
import RiskPanel from './pages/RiskPanel';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<MacroPanel />} />
        <Route path="cot" element={<CotPanel />} />
        <Route path="structure" element={<StructurePanel />} />
        <Route path="price-action" element={<PriceActionPanel />} />
        <Route path="algo" element={<AlgoPanel />} />
        <Route path="risk" element={<RiskPanel />} />
      </Route>
    </Routes>
  );
}

export default App;


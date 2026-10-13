/**
 * App.tsx
 *
 * WattWise application router.
 * Defines all 10 routes + 404.
 * /saved and /profile are protected (require auth via ProtectedRoute).
 */
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage      from './pages/LandingPage';
import LoginPage        from './pages/LoginPage';
import CalculatorPage   from './pages/CalculatorPage';
import ComparisonPage   from './pages/ComparisonPage';
import DigitalTwinPage  from './pages/DigitalTwinPage';
import RiskShieldPage   from './pages/RiskShieldPage';
import ShiftAdvisorPage from './pages/ShiftAdvisorPage';
import PlansPage        from './pages/PlansPage';
import SavedPage        from './pages/SavedPage';
import ProfilePage      from './pages/ProfilePage';
import NotFoundPage     from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route index                   element={<LandingPage />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/calculator"      element={<CalculatorPage />} />
        <Route path="/comparison"      element={<ComparisonPage />} />
        <Route path="/digital-twin"    element={<DigitalTwinPage />} />
        <Route path="/risk-shield"     element={<RiskShieldPage />} />
        <Route path="/shift-advisor"   element={<ShiftAdvisorPage />} />
        <Route path="/plans"           element={<PlansPage />} />

        {/* Protected routes — require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/saved"   element={<SavedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

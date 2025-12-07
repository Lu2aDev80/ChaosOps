
import { Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import DevicePairingDisplay from "./pages/DevicePairingDisplay";
import PlannerPage from "./pages/PlannerPage";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import Dashboard from "./pages/Dashboard";
import OrganisationSettings from "./pages/OrganisationSettings";
import Documentation from "./pages/Documentation";
import VerifyEmail from "./pages/VerifyEmail";
import AcceptInvitation from "./pages/AcceptInvitation";
import Footer from "./components/ui/Footer";

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register-display" element={<DevicePairingDisplay />} />
          <Route path="/display/:displayId" element={<DevicePairingDisplay />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/signup" element={<AdminSignup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/accept-invitation" element={<AcceptInvitation />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/settings" element={<OrganisationSettings />} />
          <Route path="/planner" element={<PlannerPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;

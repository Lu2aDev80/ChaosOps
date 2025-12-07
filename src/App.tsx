
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
import { CookieBanner } from "./components/ui";
import Impressum from "./pages/Impressum";
import AGB from "./pages/AGB";
import DSGVO from "./pages/DSGVO";
import Error404 from "./pages/Error404";
import TermsAccept from "./pages/TermsAccept";

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
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/agb" element={<AGB />} />
          <Route path="/dsgvo" element={<DSGVO />} />
          <Route path="/terms-accept" element={<TermsAccept />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </div>
      <Footer />
      <CookieBanner />
    </div>
  );
}

export default App;

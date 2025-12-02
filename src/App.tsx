
import { Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import DisplayRegister from "./pages/DisplayRegister";
import PlannerPage from "./pages/PlannerPage";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import Dashboard from "./pages/Dashboard";
import Documentation from "./pages/Documentation";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/signup" element={<AdminSignup />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/register-display" element={<DisplayRegister />} />
      <Route path="/planner" element={<PlannerPage />} />
    </Routes>
  );
}

export default App;

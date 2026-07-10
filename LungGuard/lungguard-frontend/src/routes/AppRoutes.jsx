import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import RiskAssessment from "../pages/RiskAssessment";
import Simulation from "../pages/Simulation";
import XrayUpload from "../pages/XrayUpload";
import ChatAssistant from "../pages/ChatAssistant";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "../components/ProtectedRoute";
import Tracker from "../pages/Tracker";
import HealthTimeline from "../pages/HealthTimeline";
import ScanComparison from "../pages/ScanComparison";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/risk" element={<ProtectedRoute><RiskAssessment /></ProtectedRoute>} />
      <Route path="/simulation" element={<ProtectedRoute><Simulation /></ProtectedRoute>} />
      <Route path="/xray" element={<ProtectedRoute><XrayUpload /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatAssistant /></ProtectedRoute>} />
      <Route path="/tracker" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
      <Route path="/timeline" element={<ProtectedRoute><HealthTimeline /></ProtectedRoute>} />
      <Route path="/scan-comparison" element={<ProtectedRoute><ScanComparison /></ProtectedRoute>} />
      
      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <BrowserRouter>
      {/* A clean, deep slate aesthetic for high-tech drone telemetry.
      */}
      <div className="min-h-screen bg-slate-950 selection:bg-cyan-500/30">
        <Routes>
          {/* Dashboard is now the Landing Page */}
          <Route path="/" element={<DashboardPage />} />
          
          {/* Upload is moved to its own dedicated path */}
          <Route path="/upload" element={<UploadPage />} />
          
          {/* Analysis View */}
          <Route path="/analytics" element={<AnalyticsPage />} />
          
          {/* Fallback Catch-all redirects back to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import AnalyticsPage from "./pages/AnalyticsPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        {/* Demo Banner */}
        <div className="bg-cyan-600/20 border-b border-cyan-500/30 px-4 py-2 text-center text-sm text-cyan-200">
          🚀 Demo Mode - Using mock data for development
        </div>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

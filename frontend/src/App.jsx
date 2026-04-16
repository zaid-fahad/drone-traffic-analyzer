import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import AnalyticsPage from "./pages/AnalyticsPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

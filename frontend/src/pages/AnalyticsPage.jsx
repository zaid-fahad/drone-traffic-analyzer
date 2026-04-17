import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Download, Play, ArrowLeft, ArrowDown, ArrowUp } from "lucide-react";
import VideoPlayer from "../components/VideoPlayer";
import Button from "../components/Button";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import { getProcessingStatus, downloadReport } from "../api/client";
import usePolling from "../hooks/usePolling";

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState("pending");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);

  // States for Bidirectional Split
  const [inbound, setInbound] = useState({ total: 0, car: 0, truck: 0, bus: 0, motorcycle: 0 });
  const [outbound, setOutbound] = useState({ total: 0, car: 0, truck: 0, bus: 0, motorcycle: 0 });

  useEffect(() => {
    const stored = localStorage.getItem("drone-task-id");
    if (!stored) {
      navigate("/");
      return;
    }
    setJobId(stored);
  }, [navigate]);

  const fetchStatus = useCallback(async () => {
    if (!jobId) return;
    try {
      const response = await getProcessingStatus(jobId);
      const currentStatus = response.status || "pending";
      setStatus(currentStatus);
      setProgress(response.progress || 0);

      if (response.counts_by_class) {
        if (response.counts_by_class.inbound) setInbound(response.counts_by_class.inbound);
        if (response.counts_by_class.outbound) setOutbound(response.counts_by_class.outbound);
      }

      if (currentStatus === "completed" && response.video_url) {
        setVideoUrl(`http://localhost:8000${response.video_url}`);
      }
    } catch (pollError) {
      console.error("Polling error:", pollError);
      setError("Unable to fetch processing status. Ensure the backend is running.");
    }
  }, [jobId]);

  const isEnabled = !!jobId && status !== "completed" && status !== "error";
  const { isPolling } = usePolling(fetchStatus, 2000, isEnabled);

  const handleDownload = async () => {
    setDownloadLoading(true);
    setError("");
    try {
      const blob = await downloadReport(jobId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `drone-traffic-report-${jobId}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError("Report download failed. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const statusLabel = status === "completed" ? "Completed" :
                     status === "processing" ? "Processing" : "Pending";

  return (
    <div className="min-h-screen p-4 bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header section */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-white">Analysis Results</h1>
            <p className="text-slate-400 text-sm font-mono">ID: {jobId}</p>
          </div>
        </div>

        {/* The Requested Process Card Section */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-cyan-400" />
              <span className="text-lg font-medium text-white">Processing Status</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              status === "completed" ? "bg-green-500/20 text-green-400" :
              status === "processing" ? "bg-yellow-500/20 text-yellow-400" :
              "bg-slate-500/20 text-slate-400"
            }`}>
              {statusLabel}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Analysis Progress</span>
                <span className="text-slate-400 font-mono">{progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 p-0.5">
                <div
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {isPolling && (
              <div className="flex items-center space-x-2 text-sm text-slate-400 italic">
                <LoadingSpinner size="sm" />
                <span>Synchronizing with vision engine...</span>
              </div>
            )}
          </div>
        </Card>

        {/* Bidirectional Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inbound (Down) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-400 font-bold px-2 text-sm uppercase tracking-wider">
              <ArrowDown size={16} /> Inbound Traffic
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Total" value={inbound.total} color="text-green-400" />
              <StatCard label="Cars" value={inbound.car} />
              <StatCard label="Trucks" value={inbound.truck} />
              <StatCard label="Buses" value={inbound.bus} />
            </div>
          </div>

          {/* Outbound (Up) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold px-2 text-sm uppercase tracking-wider">
              <ArrowUp size={16} /> Outbound Traffic
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Total" value={outbound.total} color="text-blue-400" />
              <StatCard label="Cars" value={outbound.car} />
              <StatCard label="Trucks" value={outbound.truck} />
              <StatCard label="Buses" value={outbound.bus} />
            </div>
          </div>
        </div>

        {status === "completed" && videoUrl && (
          <Card className="overflow-hidden border-cyan-500/30">
            <div className="flex items-center space-x-3 mb-4">
              <Play className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-medium text-white">Processed Visualization</h2>
            </div>
            <VideoPlayer src={videoUrl} key={videoUrl} />
          </Card>
        )}

        <Card className="bg-slate-900/40">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-medium text-white mb-1">Export Telemetry Data</h3>
              <p className="text-slate-400 text-sm">
                Generate a CSV report containing directional tracking IDs and timestamps.
              </p>
            </div>
            <Button
              onClick={handleDownload}
              disabled={status !== "completed" || downloadLoading}
              className="w-full md:w-auto min-w-[160px]"
            >
              {downloadLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </>
              )}
            </Button>
          </div>
        </Card>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg animate-pulse text-center">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-white" }) {
  return (
    <Card className="py-6 text-center">
      <div className={`text-4xl font-bold ${color} mb-1 font-mono`}>
        {value || 0}
      </div>
      <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
    </Card>
  );
}
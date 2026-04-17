import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Download, Play, ArrowLeft } from "lucide-react";
import VideoPlayer from "../components/VideoPlayer";
import Button from "../components/Button";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import { getProcessingStatus, downloadReport } from "../api/client";
import usePolling from "../hooks/usePolling";

const initialStats = { total: 0, cars: 0, trucks: 0, buses: 0 };

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [taskId, setTaskId] = useState("");
  const [status, setStatus] = useState("pending");
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState(initialStats);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("drone-task-id");
    if (!stored) {
      navigate("/");
      return;
    }
    setTaskId(stored);
  }, [navigate]);

  const fetchStatus = useCallback(async () => {
    if (!taskId) return;
    try {
      const response = await getProcessingStatus(taskId);
      const currentStatus = response.status || "pending";
      setStatus(currentStatus);

      if (response.counts_by_class) {
        setStats({
          total: response.total_count || 0,
          cars: response.counts_by_class.car || 0,
          trucks: response.counts_by_class.truck || 0,
          buses: response.counts_by_class.bus || 0,
        });
      }

      if (response.progress !== undefined) {
        setProgress(response.progress);
      }

      if (currentStatus === "completed" && response.video_url) {
        setVideoUrl(`http://localhost:8000${response.video_url}`);
      }
    } catch (pollError) {
      console.error("Polling error:", pollError);
      setError("Unable to fetch processing status. Ensure the backend is running.");
    }
  }, [taskId]);

  const isEnabled = !!taskId && status !== "completed" && status !== "error";
  const { isPolling } = usePolling(fetchStatus, 2000, isEnabled);

  const handleDownload = async () => {
    setDownloadLoading(true);
    setError("");
    try {
      const blob = await downloadReport(taskId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `drone-traffic-report-${taskId}.csv`;
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
        
        {/* Header section - UPDATED BUTTON */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-white">Analysis Results</h1>
            <p className="text-slate-400 text-sm">Task ID: {taskId}</p>
          </div>
        </div>

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Unique", value: stats.total, color: "text-blue-400" },
            { label: "Cars", value: stats.cars, color: "text-green-400" },
            { label: "Trucks", value: stats.trucks, color: "text-orange-400" },
            { label: "Buses", value: stats.buses, color: "text-purple-400" },
          ].map((item) => (
            <Card key={item.label} className="text-center py-6">
              <div className={`text-4xl font-bold ${item.color} mb-1 font-mono`}>
                {item.value}
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{item.label}</div>
            </Card>
          ))}
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
                Generate a CSV report containing tracking IDs and timestamps.
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
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg animate-pulse">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
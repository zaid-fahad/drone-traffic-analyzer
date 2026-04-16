import { useEffect, useState } from "react";
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
  const [progress, setProgress] = useState(12);
  const [stats, setStats] = useState(initialStats);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("drone-task-id");
    if (!stored) {
      // For demo purposes, create a mock task if none exists
      const mockTask = `demo-task-${Date.now()}`;
      localStorage.setItem("drone-task-id", mockTask);
      setTaskId(mockTask);
      return;
    }
    setTaskId(stored);
  }, [navigate]);

  const fetchStatus = async () => {
    try {
      const response = await getProcessingStatus(taskId);
      setStatus(response.status || "pending");
      setStats({
        total: response.totalVehicles ?? response.total ?? 0,
        cars: response.cars ?? 0,
        trucks: response.trucks ?? 0,
        buses: response.buses ?? 0,
      });

      setProgress((current) => {
        if (response.progress != null) return response.progress;
        if (current >= 98) return 100;
        return Math.min(100, current + 16);
      });

      if (response.status === "completed") {
        setVideoUrl(response.videoUrl ?? `http://localhost:8000/storage/results/${taskId}.mp4`);
      }
    } catch (pollError) {
      setError("Unable to fetch processing status. Check your backend.");
    }
  };

  const { isPolling } = usePolling(fetchStatus, 2000, !!taskId);

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
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Upload
          </Button>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem("drone-task-id");
                window.location.reload();
              }}
            >
              Reset Demo
            </Button>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-white">Analysis Results</h1>
              <p className="text-slate-400">Task ID: {taskId}</p>
            </div>
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
                <span className="text-slate-300">Progress</span>
                <span className="text-slate-400">{progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {isPolling && (
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <LoadingSpinner size="sm" />
                <span>Checking status...</span>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Vehicles", value: stats.total, color: "text-blue-400" },
            { label: "Cars", value: stats.cars, color: "text-green-400" },
            { label: "Trucks", value: stats.trucks, color: "text-orange-400" },
            { label: "Buses", value: stats.buses, color: "text-purple-400" },
          ].map((item) => (
            <Card key={item.label} className="text-center">
              <div className={`text-3xl font-bold ${item.color} mb-1`}>
                {item.value}
              </div>
              <div className="text-sm text-slate-400">{item.label}</div>
            </Card>
          ))}
        </div>

        {status === "completed" && (
          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <Play className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-medium text-white">Processed Video</h2>
            </div>
            <VideoPlayer src={videoUrl} />
          </Card>
        )}

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Export Report</h3>
              <p className="text-slate-400 text-sm">
                Download a CSV file with detailed vehicle tracking data
              </p>
            </div>
            <Button
              onClick={handleDownload}
              disabled={status !== "completed" || downloadLoading}
            >
              {downloadLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Downloading...
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
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

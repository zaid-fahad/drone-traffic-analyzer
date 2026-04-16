import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, DownloadCloud, PlayCircle } from "lucide-react";
import VideoPlayer from "../components/VideoPlayer";
import { getProcessingStatus, downloadReport } from "../api/client";

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
      navigate("/");
      return;
    }
    setTaskId(stored);
  }, [navigate]);

  useEffect(() => {
    if (!taskId) return;

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

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [taskId]);

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

  const statusLabel = useMemo(() => {
    if (status === "completed") return "Completed";
    if (status === "processing") return "Processing";
    return "Pending";
  }, [status]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 text-slate-100">
      <section className="space-y-3">
        <div className="flex items-center gap-3 text-cyan-300">
          <PlayCircle className="h-8 w-8" />
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Analytics Dashboard</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white">Processing Status</h1>
          </div>
        </div>
        <p className="max-w-2xl text-slate-400">Monitor the analyzer in real time, review vehicle counts, and download your CSV once processing is complete.</p>
      </section>

      <section className="glass-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Task ID</p>
            <p className="mt-2 text-lg font-medium text-slate-100">{taskId}</p>
          </div>
          <div className="rounded-full bg-slate-900/70 px-4 py-2 text-sm font-semibold text-cyan-200">
            <span className="mr-2 inline-flex items-center gap-1">
              <Activity className="h-4 w-4 text-cyan-300" />
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-full bg-slate-900/80 p-1">
          <div className="h-3 rounded-full bg-cyan-400 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm text-slate-400">Processing progress: {progress}%</p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            { label: "Total Vehicles", value: stats.total },
            { label: "Cars", value: stats.cars },
            { label: "Trucks", value: stats.trucks },
            { label: "Buses", value: stats.buses },
          ].map((item) => (
            <div key={item.label} className="glass-card p-5 text-center border border-white/10 bg-slate-950/70">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleDownload}
            disabled={status !== "completed" || downloadLoading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-slate-950 transition-all duration-300 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <DownloadCloud className="h-4 w-4" />
            {downloadLoading ? "Preparing CSV..." : "Download CSV Report"}
          </button>
          <p className="text-sm text-slate-400">Processed video source will appear once status reaches completed.</p>
        </div>
      </section>

      <section className="glass-card p-6">
        <div className="flex items-center gap-3 text-cyan-300">
          <PlayCircle className="h-5 w-5" />
          <h2 className="text-xl font-semibold text-white">Processed Output</h2>
        </div>
        <VideoPlayer src={status === "completed" ? videoUrl : ""} />
      </section>
    </main>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, RefreshCcw, FileVideo, 
  Plus, Trash2, XCircle, ChevronRight, Activity 
} from "lucide-react";
import { getAllJobs, cancelJob } from "../api/client";
import Card from "../components/Card";
import Button from "../components/Button";

export default function DashboardPage() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const data = await getAllJobs();
      setJobs(data);
    } catch (err) {
      console.error("Failed to sync dashboard data.");
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (id) => {
    if (confirm("Are you sure you want to terminate this processing task?")) {
      await cancelJob(id);
      fetchJobs();
    }
  };

  return (
    <div className="min-h-screen p-8 bg-slate-950 text-slate-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Operations Dashboard
            </h1>
            <p className="text-slate-500 text-sm">Monitor and manage traffic analysis tasks</p>
          </div>
          <Button 
            onClick={() => navigate("/upload")} 
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-5"
          >
            <Plus size={18} className="mr-2" /> New Task
          </Button>
        </div>

        {/* Technical Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard 
            label="Active Tasks" 
            value={jobs.filter(j => j.status === 'processing').length} 
            status="active" 
          />
          <MetricCard 
            label="Completed" 
            value={jobs.filter(j => j.status === 'completed').length} 
          />

          <MetricCard 
            label="Cancelled" 
            value={jobs.filter(j => j.status === 'cancelled').length} 
          />
          {/* <MetricCard 
            label="Total Detections" 
            value={jobs.reduce((acc, curr) => acc + (curr.total_count || 0), 0)} 
          /> */}
        </div>

        {/* Tasks Table */}
        <Card className="p-0 border-slate-800 bg-slate-900/20 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
                <th className="py-4 px-6">Task ID / Source</th>
                <th className="py-4 px-6">Inference Status</th>
                <th className="py-4 px-6 text-center">Traffic Count</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <FileVideo size={18} className="text-slate-500" />
                      <div>
                        <div className="text-sm font-medium text-slate-200">{job.filename}</div>
                        <div className="text-[11px] font-mono text-slate-600">{job.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={job.status} progress={job.progress} />
                  </td>
                  <td className="py-4 px-6 text-center font-mono text-sm text-cyan-500">
                    {job.total_count?.toLocaleString() || "—"}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end items-center gap-2">
  {/* Always show View/Inspect button for all states */}
  <Button 
    variant="ghost" 
    size="sm" 
    className="text-slate-400 hover:text-white"
    onClick={() => {
      localStorage.setItem("drone-task-id", job.id);
      navigate("/analytics");
    }}
  >
    {job.status === "completed" ? "View Results" : "Inspect Telemetry"}
    <ChevronRight size={14} className="ml-1" />
  </Button>

  {/* Only show Cancel if the task is active (not completed and not already cancelled) */}
  {job.status !== "completed" && job.status !== "cancelled" && (
    <button 
      onClick={() => handleCancel(job.id)} 
      className="p-2 text-slate-600 hover:text-red-400 transition-colors border-l border-slate-800 ml-1 pl-3"
      title="Terminate Task"
    >
      <XCircle size={18} />
    </button>
  )}

  {/* Delete button for record management
  <button className="p-2 text-slate-700 hover:text-slate-400 transition-colors">
    <Trash2 size={16} />
  </button> */}
</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status, progress }) {
  const styles = {
    completed: "text-emerald-500 bg-emerald-500/5 border-emerald-500/20",
    processing: "text-cyan-500 bg-cyan-500/5 border-cyan-500/20",
    cancelled: "text-slate-500 bg-slate-500/5 border-slate-500/20",
    converting: "text-amber-500 bg-amber-500/5 border-amber-500/20",
  };

  const labels = {
    completed: "Completed",
    processing: `Processing (${progress}%)`,
    cancelled: "Cancelled",
    converting: "Encoding Video",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-medium tracking-wide ${styles[status] || styles.processing}`}>
      {status === 'processing' && <RefreshCcw size={10} className="animate-spin" />}
      {labels[status] || "Initializing"}
    </div>
  );
}

function MetricCard({ label, value, status }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-lg">
      <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-semibold text-white">{value}</div>
        {status === 'active' && (
          <div className="flex items-center gap-1 text-[10px] text-cyan-500 font-bold uppercase animate-pulse">
            <Activity size={10} /> Live
          </div>
        )}
      </div>
    </div>
  );
}
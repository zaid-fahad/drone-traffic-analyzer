import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, CheckCircle, RefreshCcw, LayoutDashboard, Plus } from "lucide-react";
import { getAllJobs } from "../api/client";
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
      console.error("Dashboard sync failed.");
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-8 bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <LayoutDashboard size={20} />
              <span className="text-sm font-bold tracking-tighter uppercase">Drone</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Traffic Analysis</h1>
          </div>
          <Button onClick={() => navigate("/upload")} className="bg-cyan-600 hover:bg-cyan-500">
            <Plus size={18} className="mr-2" /> New Task
          </Button>
        </div>

        <Card className="p-0 overflow-hidden border-slate-800">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="py-4 px-6">Job ID</th>
                <th className="py-4 px-6">Filename</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Total</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs text-slate-500">{job.id.slice(0, 8)}</td>
                  <td className="py-4 px-6 font-medium text-slate-200">{job.filename}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="py-4 px-6 font-mono text-cyan-400 font-bold text-lg">
                    {/* Summing Inbound and Outbound if available, else use total_count */}
                    {job.counts_by_class?.inbound 
                      ? job.counts_by_class.inbound.total + job.counts_by_class.outbound.total 
                      : job.total_count}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button variant="ghost" size="sm" onClick={() => {
                      localStorage.setItem("drone-task-id", job.id);
                      navigate("/analytics");
                    }}>
                      <Play size={14} className="mr-2" /> Details
                    </Button>
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

function StatusBadge({ status }) {
  const isComp = status === 'completed';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
      isComp ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
    }`}>
      {isComp ? <CheckCircle size={12} /> : <RefreshCcw size={12} className="animate-spin" />}
      {status.toUpperCase()}
    </span>
  );
}
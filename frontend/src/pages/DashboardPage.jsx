import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutList, Play, CheckCircle, RefreshCcw, AlertCircle } from "lucide-react";
import axios from "axios";
import Card from "../components/Card";
import Button from "../components/Button";

export default function DashboardPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      // Use the full URL to avoid proxy issues
      const response = await axios.get("http://localhost:8000/api/jobs");
      setJobs(response.data);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to sync with mission control.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-8 text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Traffic Analyzer</h1>
            <p className="text-slate-400">View historical drone traffic data</p>
          </div>
          <Button onClick={() => navigate("/upload")}>New Task</Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-sm uppercase tracking-wider">
                    <th className="pb-4 px-4 font-semibold">Task ID</th>
                    <th className="pb-4 px-4 font-semibold">File Name</th>
                    <th className="pb-4 px-4 font-semibold">Status</th>
                    <th className="pb-4 px-4 font-semibold">Progress</th>
                    <th className="pb-4 px-4 font-semibold">Vehicles</th>
                    <th className="pb-4 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {jobs.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500">
                      No missions found. Start by uploading a video.
                    </td>
                  </tr>
                )}
                {jobs.map((job) => (
                  <tr key={job.id} className="group hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-4 font-medium">{job.id}</td>
                    <td className="py-4 px-4 font-medium">{job.filename}</td>
                    <td className="py-4 px-4">
                      <span className={`flex items-center gap-2 text-sm font-medium ${
                        job.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {job.status === 'completed' ? 
                          <CheckCircle size={14}/> : 
                          <RefreshCcw size={14} className="animate-spin"/>
                        }
                        {job.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-300">{job.progress}%</td>
                    <td className="py-4 px-4 font-mono text-cyan-400 text-lg">{job.total_count}</td>
                    <td className="py-4 px-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          localStorage.setItem("drone-task-id", job.id);
                          navigate("/analytics");
                        }}
                      >
                        <Play size={14} className="mr-2" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CloudUpload, Sparkles } from "lucide-react";
import { uploadVideo } from "../api/client";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska"];

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback((incoming) => {
    if (!incoming) return;
    if (!ACCEPTED_TYPES.includes(incoming.type)) {
      setError("Please upload a valid MP4/MOV/AVI/MKV video file.");
      return;
    }
    setError("");
    setFile(incoming);
  }, []);

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Choose a video file before uploading.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const result = await uploadVideo(file);
      localStorage.setItem("drone-task-id", result.taskId);
      navigate("/analytics");
    } catch (uploadError) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 text-slate-100">
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-cyan-300">
          <Sparkles className="h-8 w-8" />
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Drone-Tech Upload</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white">Smart Drone Traffic Analyzer</h1>
          </div>
        </div>
        <p className="max-w-2xl text-slate-400">Drag and drop a drone video to start processing. The analyzer will extract vehicle counts, process the frame stream, and prepare your analytics dashboard.</p>
      </section>

      <section
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        className="scan-ring glass-card flex min-h-[320px] flex-col items-center justify-center gap-6 rounded-[32px] border border-cyan-400/10 bg-slate-950/70 px-8 text-center shadow-xl transition-all duration-300 hover:border-cyan-300/30"
      >
        <CloudUpload className="h-16 w-16 text-cyan-400" />
        <div>
          <p className="text-2xl font-semibold text-white">Drop your video here</p>
          <p className="mt-2 text-slate-400">Supports MP4, MOV, AVI, MKV. Click to select or drag a file onto this card.</p>
        </div>
        <label className="cursor-pointer rounded-full border border-cyan-500/20 bg-slate-900/80 px-6 py-3 text-sm font-medium text-cyan-200 transition-all duration-300 hover:bg-cyan-500/10 hover:text-cyan-100">
          Choose file
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
            className="sr-only"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>
        {file && <p className="text-sm text-slate-300">Selected file: {file.name}</p>}
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="rounded-full bg-brand-accent px-8 py-3 text-sm font-semibold text-slate-950 transition-all duration-300 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Start Processing"}
        </button>
      </section>
    </main>
  );
}

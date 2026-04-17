import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Zap, LayoutDashboard } from "lucide-react";
import { uploadVideo } from "../api/client";
import Button from "../components/Button";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska"];

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback((incoming) => {
    if (!incoming) return;
    if (!ACCEPTED_TYPES.includes(incoming.type)) {
      setError("Please upload a valid MP4, MOV, AVI, or MKV video file.");
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
      setError("Please select a video file first.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const result = await uploadVideo(file);
      localStorage.setItem("drone-task-id", result.taskId);
      navigate("/analytics");
    } catch (uploadError) {
      setError("Upload failed. Please check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-slate-950">
      {/* NEW NAVIGATION HEADER */}
      <div className="max-w-4xl mx-auto flex justify-end mb-8 pt-4">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <LayoutDashboard className="h-4 w-4 mr-2" />
          View Dashboard
        </Button>
      </div>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-cyan-500/10 rounded-full">
                <Zap className="h-8 w-8 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Drone Traffic Analyzer</h1>
              <p className="text-slate-400 text-lg">Upload your drone footage to get started</p>
            </div>
          </div>

          <Card className="space-y-6">
            <div
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
              className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center transition-colors hover:border-cyan-400/50"
            >
              <Upload className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-white">Drop your video here</p>
                <p className="text-slate-400">or click to browse files</p>
                <p className="text-sm text-slate-500">Supports MP4, MOV, AVI, MKV</p>
              </div>
              <label className="mt-4 inline-block">
                <span className="btn-secondary cursor-pointer inline-block">
                  Choose File
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
                  className="sr-only"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                />
              </label>
            </div>

            {file && (
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-300">
                  <span className="font-medium">Selected:</span> {file.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="w-full"
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Uploading...
                </>
              ) : (
                "Start Analysis"
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
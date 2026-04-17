import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

/**
 * Fetches all historical and current jobs from the database.
 * Path: GET /api/jobs
 */
export async function getAllJobs() {
  const response = await api.get("/jobs");
  return response.data;
}

/**
 * Uploads a video file to the backend.
 */
export async function uploadVideo(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    job_id: response.data.job_id,
    message: response.data.message
  };
}

/**
 * Fetches the current processing status of a specific job.
 */
export async function getProcessingStatus(taskId) {
  const response = await api.get(`/status/${taskId}`);
  return response.data;
}

/**
 * Downloads the generated CSV report for a completed job.
 */
export async function downloadReport(taskId) {
  const response = await api.get(`/download/${taskId}`, {
    responseType: "blob",
  });

  return response.data;
}

export async function cancelJob(taskId) {
  const response = await api.delete(`/jobs/${taskId}`);
  return response.data;
}
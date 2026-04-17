import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

/**
 * Uploads a video file to the backend.
 * Returns an object containing the job_id and a taskId for tracking.
 */
export async function uploadVideo(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // Explicitly mapping properties to avoid using the spread (...) operator
  return {
    job_id: response.data.job_id,
    taskId: response.data.job_id,
    message: response.data.message
  };
}

/**
 * Fetches the current processing status of a specific job.
 * Path: GET /api/status/{taskId}
 */
export async function getProcessingStatus(taskId) {
  const response = await api.get(`/status/${taskId}`);
  return response.data;
}

/**
 * Downloads the generated CSV report for a completed job.
 * Path: GET /api/download/{taskId}
 */
export async function downloadReport(taskId) {
  const response = await api.get(`/download/${taskId}`, {
    responseType: "blob",
  });

  return response.data;
}
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export async function uploadVideo(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    ...response.data,
    taskId: response.data.taskId ?? `${file.name}-${Date.now()}`,
  };
}

export async function getProcessingStatus(taskId) {
  const response = await api.get("/status", { params: { taskId } });
  return response.data;
}

export async function downloadReport(taskId) {
  const response = await api.get("/download", {
    params: { taskId },
    responseType: "blob",
  });

  return response.data;
}

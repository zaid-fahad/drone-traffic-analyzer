import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Mock data for development
let mockTaskId = null;
let mockProgress = 0;
let mockStatus = "pending";
let mockStats = { total: 0, cars: 0, trucks: 0, buses: 0 };

export async function uploadVideo(file) {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  mockTaskId = `task-${Date.now()}`;
  mockProgress = 0;
  mockStatus = "processing";
  mockStats = { total: 0, cars: 0, trucks: 0, buses: 0 };

  // Start mock processing
  startMockProcessing();

  return {
    filename: file.name,
    taskId: mockTaskId,
    status: "processing"
  };
}

export async function getProcessingStatus(taskId) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    taskId,
    status: mockStatus,
    progress: mockProgress,
    totalVehicles: mockStats.total,
    cars: mockStats.cars,
    trucks: mockStats.trucks,
    buses: mockStats.buses,
    videoUrl: mockStatus === "completed" ? `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4` : null
  };
}

export async function downloadReport(taskId) {
  // Simulate download delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Create mock CSV content
  const csvContent = `timestamp,vehicle_type,confidence,x,y,speed
2024-01-01 10:00:00,car,0.95,150,200,45.2
2024-01-01 10:00:05,truck,0.89,300,180,38.7
2024-01-01 10:00:10,car,0.92,450,220,52.1
2024-01-01 10:00:15,bus,0.87,100,190,35.8
2024-01-01 10:00:20,car,0.94,280,210,48.3`;

  return new Blob([csvContent], { type: 'text/csv' });
}

// Mock processing simulation
function startMockProcessing() {
  const interval = setInterval(() => {
    mockProgress += Math.random() * 15 + 5; // Random progress between 5-20%

    if (mockProgress >= 30 && mockProgress < 60) {
      mockStats.cars = Math.floor(Math.random() * 5) + 1;
      mockStats.total = mockStats.cars;
    } else if (mockProgress >= 60 && mockProgress < 80) {
      mockStats.cars = Math.floor(Math.random() * 10) + 5;
      mockStats.trucks = Math.floor(Math.random() * 3) + 1;
      mockStats.total = mockStats.cars + mockStats.trucks;
    } else if (mockProgress >= 80 && mockProgress < 100) {
      mockStats.cars = Math.floor(Math.random() * 15) + 10;
      mockStats.trucks = Math.floor(Math.random() * 5) + 2;
      mockStats.buses = Math.floor(Math.random() * 2) + 1;
      mockStats.total = mockStats.cars + mockStats.trucks + mockStats.buses;
    }

    if (mockProgress >= 100) {
      mockProgress = 100;
      mockStatus = "completed";
      clearInterval(interval);
    }
  }, 2000);
}

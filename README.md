# Drone Traffic Analysis System

This document provides technical documentation, architectural specifications, and setup instructions for the Drone Traffic Analysis system. The application processes aerial drone footage to perform automated vehicle detection, bidirectional tracking, and classification.

---

## Local Setup

### System Requirements
* **Python:** 3.9 or higher
* **Node.js:** 18 or higher
* **FFmpeg:** Required for video encoding (e.g., `brew install ffmpeg` or `apt-get install ffmpeg`)
* **Hardware:** Apple Silicon (M1/M2/M3) or NVIDIA GPU recommended for inference performance.

### 1. Backend Initialization
Navigate to the `backend` directory and configure the Python environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Resource Configuration:**
1. Create a `weights` directory in the backend root and add the YOLOv10 weights file: `yolov10n.pt`.
2. Initialize local storage structures:
   ```bash
   mkdir -p storage/uploads storage/results
   ```

### 2. Frontend Initialization
Navigate to the `frontend` directory and install dependencies:
```bash
cd ../frontend
npm install
```

### 3. Execution
1. **Start Backend Service:**
   ```bash
   # From the backend directory
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
2. **Start Frontend Development Server:**
   ```bash
   # From the frontend directory
   npm run dev
   ```
3. **Access Application:** Open `http://localhost:5173` in a web browser.

---

## System Architecture

The application is built on a decoupled architecture that separates the compute-heavy computer vision pipeline from the user interface.

### 1. Frontend and Communication
The frontend is a single-page application (SPA) built with React 18, Vite, and Tailwind CSS.
* **State Management:** The system utilizes standard React state hooks for localized component data. For persistent mission monitoring, the application stores unique task identifiers in `localStorage`, allowing the session to persist across browser refreshes.
* **Data Synchronization:** Because video processing is an asynchronous background operation, the frontend implements a long-polling strategy. It queries the backend REST API at 2-5 second intervals to synchronize progress indicators and real-time traffic statistics.

### 2. Backend Task Management
The backend is powered by FastAPI and manages the lifecycle of analysis missions.
* **Concurrency and Threading:** Upon ingestion of a video file via the `/api/upload` endpoint, the server initializes a separate background thread (via Python’s `threading` module) to run the inference engine. This ensures the main API thread remains non-blocking for status requests.
* **Database Persistence:** An SQLite database with SQLAlchemy ORM tracks mission metadata, processing states (e.g., `processing`, `converting`, `completed`, `cancelled`), and final vehicle counts.
* **Hardware Acceleration:** The `TrafficDetector` component automatically identifies the host environment. It utilizes Metal Performance Shaders (**MPS**) on Apple Silicon or **CUDA** on NVIDIA hardware to move tensor calculations from the CPU to the GPU.

---

## Tracking Methodology

### 1. Bidirectional Vector Analysis
The system defines a virtual gate threshold, typically at a specific vertical coordinate (e.g., $y = 0.65$ of frame height). Traffic flow is determined by the transition of a vehicle's centroid relative to this line.

* **Inbound Flow:** Occurs when a vehicle's vertical centroid moves from $< threshold$ to $\ge threshold$.
* **Outbound Flow:** Occurs when a vehicle's vertical centroid moves from $> threshold$ to $\le threshold$.

### 2. Edge Case Handling
* **Double-Counting Prevention:** To mitigate errors caused by tracker "flicker" or vehicles idling on the gate line, the system maintains a set of identifiers that have already triggered a count. Once an ID is registered for a specific direction, it is excluded from future counting logic for that mission.
* **Inference Striding Compensation:** To optimize speed, the system supports processing every $N^{th}$ frame. The tracking logic accounts for large coordinate "jumps" between sampled frames by checking for threshold crossing transitions rather than exact pixel contact.
* **Occlusion Management:** The ByteTrack algorithm maintains track persistence through motion prediction. If a vehicle is briefly obscured by an object (e.g., a tree), the system attempts to re-identify the object once it reappears to maintain a single tracking ID.

---

## Engineering Assumptions

1. **Camera Angle:** The road or area of interest is assumed to be oriented such that traffic moves primarily along the vertical (Y) axis of the frame.
2. **Constant Frame Rate (CFR):** The calculation of event timestamps in the generated CSV reports assumes the input video reports an accurate and constant frame rate.
3. **Video Encoding:** The final step of the pipeline assumes the host environment provides access to standard H.264 encoders (e.g., `libx264` or `h264_videotoolbox`) for web-compatible playback.
4. **File System Permissions:** The application assumes write permissions are granted to the `storage/` directory for both video writing and temporary buffer creation.

---

**Developed by Mohammad Zaid Iqbal Fahad**
Systems Engineer | Research & Design Engineer
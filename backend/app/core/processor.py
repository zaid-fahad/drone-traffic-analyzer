import cv2
import time
import os
import subprocess
from app.core.detector import TrafficDetector
from app.core.reporter import generate_csv_report

jobs = {}

def process_video(input_path, job_id):
    detector = TrafficDetector()
    cap = cv2.VideoCapture(input_path)
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    # 1. We save to a temp file first because browsers can't play raw OpenCV output
    temp_output = os.path.join("storage/results", f"{job_id}_temp.mp4")
    final_output = os.path.join("storage/results", f"{job_id}_processed.mp4")
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(temp_output, fourcc, fps, (width, height))

    unique_ids = set()
    counts = {"car": 0, "truck": 0, "bus": 0, "motorcycle": 0}
    history = []
    start_time = time.time()

    frame_idx = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        results = detector.track_frame(frame)
        
        if results.boxes.id is not None:
            ids = results.boxes.id.cpu().numpy().astype(int)
            classes = results.boxes.cls.cpu().numpy().astype(int)
            names = results.names

            for obj_id, cls in zip(ids, classes):
                label = names[cls]
                if obj_id not in unique_ids:
                    unique_ids.add(obj_id)
                    counts[label] = counts.get(label, 0) + 1
                    
                    history.append({
                        "track_id": obj_id,
                        "vehicle_type": label,
                        "frame": frame_idx,
                        "timestamp_sec": round(frame_idx / fps, 2)
                    })

        annotated_frame = results.plot()
        out.write(annotated_frame)

        frame_idx += 1
        # Prevent staying at 100% while still processing
        progress = min(99, int((frame_idx / total_frames) * 100))
        
        jobs[job_id] = {
            "status": "processing",
            "progress": progress,
            "total_count": len(unique_ids),
            "counts_by_class": counts
        }

    # Clean up OpenCV
    cap.release()
    out.release()

    # 2. CONVERT TO WEB-FRIENDLY H.264 (The Fix for "Video not playing")
    # This uses ffmpeg to re-encode the video so browsers can stream it.
    try:
        subprocess.run([
            'ffmpeg', '-y', '-i', temp_output, 
            '-vcodec', 'libx264', '-crf', '25', 
            '-pix_fmt', 'yuv420p', final_output
        ], check=True)
        # Remove the unplayable temp file
        if os.path.exists(temp_output):
            os.remove(temp_output)
    except Exception as e:
        print(f"FFmpeg conversion failed: {e}")
        # Fallback: rename temp to final if ffmpeg fails (might still not play in browser)
        os.rename(temp_output, final_output)

    duration = round(time.time() - start_time, 2)
    generate_csv_report(history, job_id, "storage/results", duration)
    
    # 3. Final State Update (Force 100% and Completed status)
    jobs[job_id] = {
        "status": "completed",
        "progress": 100,
        "total_count": len(unique_ids),
        "counts_by_class": counts,
        "video_url": f"/static/{job_id}_processed.mp4",
        "report_url": f"/api/download/{job_id}",
        "duration": duration
    }
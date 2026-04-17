# app/core/processor.py (Updated for Accuracy)

import cv2
import time
import os
import subprocess
import pandas as pd
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
    
    temp_output = os.path.join("storage/results", f"{job_id}_temp.mp4")
    final_output = os.path.join("storage/results", f"{job_id}_processed.mp4")
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(temp_output, fourcc, fps, (width, height))

    # --- COUNTING LOGIC VARS ---
    counted_ids = set() 
    counts = {"car": 0, "truck": 0, "bus": 0, "motorcycle": 0}
    history = []
    
    # Define a virtual line (Horizontal line at 60% of screen height)
    line_y = int(height * 0.6) 
    # Use a dictionary to track previous Y positions of objects
    prev_positions = {} 

    frame_idx = 0
    start_time = time.time()

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break

        results = detector.track_frame(frame)
        
        # Draw the counting line for visual feedback
        cv2.line(frame, (0, line_y), (width, line_y), (0, 255, 255), 2)
        cv2.putText(frame, "COUNTING LINE", (10, line_y - 10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)

        if results.boxes.id is not None:
            boxes = results.boxes.xyxy.cpu().numpy()
            ids = results.boxes.id.cpu().numpy().astype(int)
            classes = results.boxes.cls.cpu().numpy().astype(int)
            names = results.names

            for box, obj_id, cls in zip(boxes, ids, classes):
                # Calculate the center point of the vehicle
                cx = int((box[0] + box[2]) / 2)
                cy = int((box[1] + box[3]) / 2)
                label = names[cls]

                # Check if we have a previous position for this ID
                if obj_id in prev_positions:
                    old_cy = prev_positions[obj_id]
                    
                    # LOGIC: If the center point crossed the line (e.g., from top to bottom)
                    if old_cy < line_y and cy >= line_y:
                        if obj_id not in counted_ids:
                            counted_ids.add(obj_id)
                            counts[label] += 1
                            
                            history.append({
                                "track_id": obj_id,
                                "vehicle_type": label,
                                "timestamp_sec": round(frame_idx / fps, 2)
                            })

                # Update the position for the next frame
                prev_positions[obj_id] = cy

        # Draw annotations and write frame
        annotated_frame = results.plot()
        out.write(annotated_frame)

        frame_idx += 1
        jobs[job_id] = {
            "status": "processing",
            "progress": min(99, int((frame_idx / total_frames) * 100)),
            "total_count": len(counted_ids),
            "counts_by_class": counts
        }

    cap.release()
    out.release()

    # FFmpeg conversion (Keep your existing H.264 logic here)
    try:
        subprocess.run([
            'ffmpeg', '-y', '-i', temp_output, 
            '-vcodec', 'libx264', '-pix_fmt', 'yuv420p', 
            '-movflags', '+faststart', final_output
        ], check=True)
        if os.path.exists(temp_output): os.remove(temp_output)
    except:
        os.rename(temp_output, final_output)

    generate_csv_report(history, job_id, "storage/results", round(time.time() - start_time, 2))
    
    jobs[job_id].update({
        "status": "completed",
        "progress": 100,
        "video_url": f"/static/{job_id}_processed.mp4",
        "report_url": f"/api/download/{job_id}"
    })
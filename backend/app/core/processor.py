import cv2
import time
import os
from app.core.detector import TrafficDetector
from app.core.annotator import VideoAnnotator
from app.core.converter import convert_to_h264
from app.core.reporter import generate_csv_report
from app.db.database import SessionLocal
from app.db.models import Job

def process_video(input_path, job_id):
    db = SessionLocal()
    job_record = db.query(Job).filter(Job.id == job_id).first()
    
    detector = TrafficDetector()
    annotator = VideoAnnotator()
    cap = cv2.VideoCapture(input_path)
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width, height = int(cap.get(3)), int(cap.get(4))
    
    temp_path = os.path.join("storage/results", f"{job_id}_temp.mp4")
    final_path = os.path.join("storage/results", f"{job_id}_processed.mp4")
    out = cv2.VideoWriter(temp_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))

    # --- BIDIRECTIONAL DATA STRUCTURE ---
    counted_ids = set()
    counts = {
        "inbound": {"total": 0, "car": 0, "truck": 0, "bus": 0, "motorcycle": 0},
        "outbound": {"total": 0, "car": 0, "truck": 0, "bus": 0, "motorcycle": 0}
    }
    prev_positions = {}
    history = []
    line_y = int(height * 0.6) # Center line for drone footage
    
    frame_idx = 0
    start_time = time.time()

    while cap.isOpened():
        
        ret, frame = cap.read()
        if not ret: break

        results = detector.track_frame(frame)
        annotator.draw_counting_line(frame, line_y, width)

        if results.boxes.id is not None:
            boxes = results.boxes.xyxy.cpu().numpy()
            ids = results.boxes.id.cpu().numpy().astype(int)
            classes = results.boxes.cls.cpu().numpy().astype(int)
            names = results.names

            for box, obj_id, cls in zip(boxes, ids, classes):
                label = names[cls]
                cy = int((box[1] + box[3]) / 2) # Centroid Y

                if obj_id in prev_positions:
                    old_cy = prev_positions[obj_id]
                    
                    # LOGIC: Direction Detection
                    # INBOUND: Top -> Bottom (Y increases)
                    if old_cy < line_y and cy >= line_y:
                        if obj_id not in counted_ids:
                            counted_ids.add(obj_id)
                            counts["inbound"]["total"] += 1
                            counts["inbound"][label] = counts["inbound"].get(label, 0) + 1
                            history.append({"track_id": obj_id, "type": label, "dir": "IN", "time": round(frame_idx/fps, 2)})
                    
                    # OUTBOUND: Bottom -> Top (Y decreases)
                    elif old_cy > line_y and cy <= line_y:
                        if obj_id not in counted_ids:
                            counted_ids.add(obj_id)
                            counts["outbound"]["total"] += 1
                            counts["outbound"][label] = counts["outbound"].get(label, 0) + 1
                            history.append({"track_id": obj_id, "type": label, "dir": "OUT", "time": round(frame_idx/fps, 2)})

                prev_positions[obj_id] = cy
                annotator.draw_tracking(frame, box, obj_id, label)

        # Updated: Draw a bidirectional dashboard
        annotator.draw_bidirectional_dashboard(frame, counts)
        
        out.write(frame)
        frame_idx += 1
        
        if frame_idx % 30 == 0:
            job_record.status = "processing"
            job_record.progress = int((frame_idx / total_frames) * 100)
            # We flatten the total for the DB summary
            job_record.total_count = counts["inbound"]["total"] + counts["outbound"]["total"]
            job_record.counts_by_class = counts # DB saves the full split JSON
            db.commit()
        # Every 30 frames, check if the user cancelled the job
        if frame_idx % 30 == 0:
            db.refresh(job_record) # Pull latest status from DB
            if job_record.status == "cancelled":
                cap.release()
                out.release()
                db.close()
                return # Self-terminate the thread

    cap.release()
    out.release()
    
    job_record.status = "converting"
    db.commit()
    
    convert_to_h264(temp_path, final_path)
    generate_csv_report(history, job_id, "storage/results", round(time.time() - start_time, 2))

    job_record.status = "completed"
    job_record.progress = 100
    job_record.video_url = f"/static/{job_id}_processed.mp4"
    job_record.report_url = f"/api/download/{job_id}"
    db.commit()
    db.close()
import torch
from ultralytics import YOLO

class TrafficDetector:
    def __init__(self, model_path="weights/yolov10n.pt"):
        # 1. Hardware detection
        if torch.backends.mps.is_available():
            self.device = torch.device("mps")
        elif torch.cuda.is_available():
            self.device = torch.device("cuda")
        else:
            self.device = torch.device("cpu")
            
        print(f"🚀 Vision Engine initiated on: {str(self.device).upper()}")
        
        # 2. THE FIX: Load model and move it to GPU memory IMMEDIATELY
        # This prevents the 'CPU-to-GPU' bottleneck during every frame
        self.model = YOLO(model_path).to(self.device)
        
        # Class IDs: 2:car, 3:motorcycle, 5:bus, 7:truck
        self.target_classes = [2, 3, 5, 7]

    def track_frame(self, frame):
        # 3. Use GPU-optimized settings
        # Increasing imgsz to 640 helps with accuracy when speed is high
        return self.model.track(
            source=frame,
            persist=True,
            classes=self.target_classes,
            conf=0.25,         # Slightly higher conf for stability
            iou=0.5,           # Higher IOU helps the tracker stay on the vehicle
            imgsz=640,         
            device=self.device,
            tracker="bytetrack.yaml",
            verbose=False
        )[0]
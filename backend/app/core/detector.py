from ultralytics import YOLO

class TrafficDetector:
    def __init__(self, model_path="weights/yolov10n.pt"):
        self.model = YOLO(model_path)
        # Class IDs: 2:car, 3:motorcycle, 5:bus, 7:truck
        self.target_classes = [2, 3, 5, 7]

    def track_frame(self, frame):
        # We lower conf to 0.20 to catch 'uncertain' trucks
        # We set imgsz to 640 (standard) or 1080 if the drone is very high
        return self.model.track(
            source=frame,
            persist=True,
            classes=self.target_classes,
            conf=0.20,         # Lowered from default 0.25
            iou=0.45,          # Adjust IOU to handle overlapping vehicles
            imgsz=640,         # Ensure consistent inference size
            tracker="bytetrack.yaml",
            verbose=False
        )[0]
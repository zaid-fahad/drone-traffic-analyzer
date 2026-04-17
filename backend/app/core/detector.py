from ultralytics import YOLO

class TrafficDetector:
    def __init__(self, model_path="weights/yolov10n.pt"):
        # Load YOLOv10 - It will auto-download to root if not in /weights
        self.model = YOLO(model_path)
        # COCO Classes: 2: car, 3: motorcycle, 5: bus, 7: truck
        self.target_classes = [2, 3, 5, 7]

    def track_frame(self, frame):
        # persistence=True enables ByteTrack/BoTSORT
        return self.model.track(
            source=frame,
            persist=True,
            classes=self.target_classes,
            tracker="bytetrack.yaml",
            verbose=False
        )[0]
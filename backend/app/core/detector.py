class Detector:
    def __init__(self, model_path: str = "../weights/yolov10.pt"):
        self.model_path = model_path
        self.model = None

    def load(self):
        # TODO: load YOLOv10 model weights
        self.model = "loaded"

    def detect(self, frame):
        # TODO: run detection on a single frame
        return []

from pathlib import Path

UPLOAD_DIR = Path(__file__).resolve().parents[1] / "storage" / "uploads"
RESULTS_DIR = Path(__file__).resolve().parents[1] / "storage" / "results"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)


def save_uploaded_file(file_path, data):
    with open(file_path, "wb") as f:
        f.write(data)
    return file_path

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from app.utils import save_uploaded_file, UPLOAD_DIR
from pathlib import Path

router = APIRouter()

@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".mp4", ".mov", ".avi", ".mkv")):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    target_path = UPLOAD_DIR / file.filename
    save_uploaded_file(target_path, await file.read())

    return {"filename": file.filename, "status": "received"}

@router.get("/status")
def check_status(job_id: str = Query(None, description="Optional job identifier")):
    return {"job_id": job_id, "status": "pending", "message": "Status endpoint placeholder."}

@router.get("/download")
def download_result(filename: str = Query(..., description="Processed result filename")):
    return {"filename": filename, "message": "Download endpoint placeholder."}

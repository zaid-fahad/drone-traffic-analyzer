from fastapi import APIRouter, UploadFile, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
import uuid
import os
from app.core.processor import process_video, jobs

router = APIRouter()

UPLOAD_DIR = "storage/uploads"
RESULT_DIR = "storage/results"

@router.post("/upload")
async def upload_video(file: UploadFile, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    file_extension = file.filename.split(".")[-1]
    input_path = os.path.join(UPLOAD_DIR, f"{job_id}.{file_extension}")

    with open(input_path, "wb") as buffer:
        buffer.write(await file.read())

    # Initialize job state
    jobs[job_id] = {"status": "starting", "progress": 0, "total_count": 0, "counts_by_class": {}}
    
    background_tasks.add_task(process_video, input_path, job_id)
    return {"job_id": job_id}

@router.get("/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

@router.get("/download/{job_id}")
async def download_report(job_id: str):
    path = os.path.join(RESULT_DIR, f"{job_id}_report.csv")
    if os.path.exists(path):
        return FileResponse(path, filename="traffic_analysis.csv")
    raise HTTPException(status_code=404, detail="Report not found")
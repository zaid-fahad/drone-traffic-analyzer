from fastapi import APIRouter, UploadFile, BackgroundTasks, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import uuid
import os

# Database imports
from app.db.database import get_db
from app.db.models import Job
from app.core.processor import process_video

router = APIRouter()

UPLOAD_DIR = "storage/uploads"
RESULT_DIR = "storage/results"

@router.post("/upload")
async def upload_video(
    file: UploadFile, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    # 1. Generate unique ID and paths
    job_id = str(uuid.uuid4())
    file_extension = file.filename.split(".")[-1]
    input_path = os.path.join(UPLOAD_DIR, f"{job_id}.{file_extension}")

    # 2. Save the physical file
    try:
        with open(input_path, "wb") as buffer:
            buffer.write(await file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # 3. Create initial database record
    new_job = Job(
        id=job_id,
        filename=file.filename,
        status="starting",
        progress=0,
        total_count=0,
        counts_by_class={} # JSON field
    )
    db.add(new_job)
    db.commit()

    # 4. Hand off to background processing
    background_tasks.add_task(process_video, input_path, job_id)
    
    return {"job_id": job_id, "status": "starting"}

@router.get("/jobs")
async def list_jobs(db: Session = Depends(get_db)):
    """Fetches all missions for the dashboard."""
    return db.query(Job).order_by(Job.created_at.desc()).all()

@router.get("/status/{job_id}")
async def get_status(job_id: str, db: Session = Depends(get_db)):
    """Fetches status for a specific job from SQLite."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/download/{job_id}")
async def download_report(job_id: str, db: Session = Depends(get_db)):
    """Serves the generated CSV report."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job or job.status != "completed":
        raise HTTPException(status_code=400, detail="Report not ready or job not found")
        
    path = os.path.join(RESULT_DIR, f"{job_id}_report.csv")
    if os.path.exists(path):
        return FileResponse(
            path, 
            media_type='text/csv', 
            filename=f"traffic_analysis_{job.filename}.csv"
        )
    raise HTTPException(status_code=404, detail="Physical report file missing")
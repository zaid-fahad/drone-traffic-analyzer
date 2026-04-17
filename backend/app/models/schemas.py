from pydantic import BaseModel
from typing import Dict, Optional

class JobStatus(BaseModel):
    job_id: str
    status: str  # "processing", "completed", "error"
    progress: int
    total_count: int
    counts_by_class: Dict[str, int]
    video_url: Optional[str] = None
    report_url: Optional[str] = None
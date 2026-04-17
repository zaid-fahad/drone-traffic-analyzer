from sqlalchemy import Column, String, Integer, DateTime, JSON
from datetime import datetime
from app.db.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String)
    status = Column(String, default="pending") # pending, processing, completed, error
    progress = Column(Integer, default=0)
    total_count = Column(Integer, default=0)
    counts_by_class = Column(JSON, default={})
    video_url = Column(String, nullable=True)
    report_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
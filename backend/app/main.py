from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.api.routes import router as api_router

app = FastAPI(title="Drone Traffic Analyzer Backend")
app.include_router(api_router, prefix="/api")

frontend_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

@app.get("/")
def root():
    return {"message": "Drone Traffic Analyzer backend is running."}

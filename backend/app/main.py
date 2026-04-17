from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.routes import router as api_router
from app.db.database import engine, Base

app = FastAPI(title="Smart Drone Traffic Analyzer")
Base.metadata.create_all(bind=engine)

# CORS for React (Vite defaults to port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for video streaming and report access
app.mount("/static", StaticFiles(directory="storage/results"), name="static")

# Include our routes
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "Backend is running. Target: ANTS Technical Assessment."}